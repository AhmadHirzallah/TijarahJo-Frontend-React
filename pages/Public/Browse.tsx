
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { postService } from '../../services/postService';
import { categoryService } from '../../services/categoryService';
import { PostDetails, Category } from '../../types/api';
import Loader from '../../components/UI/Loader';
import ErrorState from '../../components/UI/ErrorState';
import { Search, SlidersHorizontal, Grid, List as ListIcon, MapPin, Package } from 'lucide-react';
import { BACKEND_URL } from '../../services/api';

const Browse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<PostDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const currentCategory = searchParams.get('category');
  const searchQuery = searchParams.get('q') || '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catData, postData] = await Promise.all([
        categoryService.getAll(),
        postService.getPosts({
          categoryID: currentCategory ? parseInt(currentCategory) : undefined,
          rowsPerPage: 12,
          q: searchQuery
        })
      ]);
      setCategories(catData);
      setPosts(postData.items);
      setTotalCount(postData.totalCount);
    } catch (err: any) {
      console.error(err);
      setError(err.message === "Network Error" ? "Connection failed. Please verify the API server is running." : "Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }, [currentCategory, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getAbsoluteImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${normalizedPath}`;
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0 space-y-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-blue-600" /> Categories
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setSearchParams({})}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${!currentCategory ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.categoryID}
                  onClick={() => setSearchParams({ category: cat.categoryID.toString() })}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentCategory === cat.categoryID.toString() ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {cat.categoryName}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentCategory 
                ? categories.find(c => c.categoryID.toString() === currentCategory)?.categoryName 
                : 'All Listings'} 
              <span className="ml-2 text-sm font-normal text-gray-400">({totalCount} items)</span>
            </h1>
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border">
              <button className="p-2 bg-gray-50 rounded-lg text-blue-600"><Grid size={18} /></button>
              <button className="p-2 text-gray-400 hover:text-gray-600"><ListIcon size={18} /></button>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => {
                const postRawImage = post.primaryImageUrl || (post.images && post.images.length > 0 ? post.images[0].postImageURL : null);
                const cardImage = getAbsoluteImageUrl(postRawImage);
                return (
                  <a key={post.postID} href={`#/post/${post.postID}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col">
                    <div className="relative h-56 overflow-hidden bg-slate-50">
                      {cardImage ? (
                        <img src={cardImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.postTitle} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-300">
                          <Package size={48} className="mb-2 opacity-40 group-hover:scale-110 transition-transform" />
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">No Media</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {post.categoryName}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{post.postTitle}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                          <MapPin size={14} /> Amman, Jordan
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <span className="text-xl font-black text-blue-600">{post.price.toLocaleString()} JD</span>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Browse;
