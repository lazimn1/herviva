import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { dbService } from '../../services/dbService';

const defaultReviewsConfig = {
  eyebrow: 'Love Letters',
  title: 'What Our Hervivas Say',
  reviewsList: [
    {
      name: 'Priya M.',
      location: 'Mumbai',
      text: "The Sage Linen Kurta is absolutely stunning. The fabric quality is exceptional and it drapes like a dream. I've already ordered two more pieces!",
      rating: 5,
      product: 'Sage Linen Kurta',
    },
    {
      name: 'Ananya K.',
      location: 'Bangalore',
      text: 'Finally found a brand that understands fusion wear. Every piece feels premium without being over the top. herviva is my go-to for work and weekends.',
      rating: 5,
      product: 'Terracotta Flow Tunic',
    },
    {
      name: 'Rhea S.',
      location: 'Delhi',
      text: "Wore the Burgundy Festive Set to my sister's wedding and received so many compliments. The embroidery detail is exquisite. Worth every rupee.",
      rating: 5,
      product: 'Burgundy Festive Set',
    },
  ]
};

export default function AdminReviews() {
  const [content, setContent] = useState({
    reviewsConfig: defaultReviewsConfig
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const data = await dbService.getSiteContent();
      setContent(prev => ({
        ...data,
        reviewsConfig: data?.reviewsConfig || defaultReviewsConfig
      }));
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      reviewsConfig: {
        ...prev.reviewsConfig,
        [field]: value
      }
    }));
    setSavedSuccess(false);
  };

  const handleReviewChange = (index, field, value) => {
    setContent(prev => {
      const newReviews = [...(prev.reviewsConfig?.reviewsList || [])];
      newReviews[index] = { ...newReviews[index], [field]: value };
      return {
        ...prev,
        reviewsConfig: {
          ...prev.reviewsConfig,
          reviewsList: newReviews
        }
      };
    });
    setSavedSuccess(false);
  };

  const handleAddReview = () => {
    setContent(prev => ({
      ...prev,
      reviewsConfig: {
        ...prev.reviewsConfig,
        reviewsList: [
          ...(prev.reviewsConfig?.reviewsList || []),
          { name: '', location: '', text: '', rating: 5, product: '' }
        ]
      }
    }));
    setSavedSuccess(false);
  };

  const handleRemoveReview = (indexToRemove) => {
    setContent(prev => ({
      ...prev,
      reviewsConfig: {
        ...prev.reviewsConfig,
        reviewsList: (prev.reviewsConfig?.reviewsList || []).filter((_, index) => index !== indexToRemove)
      }
    }));
    setSavedSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await dbService.updateSiteContent(content);
    setSaving(false);
    setSavedSuccess(true);
    
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const reviewsList = content.reviewsConfig?.reviewsList || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customer Reviews Manager</h1>
        <p className="text-gray-500 mt-1">Manage what your customers are saying about your brand.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Header Content</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eyebrow Tag</label>
              <input 
                type="text" 
                value={content.reviewsConfig?.eyebrow || ''} 
                onChange={(e) => handleChange('eyebrow', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Title</label>
              <input 
                type="text" 
                value={content.reviewsConfig?.title || ''} 
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Reviews List</h3>
          
          <div className="space-y-6">
            {reviewsList.map((review, index) => (
              <div key={index} className="p-5 border border-gray-100 rounded-lg bg-gray-50/50 space-y-4 relative group">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="font-medium text-gray-800">Review {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveReview(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                    title="Remove Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input 
                      type="text" 
                      value={review.name || ''} 
                      onChange={(e) => handleReviewChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input 
                      type="text" 
                      value={review.location || ''} 
                      onChange={(e) => handleReviewChange(index, 'location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Bought</label>
                    <input 
                      type="text" 
                      value={review.product || ''} 
                      onChange={(e) => handleReviewChange(index, 'product', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                    <input 
                      type="number" 
                      min="1" max="5"
                      value={review.rating || 5} 
                      onChange={(e) => handleReviewChange(index, 'rating', parseInt(e.target.value) || 5)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Text</label>
                  <textarea 
                    value={review.text || ''} 
                    onChange={(e) => handleReviewChange(index, 'text', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y text-sm leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleAddReview}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Review
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
