
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { PostDetails, PostStatus } from '../../types/api';
import Loader from '../../components/UI/Loader';
import { Trash2, Edit3, ExternalLink, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyPosts: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      postService.getPosts({ userID: user.userID }).then(res => {
        setPosts(res.items);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this listing permanently?")) {
      try {
        await postService.deletePost(id);
        setPosts(posts.filter(p => p.postID !== id));
      } catch (err) {
        alert("Deletion failed");
      }
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Listings</h1>
          <p className="text-gray-500 font-medium">Manage and track your active marketplace items</p>
        </div>
        <Link to="/create-post" className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
          + New Listing
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map(post => (
                <tr key={post.postID} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                        <img src={post.primaryImageUrl || 'https://picsum.photos/100'} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{post.postTitle}</p>
                        <p className="text-xs text-gray-400">{post.categoryName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      post.status === PostStatus.Active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {PostStatus[post.status]}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-bold text-blue-600">
                    ${post.price.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <Link to={`/post/${post.postID}`} className="p-2 text-gray-400 hover:text-blue-600 inline-block">
                      <ExternalLink size={18} />
                    </Link>
                    <Link to={`/edit-post/${post.postID}`} className="p-2 text-gray-400 hover:text-orange-600 inline-block">
                      <Edit3 size={18} />
                    </Link>
                    <button onClick={() => handleDelete(post.postID)} className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {posts.length === 0 && (
          <div className="py-20 text-center text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">No listings yet</p>
            <p className="text-sm">Items you list for sale will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
