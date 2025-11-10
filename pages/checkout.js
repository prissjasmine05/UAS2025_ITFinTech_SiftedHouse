import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, addToCart, removeFromCart } = useCart();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  return (
    <div className="bg-[#F5F5DD] min-h-screen font-sans text-zinc-800 py-8">
      <div className="container mx-auto p-4 max-w-4xl">
        <Link href="/select-items">
          <button className="text-zinc-600 hover:text-zinc-900 font-semibold mb-4">&larr; Kembali ke Menu</button>
        </Link>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 border-b border-zinc-200 pb-4">Keranjang Belanja</h1>
          
          {cart.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">Keranjangmu masih kosong.</p>
          ) : (
            <div>
              {/* --- HEADER UNTUK TABEL (HANYA MUNCUL DI LAYAR LEBAR) --- */}
              <div className="hidden md:flex items-center text-left text-sm font-semibold text-zinc-500 uppercase border-b border-zinc-200 pb-2 mb-4">
                <p className="w-5/12">Produk</p>
                <p className="w-2/12 text-center">Harga Satuan</p>
                <p className="w-3/12 text-center">Kuantitas</p>
                <p className="w-2/12 text-right">Subtotal</p>
              </div>

              {/* Daftar Item di Keranjang */}
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item._id} className="flex flex-col md:flex-row gap-4 items-center border-b border-zinc-200 pb-4">
                    
                    {/* Kolom Produk (Gambar + Nama) */}
                    <div className="w-full md:w-5/12 flex items-center gap-4">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div>
                        <h2 className="text-lg font-bold">{item.name}</h2>
                        <p className="text-sm text-zinc-500">{item.description}</p>
                      </div>
                    </div>

                    {/* Kolom Harga Satuan */}
                    <div className="w-full md:w-2/12 text-left md:text-center">
                      <p className="md:hidden font-bold">Harga:</p>
                      <p>Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>

                    {/* Kolom Kuantitas */}
                    <div className="w-full md:w-3/12 flex justify-start md:justify-center">
                       <div className="flex items-center gap-3 bg-zinc-100 text-zinc-800 rounded-full px-3 py-1.5 shadow-sm w-fit">
                          <button onClick={() => removeFromCart(item)} className="font-bold text-lg text-zinc-500 hover:text-zinc-800">➖</button>
                          <span className="font-bold text-lg w-5 text-center">{item.quantity}</span>
                          <button onClick={() => addToCart(item)} className="font-bold text-lg text-zinc-500 hover:text-zinc-800">➕</button>
                      </div>
                    </div>

                    {/* Kolom Subtotal */}
                    <div className="w-full md:w-2/12 text-left md:text-right">
                      <p className="md:hidden font-bold">Subtotal:</p>
                      <p className="font-bold">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rangkuman Biaya */}
              <div className="mt-8 flex flex-col items-end">
                <div className="w-full md:w-1/3 space-y-2 text-lg">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal</span>
                      <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Pajak (11%)</span>
                      <span>Rp {tax.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl border-t border-zinc-200 pt-2 mt-2">
                      <span>Total</span>
                      <span>Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                </div>
              </div>

              {/* Tombol Lanjut ke Pembayaran */}
              <div className="mt-8">
                <Link href="/payment">
                  <button className="w-full bg-zinc-800 text-white font-bold py-4 px-6 rounded-lg hover:bg-zinc-700 transition-colors text-lg">
                    Lanjut ke Pembayaran &rarr;
                  </button>
                </Link>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

