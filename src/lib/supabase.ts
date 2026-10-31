import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Property, Enquiry } from '../types/property';

// Default Supabase project credentials provided by user
const DEFAULT_SUPABASE_URL = 'https://rjinrzanrttyjbsrcroy.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_hGj1E0Xp6ECjN__ePLYDfQ_IFuKYPAQ';

// Environment variables or localStorage overrides
const getEnvOrStored = (key: string, storedKey: string): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(storedKey);
    if (stored) return stored;
  }
  return (import.meta.env[key] as string) || '';
};

export const getSupabaseConfig = () => {
  const url = getEnvOrStored('VITE_SUPABASE_URL', 'acrelyn_supabase_url') || DEFAULT_SUPABASE_URL;
  const anonKey = getEnvOrStored('VITE_SUPABASE_ANON_KEY', 'acrelyn_supabase_anon_key') || DEFAULT_SUPABASE_ANON_KEY;
  return { url, anonKey, isConfigured: Boolean(url && anonKey && url.startsWith('http')) };
};

export const setSupabaseCustomConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    if (url && anonKey) {
      localStorage.setItem('acrelyn_supabase_url', url.trim());
      localStorage.setItem('acrelyn_supabase_anon_key', anonKey.trim());
    } else {
      localStorage.removeItem('acrelyn_supabase_url');
      localStorage.removeItem('acrelyn_supabase_anon_key');
    }
    // Reinitialize client
    supabaseInstance = null;
  }
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
};

export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  schemaPending?: boolean;
}> => {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials are not configured.',
    };
  }

  try {
    const { error } = await client.from('properties').select('count', { count: 'exact', head: true });
    if (error) {
      // Check if project exists but table is not yet created
      if (
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.message.includes('relation "public.properties" does not exist') ||
        error.message.includes('Could not find the table')
      ) {
        return {
          success: true,
          schemaPending: true,
          message:
            'Handshake with Supabase project succeeded! The "properties" and "enquiries" tables need to be created. Please run the SQL migration script in your Supabase SQL Editor.',
        };
      }
      return {
        success: false,
        message: `Database response: ${error.message} (Code: ${error.code})`,
      };
    }
    return {
      success: true,
      schemaPending: false,
      message: 'Successfully connected to Supabase PostgreSQL! Database schema and tables are active.',
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Connection failed: ${errMsg}`,
    };
  }
};

// Supabase API operations
export const supabaseApi = {
  async fetchProperties(): Promise<{ data: Property[] | null; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) return { data: null, error: 'Supabase not configured' };

    try {
      const { data, error } = await client
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return { data: null, error: error.message };
      return { data: data as Property[], error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : String(err) };
    }
  },

  async insertEnquiry(
    enquiry: Omit<Enquiry, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: Enquiry | null; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { data: null, error: 'Database credentials not configured.' };
    }

    try {
      const { data, error } = await client
        .from('enquiries')
        .insert([
          {
            property_id: enquiry.property_id,
            customer_name: enquiry.customer_name,
            email: enquiry.email,
            phone: enquiry.phone,
            message: enquiry.message,
            status: enquiry.status || 'New',
          },
        ])
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Enquiry, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : String(err) };
    }
  },

  async fetchEnquiries(): Promise<{ data: Enquiry[] | null; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) return { data: null, error: 'Supabase not configured' };

    try {
      const { data, error } = await client
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return { data: null, error: error.message };
      return { data: data as Enquiry[], error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : String(err) };
    }
  },

  async updateEnquiryStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<{ error: string | null }> {
    const client = getSupabaseClient();
    if (!client) return { error: 'Supabase not configured' };

    try {
      const updatePayload: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (notes !== undefined) {
        updatePayload.admin_notes = notes;
      }

      const { error } = await client.from('enquiries').update(updatePayload).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  },

  async upsertProperty(property: Partial<Property>): Promise<{ data: Property | null; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) return { data: null, error: 'Supabase not configured' };

    try {
      const { data, error } = await client
        .from('properties')
        .upsert([property])
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Property, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : String(err) };
    }
  },

  async deleteProperty(propertyId: string): Promise<{ error: string | null }> {
    const client = getSupabaseClient();
    if (!client) return { error: 'Supabase not configured' };

    try {
      const { error } = await client.from('properties').delete().eq('property_id', propertyId);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  },

  /**
   * Batch seed properties into Supabase
   */
  async seedPropertiesBatch(
    properties: Property[],
    onProgress?: (progress: number, total: number) => void
  ): Promise<{ success: boolean; inserted: number; error?: string }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, inserted: 0, error: 'Supabase not configured' };

    try {
      const BATCH_SIZE = 50;
      let inserted = 0;

      for (let i = 0; i < properties.length; i += BATCH_SIZE) {
        const batch = properties.slice(i, i + BATCH_SIZE).map((p) => ({
          property_id: p.property_id,
          property_name: p.property_name,
          location: p.location,
          plot_area_sqft: p.plot_area_sqft,
          price_inr: p.price_inr,
          facing: p.facing,
          land_type: p.land_type,
          facilities: p.facilities,
          latitude: p.latitude,
          longitude: p.longitude,
          source_url: p.source_url,
          availability_status: p.availability_status,
          verification_status: p.verification_status,
          data_type: p.data_type,
          notes: p.notes,
          image_urls: p.image_urls,
          cover_image: p.cover_image,
        }));

        const { error } = await client.from('properties').upsert(batch, { onConflict: 'property_id' });
        if (error) {
          return { success: false, inserted, error: `Batch error at item ${i}: ${error.message}` };
        }

        inserted += batch.length;
        if (onProgress) {
          onProgress(inserted, properties.length);
        }
      }

      return { success: true, inserted };
    } catch (err: unknown) {
      return { success: false, inserted: 0, error: err instanceof Error ? err.message : String(err) };
    }
  },
};
