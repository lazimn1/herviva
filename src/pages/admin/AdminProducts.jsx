import React, { useEffect, useState } from 'react';

const CATEGORIES = ['Kurtas', 'Tunics', 'Fusion', 'Occasion', 'Essentials', 'Dresses', 'Accessories'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
import { Plus, Edit2, Trash2, X, Check, Save, CheckCircle2 } from 'lucide-react';
import { dbService } from '../../services/dbService';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '', sku: '', price: '', stock: '', status: 'Active', image: '', category: 'Kurtas', sizes: ['S', 'M', 'L', 'XL']
  });
  
  const [shopHeader, setShopHeader] = useState({
    tag: 'Shop', title: 'New Arrivals', description: 'Pieces designed to drape beautifully, feel luxurious, and become staples in your wardrobe.'
  });
  const [savingHeader, setSavingHeader] = useState(false);
  const [headerSavedSuccess, setHeaderSavedSuccess] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const [data, siteData] = await Promise.all([
      dbService.getProducts(),
      dbService.getSiteContent()
    ]);
    setProducts(data);
    if (siteData?.shopHeader) {
      setShopHeader(siteData.shopHeader);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setShopHeader(prev => ({ ...prev, [name]: value }));
    setHeaderSavedSuccess(false);
  };

  const handleSaveHeader = async (e) => {
    e.preventDefault();
    setSavingHeader(true);
    // updateSiteContent does a partial update, so we can just pass shopHeader
    await dbService.updateSiteContent({ shopHeader });
    setSavingHeader(false);
    setHeaderSavedSuccess(true);
    setTimeout(() => setHeaderSavedSuccess(false), 3000);
  };

  const openAddModal = () => {
    setEditingId(null);
    setSubmitError(null);
    setFormData({ name: '', sku: '', price: '', stock: '', status: 'Active', image: '', category: 'Kurtas', sizes: ['S', 'M', 'L', 'XL'] });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setSubmitError(null);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      status: product.status,
      image: product.image,
      category: product.category || 'Kurtas',
      sizes: Array.isArray(product.sizes) ? product.sizes : ['S', 'M', 'L', 'XL']
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setSubmitError(null);
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const webpBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.8));
      
      const fileName = `product-${Date.now()}.webp`;
      const publicUrl = await dbService.uploadImage(webpBlob, fileName);
      
      setFormData(prev => ({ ...prev, image: publicUrl }));
    } catch (err) {
      console.error(err);
      setSubmitError('Failed to process and upload image. Ensure you created the "product-images" storage bucket in Supabase and made it public.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      };

      if (editingId) {
        await dbService.updateProduct(editingId, payload);
      } else {
        await dbService.addProduct(payload);
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'An error occurred while saving the product. Please check database permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await dbService.deleteProduct(id);
      fetchProducts();
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="text-gray-500 mt-1">Manage your inventory and product listings.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Shop Page Header Section */}
      <form onSubmit={handleSaveHeader} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 mb-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Shop Page Header</h3>
            <p className="text-sm text-gray-500">Edit the texts that appear at the top of the storefront shop page.</p>
          </div>
          <div className="flex items-center gap-4">
            {headerSavedSuccess && (
              <span className="flex items-center text-sm text-green-600 font-medium animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Saved
              </span>
            )}
            <button 
              type="submit"
              disabled={savingHeader}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-all shadow-sm ${
                savingHeader ? 'bg-indigo-400 cursor-not-allowed text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              {savingHeader ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {savingHeader ? 'Saving...' : 'Save Header'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eyebrow Tag</label>
            <input 
              type="text" name="tag" value={shopHeader.tag} onChange={handleHeaderChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Main Heading</label>
            <input 
              type="text" name="title" value={shopHeader.title} onChange={handleHeaderChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-semibold"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description Paragraph</label>
            <textarea 
              name="description" value={shopHeader.description} onChange={handleHeaderChange} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"
            />
          </div>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">SKU</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Sizes</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      {product.category || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {Array.isArray(product.sizes) && product.sizes.length > 0
                      ? product.sizes.join(', ')
                      : '—'}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock > 10 ? 'bg-green-100 text-green-800' :
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'Active' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {product.status === 'Active' ? <Check className="w-3 h-3" /> : null}
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No products found. Add a new product to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 border border-red-200">
                  {submitError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input 
                    required type="text" name="name" value={formData.name} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input 
                    required type="text" name="sku" value={formData.sku} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input 
                    required type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Count</label>
                  <input 
                    required type="number" min="0" name="stock" value={formData.stock} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category" value={formData.category} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="status" value={formData.status} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SIZES.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          formData.sizes.includes(size)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {formData.sizes.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">Please select at least one size.</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  <div className="flex items-center gap-4">
                    {formData.image && (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {isUploadingImage && <p className="text-xs text-indigo-600 mt-2 font-medium animate-pulse">Uploading and optimizing image...</p>}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
