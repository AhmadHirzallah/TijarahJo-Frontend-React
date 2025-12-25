
import api from './api';
import { PhoneNumber } from '../types/api';

export const userService = {
  async getPhones(userId: number): Promise<{ phoneNumbers: PhoneNumber[], primaryPhone: string }> {
    const { data } = await api.get(`/users/${userId}/phones`);
    return data;
  },

  async addPhone(userId: number, payload: { phoneNumber: string, isPrimary: boolean }): Promise<PhoneNumber> {
    const { data } = await api.post(`/users/${userId}/phones`, payload);
    return data;
  },

  async updatePhone(userId: number, phoneId: number, payload: { phoneNumber: string, isPrimary: boolean, isDeleted: boolean }): Promise<void> {
    await api.put(`/users/${userId}/phones/${phoneId}`, payload);
  },

  async deletePhone(userId: number, phoneId: number): Promise<void> {
    await api.delete(`/users/${userId}/phones/${phoneId}`);
  }
};
