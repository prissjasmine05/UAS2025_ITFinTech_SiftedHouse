// pages/api/auth/login.js
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { sendMFACode } from '../../../lib/whatsapp';

// --- utils ---
function normalizePhone62(phone) {
  if (!phone) return '';
  let s = String(phone).trim().replace(/[^\d+]/g, '');
  if (s.startsWith('+62')) s = '62' + s.slice(3);
  else if (s.startsWith('0')) s = '62' + s.slice(1);
  else if (!s.startsWith('62')) s = '62' + s;
  return s;
}
function maskPhone62(s62) {
  if (!s62) return '';
  const n = s62.length;
  if (n <= 6) return s62;
  return s62.slice(0, 4) + '***' + s62.slice(-3);
}
function random6() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();

    const { email, password, phone: phoneFromBody } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    // cari user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Email atau password salah' });

    // cek password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Email atau password salah' });

    // nomor WA dari DB atau body
    let phone = user.phone && String(user.phone).trim() ? user.phone : (phoneFromBody || '');
    phone = normalizePhone62(phone);
    if (!phone) {
      return res.status(400).json({
        error: 'Nomor WhatsApp belum terdaftar. Isi nomor di login atau update profil.',
        code: 'PHONE_REQUIRED',
      });
    }

    // simpan nomor bila belum/berbeda
    if (!user.phone || normalizePhone62(user.phone) !== phone) {
      user.phone = phone;
    }

    // generate OTP + expiry 5 menit
    const code = random6();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Date object

    // simpan KEDUANYA (supaya kompatibel dgn verify yg cek mfaExpires || mfaCodeExpiry)
    user.mfaCode = code;
    user.mfaExpires = expiresAt;      // <- Date
    user.mfaCodeExpiry = expiresAt;   // <- Date
    await user.save();

    // kirim WA OTP
    await sendMFACode({
      phone,            // 62…
      code,             // 6 digit
      expiresIn: 5,     // menit
      appName: process.env.STORE_NAME || 'PrisJ App',
    });

    // kirim balik userId ke FE (penting utk /api/auth/verify-mfa)
    return res.status(200).json({
      step: 'OTP_SENT',
      userId: user._id.toString(),
      to: maskPhone62(phone),
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error('LOGIN/OTP error:', err);
    return res.status(500).json({
      error: err?.message || 'Terjadi kesalahan saat mengirim OTP',
    });
  }
}
