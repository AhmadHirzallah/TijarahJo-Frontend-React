
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { categoryService } from '../../services/categoryService';
import { Category, PostImage } from '../../types/api';
import { ShoppingBag, Image as ImageIcon, AlertCircle, Upload, X, Plus } from 'lucide-react';
import Loader from '../../components/UI/Loader';
import { BACKEND_URL } from '../../services/api';

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<PostImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    postTitle: '',
    postDescription: '',
    price: 0,
    categoryID: 0,
    status: 0,
    isDeleted: false
  });

  const getAbsoluteImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${normalizedPath}`;
  };

  const loadPostData = async () => {
    try {
      const postData = await postService.getPostById(parseInt(id!));
      if (postData.ownerUserID !== user?.userID && user?.roleID !== 1) {
        alert("Unauthorized");
        navigate('/my-posts');
        return;
      }
      setFormData({
        postTitle: postData.postTitle,
        postDescription: postData.postDescription,
        price: postData.price,
        categoryID: postData.categoryID,
        status: postData.status,
        isDeleted: postData.isDeleted
      });
      setImages(postData.images || []);
    } catch (err) {
      setError("Failed to load post data");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const catData = await categoryService.getAll();
        setCategories(catData);
        await loadPostData();
      } catch (err) { 
        setError("Failed to load data"); 
      } finally { 
        setLoading(false); 
      }
    };
    init();
  }, [id, user, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');
    
    try {
      for (let i = 0; i < files.length; i++) {
        await postService.uploadImage(parseInt(id!), files[i]);
      }
      // Reload post data to get updated images
      await loadPostData();
    } catch (err: any) {
      // Check if upload succeeded despite error
      try {
        await loadPostData();
      } catch (reloadErr) {
        setError('Failed to upload image. Please try again.');
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await postService.updatePost(parseInt(id!), { ...formData, userID: user?.userID });
      navigate('/my-posts');
    } catch (err: any) { 
      // Check if the update actually succeeded despite the error
      try {
        const currentPost = await postService.getPostById(parseInt(id!));
        if (currentPost.postTitle === formData.postTitle && 
            currentPost.postDescription === formData.postDescription &&
            currentPost.price === formData.price &&
            currentPost.categoryID === formData.categoryID) {
          // Data was saved successfully, navigate away
          navigate('/my-posts');
          return;
        }
      } catch (verifyErr) {
        // Couldn't verify, show original error
      }
      setError(err.response?.data?.detail || 'An error occurred while updating the post.'); 
    }
    finally { setSaving(false); }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border">
        <div className="bg-indigo-600 p-8 text-white flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">Edit Listing</h1><p className="text-indigo-100 mt-1">Update your item details and photos</p></div>
          <ShoppingBag size={48} className="opacity-20" />
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100"><AlertCircle size={20} /> {error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Product Title</label>
                <input required type="text" className="mt-1 block w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600" value={formData.postTitle} onChange={e => setFormData({...formData, postTitle: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Price (JD)</label>
                  <input required type="number" step="1" min="0" max="1000000" className="mt-1 block w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <select required className="mt-1 block w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 appearance-none" value={formData.categoryID} onChange={e => setFormData({...formData, categoryID: parseInt(e.target.value)})}>
                    {categories.map(c => <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea required rows={6} className="mt-1 block w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600" value={formData.postDescription} onChange={e => setFormData({...formData, postDescription: e.target.value})} />
              </div>
            </div>
            
            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Product Images</label>
              
              {/* Current Images Grid */}
              <div className="grid grid-cols-2 gap-3">
                {images.filter(img => !img.isDeleted).map((img) => (
                  <div key={img.postImageID} className="relative group aspect-square rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                    <img 
                      src={getAbsoluteImageUrl(img.postImageURL)!} 
                      alt="Product" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                
                {/* Add Image Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-indigo-500 disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={32} />
                      <span className="text-xs font-bold uppercase tracking-wide">Add Photo</span>
                    </>
                  )}
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <p className="text-xs text-gray-400 text-center">
                Click "Add Photo" to upload images. Supported: JPG, PNG, WebP
              </p>
            </div>
          </div>
          <div className="pt-8 border-t flex items-center justify-end gap-4">
             <button type="button" onClick={() => navigate('/my-posts')} className="px-8 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-all">Cancel</button>
             <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-12 py-3 rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50">
               {saving ? 'Saving...' : 'Update Listing'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
