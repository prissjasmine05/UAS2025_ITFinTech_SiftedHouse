import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { name, email, phone, password } = req.body || {};

    // Validasi input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    // Cek apakah email atau nomor telepon sudah terdaftar
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });
    if (existingUser) {
      return res.status(409).json({ message: 'User dengan email atau nomor tersebut sudah ada' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // (628xx)
    let normalizedPhone = phone.replace(/[^\d]/g, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '62' + normalizedPhone.slice(1);
    } else if (!normalizedPhone.startsWith('62')) {
      normalizedPhone = '62' + normalizedPhone;
    }

    // Simpan user ke MongoDB
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: normalizedPhone,
      isVerified: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      userId: newUser._id,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
