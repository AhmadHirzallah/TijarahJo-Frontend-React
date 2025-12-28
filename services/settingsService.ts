/**
 * Settings Service
 * 
 * Connects to backend API for system settings management.
 * Settings are stored in database, not localStorage.
 */

import api from './api';

// ============================================
// TypeScript Types
// ============================================

export interface SettingResponse {
  settingID: number;
  settingKey: string;
  settingValue: string | null;
  settingGroup: string;
  description: string | null;
  dataType: 'String' | 'Int' | 'Bool' | 'Json';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  updatedByUserID: number | null;
}

export interface AllSettingsResponse {
  settings: SettingResponse[];
  totalCount: number;
  groupCounts: Record<string, number>;
}

export interface SupportContactResponse {
  supportEmail: string | null;
  supportWhatsApp: string | null;
  whatsAppLink: string | null;
  emailLink: string | null;
  isConfigured: boolean;
  whatsAppSupportLink: string | null;
}

export interface SettingsUpdateResponse {
  success: boolean;
  message: string;
  updatedAt: string;
  updatedCount: number;
}

export interface UpdateSupportContactRequest {
  supportEmail: string;
  supportWhatsApp: string;
}

// ============================================
// Settings Service
// ============================================

export const settingsService = {
  // ==================== PUBLIC (No Auth Required) ====================
  
  /**
   * Get support contact info (no auth required)
   * Use on: banned page, footer, contact page
   */
  getSupportContact: async (): Promise<SupportContactResponse> => {
    const { data } = await api.get<SupportContactResponse>('/settings/support');
    return data;
  },

  /**
   * Get all public settings (no auth required)
   */
  getPublicSettings: async (): Promise<AllSettingsResponse> => {
    const { data } = await api.get<AllSettingsResponse>('/settings/public');
    return data;
  },

  /**
   * Get a specific public setting (no auth required)
   */
  getPublicSetting: async (key: string): Promise<SettingResponse> => {
    const { data } = await api.get<SettingResponse>(`/settings/public/${key}`);
    return data;
  },

  // ==================== ADMIN (Auth Required) ====================
  
  /**
   * Get all settings (admin only)
   */
  getAllSettings: async (): Promise<AllSettingsResponse> => {
    const { data } = await api.get<AllSettingsResponse>('/settings');
    return data;
  },

  /**
   * Get settings grouped by category (admin only)
   */
  getSettingsGrouped: async (): Promise<any[]> => {
    const { data } = await api.get('/settings/grouped');
    return data;
  },

  /**
   * Get a specific setting (admin only)
   */
  getSetting: async (key: string): Promise<SettingResponse> => {
    const { data } = await api.get<SettingResponse>(`/settings/${key}`);
    return data;
  },

  /**
   * Update support contact settings (admin only)
   * Note: Some backends may return different response formats
   */
  updateSupportContact: async (request: UpdateSupportContactRequest): Promise<SettingsUpdateResponse> => {
    try {
      const response = await api.put('/settings/support', request);
      // Handle various response formats
      if (response.data) {
        return response.data as SettingsUpdateResponse;
      }
      // If no data but status is success (200/204), return success
      if (response.status >= 200 && response.status < 300) {
        return { success: true, message: 'Settings updated', updatedAt: new Date().toISOString(), updatedCount: 2 };
      }
      throw new Error('Unexpected response format');
    } catch (err: any) {
      // If it's a network error but not a 4xx/5xx, the save might have succeeded
      // Re-throw to let the caller handle it
      throw err;
    }
  },

  /**
   * Update a single setting (admin only)
   */
  updateSetting: async (key: string, value: string | null): Promise<SettingsUpdateResponse> => {
    const { data } = await api.put<SettingsUpdateResponse>(`/settings/${key}`, {
      settingKey: key,
      settingValue: value
    });
    return data;
  },

  /**
   * Update multiple settings (admin only)
   */
  updateSettingsBatch: async (
    settings: { settingKey: string; settingValue: string | null }[]
  ): Promise<SettingsUpdateResponse> => {
    const { data } = await api.put<SettingsUpdateResponse>('/settings/batch', { settings });
    return data;
  }
};

export default settingsService;
