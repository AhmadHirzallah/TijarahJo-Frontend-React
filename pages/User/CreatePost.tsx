
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
  const [showDebug, setShowDebug] = useState(false); // Hidden by default
  
  const [formData, setFormData] = useState({
    postTitle: '',
    postDescription: '',
    price: 0,
    categoryID: 0,
    userID: user?.userID || 0
  });

  useEffect(() => {
    categoryService.getAll().then(setCategories);
    
    // DEBUG: Log user information
    console.log('👤 Current user:', user);
    console.log('📝 Initial form data:', formData);
    
    // Secret debug mode: Press Ctrl+Shift+D three times
    let ctrlShiftDCount = 0;
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        ctrlShiftDCount++;
        if (ctrlShiftDCount >= 3) {
          setShowDebug(true);
          console.log('🔓 Debug mode activated');
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Update userID when user changes
  useEffect(() => {
    if (user?.userID) {
      setFormData(prev => ({ ...prev, userID: user.userID }));
      console.log('🔄 Updated userID in form:', user.userID);
    }
  }, [user]);

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
    
    // DEBUG: Log the data being sent
    console.log('📤 Creating post with data:', formData);
    
    try {
      const post = await postService.createPost(formData);
      console.log('✅ Post created successfully:', post);
      
      if (selectedImages.length > 0) {
        console.log(`📸 Uploading ${selectedImages.length} images...`);
        for (const file of selectedImages) {
          await postService.uploadImage(post.postID, file);
          console.log(`✅ Uploaded image: ${file.name}`);
        }
      }
      setSuccess(true);
      setTimeout(() => window.location.href = '#/my-posts', 2000);
    } catch (err: any) {
      // DEBUG: Log detailed error information
      console.error('❌ Error creating post:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error data:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      // 🚨 LOG THE ACTUAL ERROR MESSAGE
      console.error('🚨 BACKEND ERROR MESSAGE:', err.response?.data?.detail || err.response?.data?.message || 'No detail provided');
      console.error('🚨 FULL ERROR OBJECT:', JSON.stringify(err.response?.data, null, 2));
      
      // Extract user-friendly error message
      let userMessage = '';
      const status = err.response?.status;
      const backendError = err.response?.data?.detail || err.response?.data?.message;
      
      if (status === 400) {
        userMessage = backendError || 'Invalid data. Please check all fields and try again.';
      } else if (status === 401) {
        userMessage = 'Session expired. Please log out and log back in.';
      } else if (status === 403) {
        userMessage = 'You do not have permission to perform this action.';
      } else if (status === 500) {
        userMessage = 'Server error. Please try again later or contact support.';
      } else {
        userMessage = backendError || 'Failed to create listing. Please try again.';
      }
      
      setError(userMessage);
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
            <div className="bg-red-50 text-red-700 p-5 rounded-2xl border-2 border-red-200 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-base mb-1">Unable to Create Listing</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* DEBUG: Hidden by default, press Ctrl+Shift+D three times to reveal */}
          {showDebug && (
            <details className="bg-gray-50 p-4 rounded-xl text-xs border-2 border-dashed border-gray-300">
              <summary className="font-bold cursor-pointer text-gray-600">🔓 Debug Mode Active (Hidden from users)</summary>
              <pre className="mt-2 text-gray-700 overflow-auto">{JSON.stringify(formData, null, 2)}</pre>
              <div className="mt-2 text-gray-600">
                <p>User ID: {user?.userID || 'NOT SET'}</p>
                <p>Categories loaded: {categories.length}</p>
                <p>Images selected: {selectedImages.length}</p>
              </div>
            </details>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Product Title</label>
                <input
                  required
                  type="text"
                  pattern= "[a-zA-Z0-9]{3,100}"
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
                    // can be float but precision of 2 decimal places
                    type="number"
                    pattern = "^\d+(\.\d{1,2})?$"
                    step="1"
                    min="0"
                    max="1000000"
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
                  pattern="[a-zA-Z0-9\s.,'-]{10,1000}"
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
