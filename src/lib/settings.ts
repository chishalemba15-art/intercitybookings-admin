/**
 * Platform Settings Management
 * Handles reading and updating platform configuration
 */

import { db } from '@/lib/db';
import { platformSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface SettingsConfig {
  // Agent Settings
  minFloatForIndependentAgent: number;
  allowIndependentAgentRegistration: boolean;
  assignmentResponseTimeoutMinutes: number;

  // Lifts Settings
  liftsCostPerSearchView: number;
  liftsDailyPrice: number;
  liftsDailyAmount: number;
  liftsWeeklyPrice: number;
  liftsWeeklyAmount: number;
  liftsMonthlyPrice: number;
  liftsMonthlyAmount: number;

  // SMS Settings
  enableSmsNotifications: boolean;
  clickatellApiKey: string;
  clickatellApiId: string;

  // Notification Settings
  notifyAgentsOnNewBooking: boolean;
  notifyAdminOnEscalation: boolean;
  adminNotificationPhone: string;
}

export const DEFAULT_SETTINGS: SettingsConfig = {
  minFloatForIndependentAgent: 1000,
  allowIndependentAgentRegistration: true,
  assignmentResponseTimeoutMinutes: 30,
  liftsCostPerSearchView: 10,
  liftsDailyPrice: 20,
  liftsDailyAmount: 100,
  liftsWeeklyPrice: 100,
  liftsWeeklyAmount: 600,
  liftsMonthlyPrice: 300,
  liftsMonthlyAmount: 2000,
  enableSmsNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
  clickatellApiKey: process.env.CLICKATELL_API_KEY || '',
  clickatellApiId: process.env.CLICKATELL_API_ID || '',
  notifyAgentsOnNewBooking: true,
  notifyAdminOnEscalation: true,
  adminNotificationPhone: '+260773962307',
};

export class SettingsService {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Get a setting value
   */
  async getSetting(key: keyof SettingsConfig): Promise<any> {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    try {
      const result = await db
        .select()
        .from(platformSettings)
        .where(eq(platformSettings.settingKey, key))
        .limit(1);

      if (result.length > 0) {
        const value = this.parseValue(result[0].settingValue);
        this.cache.set(key, value);
        return value;
      }

      // Return default if not found
      const defaultValue = DEFAULT_SETTINGS[key];
      this.cache.set(key, defaultValue);
      return defaultValue;
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      return DEFAULT_SETTINGS[key];
    }
  }

  /**
   * Get all settings
   */
  async getAllSettings(): Promise<SettingsConfig> {
    try {
      const allSettings = await db.select().from(platformSettings);

      const config: any = { ...DEFAULT_SETTINGS };

      allSettings.forEach((setting) => {
        config[setting.settingKey] = this.parseValue(setting.settingValue);
      });

      return config;
    } catch (error) {
      console.error('Error getting all settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Update a setting
   */
  async updateSetting(
    key: keyof SettingsConfig,
    value: any,
    updatedBy?: number,
    description?: string
  ): Promise<boolean> {
    try {
      const stringValue = this.stringifyValue(value);

      const existing = await db
        .select()
        .from(platformSettings)
        .where(eq(platformSettings.settingKey, key))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(platformSettings)
          .set({
            settingValue: stringValue,
            updatedBy,
            updatedAt: new Date(),
          })
          .where(eq(platformSettings.settingKey, key));
      } else {
        // Insert new
        await db.insert(platformSettings).values({
          settingKey: key,
          settingValue: stringValue,
          description: description || `Setting for ${key}`,
          category: this.getCategoryForKey(key),
          updatedBy,
        });
      }

      // Clear cache
      this.cache.delete(key);

      return true;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      return false;
    }
  }

  /**
   * Update multiple settings at once
   */
  async updateMultipleSettings(
    settings: Partial<SettingsConfig>,
    updatedBy?: number
  ): Promise<boolean> {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await this.updateSetting(
          key as keyof SettingsConfig,
          value,
          updatedBy
        );
      }
      return true;
    } catch (error) {
      console.error('Error updating multiple settings:', error);
      return false;
    }
  }

  /**
   * Clear cache (call when settings are updated externally)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Parse setting value from string
   */
  private parseValue(value: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(value);
    } catch {
      // If not JSON, return as is
      return value;
    }
  }

  /**
   * Stringify value for storage
   */
  private stringifyValue(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value);
  }

  /**
   * Get category for a setting key
   */
  private getCategoryForKey(key: string): string {
    if (key.startsWith('lifts')) return 'lifts';
    if (key.includes('Agent')) return 'agents';
    if (key.includes('Sms') || key.includes('clickatell') || key.includes('Notification')) return 'notifications';
    return 'general';
  }
}

// Singleton instance
export const settingsService = new SettingsService();
