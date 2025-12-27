
import api from './api';
import { Post, PostDetails, PaginatedResponse, Review, UserPostsResponse } from '../types/api';

interface GetMyPostsParams {
  pageNumber?: number;
  rowsPerPage?: number;
  includeDeleted?: boolean;
}

export const postService = {
  async getPosts(params?: any): Promise<PaginatedResponse<PostDetails>> {
    const { data } = await api.get<PaginatedResponse<PostDetails>>('/posts/paginated', { params });
    return data;
  },

  /**
   * Get current authenticated user's posts
   */
  async getMyPosts(params?: GetMyPostsParams): Promise<UserPostsResponse> {
    const { data } = await api.get<UserPostsResponse>('/posts/my', { params });
    return data;
  },

  /**
   * Get posts by a specific user ID
   */
  async getPostsByUser(userId: number, params?: GetMyPostsParams): Promise<UserPostsResponse> {
    const { data } = await api.get<UserPostsResponse>(`/posts/user/${userId}`, { params });
    return data;
  },

  async getPostById(id: number): Promise<PostDetails> {
    const { data } = await api.get<PostDetails>(`/posts/${id}/details`);
    return data;
  },

  async createPost(payload: any): Promise<Post> {
    const { data } = await api.post<Post>('/posts', payload);
    return data;
  },

  async updatePost(id: number, payload: any): Promise<void> {
    await api.put(`/posts/${id}`, payload);
  },

  async deletePost(id: number): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  async uploadImage(postId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post(`/posts/${postId}/images/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  async createReview(postId: number, payload: { userID: number; rating: number; reviewText: string }): Promise<Review> {
    const { data } = await api.post<Review>(`/posts/${postId}/reviews`, payload);
    return data;
  }
};
