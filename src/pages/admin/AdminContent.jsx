import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { dbService } from '../../services/dbService';

export default function AdminContent() {
  const [content, setContent] = useState({
    announcementBar: '',
    heroHeading: '',
    heroSubheading: '',
    aboutUs: '',
    heroSlides: [
      { tag: 'New Season', title: 'Effortless elegance,\ncrafted for every her', sub: 'Discover flowing silhouettes and timeless pieces that move with you.', image: '/images/hero-1.webp' },
      { tag: 'Fusion Edit', title: 'Where tradition\nmeets modern grace', sub: 'Contemporary kurtas and tunics reimagined for the woman of today.', image: '/images/hero-2.webp' },
      { tag: 'The Collection', title: 'Your wardrobe,\nreimagined', sub: 'Premium fabrics, thoughtful details, and silhouettes made to last.', image: '/images/hero-3.webp' }
    ],
    collections: [
      { title: 'Kurtas & Tunics', desc: 'Flowing fabrics, artisanal prints', image: '/images/collection-1.webp', color: 'bg-sage/20', accent: 'text-sage-dark' },
      { title: 'Fusion Wear', desc: 'East meets west, effortlessly', image: '/images/collection-2.webp', color: 'bg-terracotta/15', accent: 'text-terracotta' },
      { title: 'Occasion Edit', desc: 'Festive, formal & celebratory', image: '/images/collection-3.webp', color: 'bg-burgundy/10', accent: 'text-burgundy' },
      { title: 'Everyday Essentials', desc: 'Comfort meets quiet luxury', image: '/images/collection-4.webp', color: 'bg-tan/20', accent: 'text-ink' }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState(null);
  const [uploadingCollectionIndex, setUploadingCollectionIndex] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const data = await dbService.getSiteContent();
      setContent(prev => ({
        ...data,
        heroSlides: data?.heroSlides || prev.heroSlides,
        collections: data?.collections || prev.collections
      }));
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
    setSavedSuccess(false);
  };

  const handleSlideChange = (index, field, value) => {
    setContent(prev => {
      const newSlides = [...prev.heroSlides];
      newSlides[index] = { ...newSlides[index], [field]: value };
      return { ...prev, heroSlides: newSlides };
    });
    setSavedSuccess(false);
  };

  const handleAddSlide = () => {
    setContent(prev => ({
      ...prev,
      heroSlides: [
        ...prev.heroSlides,
        { tag: '', title: '', sub: '', image: '' }
      ]
    }));
    setSavedSuccess(false);
  };

  const handleRemoveSlide = (indexToRemove) => {
    setContent(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((_, index) => index !== indexToRemove)
    }));
    setSavedSuccess(false);
  };

  const handleCollectionChange = (index, field, value) => {
    setContent(prev => {
      const newCols = [...prev.collections];
      newCols[index] = { ...newCols[index], [field]: value };
      return { ...prev, collections: newCols };
    });
    setSavedSuccess(false);
  };

  const handleAddCollection = () => {
    setContent(prev => ({
      ...prev,
      collections: [
        ...prev.collections,
        { title: '', desc: '', image: '', color: 'bg-sage/20', accent: 'text-sage-dark' }
      ]
    }));
    setSavedSuccess(false);
  };

  const handleRemoveCollection = (indexToRemove) => {
    setContent(prev => ({
      ...prev,
      collections: prev.collections.filter((_, index) => index !== indexToRemove)
    }));
    setSavedSuccess(false);
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlideIndex(index);
    setUploadError(null);
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
      
      const fileName = `hero-${Date.now()}.webp`;
      const publicUrl = await dbService.uploadImage(webpBlob, fileName);
      
      handleSlideChange(index, 'image', publicUrl);
    } catch (err) {
      console.error(err);
      setUploadError('Failed to process and upload image. Please check bucket permissions.');
    } finally {
      setUploadingSlideIndex(null);
    }
  };

  const handleCollectionImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCollectionIndex(index);
    setUploadError(null);
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
      
      const fileName = `collection-${Date.now()}.webp`;
      const publicUrl = await dbService.uploadImage(webpBlob, fileName);
      
      handleCollectionChange(index, 'image', publicUrl);
    } catch (err) {
      console.error(err);
      setUploadError('Failed to process and upload image. Please check bucket permissions.');
    } finally {
      setUploadingCollectionIndex(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await dbService.updateSiteContent(content);
    setSaving(false);
    setSavedSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Site Content Manager</h1>
        <p className="text-gray-500 mt-1">Update text and banners displayed on your live storefront.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">
        
        {/* Announcement Bar */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Top Announcement Bar</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Text</label>
            <input 
              type="text" 
              name="announcementBar" 
              value={content.announcementBar} 
              onChange={handleChange}
              placeholder="e.g., Free shipping on orders over $50!"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">This appears at the very top of the website above the navigation.</p>
          </div>
        </div>

        {/* Hero Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Hero Section (Homepage)</h3>
          
          <div className="space-y-8">
            {content.heroSlides.map((slide, index) => (
              <div key={index} className="p-5 border border-gray-100 rounded-lg bg-gray-50/50 space-y-4 relative group">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="font-medium text-gray-800">Slide {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlide(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                    title="Remove Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eyebrow Tag</label>
                  <input 
                    type="text" 
                    value={slide.tag || ''} 
                    onChange={(e) => handleSlideChange(index, 'tag', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Heading</label>
                  <textarea 
                    value={slide.title || ''} 
                    onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y text-lg font-semibold"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subheading / Description</label>
                  <textarea 
                    value={slide.sub || ''} 
                    onChange={(e) => handleSlideChange(index, 'sub', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slide Image</label>
                  <div className="flex items-center gap-4">
                    {slide.image && (
                      <div className="w-20 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        <img src={slide.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, index)}
                        disabled={uploadingSlideIndex !== null}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {uploadingSlideIndex === index && <p className="text-xs text-indigo-600 mt-2 font-medium animate-pulse">Uploading and optimizing image...</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleAddSlide}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Slide
            </button>
          </div>

          {uploadError && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {uploadError}
            </div>
          )}
        </div>

        {/* About Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">About Us Section</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
            <textarea 
              name="aboutUs" 
              value={content.aboutUs} 
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"
            />
          </div>
        </div>

        {/* Collections Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Collections Section (Homepage)</h3>
          
          <div className="space-y-8">
            {content.collections.map((col, index) => (
              <div key={index} className="p-5 border border-gray-100 rounded-lg bg-gray-50/50 space-y-4 relative group">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="font-medium text-gray-800">Collection {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveCollection(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                    title="Remove Collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Collection Title</label>
                  <input 
                    type="text" 
                    value={col.title || ''} 
                    onChange={(e) => handleCollectionChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg font-semibold"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    value={col.desc || ''} 
                    onChange={(e) => handleCollectionChange(index, 'desc', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Collection Image</label>
                  <div className="flex items-center gap-4">
                    {col.image && (
                      <div className="w-16 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        <img src={col.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleCollectionImageUpload(e, index)}
                        disabled={uploadingCollectionIndex !== null}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {uploadingCollectionIndex === index && <p className="text-xs text-indigo-600 mt-2 font-medium animate-pulse">Uploading and optimizing image...</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleAddCollection}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Collection
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center text-sm">
            {savedSuccess && (
              <span className="flex items-center text-green-600 font-medium animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 className="w-5 h-5 mr-1.5" />
                Changes saved successfully
              </span>
            )}
          </div>
          
          <button 
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-sm ${
              saving ? 'bg-indigo-400 cursor-not-allowed text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
