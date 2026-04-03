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
      ad_campaigns: {
        Row: {
          created_at: string | null
          id: string
          industries: string[]
          name: string
          platforms: string[]
          status: string | null
          total_ads: number | null
          user_id: string
          visual_style: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industries: string[]
          name: string
          platforms: string[]
          status?: string | null
          total_ads?: number | null
          user_id: string
          visual_style?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industries?: string[]
          name?: string
          platforms?: string[]
          status?: string | null
          total_ads?: number | null
          user_id?: string
          visual_style?: string | null
        }
        Relationships: []
      }
      ad_creatives: {
        Row: {
          ad_structure: string
          agent_name: string
          campaign_id: string | null
          created_at: string | null
          cta: string
          description: string | null
          format: string
          hashtags: string[] | null
          headline: string
          id: string
          image_url: string | null
          industry: string
          pain_point: string
          platform: string
          primary_text: string
          target_audience: string | null
          user_id: string
        }
        Insert: {
          ad_structure: string
          agent_name: string
          campaign_id?: string | null
          created_at?: string | null
          cta: string
          description?: string | null
          format?: string
          hashtags?: string[] | null
          headline: string
          id?: string
          image_url?: string | null
          industry: string
          pain_point: string
          platform: string
          primary_text: string
          target_audience?: string | null
          user_id: string
        }
        Update: {
          ad_structure?: string
          agent_name?: string
          campaign_id?: string | null
          created_at?: string | null
          cta?: string
          description?: string | null
          format?: string
          hashtags?: string[] | null
          headline?: string
          id?: string
          image_url?: string | null
          industry?: string
          pain_point?: string
          platform?: string
          primary_text?: string
          target_audience?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_creatives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_access: {
        Row: {
          agent_code: string
          created_at: string | null
          id: string
          is_enabled: boolean | null
          pack_id: string
          tenant_id: string
        }
        Insert: {
          agent_code: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          pack_id: string
          tenant_id: string
        }
        Update: {
          agent_code?: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          pack_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_access_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_analytics: {
        Row: {
          agent_name: string
          complexity: string | null
          created_at: string | null
          error: boolean | null
          error_message: string | null
          estimated_cost_nzd: number | null
          from_cache: boolean | null
          id: string
          input_tokens: number | null
          message_count: number | null
          model_used: string | null
          output_tokens: number | null
          response_time_ms: number | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          agent_name: string
          complexity?: string | null
          created_at?: string | null
          error?: boolean | null
          error_message?: string | null
          estimated_cost_nzd?: number | null
          from_cache?: boolean | null
          id?: string
          input_tokens?: number | null
          message_count?: number | null
          model_used?: string | null
          output_tokens?: number | null
          response_time_ms?: number | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          agent_name?: string
          complexity?: string | null
          created_at?: string | null
          error?: boolean | null
          error_message?: string | null
          estimated_cost_nzd?: number | null
          from_cache?: boolean | null
          id?: string
          input_tokens?: number | null
          message_count?: number | null
          model_used?: string | null
          output_tokens?: number | null
          response_time_ms?: number | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_analytics_events: {
        Row: {
          agent_slug: string
          created_at: string
          event_id: string
          event_type: string
          metadata: Json | null
          pack_slug: string
          session_duration_seconds: number | null
          successful_completion: boolean | null
          user_id: string | null
        }
        Insert: {
          agent_slug: string
          created_at?: string
          event_id?: string
          event_type: string
          metadata?: Json | null
          pack_slug: string
          session_duration_seconds?: number | null
          successful_completion?: boolean | null
          user_id?: string | null
        }
        Update: {
          agent_slug?: string
          created_at?: string
          event_id?: string
          event_type?: string
          metadata?: Json | null
          pack_slug?: string
          session_duration_seconds?: number | null
          successful_completion?: boolean | null
          user_id?: string | null
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
      agent_prompts: {
        Row: {
          agent_name: string
          created_at: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean | null
          model_preference: string | null
          pack: string
          system_prompt: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          model_preference?: string | null
          pack: string
          system_prompt: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          model_preference?: string | null
          pack?: string
          system_prompt?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      agent_sms_config: {
        Row: {
          agent_id: string
          channel: string
          created_at: string
          enabled: boolean
          greeting: string
          id: string
          twilio_phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          channel?: string
          created_at?: string
          enabled?: boolean
          greeting?: string
          id?: string
          twilio_phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          channel?: string
          created_at?: string
          enabled?: boolean
          greeting?: string
          id?: string
          twilio_phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_sms_messages: {
        Row: {
          agent_id: string
          body: string
          channel: string
          created_at: string
          direction: string
          id: string
          image_description: string | null
          media_caption: string | null
          media_type: string | null
          media_url: string | null
          phone_number: string
          status: string
          twilio_sid: string | null
          user_id: string
          whatsapp_message_id: string | null
          whatsapp_status: string | null
        }
        Insert: {
          agent_id: string
          body: string
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          image_description?: string | null
          media_caption?: string | null
          media_type?: string | null
          media_url?: string | null
          phone_number: string
          status?: string
          twilio_sid?: string | null
          user_id: string
          whatsapp_message_id?: string | null
          whatsapp_status?: string | null
        }
        Update: {
          agent_id?: string
          body?: string
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          image_description?: string | null
          media_caption?: string | null
          media_type?: string | null
          media_url?: string | null
          phone_number?: string
          status?: string
          twilio_sid?: string | null
          user_id?: string
          whatsapp_message_id?: string | null
          whatsapp_status?: string | null
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
      api_usage: {
        Row: {
          action: string
          cost_cents: number
          created_at: string | null
          id: string
          metadata: Json | null
          model: string | null
          provider: string
          user_id: string
        }
        Insert: {
          action: string
          cost_cents?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model?: string | null
          provider: string
          user_id: string
        }
        Update: {
          action?: string
          cost_cents?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model?: string | null
          provider?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          agent_code: string
          agent_name: string
          compliance_passed: boolean | null
          cost_nzd: number | null
          created_at: string | null
          data_classification: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          input_tokens: number | null
          model_used: string
          output_tokens: number | null
          pack_id: string | null
          pii_detected: boolean | null
          pii_masked: boolean | null
          policies_checked: string[] | null
          request_id: string | null
          request_summary: string | null
          response_summary: string | null
          tenant_id: string | null
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          agent_code: string
          agent_name: string
          compliance_passed?: boolean | null
          cost_nzd?: number | null
          created_at?: string | null
          data_classification?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          model_used: string
          output_tokens?: number | null
          pack_id?: string | null
          pii_detected?: boolean | null
          pii_masked?: boolean | null
          policies_checked?: string[] | null
          request_id?: string | null
          request_summary?: string | null
          response_summary?: string | null
          tenant_id?: string | null
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          agent_code?: string
          agent_name?: string
          compliance_passed?: boolean | null
          cost_nzd?: number | null
          created_at?: string | null
          data_classification?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          model_used?: string
          output_tokens?: number | null
          pack_id?: string | null
          pii_detected?: boolean | null
          pii_masked?: boolean | null
          policies_checked?: string[] | null
          request_id?: string | null
          request_summary?: string | null
          response_summary?: string | null
          tenant_id?: string | null
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      brand_identities: {
        Row: {
          brand_name: string
          colors: Json | null
          created_at: string | null
          fonts: Json | null
          id: string
          is_primary: boolean | null
          keywords: string[] | null
          logo_url: string | null
          mission: string | null
          scan_data: Json | null
          scanned_url: string | null
          target_audience: string | null
          updated_at: string | null
          user_id: string
          voice_tone: string | null
        }
        Insert: {
          brand_name: string
          colors?: Json | null
          created_at?: string | null
          fonts?: Json | null
          id?: string
          is_primary?: boolean | null
          keywords?: string[] | null
          logo_url?: string | null
          mission?: string | null
          scan_data?: Json | null
          scanned_url?: string | null
          target_audience?: string | null
          updated_at?: string | null
          user_id: string
          voice_tone?: string | null
        }
        Update: {
          brand_name?: string
          colors?: Json | null
          created_at?: string | null
          fonts?: Json | null
          id?: string
          is_primary?: boolean | null
          keywords?: string[] | null
          logo_url?: string | null
          mission?: string | null
          scan_data?: Json | null
          scanned_url?: string | null
          target_audience?: string | null
          updated_at?: string | null
          user_id?: string
          voice_tone?: string | null
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
      buffer_connections: {
        Row: {
          access_token: string
          connected_at: string | null
          id: string
          is_active: boolean | null
          profiles: Json | null
          user_id: string
        }
        Insert: {
          access_token: string
          connected_at?: string | null
          id?: string
          is_active?: boolean | null
          profiles?: Json | null
          user_id: string
        }
        Update: {
          access_token?: string
          connected_at?: string | null
          id?: string
          is_active?: boolean | null
          profiles?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      business_memory: {
        Row: {
          category: string
          content: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_archived: boolean | null
          metadata: Json | null
          relevance_score: number | null
          tags: string[] | null
          tenant_id: string | null
          ttl_days: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_archived?: boolean | null
          metadata?: Json | null
          relevance_score?: number | null
          tags?: string[] | null
          tenant_id?: string | null
          ttl_days?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_archived?: boolean | null
          metadata?: Json | null
          relevance_score?: number | null
          tags?: string[] | null
          tenant_id?: string | null
          ttl_days?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_memory_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          audience: string | null
          body_json: Json | null
          brand_id: string | null
          click_count: number | null
          created_at: string
          end_date: string | null
          goal: string | null
          id: string
          name: string
          open_count: number | null
          performance_summary: Json | null
          pipeline_step: string | null
          platforms: string[] | null
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          start_date: string | null
          status: string
          subject_line: string | null
          tone: string | null
          user_id: string
        }
        Insert: {
          audience?: string | null
          body_json?: Json | null
          brand_id?: string | null
          click_count?: number | null
          created_at?: string
          end_date?: string | null
          goal?: string | null
          id?: string
          name: string
          open_count?: number | null
          performance_summary?: Json | null
          pipeline_step?: string | null
          platforms?: string[] | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          start_date?: string | null
          status?: string
          subject_line?: string | null
          tone?: string | null
          user_id: string
        }
        Update: {
          audience?: string | null
          body_json?: Json | null
          brand_id?: string | null
          click_count?: number | null
          created_at?: string
          end_date?: string | null
          goal?: string | null
          id?: string
          name?: string
          open_count?: number | null
          performance_summary?: Json | null
          pipeline_step?: string | null
          platforms?: string[] | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          start_date?: string | null
          status?: string
          subject_line?: string | null
          tone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      care_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          category: string
          created_at: string | null
          delivered_to: Json | null
          description: string
          id: string
          priority: string
          recommended_action: string | null
          resolution_notes: string | null
          resolved_at: string | null
          senior_id: string
          source_agent: string
          source_check_in_id: string | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          category: string
          created_at?: string | null
          delivered_to?: Json | null
          description: string
          id?: string
          priority: string
          recommended_action?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          senior_id: string
          source_agent: string
          source_check_in_id?: string | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          category?: string
          created_at?: string | null
          delivered_to?: Json | null
          description?: string
          id?: string
          priority?: string
          recommended_action?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          senior_id?: string
          source_agent?: string
          source_check_in_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_alerts_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "senior_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_alerts_source_check_in_id_fkey"
            columns: ["source_check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
        ]
      }
      care_journeys: {
        Row: {
          created_at: string | null
          facility: string | null
          fsa_actual_date: string | null
          fsa_target_date: string | null
          id: string
          notes: Json | null
          referral_date: string | null
          referral_type: string
          referring_practice: string | null
          region: string | null
          senior_id: string
          speciality: string | null
          status: string
          treatment_actual_date: string | null
          treatment_target_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          facility?: string | null
          fsa_actual_date?: string | null
          fsa_target_date?: string | null
          id?: string
          notes?: Json | null
          referral_date?: string | null
          referral_type: string
          referring_practice?: string | null
          region?: string | null
          senior_id: string
          speciality?: string | null
          status?: string
          treatment_actual_date?: string | null
          treatment_target_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          facility?: string | null
          fsa_actual_date?: string | null
          fsa_target_date?: string | null
          id?: string
          notes?: Json | null
          referral_date?: string | null
          referral_type?: string
          referring_practice?: string | null
          region?: string | null
          senior_id?: string
          speciality?: string | null
          status?: string
          treatment_actual_date?: string | null
          treatment_target_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_journeys_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "senior_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_wellbeing: {
        Row: {
          burnout_factors: string[] | null
          burnout_risk: string | null
          check_in_date: string | null
          connection_id: string
          created_at: string | null
          id: string
          recommended_actions: Json | null
          respite_hours_this_week: number | null
          sleep_quality: string | null
          stress_level: number | null
          support_satisfaction: string | null
        }
        Insert: {
          burnout_factors?: string[] | null
          burnout_risk?: string | null
          check_in_date?: string | null
          connection_id: string
          created_at?: string | null
          id?: string
          recommended_actions?: Json | null
          respite_hours_this_week?: number | null
          sleep_quality?: string | null
          stress_level?: number | null
          support_satisfaction?: string | null
        }
        Update: {
          burnout_factors?: string[] | null
          burnout_risk?: string | null
          check_in_date?: string | null
          connection_id?: string
          created_at?: string | null
          id?: string
          recommended_actions?: Json | null
          respite_hours_this_week?: number | null
          sleep_quality?: string | null
          stress_level?: number | null
          support_satisfaction?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_wellbeing_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whanau_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          agent: string
          alert_details: Json | null
          alert_triggered: boolean | null
          appetite: string | null
          channel: string | null
          completed_at: string | null
          concern_flags: string[] | null
          created_at: string | null
          duration_seconds: number | null
          energy_level: string | null
          engagement_score: number | null
          id: string
          medications_confirmed: boolean | null
          medications_missed: string[] | null
          model_used: string | null
          mood_notes: string | null
          mood_score: number | null
          pain_location: string | null
          pain_reported: boolean | null
          pain_severity: number | null
          scheduled_at: string
          senior_id: string
          sleep_quality: string | null
          started_at: string | null
          topics_discussed: string[] | null
          transcript: Json | null
        }
        Insert: {
          agent?: string
          alert_details?: Json | null
          alert_triggered?: boolean | null
          appetite?: string | null
          channel?: string | null
          completed_at?: string | null
          concern_flags?: string[] | null
          created_at?: string | null
          duration_seconds?: number | null
          energy_level?: string | null
          engagement_score?: number | null
          id?: string
          medications_confirmed?: boolean | null
          medications_missed?: string[] | null
          model_used?: string | null
          mood_notes?: string | null
          mood_score?: number | null
          pain_location?: string | null
          pain_reported?: boolean | null
          pain_severity?: number | null
          scheduled_at: string
          senior_id: string
          sleep_quality?: string | null
          started_at?: string | null
          topics_discussed?: string[] | null
          transcript?: Json | null
        }
        Update: {
          agent?: string
          alert_details?: Json | null
          alert_triggered?: boolean | null
          appetite?: string | null
          channel?: string | null
          completed_at?: string | null
          concern_flags?: string[] | null
          created_at?: string | null
          duration_seconds?: number | null
          energy_level?: string | null
          engagement_score?: number | null
          id?: string
          medications_confirmed?: boolean | null
          medications_missed?: string[] | null
          model_used?: string | null
          mood_notes?: string | null
          mood_score?: number | null
          pain_location?: string | null
          pain_reported?: boolean | null
          pain_severity?: number | null
          scheduled_at?: string
          senior_id?: string
          sleep_quality?: string | null
          started_at?: string | null
          topics_discussed?: string[] | null
          transcript?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "senior_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      compliance_deadlines: {
        Row: {
          agents: string[] | null
          auto_generate_document: boolean | null
          category: string
          created_at: string | null
          description: string | null
          document_template: string | null
          due_date: string
          id: string
          industries: string[] | null
          legislation_ref: string | null
          recurrence_rule: string | null
          recurring: string | null
          severity: string | null
          title: string
        }
        Insert: {
          agents?: string[] | null
          auto_generate_document?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          document_template?: string | null
          due_date: string
          id?: string
          industries?: string[] | null
          legislation_ref?: string | null
          recurrence_rule?: string | null
          recurring?: string | null
          severity?: string | null
          title: string
        }
        Update: {
          agents?: string[] | null
          auto_generate_document?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          document_template?: string | null
          due_date?: string
          id?: string
          industries?: string[] | null
          legislation_ref?: string | null
          recurrence_rule?: string | null
          recurring?: string | null
          severity?: string | null
          title?: string
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
          follow_up_sent: boolean | null
          id: string
          is_read: boolean
          lead_score: number | null
          lead_status: string | null
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          follow_up_sent?: boolean | null
          id?: string
          is_read?: boolean
          lead_score?: number | null
          lead_status?: string | null
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          follow_up_sent?: boolean | null
          id?: string
          is_read?: boolean
          lead_score?: number | null
          lead_status?: string | null
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
      creative_assets: {
        Row: {
          asset_type: string
          campaign_id: string | null
          created_at: string | null
          file_url: string
          id: string
          metadata: Json | null
          platform: string | null
          prompt: string | null
          style: string | null
          thumbnail_url: string | null
          user_id: string
        }
        Insert: {
          asset_type?: string
          campaign_id?: string | null
          created_at?: string | null
          file_url: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          prompt?: string | null
          style?: string | null
          thumbnail_url?: string | null
          user_id: string
        }
        Update: {
          asset_type?: string
          campaign_id?: string | null
          created_at?: string | null
          file_url?: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          prompt?: string | null
          style?: string | null
          thumbnail_url?: string | null
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          business_name: string | null
          created_at: string | null
          email: string
          id: string
          industry: string | null
          interest: string | null
          message: string | null
          name: string
          phone: string | null
          status: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          email: string
          id?: string
          industry?: string | null
          interest?: string | null
          message?: string | null
          name: string
          phone?: string | null
          status?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          industry?: string | null
          interest?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          status?: string | null
        }
        Relationships: []
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
      exported_outputs: {
        Row: {
          agent_id: string
          agent_name: string
          content_preview: string | null
          created_at: string
          format: string | null
          id: string
          image_url: string | null
          output_type: string
          title: string
          user_id: string
        }
        Insert: {
          agent_id: string
          agent_name: string
          content_preview?: string | null
          created_at?: string
          format?: string | null
          id?: string
          image_url?: string | null
          output_type?: string
          title: string
          user_id: string
        }
        Update: {
          agent_id?: string
          agent_name?: string
          content_preview?: string | null
          created_at?: string
          format?: string | null
          id?: string
          image_url?: string | null
          output_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
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
      feature_flags: {
        Row: {
          created_at: string | null
          feature_name: string
          id: string
          is_enabled: boolean | null
          metadata: Json | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean | null
          metadata?: Json | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean | null
          metadata?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      food_safety_checklists: {
        Row: {
          checklist_date: string
          completed_at: string | null
          completed_by: string
          created_at: string | null
          id: string
          items: Json
          shift: string | null
          user_id: string
        }
        Insert: {
          checklist_date: string
          completed_at?: string | null
          completed_by: string
          created_at?: string | null
          id?: string
          items: Json
          shift?: string | null
          user_id: string
        }
        Update: {
          checklist_date?: string
          completed_at?: string | null
          completed_by?: string
          created_at?: string | null
          id?: string
          items?: Json
          shift?: string | null
          user_id?: string
        }
        Relationships: []
      }
      food_safety_records: {
        Row: {
          checked_by: string
          corrective_action: string | null
          created_at: string | null
          id: string
          is_compliant: boolean | null
          item_name: string | null
          notes: string | null
          record_date: string
          record_type: string
          shift: string | null
          temperature: number | null
          user_id: string
        }
        Insert: {
          checked_by: string
          corrective_action?: string | null
          created_at?: string | null
          id?: string
          is_compliant?: boolean | null
          item_name?: string | null
          notes?: string | null
          record_date: string
          record_type: string
          shift?: string | null
          temperature?: number | null
          user_id: string
        }
        Update: {
          checked_by?: string
          corrective_action?: string | null
          created_at?: string | null
          id?: string
          is_compliant?: boolean | null
          item_name?: string | null
          notes?: string | null
          record_date?: string
          record_type?: string
          shift?: string | null
          temperature?: number | null
          user_id?: string
        }
        Relationships: []
      }
      funnel_analytics: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          metadata: Json | null
          step_name: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          metadata?: Json | null
          step_name: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          metadata?: Json | null
          step_name?: string
          user_id?: string
        }
        Relationships: []
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
      hanga_consents: {
        Row: {
          conditions: string[] | null
          consent_type: Database["public"]["Enums"]["consent_type"]
          created_at: string
          decision_date: string | null
          expiry_date: string | null
          id: string
          lodged_date: string | null
          project_id: string
          reference_number: string | null
          status: Database["public"]["Enums"]["consent_status"]
          user_id: string
        }
        Insert: {
          conditions?: string[] | null
          consent_type: Database["public"]["Enums"]["consent_type"]
          created_at?: string
          decision_date?: string | null
          expiry_date?: string | null
          id?: string
          lodged_date?: string | null
          project_id: string
          reference_number?: string | null
          status?: Database["public"]["Enums"]["consent_status"]
          user_id: string
        }
        Update: {
          conditions?: string[] | null
          consent_type?: Database["public"]["Enums"]["consent_type"]
          created_at?: string
          decision_date?: string | null
          expiry_date?: string | null
          id?: string
          lodged_date?: string | null
          project_id?: string
          reference_number?: string | null
          status?: Database["public"]["Enums"]["consent_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hanga_consents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hanga_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hanga_incidents: {
        Row: {
          created_at: string
          date: string
          description: string
          id: string
          immediate_actions: string | null
          incident_type: Database["public"]["Enums"]["incident_type"]
          investigation_status: string
          location: string | null
          project_id: string
          user_id: string
          worksafe_notified: boolean
        }
        Insert: {
          created_at?: string
          date?: string
          description: string
          id?: string
          immediate_actions?: string | null
          incident_type: Database["public"]["Enums"]["incident_type"]
          investigation_status?: string
          location?: string | null
          project_id: string
          user_id: string
          worksafe_notified?: boolean
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: string
          immediate_actions?: string | null
          incident_type?: Database["public"]["Enums"]["incident_type"]
          investigation_status?: string
          location?: string | null
          project_id?: string
          user_id?: string
          worksafe_notified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "hanga_incidents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hanga_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hanga_payment_claims: {
        Row: {
          amount: number
          cca_form_1: boolean
          claim_date: string
          claim_number: string | null
          created_at: string
          id: string
          net_amount: number | null
          project_id: string
          response_due_date: string | null
          retention_held: number
          status: Database["public"]["Enums"]["payment_claim_status"]
          user_id: string
        }
        Insert: {
          amount?: number
          cca_form_1?: boolean
          claim_date?: string
          claim_number?: string | null
          created_at?: string
          id?: string
          net_amount?: number | null
          project_id: string
          response_due_date?: string | null
          retention_held?: number
          status?: Database["public"]["Enums"]["payment_claim_status"]
          user_id: string
        }
        Update: {
          amount?: number
          cca_form_1?: boolean
          claim_date?: string
          claim_number?: string | null
          created_at?: string
          id?: string
          net_amount?: number | null
          project_id?: string
          response_due_date?: string | null
          retention_held?: number
          status?: Database["public"]["Enums"]["payment_claim_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hanga_payment_claims_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hanga_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hanga_projects: {
        Row: {
          address: string | null
          budget: number | null
          client_name: string | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          user_id: string
        }
        Insert: {
          address?: string | null
          budget?: number | null
          client_name?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          user_id: string
        }
        Update: {
          address?: string | null
          budget?: number | null
          client_name?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      hanga_punch_list: {
        Row: {
          assigned_to: string | null
          created_at: string
          due_date: string | null
          id: string
          item_description: string
          location: string | null
          photo_url: string | null
          priority: Database["public"]["Enums"]["punch_priority"]
          project_id: string
          status: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          item_description: string
          location?: string | null
          photo_url?: string | null
          priority?: Database["public"]["Enums"]["punch_priority"]
          project_id: string
          status?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          item_description?: string
          location?: string | null
          photo_url?: string | null
          priority?: Database["public"]["Enums"]["punch_priority"]
          project_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hanga_punch_list_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hanga_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hanga_quality_ncr: {
        Row: {
          assigned_to: string | null
          close_date: string | null
          corrective_action: string | null
          created_at: string
          description: string
          id: string
          ncr_number: string | null
          project_id: string
          raised_date: string
          severity: Database["public"]["Enums"]["ncr_severity"]
          status: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          close_date?: string | null
          corrective_action?: string | null
          created_at?: string
          description: string
          id?: string
          ncr_number?: string | null
          project_id: string
          raised_date?: string
          severity?: Database["public"]["Enums"]["ncr_severity"]
          status?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          close_date?: string | null
          corrective_action?: string | null
          created_at?: string
          description?: string
          id?: string
          ncr_number?: string | null
          project_id?: string
          raised_date?: string
          severity?: Database["public"]["Enums"]["ncr_severity"]
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hanga_quality_ncr_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hanga_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hanga_risk_register: {
        Row: {
          consequence: number | null
          control_hierarchy:
            | Database["public"]["Enums"]["control_hierarchy"]
            | null
          control_measures: string | null
          created_at: string
          description: string
          hazard_category: string | null
          id: string
          likelihood: number | null
          project_id: string
          responsible_person: string | null
          review_date: string | null
          risk_score: number | null
          status: string
          user_id: string
        }
        Insert: {
          consequence?: number | null
          control_hierarchy?:
            | Database["public"]["Enums"]["control_hierarchy"]
            | null
          control_measures?: string | null
          created_at?: string
          description: string
          hazard_category?: string | null
          id?: string
          likelihood?: number | null
          project_id: string
          responsible_person?: string | null
          review_date?: string | null
          risk_score?: number | null
          status?: string
          user_id: string
        }
        Update: {
          consequence?: number | null
          control_hierarchy?:
            | Database["public"]["Enums"]["control_hierarchy"]
            | null
          control_measures?: string | null
          created_at?: string
          description?: string
          hazard_category?: string | null
          id?: string
          likelihood?: number | null
          project_id?: string
          responsible_person?: string | null
          review_date?: string | null
          risk_score?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hanga_risk_register_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hanga_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hanga_variations: {
        Row: {
          approval_date: string | null
          cost_impact: number | null
          created_at: string
          description: string
          id: string
          project_id: string
          requested_by: string | null
          status: Database["public"]["Enums"]["variation_status"]
          time_impact_days: number | null
          user_id: string
          variation_number: string | null
        }
        Insert: {
          approval_date?: string | null
          cost_impact?: number | null
          created_at?: string
          description: string
          id?: string
          project_id: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["variation_status"]
          time_impact_days?: number | null
          user_id: string
          variation_number?: string | null
        }
        Update: {
          approval_date?: string | null
          cost_impact?: number | null
          created_at?: string
          description?: string
          id?: string
          project_id?: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["variation_status"]
          time_impact_days?: number | null
          user_id?: string
          variation_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hanga_variations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hanga_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hanga_worker_competency: {
        Row: {
          created_at: string
          first_aid_cert: boolean
          id: string
          induction_completed: boolean
          induction_date: string | null
          lbp_class: string | null
          lbp_number: string | null
          project_id: string
          role: string | null
          site_safe_card: boolean
          user_id: string
          worker_name: string
        }
        Insert: {
          created_at?: string
          first_aid_cert?: boolean
          id?: string
          induction_completed?: boolean
          induction_date?: string | null
          lbp_class?: string | null
          lbp_number?: string | null
          project_id: string
          role?: string | null
          site_safe_card?: boolean
          user_id: string
          worker_name: string
        }
        Update: {
          created_at?: string
          first_aid_cert?: boolean
          id?: string
          induction_completed?: boolean
          induction_date?: string | null
          lbp_class?: string | null
          lbp_number?: string | null
          project_id?: string
          role?: string | null
          site_safe_card?: boolean
          user_id?: string
          worker_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "hanga_worker_competency_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hanga_projects"
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
      health_checks: {
        Row: {
          checked_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          response_time_ms: number | null
          service_name: string
          status: string
        }
        Insert: {
          checked_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name: string
          status?: string
        }
        Update: {
          checked_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name?: string
          status?: string
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
      helm_sms_config: {
        Row: {
          briefing_time: string
          created_at: string
          enabled: boolean
          family_id: string
          id: string
          morning_briefing: boolean
          reminder_notifications: boolean
          twilio_phone_number: string | null
          updated_at: string
        }
        Insert: {
          briefing_time?: string
          created_at?: string
          enabled?: boolean
          family_id: string
          id?: string
          morning_briefing?: boolean
          reminder_notifications?: boolean
          twilio_phone_number?: string | null
          updated_at?: string
        }
        Update: {
          briefing_time?: string
          created_at?: string
          enabled?: boolean
          family_id?: string
          id?: string
          morning_briefing?: boolean
          reminder_notifications?: boolean
          twilio_phone_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "helm_sms_config_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: true
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      helm_sms_conversations: {
        Row: {
          created_at: string
          display_name: string | null
          family_id: string
          id: string
          opted_in: boolean
          phone_number: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          family_id: string
          id?: string
          opted_in?: boolean
          phone_number: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          display_name?: string | null
          family_id?: string
          id?: string
          opted_in?: boolean
          phone_number?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "helm_sms_conversations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      home_safety_assessments: {
        Row: {
          assessed_by: string | null
          assessment_type: string | null
          created_at: string | null
          device_data: Json | null
          hazards_identified: Json | null
          id: string
          recommendations: Json | null
          risk_score: number | null
          room: string | null
          senior_id: string
          updated_at: string | null
        }
        Insert: {
          assessed_by?: string | null
          assessment_type?: string | null
          created_at?: string | null
          device_data?: Json | null
          hazards_identified?: Json | null
          id?: string
          recommendations?: Json | null
          risk_score?: number | null
          room?: string | null
          senior_id: string
          updated_at?: string | null
        }
        Update: {
          assessed_by?: string | null
          assessment_type?: string | null
          created_at?: string | null
          device_data?: Json | null
          hazards_identified?: Json | null
          id?: string
          recommendations?: Json | null
          risk_score?: number | null
          room?: string | null
          senior_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_safety_assessments_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "senior_profiles"
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
      industry_pain_points: {
        Row: {
          agent_name: string
          created_at: string
          hook: string | null
          id: string
          industry: string
          last_updated: string
          pain_point_text: string
          severity: number
          stat: string | null
        }
        Insert: {
          agent_name: string
          created_at?: string
          hook?: string | null
          id?: string
          industry: string
          last_updated?: string
          pain_point_text: string
          severity?: number
          stat?: string | null
        }
        Update: {
          agent_name?: string
          created_at?: string
          hook?: string | null
          id?: string
          industry?: string
          last_updated?: string
          pain_point_text?: string
          severity?: number
          stat?: string | null
        }
        Relationships: []
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
      lead_activity: {
        Row: {
          activity_type: string
          created_at: string
          details: string | null
          id: string
          metadata: Json | null
          submission_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          details?: string | null
          id?: string
          metadata?: Json | null
          submission_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          details?: string | null
          id?: string
          metadata?: Json | null
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activity_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "contact_submissions"
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
      legislation_changes: {
        Row: {
          act_name: string
          action_required: string | null
          affected_agents: string[] | null
          affected_industries: string[] | null
          created_at: string | null
          effective_date: string | null
          id: string
          impact: string
          severity: string | null
          source_url: string | null
          summary: string
          title: string
        }
        Insert: {
          act_name: string
          action_required?: string | null
          affected_agents?: string[] | null
          affected_industries?: string[] | null
          created_at?: string | null
          effective_date?: string | null
          id?: string
          impact: string
          severity?: string | null
          source_url?: string | null
          summary: string
          title: string
        }
        Update: {
          act_name?: string
          action_required?: string | null
          affected_agents?: string[] | null
          affected_industries?: string[] | null
          created_at?: string | null
          effective_date?: string | null
          id?: string
          impact?: string
          severity?: string | null
          source_url?: string | null
          summary?: string
          title?: string
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
      medication_schedules: {
        Row: {
          active: boolean | null
          created_at: string | null
          dosage: string | null
          frequency: string
          id: string
          important_notes: string | null
          medication_name: string
          purpose: string | null
          senior_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          dosage?: string | null
          frequency: string
          id?: string
          important_notes?: string | null
          medication_name: string
          purpose?: string | null
          senior_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          dosage?: string | null
          frequency?: string
          id?: string
          important_notes?: string | null
          medication_name?: string
          purpose?: string | null
          senior_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_schedules_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "senior_profiles"
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
      messaging_conversations: {
        Row: {
          assigned_agent: string | null
          assigned_pack: string | null
          channel: string
          contact_name: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          phone_number: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_agent?: string | null
          assigned_pack?: string | null
          channel: string
          contact_name?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          phone_number: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_agent?: string | null
          assigned_pack?: string | null
          channel?: string
          contact_name?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          phone_number?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messaging_messages: {
        Row: {
          agent_used: string | null
          body: string | null
          channel: string
          compliance_checked: boolean | null
          conversation_id: string | null
          created_at: string | null
          direction: string | null
          from_number: string | null
          id: string
          media_type: string | null
          media_url: string | null
          model_used: string | null
          response_time_ms: number | null
          status: string | null
          tnz_message_id: string | null
          tnz_reference: string | null
          to_number: string | null
        }
        Insert: {
          agent_used?: string | null
          body?: string | null
          channel: string
          compliance_checked?: boolean | null
          conversation_id?: string | null
          created_at?: string | null
          direction?: string | null
          from_number?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          model_used?: string | null
          response_time_ms?: number | null
          status?: string | null
          tnz_message_id?: string | null
          tnz_reference?: string | null
          to_number?: string | null
        }
        Update: {
          agent_used?: string | null
          body?: string | null
          channel?: string
          compliance_checked?: boolean | null
          conversation_id?: string | null
          created_at?: string | null
          direction?: string | null
          from_number?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          model_used?: string | null
          response_time_ms?: number | null
          status?: string | null
          tnz_message_id?: string | null
          tnz_reference?: string | null
          to_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messaging_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "messaging_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_templates: {
        Row: {
          approved: boolean | null
          body_template: string
          category: string | null
          channel: string | null
          created_at: string | null
          id: string
          language: string | null
          template_name: string
          variables: string[] | null
        }
        Insert: {
          approved?: boolean | null
          body_template: string
          category?: string | null
          channel?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          template_name: string
          variables?: string[] | null
        }
        Update: {
          approved?: boolean | null
          body_template?: string
          category?: string | null
          channel?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          template_name?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      meta_connections: {
        Row: {
          access_token: string
          ad_account_id: string | null
          connected_at: string | null
          id: string
          instagram_account_id: string | null
          is_active: boolean | null
          page_id: string | null
          token_expires_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          ad_account_id?: string | null
          connected_at?: string | null
          id?: string
          instagram_account_id?: string | null
          is_active?: boolean | null
          page_id?: string | null
          token_expires_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          ad_account_id?: string | null
          connected_at?: string | null
          id?: string
          instagram_account_id?: string | null
          is_active?: boolean | null
          page_id?: string | null
          token_expires_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_sessions: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          selected_pack: string | null
          session_key: string | null
          step_1_at: string | null
          step_2_at: string | null
          step_3_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          selected_pack?: string | null
          session_key?: string | null
          step_1_at?: string | null
          step_2_at?: string | null
          step_3_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          selected_pack?: string | null
          session_key?: string | null
          step_1_at?: string | null
          step_2_at?: string | null
          step_3_at?: string | null
          updated_at?: string
          user_id?: string | null
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
      pack_analytics: {
        Row: {
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          event_id: string
          event_type: string
          metadata: Json | null
          pack_slug: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          event_id?: string
          event_type: string
          metadata?: Json | null
          pack_slug: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          event_id?: string
          event_type?: string
          metadata?: Json | null
          pack_slug?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pack_visibility: {
        Row: {
          agent_count: number
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_public: boolean
          pack_name: string
          pack_slug: string
          requires_role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          agent_count?: number
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_public?: boolean
          pack_name: string
          pack_slug: string
          requires_role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          agent_count?: number
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_public?: boolean
          pack_name?: string
          pack_slug?: string
          requires_role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
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
      podcast_episodes: {
        Row: {
          audio_url: string | null
          chapter_markers: Json | null
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          podcast_id: string | null
          published_at: string | null
          show_notes: Json | null
          status: string | null
          title: string
          transcript: string | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          chapter_markers?: Json | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          podcast_id?: string | null
          published_at?: string | null
          show_notes?: Json | null
          status?: string | null
          title: string
          transcript?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          chapter_markers?: Json | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          podcast_id?: string | null
          published_at?: string | null
          show_notes?: Json | null
          status?: string | null
          title?: string
          transcript?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_episodes_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          artwork_url: string | null
          created_at: string | null
          id: string
          podcast_name: string
          rss_feed_url: string | null
          user_id: string
        }
        Insert: {
          artwork_url?: string | null
          created_at?: string | null
          id?: string
          podcast_name: string
          rss_feed_url?: string | null
          user_id: string
        }
        Update: {
          artwork_url?: string | null
          created_at?: string | null
          id?: string
          podcast_name?: string
          rss_feed_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      proactive_alerts: {
        Row: {
          alert_type: string
          created_at: string
          expires_at: string | null
          id: string
          is_dismissed: boolean
          is_read: boolean
          message: string
          metadata: Json | null
          severity: string
          source_agent: string
          target_agent: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message: string
          metadata?: Json | null
          severity?: string
          source_agent: string
          target_agent: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message?: string
          metadata?: Json | null
          severity?: string
          source_agent?: string
          target_agent?: string
          title?: string
          user_id?: string
        }
        Relationships: []
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
      response_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          expires_at: string
          id: string
          model_used: string | null
          response_text: string
          tokens_saved: number | null
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          expires_at: string
          id?: string
          model_used?: string | null
          response_text: string
          tokens_saved?: number | null
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          model_used?: string | null
          response_text?: string
          tokens_saved?: number | null
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
      senior_profiles: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          check_in_frequency: string | null
          check_in_time_preference: string | null
          city: string | null
          cognitive_status: string | null
          created_at: string | null
          date_of_birth: string | null
          ethnicity: string[] | null
          first_name: string
          gender: string | null
          gp_practice_name: string | null
          gp_practice_phone: string | null
          id: string
          interests: string[] | null
          last_name: string
          living_situation: string | null
          mobility_level: string | null
          nhi_number: string | null
          postcode: string | null
          preferred_language: string | null
          preferred_name: string | null
          primary_conditions: string[] | null
          region: string | null
          status: string | null
          suburb: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          check_in_frequency?: string | null
          check_in_time_preference?: string | null
          city?: string | null
          cognitive_status?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          ethnicity?: string[] | null
          first_name: string
          gender?: string | null
          gp_practice_name?: string | null
          gp_practice_phone?: string | null
          id?: string
          interests?: string[] | null
          last_name: string
          living_situation?: string | null
          mobility_level?: string | null
          nhi_number?: string | null
          postcode?: string | null
          preferred_language?: string | null
          preferred_name?: string | null
          primary_conditions?: string[] | null
          region?: string | null
          status?: string | null
          suburb?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          check_in_frequency?: string | null
          check_in_time_preference?: string | null
          city?: string | null
          cognitive_status?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          ethnicity?: string[] | null
          first_name?: string
          gender?: string | null
          gp_practice_name?: string | null
          gp_practice_phone?: string | null
          id?: string
          interests?: string[] | null
          last_name?: string
          living_situation?: string | null
          mobility_level?: string | null
          nhi_number?: string | null
          postcode?: string | null
          preferred_language?: string | null
          preferred_name?: string | null
          primary_conditions?: string[] | null
          region?: string | null
          status?: string | null
          suburb?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sensor_readings: {
        Row: {
          alert_triggered: boolean | null
          alert_type: string | null
          created_at: string | null
          id: string
          location_label: string | null
          sensor_id: string
          sensor_type: string
          unit: string
          user_id: string
          value: number
        }
        Insert: {
          alert_triggered?: boolean | null
          alert_type?: string | null
          created_at?: string | null
          id?: string
          location_label?: string | null
          sensor_id: string
          sensor_type: string
          unit: string
          user_id: string
          value: number
        }
        Update: {
          alert_triggered?: boolean | null
          alert_type?: string | null
          created_at?: string | null
          id?: string
          location_label?: string | null
          sensor_id?: string
          sensor_type?: string
          unit?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      sensor_thresholds: {
        Row: {
          alert_agent: string | null
          alert_message_template: string | null
          created_at: string | null
          id: string
          location_label: string | null
          max_value: number | null
          min_value: number | null
          sensor_type: string
          user_id: string
        }
        Insert: {
          alert_agent?: string | null
          alert_message_template?: string | null
          created_at?: string | null
          id?: string
          location_label?: string | null
          max_value?: number | null
          min_value?: number | null
          sensor_type: string
          user_id: string
        }
        Update: {
          alert_agent?: string | null
          alert_message_template?: string | null
          created_at?: string | null
          id?: string
          location_label?: string | null
          max_value?: number | null
          min_value?: number | null
          sensor_type?: string
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
          expires_at: string | null
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
          expires_at?: string | null
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
          expires_at?: string | null
          id?: string
          source_agent?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_channels: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          kete: string
          phone_number: string
          provider: string | null
          tenant_id: string
          updated_at: string | null
          whatsapp_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kete: string
          phone_number: string
          provider?: string | null
          tenant_id: string
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kete?: string
          phone_number?: string
          provider?: string | null
          tenant_id?: string
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
        }
        Relationships: []
      }
      sms_conversations: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_message_at: string | null
          phone_number: string
          sms_phone_number_id: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          phone_number: string
          sms_phone_number_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          phone_number?: string
          sms_phone_number_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_conversations_sms_phone_number_id_fkey"
            columns: ["sms_phone_number_id"]
            isOneToOne: false
            referencedRelation: "sms_phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string | null
          direction: string
          id: string
          status: string | null
          twilio_sid: string | null
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string | null
          direction: string
          id?: string
          status?: string | null
          twilio_sid?: string | null
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string | null
          direction?: string
          id?: string
          status?: string | null
          twilio_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "sms_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_phone_numbers: {
        Row: {
          agent_id: string
          agent_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          twilio_number: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          agent_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          twilio_number: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          agent_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          twilio_number?: string
          updated_at?: string | null
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      tenant_members: {
        Row: {
          created_at: string | null
          id: string
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      tenants: {
        Row: {
          billing_email: string | null
          created_at: string | null
          credit_nzd: number | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          plan: string
          updated_at: string | null
        }
        Insert: {
          billing_email?: string | null
          created_at?: string | null
          credit_nzd?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          plan?: string
          updated_at?: string | null
        }
        Update: {
          billing_email?: string | null
          created_at?: string | null
          credit_nzd?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          plan?: string
          updated_at?: string | null
        }
        Relationships: []
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
      toroa_calendar: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          event_time: string | null
          family_id: string | null
          gear_list: Json | null
          id: string
          source: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          family_id?: string | null
          gear_list?: Json | null
          id?: string
          source?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          family_id?: string | null
          gear_list?: Json | null
          id?: string
          source?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "toroa_calendar_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
        ]
      }
      toroa_families: {
        Row: {
          budget: Json | null
          created_at: string | null
          family_name: string | null
          grocery_list: Json | null
          id: string
          location: string | null
          members: Json | null
          messages_remaining: number | null
          preferences: Json | null
          primary_phone: string
          reminders: Json | null
          status: string | null
          subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: Json | null
          created_at?: string | null
          family_name?: string | null
          grocery_list?: Json | null
          id?: string
          location?: string | null
          members?: Json | null
          messages_remaining?: number | null
          preferences?: Json | null
          primary_phone: string
          reminders?: Json | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: Json | null
          created_at?: string | null
          family_name?: string | null
          grocery_list?: Json | null
          id?: string
          location?: string | null
          members?: Json | null
          messages_remaining?: number | null
          preferences?: Json | null
          primary_phone?: string
          reminders?: Json | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      toroa_messages: {
        Row: {
          body: string
          created_at: string | null
          direction: string
          family_id: string | null
          from_number: string
          id: string
          media_url: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          direction: string
          family_id?: string | null
          from_number: string
          id?: string
          media_url?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          direction?: string
          family_id?: string | null
          from_number?: string
          id?: string
          media_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "toroa_messages_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
        ]
      }
      toroa_waitlist: {
        Row: {
          biggest_pain: string | null
          email: string
          email_consent: boolean | null
          id: string
          joined_at: string
          mobile: string | null
          name: string | null
          sms_consent: boolean | null
          status: string
        }
        Insert: {
          biggest_pain?: string | null
          email: string
          email_consent?: boolean | null
          id?: string
          joined_at?: string
          mobile?: string | null
          name?: string | null
          sms_consent?: boolean | null
          status?: string
        }
        Update: {
          biggest_pain?: string | null
          email?: string
          email_consent?: boolean | null
          id?: string
          joined_at?: string
          mobile?: string | null
          name?: string | null
          sms_consent?: boolean | null
          status?: string
        }
        Relationships: []
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
      triage_sessions: {
        Row: {
          age_band: string | null
          channel: string | null
          completed_at: string | null
          created_at: string | null
          escalated_to_human: boolean | null
          escalation_reason: string | null
          ethnicity: string[] | null
          id: string
          model_used: string | null
          primary_symptom: string | null
          recommended_service: string | null
          recommended_service_details: Json | null
          red_flags_detected: string[] | null
          region: string | null
          senior_id: string | null
          started_at: string | null
          symptom_details: Json | null
          thinking_level: string | null
          transcript: Json | null
          urgency_assessment: string | null
          user_accepted_recommendation: boolean | null
          user_id: string | null
        }
        Insert: {
          age_band?: string | null
          channel?: string | null
          completed_at?: string | null
          created_at?: string | null
          escalated_to_human?: boolean | null
          escalation_reason?: string | null
          ethnicity?: string[] | null
          id?: string
          model_used?: string | null
          primary_symptom?: string | null
          recommended_service?: string | null
          recommended_service_details?: Json | null
          red_flags_detected?: string[] | null
          region?: string | null
          senior_id?: string | null
          started_at?: string | null
          symptom_details?: Json | null
          thinking_level?: string | null
          transcript?: Json | null
          urgency_assessment?: string | null
          user_accepted_recommendation?: boolean | null
          user_id?: string | null
        }
        Update: {
          age_band?: string | null
          channel?: string | null
          completed_at?: string | null
          created_at?: string | null
          escalated_to_human?: boolean | null
          escalation_reason?: string | null
          ethnicity?: string[] | null
          id?: string
          model_used?: string | null
          primary_symptom?: string | null
          recommended_service?: string | null
          recommended_service_details?: Json | null
          red_flags_detected?: string[] | null
          region?: string | null
          senior_id?: string | null
          started_at?: string | null
          symptom_details?: Json | null
          thinking_level?: string | null
          transcript?: Json | null
          urgency_assessment?: string | null
          user_accepted_recommendation?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "triage_sessions_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "senior_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_subscriptions: {
        Row: {
          converted_to_paid: boolean
          created_at: string
          id: string
          pack_slug: string
          trial_expires_at: string
          trial_started_at: string
          user_id: string
        }
        Insert: {
          converted_to_paid?: boolean
          created_at?: string
          id?: string
          pack_slug: string
          trial_expires_at?: string
          trial_started_at?: string
          user_id: string
        }
        Update: {
          converted_to_paid?: boolean
          created_at?: string
          id?: string
          pack_slug?: string
          trial_expires_at?: string
          trial_started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_subscriptions_pack_slug_fkey"
            columns: ["pack_slug"]
            isOneToOne: false
            referencedRelation: "pack_visibility"
            referencedColumns: ["pack_slug"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          cost_nzd: number | null
          id: string
          messages_used: number | null
          period: string
          tokens_used: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cost_nzd?: number | null
          id?: string
          messages_used?: number | null
          period: string
          tokens_used?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cost_nzd?: number | null
          id?: string
          messages_used?: number | null
          period?: string
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_compliance_tasks: {
        Row: {
          completed_date: string | null
          created_at: string | null
          deadline_id: string | null
          due_date: string
          generated_document_id: string | null
          id: string
          notes: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          deadline_id?: string | null
          due_date: string
          generated_document_id?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          deadline_id?: string | null
          due_date?: string
          generated_document_id?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_compliance_tasks_deadline_id_fkey"
            columns: ["deadline_id"]
            isOneToOne: false
            referencedRelation: "compliance_deadlines"
            referencedColumns: ["id"]
          },
        ]
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
      user_notifications: {
        Row: {
          action_url: string | null
          agent_name: string
          created_at: string | null
          id: string
          message: string
          priority: string | null
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          agent_name: string
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          agent_name?: string
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          read?: boolean | null
          title?: string
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
      voice_agent_config: {
        Row: {
          after_hours_behaviour: string | null
          agent_id: string
          business_hours: Json | null
          calendar_integration: string | null
          created_at: string | null
          enabled: boolean | null
          greeting: string | null
          id: string
          knowledge_base: string | null
          language: string | null
          phone_number: string | null
          qualification_questions: Json | null
          updated_at: string | null
          user_id: string
          voice_id: string | null
          voice_style: string | null
        }
        Insert: {
          after_hours_behaviour?: string | null
          agent_id: string
          business_hours?: Json | null
          calendar_integration?: string | null
          created_at?: string | null
          enabled?: boolean | null
          greeting?: string | null
          id?: string
          knowledge_base?: string | null
          language?: string | null
          phone_number?: string | null
          qualification_questions?: Json | null
          updated_at?: string | null
          user_id: string
          voice_id?: string | null
          voice_style?: string | null
        }
        Update: {
          after_hours_behaviour?: string | null
          agent_id?: string
          business_hours?: Json | null
          calendar_integration?: string | null
          created_at?: string | null
          enabled?: boolean | null
          greeting?: string | null
          id?: string
          knowledge_base?: string | null
          language?: string | null
          phone_number?: string | null
          qualification_questions?: Json | null
          updated_at?: string | null
          user_id?: string
          voice_id?: string | null
          voice_style?: string | null
        }
        Relationships: []
      }
      voice_call_log: {
        Row: {
          agent_id: string
          appointment_booked: boolean | null
          appointment_datetime: string | null
          caller_name: string | null
          caller_phone: string | null
          created_at: string | null
          duration_seconds: number | null
          follow_up_required: boolean | null
          id: string
          outcome: string | null
          sentiment: string | null
          summary: string | null
          transcript: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          appointment_booked?: boolean | null
          appointment_datetime?: string | null
          caller_name?: string | null
          caller_phone?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          follow_up_required?: boolean | null
          id?: string
          outcome?: string | null
          sentiment?: string | null
          summary?: string | null
          transcript?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          appointment_booked?: boolean | null
          appointment_datetime?: string | null
          caller_name?: string | null
          caller_phone?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          follow_up_required?: boolean | null
          id?: string
          outcome?: string | null
          sentiment?: string | null
          summary?: string | null
          transcript?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whanau_connections: {
        Row: {
          alert_priority_threshold: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          receives_alerts: boolean | null
          receives_daily_summary: boolean | null
          relationship: string
          role: string | null
          senior_id: string
          user_id: string | null
        }
        Insert: {
          alert_priority_threshold?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          receives_alerts?: boolean | null
          receives_daily_summary?: boolean | null
          relationship: string
          role?: string | null
          senior_id: string
          user_id?: string | null
        }
        Update: {
          alert_priority_threshold?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          receives_alerts?: boolean | null
          receives_daily_summary?: boolean | null
          relationship?: string
          role?: string | null
          senior_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whanau_connections_senior_id_fkey"
            columns: ["senior_id"]
            isOneToOne: false
            referencedRelation: "senior_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          admin_only: boolean
          approval_notes: string | null
          body_text: string
          category: string
          created_at: string
          footer_text: string | null
          id: string
          language_code: string
          status: string
          template_name: string
          updated_at: string
          variables: Json | null
          whatsapp_template_id: string | null
        }
        Insert: {
          admin_only?: boolean
          approval_notes?: string | null
          body_text: string
          category?: string
          created_at?: string
          footer_text?: string | null
          id?: string
          language_code?: string
          status?: string
          template_name: string
          updated_at?: string
          variables?: Json | null
          whatsapp_template_id?: string | null
        }
        Update: {
          admin_only?: boolean
          approval_notes?: string | null
          body_text?: string
          category?: string
          created_at?: string
          footer_text?: string | null
          id?: string
          language_code?: string
          status?: string
          template_name?: string
          updated_at?: string
          variables?: Json | null
          whatsapp_template_id?: string | null
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
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
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "free" | "starter" | "pro" | "business" | "admin"
      compliance_status: "compliant" | "due_soon" | "overdue" | "not_checked"
      consent_status: "preparing" | "lodged" | "rfi" | "approved" | "expired"
      consent_type: "building" | "resource" | "subdivision" | "land_use"
      control_hierarchy:
        | "elimination"
        | "substitution"
        | "isolation"
        | "engineering"
        | "administrative"
        | "ppe"
      incident_type:
        | "near_miss"
        | "first_aid"
        | "medical_treatment"
        | "serious_harm"
        | "notifiable_event"
      job_status:
        | "reported"
        | "contacted"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "invoice_uploaded"
      ncr_severity: "minor" | "major" | "critical"
      payment_claim_status:
        | "draft"
        | "submitted"
        | "approved"
        | "disputed"
        | "paid"
      punch_priority: "P1" | "P2" | "P3"
      urgency_level: "low" | "medium" | "high" | "emergency"
      variation_status: "proposed" | "approved" | "rejected" | "implemented"
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
      consent_status: ["preparing", "lodged", "rfi", "approved", "expired"],
      consent_type: ["building", "resource", "subdivision", "land_use"],
      control_hierarchy: [
        "elimination",
        "substitution",
        "isolation",
        "engineering",
        "administrative",
        "ppe",
      ],
      incident_type: [
        "near_miss",
        "first_aid",
        "medical_treatment",
        "serious_harm",
        "notifiable_event",
      ],
      job_status: [
        "reported",
        "contacted",
        "scheduled",
        "in_progress",
        "completed",
        "invoice_uploaded",
      ],
      ncr_severity: ["minor", "major", "critical"],
      payment_claim_status: [
        "draft",
        "submitted",
        "approved",
        "disputed",
        "paid",
      ],
      punch_priority: ["P1", "P2", "P3"],
      urgency_level: ["low", "medium", "high", "emergency"],
      variation_status: ["proposed", "approved", "rejected", "implemented"],
    },
  },
} as const
