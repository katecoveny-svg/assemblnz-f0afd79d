export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      action_queue: {
        Row: {
          agent_id: string
          created_at: string
          description: string
          due_date: string | null
          id: string
          priority: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_memory: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          memory_key: string
          memory_value: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          memory_key: string
          memory_value?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          memory_key?: string
          memory_value?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_status: {
        Row: {
          agent_id: string
          is_online: boolean
          maintenance_message: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          is_online?: boolean
          maintenance_message?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          is_online?: boolean
          maintenance_message?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      agent_training: {
        Row: {
          agent_id: string
          business_context: string | null
          created_at: string
          faqs: Json | null
          id: string
          personality: string | null
          role_fields: Json | null
          rules: Json | null
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          business_context?: string | null
          created_at?: string
          faqs?: Json | null
          id?: string
          personality?: string | null
          role_fields?: Json | null
          rules?: Json | null
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          business_context?: string | null
          created_at?: string
          faqs?: Json | null
          id?: string
          personality?: string | null
          role_fields?: Json | null
          rules?: Json | null
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_triggers: {
        Row: {
          created_at: string
          id: string
          payload: Json
          status: string
          target_action: string
          target_agent: string
          trigger_agent: string
          trigger_event: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          status?: string
          target_action: string
          target_agent: string
          trigger_agent: string
          trigger_event: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          status?: string
          target_action?: string
          target_agent?: string
          trigger_agent?: string
          trigger_event?: string
          user_id?: string
        }
        Relationships: []
      }
      automations: {
        Row: {
          agent_id: string | null
          category: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          run_count: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          run_count?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          run_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          arrival: string
          arrival_method: string | null
          created_at: string
          departure: string
          dietary: string | null
          guest_name: string
          id: string
          nationality: string | null
          notes: string | null
          occasion: string | null
          rate: string | null
          requests: string | null
          returning_guest: boolean | null
          room: string
          status: string
          updated_at: string
          user_id: string
          vip: boolean | null
        }
        Insert: {
          arrival: string
          arrival_method?: string | null
          created_at?: string
          departure: string
          dietary?: string | null
          guest_name: string
          id?: string
          nationality?: string | null
          notes?: string | null
          occasion?: string | null
          rate?: string | null
          requests?: string | null
          returning_guest?: boolean | null
          room: string
          status?: string
          updated_at?: string
          user_id: string
          vip?: boolean | null
        }
        Update: {
          arrival?: string
          arrival_method?: string | null
          created_at?: string
          departure?: string
          dietary?: string | null
          guest_name?: string
          id?: string
          nationality?: string | null
          notes?: string | null
          occasion?: string | null
          rate?: string | null
          requests?: string | null
          returning_guest?: boolean | null
          room?: string
          status?: string
          updated_at?: string
          user_id?: string
          vip?: boolean | null
        }
        Relationships: []
      }
      brand_profiles: {
        Row: {
          audience: string | null
          brand_dna: Json | null
          business_name: string | null
          created_at: string
          creative_brief: Json | null
          id: string
          industry: string | null
          key_message: string | null
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audience?: string | null
          brand_dna?: Json | null
          business_name?: string | null
          created_at?: string
          creative_brief?: Json | null
          id?: string
          industry?: string | null
          key_message?: string | null
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audience?: string | null
          brand_dna?: Json | null
          business_name?: string | null
          created_at?: string
          creative_brief?: Json | null
          id?: string
          industry?: string | null
          key_message?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          audience: string | null
          body_json: Json | null
          click_count: number | null
          created_at: string
          goal: string | null
          id: string
          name: string
          open_count: number | null
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject_line: string | null
          tone: string | null
          user_id: string
        }
        Insert: {
          audience?: string | null
          body_json?: Json | null
          click_count?: number | null
          created_at?: string
          goal?: string | null
          id?: string
          name: string
          open_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject_line?: string | null
          tone?: string | null
          user_id: string
        }
        Update: {
          audience?: string | null
          body_json?: Json | null
          click_count?: number | null
          created_at?: string
          goal?: string | null
          id?: string
          name?: string
          open_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject_line?: string | null
          tone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          avatar_color: string | null
          bus_route_id: string | null
          created_at: string
          family_id: string
          id: string
          name: string
          school: string | null
          year_level: string | null
        }
        Insert: {
          avatar_color?: string | null
          bus_route_id?: string | null
          created_at?: string
          family_id: string
          id?: string
          name: string
          school?: string | null
          year_level?: string | null
        }
        Update: {
          avatar_color?: string | null
          bus_route_id?: string | null
          created_at?: string
          family_id?: string
          id?: string
          name?: string
          school?: string | null
          year_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          business_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          user_id: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          user_id: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      compliance_items: {
        Row: {
          category: string
          created_at: string
          due_date: string | null
          id: string
          last_completed: string | null
          notes: string | null
          property_id: string
          reminder_enabled: boolean | null
          status: Database["public"]["Enums"]["compliance_status"] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          due_date?: string | null
          id?: string
          last_completed?: string | null
          notes?: string | null
          property_id: string
          reminder_enabled?: boolean | null
          status?: Database["public"]["Enums"]["compliance_status"] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          due_date?: string | null
          id?: string
          last_completed?: string | null
          notes?: string | null
          property_id?: string
          reminder_enabled?: boolean | null
          status?: Database["public"]["Enums"]["compliance_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_items_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
        }
        Relationships: []
      }
      conversation_summaries: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          key_facts_extracted: Json
          summary: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          key_facts_extracted?: Json
          summary: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          key_facts_extracted?: Json
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_messages: {
        Row: {
          id: string
          message_count: number
          message_date: string
          user_id: string
        }
        Insert: {
          id?: string
          message_count?: number
          message_date?: string
          user_id: string
        }
        Update: {
          id?: string
          message_count?: number
          message_date?: string
          user_id?: string
        }
        Relationships: []
      }
      delivery_requests: {
        Row: {
          child_id: string | null
          created_at: string
          currency: string | null
          delivery_provider_id: string | null
          dropoff_address: string
          estimated_arrival: string | null
          family_id: string
          fee_cents: number | null
          id: string
          item_description: string
          pickup_address: string
          status: string
          tracking_url: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          currency?: string | null
          delivery_provider_id?: string | null
          dropoff_address: string
          estimated_arrival?: string | null
          family_id: string
          fee_cents?: number | null
          id?: string
          item_description: string
          pickup_address: string
          status?: string
          tracking_url?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string
          currency?: string | null
          delivery_provider_id?: string | null
          dropoff_address?: string
          estimated_arrival?: string | null
          family_id?: string
          fee_cents?: number | null
          id?: string
          item_description?: string
          pickup_address?: string
          status?: string
          tracking_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_requests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_requests_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          child_id: string | null
          created_at: string
          description: string | null
          end_at: string | null
          family_id: string
          id: string
          location: string | null
          notes: string | null
          source: string | null
          source_message_id: string | null
          start_at: string
          title: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          description?: string | null
          end_at?: string | null
          family_id: string
          id?: string
          location?: string | null
          notes?: string | null
          source?: string | null
          source_message_id?: string | null
          start_at: string
          title: string
        }
        Update: {
          child_id?: string | null
          created_at?: string
          description?: string | null
          end_at?: string | null
          family_id?: string
          id?: string
          location?: string | null
          notes?: string | null
          source?: string | null
          source_message_id?: string | null
          start_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          nz_region: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          nz_region?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          nz_region?: string | null
        }
        Relationships: []
      }
      family_invites: {
        Row: {
          code: string | null
          created_at: string
          created_by: string | null
          family_id: string
          id: string
          role: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          family_id: string
          id?: string
          role?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          family_id?: string
          id?: string
          role?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_invites_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          created_at: string
          family_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          agent_name: string
          contact_email: string | null
          contact_name: string
          created_at: string
          due_date: string | null
          id: string
          lead_id: string | null
          notes: string | null
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          agent_name?: string
          contact_email?: string | null
          contact_name: string
          created_at?: string
          due_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          status?: string
          subject: string
          user_id: string
        }
        Update: {
          agent_name?: string
          contact_email?: string | null
          contact_name?: string
          created_at?: string
          due_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      gear_rules: {
        Row: {
          created_at: string
          family_id: string
          id: string
          items: string[]
          subject: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          items: string[]
          subject: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          items?: string[]
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "gear_rules_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      haven_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          related_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      helm_integrations: {
        Row: {
          created_at: string
          family_id: string
          id: string
          provider: string
          scopes: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          provider: string
          scopes?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          provider?: string
          scopes?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "helm_integrations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      inbox_messages: {
        Row: {
          family_id: string
          id: string
          provider: string | null
          raw_text: string | null
          received_at: string
          sender: string | null
          status: string
          subject: string | null
        }
        Insert: {
          family_id: string
          id?: string
          provider?: string | null
          raw_text?: string | null
          received_at?: string
          sender?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          family_id?: string
          id?: string
          provider?: string | null
          raw_text?: string | null
          received_at?: string
          sender?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inbox_messages_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_notes: {
        Row: {
          created_at: string
          id: string
          note: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_notes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      job_offers: {
        Row: {
          id: string
          job_id: string
          responded_at: string | null
          sent_at: string | null
          status: string | null
          token: string | null
          tradie_id: string
        }
        Insert: {
          id?: string
          job_id: string
          responded_at?: string | null
          sent_at?: string | null
          status?: string | null
          token?: string | null
          tradie_id: string
        }
        Update: {
          id?: string
          job_id?: string
          responded_at?: string | null
          sent_at?: string | null
          status?: string | null
          token?: string | null
          tradie_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "maintenance_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_offers_tradie_id_fkey"
            columns: ["tradie_id"]
            isOneToOne: false
            referencedRelation: "tradies"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          last_activity: string | null
          name: string
          notes: string | null
          phone: string | null
          score: string | null
          source: string | null
          stage: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_activity?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          score?: string | null
          source?: string | null
          stage?: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_activity?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          score?: string | null
          source?: string | null
          stage?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      maintenance_jobs: {
        Row: {
          access_instructions: string | null
          budget_max: number | null
          budget_min: number | null
          category: string | null
          completed_date: string | null
          created_at: string
          description: string | null
          id: string
          invoice_amount: number | null
          job_size: string | null
          notes: string | null
          property_id: string
          reported_date: string | null
          requires_quote: boolean | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
          tradie_id: string | null
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"] | null
          user_id: string
        }
        Insert: {
          access_instructions?: string | null
          budget_max?: number | null
          budget_min?: number | null
          category?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          invoice_amount?: number | null
          job_size?: string | null
          notes?: string | null
          property_id: string
          reported_date?: string | null
          requires_quote?: boolean | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
          tradie_id?: string | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
          user_id: string
        }
        Update: {
          access_instructions?: string | null
          budget_max?: number | null
          budget_min?: number | null
          category?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          invoice_amount?: number | null
          job_size?: string | null
          notes?: string | null
          property_id?: string
          reported_date?: string | null
          requires_quote?: boolean | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
          tradie_id?: string | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_jobs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_jobs_tradie_id_fkey"
            columns: ["tradie_id"]
            isOneToOne: false
            referencedRelation: "tradies"
            referencedColumns: ["id"]
          },
        ]
      }
      message_log: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          message_preview: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          message_preview: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          message_preview?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      output_versions: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          id: string
          output_type: string
          title: string
          user_id: string
          version: string
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string
          id?: string
          output_type?: string
          title: string
          user_id: string
          version?: string
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          id?: string
          output_type?: string
          title?: string
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      packing_items: {
        Row: {
          child_id: string | null
          created_at: string
          event_id: string | null
          family_id: string
          id: string
          item_name: string
          packed: boolean
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          event_id?: string | null
          family_id: string
          id?: string
          item_name: string
          packed?: boolean
        }
        Update: {
          child_id?: string | null
          created_at?: string
          event_id?: string | null
          family_id?: string
          id?: string
          item_name?: string
          packed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "packing_items_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packing_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packing_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      parsed_items: {
        Row: {
          child_id: string | null
          confidence: number | null
          created_at: string
          family_id: string
          id: string
          item_type: string
          message_id: string | null
          parsed_data: Json
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          child_id?: string | null
          confidence?: number | null
          created_at?: string
          family_id: string
          id?: string
          item_type: string
          message_id?: string | null
          parsed_data: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          child_id?: string | null
          confidence?: number | null
          created_at?: string
          family_id?: string
          id?: string
          item_type?: string
          message_id?: string | null
          parsed_data?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "parsed_items_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parsed_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parsed_items_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "inbox_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          created_at: string
          id: string
          image_url: string | null
          inspection_notes: string | null
          next_inspection_date: string | null
          notes: string | null
          region: string
          suburb: string
          tenant_email: string | null
          tenant_name: string | null
          tenant_phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          image_url?: string | null
          inspection_notes?: string | null
          next_inspection_date?: string | null
          notes?: string | null
          region?: string
          suburb: string
          tenant_email?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          image_url?: string | null
          inspection_notes?: string | null
          next_inspection_date?: string | null
          notes?: string | null
          region?: string
          suburb?: string
          tenant_email?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          agent_id: string
          agent_name: string
          content: string
          created_at: string
          id: string
          preview: string
          user_id: string
        }
        Insert: {
          agent_id: string
          agent_name: string
          content: string
          created_at?: string
          id?: string
          preview: string
          user_id: string
        }
        Update: {
          agent_id?: string
          agent_name?: string
          content?: string
          created_at?: string
          id?: string
          preview?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_context: {
        Row: {
          confidence: number
          context_key: string
          context_value: Json
          created_at: string
          id: string
          source_agent: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number
          context_key: string
          context_value?: Json
          created_at?: string
          id?: string
          source_agent: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number
          context_key?: string
          context_value?: Json
          created_at?: string
          id?: string
          source_agent?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          caption: string
          created_at: string
          hashtags: string | null
          id: string
          platform: string
          scheduled_at: string | null
          status: string
          tone: string | null
          topic: string | null
          user_id: string
        }
        Insert: {
          caption: string
          created_at?: string
          hashtags?: string | null
          id?: string
          platform: string
          scheduled_at?: string | null
          status?: string
          tone?: string | null
          topic?: string | null
          user_id: string
        }
        Update: {
          caption?: string
          created_at?: string
          hashtags?: string | null
          id?: string
          platform?: string
          scheduled_at?: string | null
          status?: string
          tone?: string | null
          topic?: string | null
          user_id?: string
        }
        Relationships: []
      }
      spark_apps: {
        Row: {
          created_at: string
          display_name: string
          html_content: string
          id: string
          meta_description: string | null
          name: string
          password_hash: string | null
          show_branding: boolean
          status: string
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          created_at?: string
          display_name: string
          html_content: string
          id?: string
          meta_description?: string | null
          name: string
          password_hash?: string | null
          show_branding?: boolean
          status?: string
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          created_at?: string
          display_name?: string
          html_content?: string
          id?: string
          meta_description?: string | null
          name?: string
          password_hash?: string | null
          show_branding?: boolean
          status?: string
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          child_id: string | null
          completed: boolean
          created_at: string
          due_at: string | null
          family_id: string
          id: string
          source: string | null
          source_message_id: string | null
          title: string
        }
        Insert: {
          child_id?: string | null
          completed?: boolean
          created_at?: string
          due_at?: string | null
          family_id: string
          id?: string
          source?: string | null
          source_message_id?: string | null
          title: string
        }
        Update: {
          child_id?: string | null
          completed?: boolean
          created_at?: string
          due_at?: string | null
          family_id?: string
          id?: string
          source?: string | null
          source_message_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_requests: {
        Row: {
          created_at: string
          description: string
          id: string
          photos: string[] | null
          property_id: string
          status: string | null
          tenant_name: string | null
          urgency: Database["public"]["Enums"]["urgency_level"] | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          photos?: string[] | null
          property_id: string
          status?: string | null
          tenant_name?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          photos?: string[] | null
          property_id?: string
          status?: string | null
          tenant_name?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      timetables: {
        Row: {
          child_id: string
          created_at: string
          day_of_week: number
          family_id: string
          id: string
          period: number
          subject: string
        }
        Insert: {
          child_id: string
          created_at?: string
          day_of_week: number
          family_id: string
          id?: string
          period: number
          subject: string
        }
        Update: {
          child_id?: string
          created_at?: string
          day_of_week?: number
          family_id?: string
          id?: string
          period?: number
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetables_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      tradie_availability: {
        Row: {
          available_date: string
          id: string
          is_available: boolean | null
          notes: string | null
          tradie_id: string
        }
        Insert: {
          available_date: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          tradie_id: string
        }
        Update: {
          available_date?: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          tradie_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tradie_availability_tradie_id_fkey"
            columns: ["tradie_id"]
            isOneToOne: false
            referencedRelation: "tradies"
            referencedColumns: ["id"]
          },
        ]
      }
      tradies: {
        Row: {
          availability_token: string | null
          bio: string | null
          certifications: string[] | null
          created_at: string
          email: string | null
          id: string
          insurance_provider: string | null
          jobs_completed: number | null
          licence_number: string | null
          name: string
          phone: string | null
          rating: number | null
          service_area: string | null
          specialties: string[] | null
          tagline: string | null
          trade: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          availability_token?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          email?: string | null
          id?: string
          insurance_provider?: string | null
          jobs_completed?: number | null
          licence_number?: string | null
          name: string
          phone?: string | null
          rating?: number | null
          service_area?: string | null
          specialties?: string[] | null
          tagline?: string | null
          trade: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          availability_token?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          email?: string | null
          id?: string
          insurance_provider?: string | null
          jobs_completed?: number | null
          licence_number?: string | null
          name?: string
          phone?: string | null
          rating?: number | null
          service_area?: string | null
          specialties?: string[] | null
          tagline?: string | null
          trade?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          integration_name: string
          integration_type: string
          last_synced_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          integration_name: string
          integration_type: string
          last_synced_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          integration_name?: string
          integration_type?: string
          last_synced_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_scripts: {
        Row: {
          audience: string | null
          created_at: string
          duration: string | null
          format: string | null
          id: string
          narration: string | null
          storyboard: Json | null
          topic: string
          user_id: string
        }
        Insert: {
          audience?: string | null
          created_at?: string
          duration?: string | null
          format?: string | null
          id?: string
          narration?: string | null
          storyboard?: Json | null
          topic: string
          user_id: string
        }
        Update: {
          audience?: string | null
          created_at?: string
          duration?: string | null
          format?: string | null
          id?: string
          narration?: string | null
          storyboard?: Json | null
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          current_step: number | null
          id: string
          started_at: string | null
          status: string | null
          steps_log: Json | null
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          current_step?: number | null
          id?: string
          started_at?: string | null
          status?: string | null
          steps_log?: Json | null
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          current_step?: number | null
          id?: string
          started_at?: string | null
          status?: string | null
          steps_log?: Json | null
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          steps: Json
          trigger_agent: string
          trigger_event: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          steps?: Json
          trigger_agent: string
          trigger_event: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          steps?: Json
          trigger_agent?: string
          trigger_event?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_family_member: {
        Args: { _family_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "free" | "starter" | "pro" | "business" | "admin"
      compliance_status: "compliant" | "due_soon" | "overdue" | "not_checked"
      job_status:
        | "reported"
        | "contacted"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "invoice_uploaded"
      urgency_level: "low" | "medium" | "high" | "emergency"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["free", "starter", "pro", "business", "admin"],
      compliance_status: ["compliant", "due_soon", "overdue", "not_checked"],
      job_status: [
        "reported",
        "contacted",
        "scheduled",
        "in_progress",
        "completed",
        "invoice_uploaded",
      ],
      urgency_level: ["low", "medium", "high", "emergency"],
    },
  },
} as const
