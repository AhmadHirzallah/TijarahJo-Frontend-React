
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { UserPost, PostStatus } from '../../types/api';
import Loader from '../../components/UI/Loader';
import { Trash2, Edit3, ExternalLink, Package } from 'lucide-react';
import { Link } from 'react-router';
import { BACKEND_URL } from '../../services/api';

const MyPosts: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchMyPosts();
  }, [currentPage]);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await postService.getMyPosts({
        pageNumber: currentPage,
        rowsPerPage: 20
      });
      
      setPosts(response.items);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err: any) {
      console.error('Failed to fetch posts:', err);
      setError(err.response?.data?.detail || 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Convert relative image URL to absolute URL
   */
  const getAbsoluteImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${normalizedPath}`;
  };

  /**
   * Handle post deletion
   */
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      await postService.deletePost(id);
      // Remove from local state
      setPosts(posts.filter(p => p.postID !== id));
      setTotalCount(prev => prev - 1);
      
      // Show success message
      alert("Listing deleted successfully!");
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error data:', err.response?.data);
      
      const status = err.response?.status;
      const backendError = err.response?.data?.detail || err.response?.data?.message;
      
      let errorMessage = '';
      
      if (status === 500) {
        errorMessage = backendError || 
          "Server error while deleting. The post may have associated data (images, reviews). Please contact support or try again later.";
      } else if (status === 404) {
        errorMessage = "Post not found. It may have already been deleted.";
      } else if (status === 403) {
        errorMessage = "You don't have permission to delete this post.";
      } else if (status === 401) {
        errorMessage = "Session expired. Please log out and log back in.";
      } else {
        errorMessage = backendError || "Failed to delete listing. Please try again.";
      }
      
      alert(errorMessage);
    }
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status: PostStatus) => {
    const styles: Record<PostStatus, string> = {
      [PostStatus.Draft]: 'bg-gray-100 text-gray-600',
      [PostStatus.PendingReview]: 'bg-yellow-100 text-yellow-700',
      [PostStatus.Active]: 'bg-green-100 text-green-700',
      [PostStatus.Sold]: 'bg-blue-100 text-blue-700',
      [PostStatus.Expired]: 'bg-red-100 text-red-600',
      [PostStatus.Rejected]: 'bg-red-100 text-red-700',
      [PostStatus.Removed]: 'bg-gray-100 text-gray-500',
      [PostStatus.Deleted]: 'bg-gray-100 text-gray-400',
    };
    return styles[status] || 'bg-gray-100 text-gray-500';
  };

  if (loading) return <Loader fullScreen />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchMyPosts}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Listings</h1>
          <p className="text-gray-500 font-medium">
            {totalCount} {totalCount === 1 ? 'listing' : 'listings'} total
          </p>
        </div>
        <Link 
          to="/create-post" 
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
        >
          + New Listing
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Item
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Price
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.filter(post => !post.isDeleted).map(post => {
                // Get image URL - prefer primaryImageUrl, fallback to first image
                const imageUrl = getAbsoluteImageUrl(
                  post.primaryImageUrl || 
                  (post.images.length > 0 ? post.images[0].postImageURL : null)
                );

                return (
                  <tr key={post.postID} className="hover:bg-gray-50 transition-colors">
                    {/* Item Info */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              className="w-full h-full object-cover" 
                              alt={post.postTitle}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package size={20} className="opacity-40" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{post.postTitle}</p>
                          <p className="text-xs text-gray-400">
                            {post.categoryName || 'Uncategorized'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(post.status)}`}>
                        {post.statusName || PostStatus[post.status]}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-8 py-6 font-bold text-blue-600">
                      {post.price.toLocaleString()} JD
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-6 text-right space-x-2">
                      <Link 
                        to={`/post/${post.postID}`} 
                        className="p-2 text-gray-400 hover:text-blue-600 inline-block"
                        title="View"
                      >
                        <ExternalLink size={18} />
                      </Link>
                      <Link 
                        to={`/edit-post/${post.postID}`} 
                        className="p-2 text-gray-400 hover:text-orange-600 inline-block"
                        title="Edit"
                      >
                        <Edit3 size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(post.postID)} 
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="py-20 text-center text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">No listings yet</p>
            <p className="text-sm mt-2">Create your first listing to start selling!</p>
            <Link 
              to="/create-post"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              Create Listing
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
