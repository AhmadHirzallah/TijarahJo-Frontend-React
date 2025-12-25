
import api from './api';
import { AdminDashboardStats, User, Post, Category, RoleID, Review } from '../types/api';

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const { data } = await api.get<AdminDashboardStats>('/admin/dashboard');
    return data;
  },

  async getAllUsers(params?: { includeDeleted?: boolean }): Promise<{ users: User[], totalCount: number }> {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  async getUserDetails(id: number): Promise<User & { totalPosts: number, totalImages: number }> {
    const { data } = await api.get(`/admin/users/${id}`);
    return data;
  },

  async updateUserRole(userId: number, roleId: RoleID): Promise<void> {
    await api.put(`/admin/users/${userId}/role`, { roleID: roleId });
  },

  async updateUserStatus(userId: number, status: number, reason?: string): Promise<void> {
    await api.put(`/admin/users/${userId}/status`, { status, reason });
  },

  async restoreUser(userId: number): Promise<void> {
    await api.post(`/admin/users/${userId}/restore`);
  },

  async permanentDeleteUser(userId: number): Promise<void> {
    await api.delete(`/admin/users/${userId}/permanent`);
  },

  async getAllPosts(params?: { includeDeleted?: boolean }): Promise<{ posts: Post[], totalCount: number }> {
    const { data } = await api.get('/admin/posts', { params });
    return data;
  },

  async updatePostStatus(postId: number, status: number, reason?: string): Promise<void> {
    await api.put(`/admin/posts/${postId}/status`, { status, reason });
  },

  async deletePost(postId: number): Promise<void> {
    await api.delete(`/admin/posts/${postId}`);
  },

  // Category Management
  async createCategory(name: string): Promise<void> {
    await api.post('/categories', { categoryName: name });
  },

  async updateCategory(id: number, name: string): Promise<void> {
    await api.put(`/categories/${id}`, { categoryName: name });
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },

  // Global Reviews Management
  async getAllReviews(): Promise<Review[]> {
    // Note: Documentation says /api/posts/{id}/reviews, 
    // but a real admin panel usually has a way to see recent reviews globally.
    // Assuming a global endpoint exists or using specific post reviews if needed.
    // For now, let's implement based on the docs providing post-specific reviews.
    const { data } = await api.get('/admin/dashboard'); // Dashboard usually returns latest reviews or stats
    return []; // Placeholder if global review list is not explicitly in docs
  }
};
