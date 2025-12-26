
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types/api';
import { ShoppingBag, Image as ImageIcon, Save, AlertCircle } from 'lucide-react';
import Loader from '../../components/UI/Loader';

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    postTitle: '',
    postDescription: '',
    price: 0,
    categoryID: 0,
    status: 0,
    isDeleted: false
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [catData, postData] = await Promise.all([
          categoryService.getAll(),
          postService.getPostById(parseInt(id!))
        ]);
        if (postData.ownerUserID !== user?.userID && user?.roleID !== 1) {
          alert("Unauthorized");
          navigate('/my-posts');
          return;
        }
        setCategories(catData);
        setFormData({
          postTitle: postData.postTitle,
          postDescription: postData.postDescription,
          price: postData.price,
          categoryID: postData.categoryID,
          status: postData.status,
          isDeleted: postData.isDeleted
        });
      } catch (err) { setError("Failed to load post data"); }
      finally { setLoading(false); }
    };
    init();
  }, [id, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await postService.updatePost(parseInt(id!), { ...formData, userID: user?.userID });
      navigate('/my-posts');
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to update listing'); }
    finally { setSaving(false); }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border">
        <div className="bg-indigo-600 p-8 text-white flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">Edit Listing</h1><p className="text-indigo-100 mt-1">Update your item details</p></div>
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
                  <input required type="number" min="0" className="mt-1 block w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
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
            <div className="bg-gray-50 rounded-3xl p-6 flex flex-col justify-center text-center space-y-4"><ImageIcon className="mx-auto text-gray-300" size={64} /><p className="text-gray-500 font-medium">Manage photos on listing details page.</p></div>
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
