import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('checkout');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Drinks',
    imageUrl: '',
  });

  // FUNCTIONS - Definisikan SEBELUM useEffect
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      console.log('Admin /products result:', result);
      if (response.ok && result.success) setProducts(result.data || []);
      else setProducts([]);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      
      const body = editingProduct 
        ? { id: editingProduct._id, ...newProduct, price: parseFloat(newProduct.price) }
        : { ...newProduct, price: parseFloat(newProduct.price) };

      const response = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert(editingProduct ? 'Product berhasil diupdate!' : 'Product berhasil ditambahkan!');
        setShowAddProduct(false);
        setEditingProduct(null);
        setNewProduct({ name: '', price: '', description: '', category: 'Drinks', imageUrl: '' });
        fetchProducts();
        fetchDashboardData();
      } else {
        const error = await response.json();
        alert('Error: ' + error.message);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Gagal menyimpan product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl || '',
    });
    setShowAddProduct(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Yakin ingin menghapus product ini?')) return;

    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Product berhasil dihapus!');
        fetchProducts();
        fetchDashboardData();
      } else {
        const error = await response.json();
        alert('Error: ' + error.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Gagal menghapus product');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  // useEffect - Panggil setelah functions didefinisikan
  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/admin/login');
      return;
    }

    fetchDashboardData();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'products' && products.length === 0) {
      fetchProducts();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5DD] flex items-center justify-center">
        <div className="text-xl font-bold text-zinc-800">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5DD]">
      {/* Header - Sifted House Theme */}
      <div className="bg-[#FFFBE7]/90 backdrop-blur-md shadow-sm border-b border-[#E5D8CC] sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
      <img
        src="/logo-sifted-house.png"
        alt="Sifted House Logo"
        className="h-10 w-auto"
      />
      <h1 className="text-2xl font-bold text-[#37432B]">Admin Dashboard</h1>
    </div>
    <button
      onClick={handleLogout}
      className="px-5 py-2 bg-[#682C23] text-[#FFFBE7] rounded-full font-semibold hover:bg-[#37432B] transition-colors shadow-md"
    >
      Logout
    </button>
  </div>
