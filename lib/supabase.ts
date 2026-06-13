import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cpklaqcxjvdgkgnbzswk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwa2xhcWN4anZkZ2tnbmJ6c3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMTIwNzcsImV4cCI6MjA5Njg4ODA3N30.rIhJEeW5zaKyyHGBIlkup99Ssj_U9gS4tMVPOyXQwFI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number;
          slug: string;
          name: string;
          description: string | null;
          icon: string | null;
          color: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          slug: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          color?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          category_id: number;
          slug: string;
          name: string;
          tagline: string | null;
          description: string | null;
          logo_url: string | null;
          website_url: string | null;
          affiliate_url: string | null;
          affiliate_commission: string | null;
          affiliate_details: string | null;
          pricing_type: string | null;
          starting_price: string | null;
          overall_rating: number;
          review_count: number;
          is_featured: boolean;
          is_verified: boolean;
          pros: string[];
          cons: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: number;
          slug: string;
          name: string;
          tagline?: string | null;
          description?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          affiliate_url?: string | null;
          affiliate_commission?: string | null;
          affiliate_details?: string | null;
          pricing_type?: string | null;
          starting_price?: string | null;
          overall_rating?: number;
          review_count?: number;
          is_featured?: boolean;
          is_verified?: boolean;
          pros?: string[];
          cons?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: number;
          slug?: string;
          name?: string;
          tagline?: string | null;
          description?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          affiliate_url?: string | null;
          affiliate_commission?: string | null;
          affiliate_details?: string | null;
          pricing_type?: string | null;
          starting_price?: string | null;
          overall_rating?: number;
          review_count?: number;
          is_featured?: boolean;
          is_verified?: boolean;
          pros?: string[];
          cons?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      listing_attributes: {
        Row: {
          id: number;
          listing_id: string;
          attribute_key: string;
          attribute_value: string;
          attribute_type: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          listing_id: string;
          attribute_key: string;
          attribute_value: string;
          attribute_type?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          listing_id?: string;
          attribute_key?: string;
          attribute_value?: string;
          attribute_type?: string;
          created_at?: string;
        };
      };
      comparisons: {
        Row: {
          id: string;
          listing_ids: string[];
          category_id: number | null;
          title: string | null;
          view_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_ids: string[];
          category_id?: number | null;
          title?: string | null;
          view_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_ids?: string[];
          category_id?: number | null;
          title?: string | null;
          view_count?: number;
          created_at?: string;
        };
      };
      content_blocks: {
        Row: {
          id: number;
          page_slug: string;
          block_type: string;
          title: string | null;
          content: string | null;
          metadata: Record<string, unknown>;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          page_slug: string;
          block_type: string;
          title?: string | null;
          content?: string | null;
          metadata?: Record<string, unknown>;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          page_slug?: string;
          block_type?: string;
          title?: string | null;
          content?: string | null;
          metadata?: Record<string, unknown>;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type Category = Database['public']['Tables']['categories']['Row'];
export type Listing = Database['public']['Tables']['listings']['Row'];
export type ListingAttribute = Database['public']['Tables']['listing_attributes']['Row'];
export type Comparison = Database['public']['Tables']['comparisons']['Row'];
export type ContentBlock = Database['public']['Tables']['content_blocks']['Row'];
