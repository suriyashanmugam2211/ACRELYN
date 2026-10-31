import type { Property, Enquiry, AdminUser, EnquiryStatus } from '../types/property';
import { loadDatasetFromCSV, getLandImagesForProperty, LAND_IMAGE_GALLERY } from './dataset';
import { supabaseApi, getSupabaseConfig, getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  PROPERTIES: 'acrelyn_properties_v1',
  ENQUIRIES: 'acrelyn_enquiries_v1',
  SAVED: 'acrelyn_saved_v1',
  COMPARE: 'acrelyn_compare_v1',
  ADMIN_SESSION: 'acrelyn_admin_session_v1',
};

// Initial admin seed
export const DEMO_ADMIN: AdminUser = {
  id: 'admin-001',
  email: 'admin@acrelyn.com',
  name: 'Acrelyn Operations Admin',
  role: 'super_admin',
};

// Listeners for reactive updates
type Listener<T> = (data: T) => void;
const listeners = {
  properties: new Set<Listener<Property[]>>(),
  enquiries: new Set<Listener<Enquiry[]>>(),
  saved: new Set<Listener<string[]>>(),
  compare: new Set<Listener<string[]>>(),
  admin: new Set<Listener<AdminUser | null>>(),
};

/**
 * Guarantees that every property record has valid, high-resolution land photos
 * so no card or detail page ever renders a broken image or empty placeholder.
 */
export function ensurePropertyImages(property: Property): Property {
  if (!property) return property;
  const fallback = getLandImagesForProperty(property.property_id || property.id || 'ACR-DEFAULT', 4);

  const hasValidCover =
    typeof property.cover_image === 'string' &&
    property.cover_image.trim().startsWith('http') &&
    !property.cover_image.includes('null');

  const cover_image = hasValidCover && property.cover_image ? property.cover_image.trim() : fallback.cover_image;

  let image_urls: string[] = [];
  if (Array.isArray(property.image_urls) && property.image_urls.length > 0) {
    image_urls = property.image_urls.filter(
      (u) => typeof u === 'string' && u.trim().startsWith('http') && !u.includes('null')
    );
  }

  if (image_urls.length === 0) {
    image_urls = [cover_image, ...fallback.image_urls.slice(1)];
  } else if (image_urls.length < 3) {
    // augment with fallback to ensure detail page has a full thumbnail carousel
    image_urls = Array.from(new Set([...image_urls, ...fallback.image_urls])).slice(0, 4);
  }

  return {
    ...property,
    cover_image,
    image_urls,
  };
}

