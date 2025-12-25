
import api from './api';
import { Category } from '../types/api';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  async create(name: string): Promise<Category> {
    const { data } = await api.post<Category>('/categories', { categoryName: name });
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
};
