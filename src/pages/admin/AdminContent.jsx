import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { dbService } from '../../services/dbService';

export default function AdminContent() {
  const [content, setContent] = useState({
    announcementBar: '',
    heroHeading: '',
    heroSubheading: '',
    aboutUs: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const data = await dbService.getSiteContent();
      setContent(data);
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
    setSavedSuccess(false);
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
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input 
                type="text" 
                name="heroHeading" 
                value={content.heroHeading} 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subheading / Description</label>
              <textarea 
                name="heroSubheading" 
                value={content.heroSubheading} 
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"
              />
            </div>
          </div>
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