</div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs - Matching homepage button style */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors shadow-md ${
              activeTab === 'checkout'
                ? 'bg-zinc-800 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            Checkout
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors shadow-md ${
              activeTab === 'products'
                ? 'bg-zinc-800 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors shadow-md ${
              activeTab === 'analytics'
                ? 'bg-zinc-800 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            Analytics
          </button>
        </div>

{/* CHECKOUT TAB */}
{activeTab === 'checkout' && (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#E5D8CC]">
    <div className="p-6 border-b border-[#E5D8CC] bg-[#FFFBE7]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#37432B]">📦 Checkout List</h2>
          <p className="text-sm text-[#6A6F4C] mt-1">Daftar semua transaksi checkout</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-[#37432B] mb-2">Filter Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-[#6A6F4C]/40 rounded-full bg-white text-[#37432B] focus:ring-2 focus:ring-[#6A6F4C] focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-[#37432B] mb-2">Start Date</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-4 py-2 border-2 border-[#6A6F4C]/40 rounded-full bg-white text-[#37432B] focus:ring-2 focus:ring-[#6A6F4C] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#37432B] mb-2">End Date</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-4 py-2 border-2 border-[#6A6F4C]/40 rounded-full bg-white text-[#37432B] focus:ring-2 focus:ring-[#6A6F4C] focus:border-transparent"
          />
        </div>

        {/* Reset Button */}
        {(filterStatus !== 'All' || dateRange.start || dateRange.end) && (
          <button
            onClick={() => {
              setFilterStatus('All');
              setDateRange({ start: '', end: '' });
            }}
            className="px-4 py-2 bg-[#6A6F4C]/20 text-[#37432B] rounded-full hover:bg-[#6A6F4C]/30 transition font-medium border border-[#6A6F4C]/30"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#E5D8CC]/40 border-b border-[#E5D8CC]">
          <tr>
            <th className="text-left py-4 px-6 text-xs font-bold text-[#37432B] uppercase tracking-wider">Order ID</th>
            <th className="text-left py-4 px-6 text-xs font-bold text-[#37432B] uppercase tracking-wider">Customer</th>
            <th className="text-left py-4 px-6 text-xs font-bold text-[#37432B] uppercase tracking-wider">Amount</th>
            <th className="text-left py-4 px-6 text-xs font-bold text-[#37432B] uppercase tracking-wider">Status</th>
            <th className="text-left py-4 px-6 text-xs font-bold text-[#37432B] uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5D8CC]">
          {data?.payments
            ?.filter((payment) => {
              if (filterStatus !== 'All' && payment.status !== filterStatus) return false;
              if (dateRange.start || dateRange.end) {
                const paymentDate = new Date(payment.createdAt);
                const startDate = dateRange.start ? new Date(dateRange.start) : null;
                const endDate = dateRange.end ? new Date(dateRange.end + 'T23:59:59') : null;
                if (startDate && paymentDate < startDate) return false;
                if (endDate && paymentDate > endDate) return false;
              }
              return true;
            })
            .map((payment, index) => (
              <tr
                key={payment._id}
                className="transition bg-white hover:bg-[#E5D8CC]/30"
              >
                <td className="py-4 px-6">
                  <span className="font-mono text-sm font-medium text-[#37432B]">
                    {payment.externalId}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#6A6F4C] rounded-full flex items-center justify-center text-[#FFFBE7] font-bold text-xs mr-3">
                      {payment.payerEmail.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-[#37432B]">{payment.payerEmail}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-base font-bold text-[#37432B]">
                    Rp {payment.amount.toLocaleString('id-ID')}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                      payment.status === 'PAID'
                        ? 'bg-[#6A6F4C]/20 text-[#37432B] border-[#6A6F4C]/40'
                        : payment.status === 'PENDING'
                        ? 'bg-[#E5D8CC]/50 text-[#6A6F4C] border-[#6A6F4C]/30'
                        : 'bg-[#682C23]/20 text-[#682C23] border-[#682C23]/40'
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-[#6A6F4C]">
                  {new Date(payment.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
            
            {/* Footer Summary */}
            <div className="p-4 bg-zinc-50 border-t flex justify-between items-center">
              <span className="text-sm text-zinc-600">
                Showing {data?.payments?.filter((payment) => {
                  if (filterStatus !== 'All' && payment.status !== filterStatus) return false;
                  if (dateRange.start || dateRange.end) {
                    const paymentDate = new Date(payment.createdAt);
                    const startDate = dateRange.start ? new Date(dateRange.start) : null;
                    const endDate = dateRange.end ? new Date(dateRange.end + 'T23:59:59') : null;
                    if (startDate && paymentDate < startDate) return false;
                    if (endDate && paymentDate > endDate) return false;
                  }
                  return true;
                }).length || 0} of {data?.payments?.length || 0} transactions
              </span>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="min-h-screen">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-zinc-800">Products Management</h2>
                <p className="text-zinc-600 mt-1">Kelola semua produk di toko Anda</p>
              </div>
              <button
                onClick={() => {
                  setShowAddProduct(!showAddProduct);
                  setEditingProduct(null);
                  setNewProduct({ name: '', price: '', description: '', category: 'Drinks', imageUrl: '' });
                }}
                className="px-6 py-3 bg-zinc-800 text-white rounded-full font-semibold hover:bg-zinc-700 transition shadow-lg"
              >
                {showAddProduct ? '✕ Cancel' : '+ Add Product'}
              </button>
            </div>

            {/* Add/Edit Product Form */}
            {showAddProduct && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-zinc-200">
                <h3 className="text-2xl font-bold mb-6 text-zinc-800">
                  {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                </h3>
                <form onSubmit={handleAddProduct} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Es Kopi Susu"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">
                        Price (Rp) *
                      </label>
                      <input
                        type="number"
                        placeholder="22000"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition"
                        required
                      >
                        <option value="Drinks">☕ Drinks</option>
                        <option value="Snacks">🍪 Snacks</option>
                        <option value="Bundles">🎁 Bundles</option>
                        <option value="Other">📦 Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">
                        Image URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={newProduct.imageUrl}
                        onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      placeholder="Perpaduan kopi, susu, dan gula aren..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition"
                      rows="3"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-zinc-800 text-white py-4 rounded-lg font-bold text-lg hover:bg-zinc-700 transition shadow-lg"
                  >
                    {editingProduct ? '💾 Update Product' : '✨ Create Product'}
                  </button>
                </form>
              </div>
            )}

            {/* Products Grid - Style sama dengan select-items */}
            {loadingProducts ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-zinc-800"></div>
                <p className="mt-4 text-zinc-600 font-medium">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden flex transform hover:-translate-y-1 transition-transform duration-300">
                    {/* Product Image - 1/3 width */}
                    <div className="w-1/3 flex-shrink-0 relative">
                      <img 
                        src={product.imageUrl || `https://placehold.co/400x400/F5F5DD/4E443A?text=No+Image`} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                      {/* Category Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-zinc-800 text-white text-xs font-bold rounded-full">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Product Info - 2/3 width */}
                    <div className="w-2/3 p-5 flex flex-col">
                      <div>
                        <h2 className="text-xl font-bold text-zinc-800">{product.name}</h2>
                        <p className="text-lg font-black text-zinc-800 mb-2">
                          Rp {product.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      
                      <p className="text-zinc-600 text-sm mb-4 flex-grow line-clamp-3">{product.description}</p>
                      
                      {/* Action Buttons */}
                      <div className="mt-auto flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 bg-zinc-700 text-white font-bold py-2 px-4 rounded-full hover:bg-zinc-600 transition-colors shadow-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex-1 bg-red-600 text-white font-bold py-2 px-4 rounded-full hover:bg-red-700 transition-colors shadow-md"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                <svg className="w-32 h-32 mx-auto text-zinc-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-zinc-500 text-2xl font-bold mb-2">No products yet</p>
                <p className="text-zinc-400 mb-6">Start by adding your first product to the store</p>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="px-8 py-3 bg-zinc-800 text-white rounded-full font-bold hover:bg-zinc-700 transition"
                >
                  + Add First Product
                </button>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-zinc-800 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 font-medium mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-zinc-900">
                      Rp {(data?.analytics?.totalRevenue || 0).toLocaleString('id-ID')}
                    </h3>
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      ↑ {data?.analytics?.totalOrders || 0} transaksi
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 font-medium mb-1">Transaksi Sukses</p>
                    <h3 className="text-2xl font-bold text-zinc-900">
                      {data?.analytics?.totalOrders || 0}
                    </h3>
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      PAID orders
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 font-medium mb-1">Rata-rata Order</p>
                    <h3 className="text-2xl font-bold text-zinc-900">
                      Rp {data?.analytics?.totalOrders > 0 
                        ? Math.round(data.analytics.totalRevenue / data.analytics.totalOrders).toLocaleString('id-ID')
                        : 0
                      }
                    </h3>
                    <p className="text-xs text-purple-600 font-semibold mt-1">
                      per transaksi
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 font-medium mb-1">Conversion Rate</p>
                    <h3 className="text-2xl font-bold text-zinc-900">
                      {data?.payments?.length > 0
                        ? ((data.analytics.totalOrders / data.payments.length) * 100).toFixed(1)
                        : 0
                      }%
                    </h3>
                    <p className="text-xs text-orange-600 font-semibold mt-1">
                      dari {data?.payments?.length || 0} checkout
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Revenue Chart - Bar Style */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-zinc-800">Omset Harian</h3>
                  <p className="text-sm text-zinc-500">30 hari terakhir (hanya hari dengan transaksi)</p>
                </div>

                {data?.analytics?.dailyRevenue && data.analytics.dailyRevenue.filter(d => d.total > 0).length > 0 ? (
                  <div className="relative">
                    <div className="flex h-64 items-end justify-between space-x-1">
                      {data.analytics.dailyRevenue
                        .filter(day => day.total > 0)
                        .map((day) => {
                          const maxRevenue = Math.max(...data.analytics.dailyRevenue.filter(d => d.total > 0).map(d => d.total));
                          const heightPercent = (day.total / maxRevenue) * 100;
                          
                          return (
                            <div key={day._id} className="flex-1 flex flex-col items-center group relative">
                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                <div className="bg-zinc-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                                  <div className="font-bold">Rp {day.total.toLocaleString('id-ID')}</div>
                                  <div className="text-zinc-300">{day.count} orders</div>
                                  <div className="text-zinc-400">
                                    {new Date(day._id).toLocaleDateString('id-ID', { 
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Bar */}
                              <div className="w-full flex items-end h-64">
                                <div
                                  className="w-full bg-gradient-to-t from-zinc-700 via-zinc-500 to-zinc-400 rounded-t-md hover:from-zinc-800 hover:via-zinc-600 hover:to-zinc-500 transition-all cursor-pointer shadow-sm"
                                  style={{ height: `${heightPercent}%`, minHeight: '8px' }}
                                ></div>
                              </div>
                              
                              {/* X-Axis Label */}
                              <div className="mt-2 text-center">
                                <div className="text-[10px] font-medium text-zinc-600">
                                  {new Date(day._id).toLocaleDateString('id-ID', { 
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    <div className="w-full h-px bg-zinc-300 mt-1"></div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-zinc-50 rounded-lg">
                    <div className="text-center text-zinc-400">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm font-medium">No data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly Revenue Chart */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-zinc-800">Omset Bulanan</h3>
                  <p className="text-sm text-zinc-500">12 bulan terakhir</p>
                </div>

                {data?.analytics?.monthlyRevenue && data.analytics.monthlyRevenue.length > 0 ? (
                  <div className="relative">
                    <div className="flex h-64 items-end justify-between space-x-1">
                      {data.analytics.monthlyRevenue.map((month) => {
                        const maxRevenue = Math.max(...data.analytics.monthlyRevenue.map(m => m.total));
                        const heightPercent = (month.total / maxRevenue) * 100;
                        
                        return (
                          <div key={month._id} className="flex-1 flex flex-col items-center group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-zinc-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                                <div className="font-bold">Rp {month.total.toLocaleString('id-ID')}</div>
                                <div className="text-zinc-300">{month.count} orders</div>
                                <div className="text-zinc-400">
                                  {new Date(month._id + '-01').toLocaleDateString('id-ID', { 
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                            
                            {/* Bar */}
                            <div className="w-full flex items-end h-64">
                              <div
                                className="w-full bg-gradient-to-t from-green-500 via-green-400 to-green-300 rounded-t-md hover:from-green-600 hover:via-green-500 hover:to-green-400 transition-all cursor-pointer shadow-sm"
                                style={{ height: `${heightPercent}%`, minHeight: '12px' }}
                              ></div>
                            </div>
                            
                            {/* X-Axis Label */}
                            <div className="mt-2 text-center">
                              <div className="text-[10px] font-medium text-zinc-600">
                                {new Date(month._id + '-01').toLocaleDateString('id-ID', { 
                                  month: 'short',
                                  year: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="w-full h-px bg-zinc-300 mt-1"></div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-zinc-50 rounded-lg">
                    <div className="text-center text-zinc-400">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm font-medium">No data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Status */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-zinc-800 mb-4">Status Pesanan</h3>
                
                {data?.analytics?.statusSummary && data.analytics.statusSummary.length > 0 ? (
                  <div className="space-y-3">
                    {data.analytics.statusSummary.map((status) => (
                      <div
                        key={status._id}
                        className={`p-4 rounded-xl border-2 ${
                          status._id === 'PAID'
                            ? 'bg-green-50 border-green-200'
                            : status._id === 'PENDING'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-bold ${
                            status._id === 'PAID' ? 'text-green-800' :
                            status._id === 'PENDING' ? 'text-yellow-800' :
                            'text-red-800'
                          }`}>
                            {status._id}
                          </span>
                          <span className={`text-2xl font-bold ${
                            status._id === 'PAID' ? 'text-green-700' :
                            status._id === 'PENDING' ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            {status.count}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-600 font-medium">
                          Rp {status.total.toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center bg-zinc-50 rounded-lg">
                    <p className="text-sm text-zinc-400">No data</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}