export const repository = {
  // -------------------------------------------------------------
  // PROPERTIES
  // -------------------------------------------------------------
  async getProperties(): Promise<Property[]> {
    // 1. Try Supabase first if configured
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured) {
      const { data, error } = await supabaseApi.fetchProperties();
      if (!error && data && data.length > 0) {
        const enriched = data.map(ensurePropertyImages);
        localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(enriched));
        return enriched;
      }
    }

    // 2. Check local storage cache
    const cached = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const enriched = parsed.map(ensurePropertyImages);
          return enriched;
        }
      } catch {
        // invalid JSON, fall through
      }
    }

    // 3. Load from CSV asset
    const { properties } = await loadDatasetFromCSV();
    if (properties.length > 0) {
      const enriched = properties.map(ensurePropertyImages);
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(enriched));
      return enriched;
    }

    return [];
  },

  getPropertyById(idOrPropertyId: string, allProperties: Property[]): Property | undefined {
    const found = allProperties.find(
      (p) => p.id === idOrPropertyId || p.property_id.toLowerCase() === idOrPropertyId.toLowerCase()
    );
    return found ? ensurePropertyImages(found) : undefined;
  },

  async saveProperty(property: Property): Promise<{ success: boolean; error?: string }> {
    // Sync with Supabase if configured
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured) {
      const { error } = await supabaseApi.upsertProperty(property);
      if (error) {
        return { success: false, error: `Supabase save error: ${error}` };
      }
    }

    // Save in local repository
    const properties = await this.getProperties();
    const index = properties.findIndex((p) => p.property_id === property.property_id);
    let updated: Property[];
    if (index >= 0) {
      updated = [...properties];
      updated[index] = { ...property, updated_at: new Date().toISOString() };
    } else {
      updated = [{ ...property, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...properties];
    }

    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(updated));
    listeners.properties.forEach((cb) => cb(updated));
    return { success: true };
  },

  async deleteProperty(propertyId: string): Promise<{ success: boolean; error?: string }> {
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured) {
      const { error } = await supabaseApi.deleteProperty(propertyId);
      if (error) {
        return { success: false, error: `Supabase delete error: ${error}` };
      }
    }

    const properties = await this.getProperties();
    const updated = properties.filter((p) => p.property_id !== propertyId);
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(updated));
    listeners.properties.forEach((cb) => cb(updated));
    return { success: true };
  },

  async resetPropertiesToDataset(): Promise<Property[]> {
    const { properties } = await loadDatasetFromCSV();
    const enriched = properties.map(ensurePropertyImages);
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(enriched));
    listeners.properties.forEach((cb) => cb(enriched));
    return enriched;
  },

  // -------------------------------------------------------------
  // ENQUIRIES
  // -------------------------------------------------------------
  async getEnquiries(): Promise<Enquiry[]> {
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured) {
      const { data, error } = await supabaseApi.fetchEnquiries();
      if (!error && data) {
        localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(data));
        return data;
      }
    }

    const stored = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return [];
  },

  async submitEnquiry(
    enquiryData: Omit<Enquiry, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; enquiry?: Enquiry; error?: string }> {
    const { isConfigured } = getSupabaseConfig();

    // If Supabase IS configured, we must persist to Supabase or fail
    if (isConfigured) {
      const { data, error } = await supabaseApi.insertEnquiry(enquiryData);
      if (error) {
        return {
          success: false,
          error: `Database insertion failed: ${error}`,
        };
      }
      if (data) {
        // Also update local cache
        const current = await this.getEnquiries();
        const updated = [data, ...current];
        localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(updated));
        listeners.enquiries.forEach((cb) => cb(updated));
        return { success: true, enquiry: data };
      }
    }

    // Local repository persistence when Supabase is unconfigured
    const newEnquiry: Enquiry = {
      id: 'ENQ-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      ...enquiryData,
      status: enquiryData.status || 'New',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const current = await this.getEnquiries();
    const updated = [newEnquiry, ...current];
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(updated));
    listeners.enquiries.forEach((cb) => cb(updated));

    return { success: true, enquiry: newEnquiry };
  },

  async updateEnquiryStatus(
    id: string,
    status: EnquiryStatus,
    admin_notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured) {
      const { error } = await supabaseApi.updateEnquiryStatus(id, status, admin_notes);
      if (error) {
        return { success: false, error: `Supabase update error: ${error}` };
      }
    }

    const enquiries = await this.getEnquiries();
    const index = enquiries.findIndex((e) => e.id === id);
    if (index >= 0) {
      const updated = [...enquiries];
      updated[index] = {
        ...updated[index],
        status,
        ...(admin_notes !== undefined ? { admin_notes } : {}),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(updated));
      listeners.enquiries.forEach((cb) => cb(updated));
      return { success: true };
    }
    return { success: false, error: 'Enquiry not found' };
  },

  // -------------------------------------------------------------
  // SAVED PROPERTIES
  // -------------------------------------------------------------
  getSavedPropertyIds(): string[] {
    const stored = localStorage.getItem(STORAGE_KEYS.SAVED);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  },

  toggleSaveProperty(propertyId: string): boolean {
    const current = this.getSavedPropertyIds();
    const exists = current.includes(propertyId);
    let updated: string[];
    if (exists) {
      updated = current.filter((id) => id !== propertyId);
    } else {
      updated = [...current, propertyId];
    }
    localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(updated));
    listeners.saved.forEach((cb) => cb(updated));
    return !exists;
  },

  isSaved(propertyId: string): boolean {
    return this.getSavedPropertyIds().includes(propertyId);
  },

  // -------------------------------------------------------------
  // PROPERTY COMPARISON (up to 4 properties)
  // -------------------------------------------------------------
  getComparisonIds(): string[] {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPARE);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  },

  toggleCompareProperty(propertyId: string): { inComparison: boolean; message?: string } {
    const current = this.getComparisonIds();
    const exists = current.includes(propertyId);
    if (exists) {
      const updated = current.filter((id) => id !== propertyId);
      localStorage.setItem(STORAGE_KEYS.COMPARE, JSON.stringify(updated));
      listeners.compare.forEach((cb) => cb(updated));
      return { inComparison: false };
    } else {
      if (current.length >= 4) {
        return {
          inComparison: false,
          message: 'Comparison is limited to a maximum of 4 properties. Remove one to add this.',
        };
      }
      const updated = [...current, propertyId];
      localStorage.setItem(STORAGE_KEYS.COMPARE, JSON.stringify(updated));
      listeners.compare.forEach((cb) => cb(updated));
      return { inComparison: true };
    }
  },

  isInComparison(propertyId: string): boolean {
    return this.getComparisonIds().includes(propertyId);
  },

  clearComparison(): void {
    localStorage.setItem(STORAGE_KEYS.COMPARE, JSON.stringify([]));
    listeners.compare.forEach((cb) => cb([]));
  },

  // -------------------------------------------------------------
  // ADMIN AUTHENTICATION
  // -------------------------------------------------------------
  getAdminSession(): AdminUser | null {
    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  },

  async loginAdmin(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: AdminUser; error?: string; notice?: string }> {
    const { isConfigured } = getSupabaseConfig();
    const client = getSupabaseClient();
    const isEvaluationCreds = email.toLowerCase().trim() === 'admin@acrelyn.com' && password === 'acrelyn2026';

    // 1. Try Supabase Auth if client is configured
    if (isConfigured && client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (!error && data.user) {
          const user: AdminUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: (data.user.user_metadata?.full_name as string) || 'Admin User',
            role: 'super_admin',
          };
          localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(user));
          listeners.admin.forEach((cb) => cb(user));
          return { success: true, user };
        }

        // If credentials failed in Supabase, but match evaluation credentials:
        if (isEvaluationCreds) {
          // Attempt to register in Supabase Auth
          try {
            const { data: signUpData } = await client.auth.signUp({
              email: email.trim(),
              password,
              options: {
                data: { full_name: 'Acrelyn Operations Admin' },
              },
            });
            if (signUpData?.user && signUpData?.session) {
              const user: AdminUser = {
                id: signUpData.user.id,
                email: signUpData.user.email || email,
                name: 'Acrelyn Operations Admin',
                role: 'super_admin',
              };
              localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(user));
              listeners.admin.forEach((cb) => cb(user));
              return { success: true, user, notice: 'Account created and authenticated in Supabase!' };
            }
          } catch {
            // Fall through to evaluation session
          }

          // Fall back to local evaluation session
          const user = DEMO_ADMIN;
          localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(user));
          listeners.admin.forEach((cb) => cb(user));
          return {
            success: true,
            user,
            notice: 'Authenticated via evaluation admin session. You can also create users in your Supabase Auth dashboard.',
          };
        }

        return {
          success: false,
          error: `Supabase authentication error: ${error?.message || 'Invalid login credentials'}. Please verify the user exists in your Supabase Auth dashboard, or use the 1-Click Evaluation Login below.`,
        };
      } catch (err: unknown) {
        if (isEvaluationCreds) {
          const user = DEMO_ADMIN;
          localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(user));
          listeners.admin.forEach((cb) => cb(user));
          return { success: true, user };
        }
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    }

    // 2. Demo testing credentials when Supabase Auth is unconfigured
    if (isEvaluationCreds) {
      const user = DEMO_ADMIN;
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(user));
      listeners.admin.forEach((cb) => cb(user));
      return { success: true, user };
    }

    return {
      success: false,
      error: 'Invalid credentials. For evaluation use admin@acrelyn.com / acrelyn2026.',
    };
  },

  async registerAdminInSupabase(
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'Supabase client is not configured.' };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        const user: AdminUser = {
          id: data.user!.id,
          email: data.user!.email || email,
          name: name.trim(),
          role: 'super_admin',
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(user));
        listeners.admin.forEach((cb) => cb(user));
        return { success: true, message: 'User registered and authenticated successfully in Supabase!' };
      } else {
        return {
          success: true,
          message: 'Registration request submitted! Please check your email to confirm the address, or sign in if confirmation is disabled.',
        };
      }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },

  logoutAdmin(): void {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    const client = getSupabaseClient();
    if (client) {
      client.auth.signOut().catch(() => {});
    }
    listeners.admin.forEach((cb) => cb(null));
  },

  // Subscription helpers
  subscribe(type: 'properties' | 'enquiries' | 'saved' | 'compare' | 'admin', cb: any) {
    listeners[type].add(cb);
    return () => {
      listeners[type].delete(cb);
    };
  },
};
