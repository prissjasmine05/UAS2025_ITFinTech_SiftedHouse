// pages/api/payments.js
import { Xendit } from 'xendit-node';
import connectDB from '../../lib/mongodb';
import Payment from '../../models/Payment';
import { sendPendingPaymentTemplate } from '../../lib/whatsapp';

// ===== Helpers =====
function resolveBaseUrl() {
  // PRIORITAS: NEXT_PUBLIC_APP_URL > NEXT_PUBLIC_VERCEL_URL > localhost
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    'http://localhost:3000';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}
const BASE_URL = resolveBaseUrl();

function isLiveMode() {
  const key = process.env.XENDIT_SECRET_KEY || '';
  return key.startsWith('xnd_production_');
}

function normalizePhone(phone) {
  if (!phone) return '';
  let v = String(phone).replace(/[^\d+]/g, ''); // keep digits & '+'
  if (v.startsWith('+62')) v = '62' + v.slice(3);
  else if (v.startsWith('0')) v = '62' + v.slice(1);
  // jika sudah 62..., biarkan
  return v;
}

// Toggle WA:
// - WHATSAPP_ENABLE=1 untuk aktifkan pengiriman WA
// - WHATSAPP_ALLOW_TEST=1 jika ingin kirim WA meski Xendit masih TEST key
const WA_ENABLED = (process.env.WHATSAPP_ENABLE || '0') === '1';
const WA_ALLOW_TEST = (process.env.WHATSAPP_ALLOW_TEST || '0') === '1';

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    // FE mengirim { cart, total, customer }
    // customer: { name, email, phone, address, notes? }
    const { cart, total, customer } = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Missing cart items' });
    }
    if (!total || !customer || !customer.email) {
      return res.status(400).json({ error: 'Missing required data in request' });
    }

    const amount = Number(total);
    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const externalId = `invoice-uts-${Date.now()}`;
    const normalizedPhone = normalizePhone(customer.phone);

    // ===== 1) Payload ke Xendit (pakai properti camelCase sesuai SDK) =====
    const invoicePayload = {
      externalId,
      amount,
      payerEmail: customer.email,
      description: `Pembayaran oleh ${customer.name || customer.email} untuk pesanan #${externalId}`,
      // PENTING: biarkan URL konfirmasi yang SUDAH ADA di project-mu
      successRedirectUrl: `${BASE_URL}/success`,
      failureRedirectUrl: `${BASE_URL}/failure`,
      currency: 'IDR',
      customer: {
        given_names: customer.name || '',
        email: customer.email,
        mobile_number: normalizedPhone || undefined,
        address: customer.address || '',
      },
      metadata: {
        phone: normalizedPhone,
        notes: customer.notes || '',
      },
      items: cart.map((it) => ({
        name: it?.name || 'Item',
        quantity: Number(it?.quantity || 0),
        price: Number(it?.price || 0),
      })),
    };

    // ===== 2) Simpan payment lokal = PENDING =====
    const paymentDoc = await Payment.create({
      externalId: invoicePayload.externalId,
      amount: invoicePayload.amount,
      payerEmail: invoicePayload.payerEmail,
      payerName: customer.name || '',
      phone: normalizedPhone,
      notes: customer.notes || '',
      status: 'PENDING',
      cart,
    });

    // ===== 3) Buat invoice di Xendit =====
    const invoice = await xenditClient.Invoice.createInvoice({ data: invoicePayload });
    const invoiceUrl = invoice?.invoiceUrl || invoice?.invoice_url || '';

    if (!invoiceUrl) {
      console.error('[XENDIT] Missing invoiceUrl:', invoice);
      return res.status(500).json({ error: 'Gagal membuat invoice Xendit (no URL)' });
    }

    // ===== 4) Update invoiceUrl di DB =====
    paymentDoc.invoiceUrl = invoiceUrl;
    await paymentDoc.save();

    // ===== 5) (Opsional) Kirim WhatsApp PENDING =====
    // RULE:
    // - kalau Xendit LIVE → kirim WA hanya jika WHATSAPP_ENABLE=1
    // - kalau Xendit TEST → kirim WA HANYA jika WHATSAPP_ENABLE=1 **dan** WHATSAPP_ALLOW_TEST=1
    const canSendWA = isLiveMode()
      ? WA_ENABLED
      : (WA_ENABLED && WA_ALLOW_TEST);

    if (canSendWA && normalizedPhone) {
      try {
        await sendPendingPaymentTemplate({
          phone: normalizedPhone, // 62…
          customer_name: customer.name || (customer.email ? customer.email.split('@')[0] : 'Customer'),
          order_id: externalId,
          amount: amount.toLocaleString('id-ID'),
          order_date: new Date(paymentDoc.createdAt).toLocaleDateString('id-ID'),
          payment_link: invoiceUrl,
          notes: customer.notes || '',
        });
        console.log('✅ WA template PENDING sent:', externalId, `(mode: ${isLiveMode() ? 'LIVE' : 'TEST'})`);
      } catch (waErr) {
        console.error('❌ WA PENDING error:', waErr?.response?.data || waErr?.message || waErr);
        // jangan throw; biarkan checkout tetap berhasil
      }
    } else {
      if (!WA_ENABLED) console.log('ℹ️ Skip kirim WA: WHATSAPP_ENABLE != 1.');
      if (!isLiveMode() && !WA_ALLOW_TEST) console.log('ℹ️ Skip kirim WA: Xendit TEST & WHATSAPP_ALLOW_TEST != 1.');
      if (!normalizedPhone) console.log('ℹ️ Skip kirim WA: nomor kosong/tidak valid.');
    }

    // ===== 6) Response ke FE =====
    return res.status(200).json({ invoiceUrl });
  } catch (error) {
    console.error('Xendit API Error:', error?.response?.data || error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to create payment invoice';
    return res.status(500).json({ error: errorMessage });
  }
}
