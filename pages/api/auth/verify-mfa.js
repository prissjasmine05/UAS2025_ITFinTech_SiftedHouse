// pages/api/auth/verify-mfa.js
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { userId, code } = req.body || {};

    // Validasi input
    const trimmedCode = (code ?? '').toString().trim();
    if (!userId || !trimmedCode) {
      return res.status(400).json({ message: 'User ID dan kode harus diisi' });
    }
    if (trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
      return res.status(400).json({ message: 'Format kode verifikasi tidak valid' });
    }

    // Ambil user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Ambil kode & expiry (dukung 2 nama field: mfaExpires atau mfaCodeExpiry)
    const storedCode = (user.mfaCode ?? '').toString().trim();
    const expiryRaw = user.mfaExpires || user.mfaCodeExpiry;

    if (!storedCode || !expiryRaw) {
      return res.status(400).json({ message: 'Tidak ada kode OTP aktif' });
    }

    const now = Date.now();
    const expiryTs = new Date(expiryRaw).getTime();
    if (Number.isNaN(expiryTs)) {
      return res.status(400).json({ message: 'Data OTP tidak valid, silakan minta kode baru' });
    }
    if (now > expiryTs) {
      return res.status(400).json({ message: 'Kode verifikasi telah kadaluarsa' });
    }

    // Bandingkan kode
    if (storedCode !== trimmedCode) {
      return res.status(400).json({ message: 'Kode verifikasi salah' });
    }

    // Bersihkan OTP & tandai verified
    user.mfaCode = undefined;
    user.mfaExpires = undefined;     // jika pakai field ini
    user.mfaCodeExpiry = undefined;  // atau jika pakai field ini
    user.isVerified = true;

    await user.save();

    // Buat JWT
    if (!process.env.JWT_SECRET) {
      // kalau belum ada secret, balikin 500 biar jelas
      return res.status(500).json({ message: 'JWT_SECRET belum diset di environment' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie httpOnly
    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    console.error('MFA verify error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
