import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import LoginChooser from './LoginChooser';

export default function ProfileIcon() {
  const router = useRouter();
  const [showChooser, setShowChooser] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'user' | 'admin'
  const menuRef = useRef(null);

  useEffect(() => {
    // Cek status login
    try {
      const user = localStorage.getItem('user');
      const admin = localStorage.getItem('admin');
      if (admin) {
        setIsLoggedIn(true);
        setUserType('admin');
      } else if (user) {
        setIsLoggedIn(true);
        setUserType('user');
      }
    } catch (_) {}
  }, []);

  // Tutup menu kalau klik di luar
  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showMenu]);

  const handleIconClick = () => {
    if (!isLoggedIn) {
      // Belum login -> buka chooser
      setShowChooser(true);
      return;
    }
    // Sudah login -> tampilkan menu akun, JANGAN auto-redirect ke checkout
    setShowMenu((v) => !v);
  };

  const gotoAdmin = () => router.push('/admin/dashboard');
  const gotoProfile = () => router.push('/profile'); // ganti ke halaman akunmu jika berbeda
  const gotoOrders  = () => router.push('/orders');  // opsional: halaman riwayat pesanan
  const doLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    setIsLoggedIn(false);
    setUserType(null);
    setShowMenu(false);
    router.push('/select-items');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleIconClick}
        className="relative bg-zinc-800 text-white p-2 rounded-full hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500"
        aria-label="Profile menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>

        {isLoggedIn && (
          <span className="absolute -top-1 -right-1 bg-green-500 h-3 w-3 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* Dropdown menu saat sudah login */}
      {isLoggedIn && showMenu && (
        <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden z-20">
          <div className="px-4 py-3 border-b">
            <p className="text-sm text-zinc-500">Signed in as</p>
            <p className="text-sm font-semibold text-zinc-800 capitalize">{userType}</p>
          </div>

          {userType === 'admin' ? (
            <button
              onClick={gotoAdmin}
              className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 text-zinc-700"
            >
              Admin Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={gotoProfile}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 text-zinc-700"
              >
                Profil Saya
              </button>
              <button
                onClick={gotoOrders}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 text-zinc-700"
              >
                Pesanan Saya
              </button>
            </>
          )}

          <button
            onClick={doLogout}
            className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 text-red-600 border-t"
          >
            Logout
          </button>
        </div>
      )}

      {/* Chooser saat belum login */}
      <LoginChooser
        show={showChooser}
        onClose={() => setShowChooser(false)}
      />
    </div>
  );
}
