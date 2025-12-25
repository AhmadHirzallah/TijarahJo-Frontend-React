
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { postService } from '../../services/postService';
import { categoryService } from '../../services/categoryService';
import { PostDetails, Category } from '../../types/api';
import Loader from '../../components/UI/Loader';
import ErrorState from '../../components/UI/ErrorState';
import { Search, SlidersHorizontal, Grid, List as ListIcon, MapPin, Heart } from 'lucide-react';

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
          rowsPerPage: 12
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
        {/* Sidebar Filters */}
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

        {/* Main Content */}
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
              {posts.map(post => (
                <a key={post.postID} href={`#/post/${post.postID}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={post.primaryImageUrl || `https://picsum.photos/400/300?random=${post.postID}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={post.postTitle} 
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {post.categoryName}
                    </div>
                    <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                      <Heart size={16} />
                    </button>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{post.postTitle}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                        <MapPin size={14} /> Amman, Jordan
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <span className="text-xl font-black text-blue-600">${post.price.toLocaleString()}</span>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {posts.length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
              <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <Search size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No results found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search keywords.</p>
              <button onClick={() => setSearchParams({})} className="mt-6 text-blue-600 font-bold hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Browse;
