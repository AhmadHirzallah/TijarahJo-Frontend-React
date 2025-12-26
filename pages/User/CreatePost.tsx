
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types/api';
import { ShoppingBag, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import Loader from '../../components/UI/Loader';

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    postTitle: '',
    postDescription: '',
    price: 0,
    categoryID: 0,
    userID: user?.userID || 0
  });

  useEffect(() => {
    categoryService.getAll().then(setCategories);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryID) {
       setError('Please select a category');
       return;
    }
    
    setLoading(true);
    setError('');
    try {
      const post = await postService.createPost(formData);
      if (selectedImages.length > 0) {
        for (const file of selectedImages) {
          await postService.uploadImage(post.postID, file);
        }
      }
      setSuccess(true);
      setTimeout(() => window.location.href = '#/my-posts', 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Listing Created!</h2>
        <p className="text-gray-500 mt-4">Your item is now live. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border">
        <div className="bg-blue-600 p-8 text-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">List a New Item</h1>
            <p className="text-blue-100 mt-1">Fill in the details for buyers in Jordan</p>
          </div>
          <ShoppingBag size={48} className="opacity-20" />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Product Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. iPhone 15 Pro Max"
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600"
                  onChange={e => setFormData({...formData, postTitle: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Price (JD)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="0.00"
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600"
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <select
                    required
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 appearance-none"
                    onChange={e => setFormData({...formData, categoryID: parseInt(e.target.value)})}
                  >
                    <option value="">Select...</option>
                    {categories.map(c => (
                      <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Details about the condition and features..."
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600"
                  onChange={e => setFormData({...formData, postDescription: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-6">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Product Images</label>
              <div className="relative group border-2 border-dashed border-gray-200 rounded-[2rem] p-10 flex flex-col items-center justify-center hover:bg-gray-50 hover:border-blue-300 transition-all cursor-pointer">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="bg-blue-50 p-4 rounded-full text-blue-600 mb-4 group-hover:scale-110 transition-transform"><Upload size={32} /></div>
                <p className="font-bold text-gray-700">Click to upload photos</p>
              </div>
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {selectedImages.map((file, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative group shadow-sm"><img src={URL.createObjectURL(file)} className="w-full h-full object-cover" /></div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="pt-8 border-t flex items-center justify-end gap-4">
             <button type="button" onClick={() => window.history.back()} className="px-8 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-all">Cancel</button>
             <button type="submit" disabled={loading} className="bg-blue-600 text-white px-12 py-3 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50">
               {loading ? 'Creating...' : 'Publish Item'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
