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
      aaaip_audit_exports: {
        Row: {
          allowed: number
          applied: number
          blocked: number
          compliance_rate: number | null
          created_at: string
          domain: string
          entries: Json
          entry_count: number
          exported_at: string
          human_approval_rate: number | null
          id: string
          needs_human: number
          pilot_label: string | null
          policy_hits: Json
          source_ip: string | null
          total_decisions: number
          user_agent: string | null
        }
        Insert: {
          allowed?: number
          applied?: number
          blocked?: number
          compliance_rate?: number | null
          created_at?: string
          domain: string
          entries?: Json
          entry_count?: number
          exported_at: string
          human_approval_rate?: number | null
          id?: string
          needs_human?: number
          pilot_label?: string | null
          policy_hits?: Json
          source_ip?: string | null
          total_decisions?: number
          user_agent?: string | null
        }
        Update: {
          allowed?: number
          applied?: number
          blocked?: number
          compliance_rate?: number | null
          created_at?: string
          domain?: string
          entries?: Json
          entry_count?: number
          exported_at?: string
          human_approval_rate?: number | null
          id?: string
          needs_human?: number
          pilot_label?: string | null
          policy_hits?: Json
          source_ip?: string | null
          total_decisions?: number
          user_agent?: string | null
        }
        Relationships: []
      }
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
      admin_notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          priority: string | null
          read: boolean | null
          title: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          priority?: string | null
          read?: boolean | null
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          priority?: string | null
          read?: boolean | null
          title?: string
          type?: string
        }
        Relationships: []
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
      agent_knowledge_base: {
        Row: {
          agent_id: string
          confidence: number | null
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          is_stale: boolean | null
          last_verified: string | null
          source_url: string | null
          stale_reason: string | null
          topic: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          confidence?: number | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_stale?: boolean | null
          last_verified?: string | null
          source_url?: string | null
          stale_reason?: string | null
          topic: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          confidence?: number | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_stale?: boolean | null
          last_verified?: string | null
          source_url?: string | null
          stale_reason?: string | null
          topic?: string
          updated_at?: string
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_prompts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      agent_test_results: {
        Row: {
          agent_slug: string
          audit_entry: Json | null
          created_at: string
          id: string
          kete: string
          overall_verdict: string | null
          prompt: string
          response: string | null
          run_by: string | null
          verdict_iho: string | null
          verdict_kahu: string | null
          verdict_mahara: string | null
          verdict_mana: string | null
          verdict_ta: string | null
        }
        Insert: {
          agent_slug: string
          audit_entry?: Json | null
          created_at?: string
          id?: string
          kete: string
          overall_verdict?: string | null
          prompt: string
          response?: string | null
          run_by?: string | null
          verdict_iho?: string | null
          verdict_kahu?: string | null
          verdict_mahara?: string | null
          verdict_mana?: string | null
          verdict_ta?: string | null
        }
        Update: {
          agent_slug?: string
          audit_entry?: Json | null
          created_at?: string
          id?: string
          kete?: string
          overall_verdict?: string | null
          prompt?: string
          response?: string | null
          run_by?: string | null
          verdict_iho?: string | null
          verdict_kahu?: string | null
          verdict_mahara?: string | null
          verdict_mana?: string | null
          verdict_ta?: string | null
        }
        Relationships: []
      }
      agent_toolsets: {
        Row: {
          agent_id: string
          tool_name: string
        }
        Insert: {
          agent_id: string
          tool_name: string
        }
        Update: {
          agent_id?: string
          tool_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_toolsets_tool_name_fkey"
            columns: ["tool_name"]
            isOneToOne: false
            referencedRelation: "tool_registry"
            referencedColumns: ["tool_name"]
          },
        ]
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
      approval_queue: {
        Row: {
          action_type: string
          approved_by: string | null
          context: Json
          decided_at: string | null
          decision_reason: string | null
          expires_at: string | null
          id: string
          kete: string
          request_id: string
          requested_at: string | null
          requested_by: string | null
          status: string | null
        }
        Insert: {
          action_type: string
          approved_by?: string | null
          context?: Json
          decided_at?: string | null
          decision_reason?: string | null
          expires_at?: string | null
          id?: string
          kete: string
          request_id: string
          requested_at?: string | null
          requested_by?: string | null
          status?: string | null
        }
        Update: {
          action_type?: string
          approved_by?: string | null
          context?: Json
          decided_at?: string | null
          decision_reason?: string | null
          expires_at?: string | null
          id?: string
          kete?: string
          request_id?: string
          requested_at?: string | null
          requested_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      arataki_workflow_records: {
        Row: {
          created_at: string
          exposure_nzd: number | null
          id: string
          payload: Json
          result_summary: string | null
          risk_rating: string | null
          run_id: string | null
          user_id: string
          vehicle_ref: string | null
          vin: string | null
          workflow_type: string
        }
        Insert: {
          created_at?: string
          exposure_nzd?: number | null
          id?: string
          payload?: Json
          result_summary?: string | null
          risk_rating?: string | null
          run_id?: string | null
          user_id: string
          vehicle_ref?: string | null
          vin?: string | null
          workflow_type: string
        }
        Update: {
          created_at?: string
          exposure_nzd?: number | null
          id?: string
          payload?: Json
          result_summary?: string | null
          risk_rating?: string | null
          run_id?: string | null
          user_id?: string
          vehicle_ref?: string | null
          vin?: string | null
          workflow_type?: string
        }
        Relationships: []
      }
      architecture_workflow_records: {
        Row: {
          created_at: string
          id: string
          payload: Json
          project_ref: string | null
          result_summary: string | null
          risk_rating: string | null
          run_id: string | null
          user_id: string
          workflow_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          project_ref?: string | null
          result_summary?: string | null
          risk_rating?: string | null
          run_id?: string | null
          user_id: string
          workflow_type: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          project_ref?: string | null
          result_summary?: string | null
          risk_rating?: string | null
          run_id?: string | null
          user_id?: string
          workflow_type?: string
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
      biosecurity_clearances: {
        Row: {
          clearance_time: number | null
          created_at: string
          id: string
          mpi_standards_applied: string[] | null
          shipment_id: string
          status: string | null
        }
        Insert: {
          clearance_time?: number | null
          created_at?: string
          id?: string
          mpi_standards_applied?: string[] | null
          shipment_id: string
          status?: string | null
        }
        Update: {
          clearance_time?: number | null
          created_at?: string
          id?: string
          mpi_standards_applied?: string[] | null
          shipment_id?: string
          status?: string | null
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
      breach_reports: {
        Row: {
          affected_data_types: string[] | null
          breach_id: string
          containment_actions: string[] | null
          created_at: string
          deadline_72h: string | null
          description: string
          discovery_date: string
          estimated_affected: number | null
          harm_likelihood: string
          id: string
          is_notifiable: boolean | null
          level: string | null
          notify_commissioner: boolean | null
          notify_individuals: boolean | null
          status: string | null
          updated_at: string
        }
        Insert: {
          affected_data_types?: string[] | null
          breach_id: string
          containment_actions?: string[] | null
          created_at?: string
          deadline_72h?: string | null
          description: string
          discovery_date?: string
          estimated_affected?: number | null
          harm_likelihood?: string
          id?: string
          is_notifiable?: boolean | null
          level?: string | null
          notify_commissioner?: boolean | null
          notify_individuals?: boolean | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          affected_data_types?: string[] | null
          breach_id?: string
          containment_actions?: string[] | null
          created_at?: string
          deadline_72h?: string | null
          description?: string
          discovery_date?: string
          estimated_affected?: number | null
          harm_likelihood?: string
          id?: string
          is_notifiable?: boolean | null
          level?: string | null
          notify_commissioner?: boolean | null
          notify_individuals?: boolean | null
          status?: string | null
          updated_at?: string
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
      compliance_scan_log: {
        Row: {
          changes_detected: number | null
          created_at: string
          errors: string[] | null
          high_impact_count: number | null
          id: string
          scan_date: string
          scan_duration_seconds: number | null
          sources_checked: number | null
        }
        Insert: {
          changes_detected?: number | null
          created_at?: string
          errors?: string[] | null
          high_impact_count?: number | null
          id?: string
          scan_date?: string
          scan_duration_seconds?: number | null
          sources_checked?: number | null
        }
        Update: {
          changes_detected?: number | null
          created_at?: string
          errors?: string[] | null
          high_impact_count?: number | null
          id?: string
          scan_date?: string
          scan_duration_seconds?: number | null
          sources_checked?: number | null
        }
        Relationships: []
      }
      compliance_updates: {
        Row: {
          affected_agents: string[] | null
          affected_industries: string[] | null
          auto_applied: boolean | null
          change_detail: Json | null
          change_summary: string
          created_at: string | null
          effective_date: string | null
          id: string
          impact_level: string
          legislation_ref: string | null
          requires_human_review: boolean | null
          review_notes: string | null
          reviewed_by: string | null
          source_name: string
          source_url: string | null
          title: string
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          affected_agents?: string[] | null
          affected_industries?: string[] | null
          auto_applied?: boolean | null
          change_detail?: Json | null
          change_summary: string
          created_at?: string | null
          effective_date?: string | null
          id?: string
          impact_level?: string
          legislation_ref?: string | null
          requires_human_review?: boolean | null
          review_notes?: string | null
          reviewed_by?: string | null
          source_name: string
          source_url?: string | null
          title: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          affected_agents?: string[] | null
          affected_industries?: string[] | null
          auto_applied?: boolean | null
          change_detail?: Json | null
          change_summary?: string
          created_at?: string | null
          effective_date?: string | null
          id?: string
          impact_level?: string
          legislation_ref?: string | null
          requires_human_review?: boolean | null
          review_notes?: string | null
          reviewed_by?: string | null
          source_name?: string
          source_url?: string | null
          title?: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          follow_up_sent: boolean | null
          id: string
          interest: string | null
          is_read: boolean
          lead_score: number | null
          lead_status: string | null
          message: string
          name: string
          pain_area: string | null
          phone: string | null
          website: string | null
        }
        Insert: {
          created_at?: string
          email: string
          follow_up_sent?: boolean | null
          id?: string
          interest?: string | null
          is_read?: boolean
          lead_score?: number | null
          lead_status?: string | null
          message: string
          name: string
          pain_area?: string | null
          phone?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          follow_up_sent?: boolean | null
          id?: string
          interest?: string | null
          is_read?: boolean
          lead_score?: number | null
          lead_status?: string | null
          message?: string
          name?: string
          pain_area?: string | null
          phone?: string | null
          website?: string | null
        }
        Relationships: []
      }
      content_items: {
        Row: {
          agent_attribution: string | null
          body: string | null
          campaign_id: string | null
          content_type: string
          created_at: string
          id: string
          metadata: Json | null
          pipeline_stage: string
          platform: string | null
          title: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_attribution?: string | null
          body?: string | null
          campaign_id?: string | null
          content_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          pipeline_stage?: string
          platform?: string | null
          title: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_attribution?: string | null
          body?: string | null
          campaign_id?: string | null
          content_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          pipeline_stage?: string
          platform?: string | null
          title?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_items_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_summaries: {
        Row: {
          agent_id: string
          compression_level: number | null
          created_at: string
          fts: unknown
          id: string
          key_facts_extracted: Json
          original_message_count: number | null
          parent_summary_id: string | null
          summary: string
          user_id: string
        }
        Insert: {
          agent_id: string
          compression_level?: number | null
          created_at?: string
          fts?: unknown
          id?: string
          key_facts_extracted?: Json
          original_message_count?: number | null
          parent_summary_id?: string | null
          summary: string
          user_id: string
        }
        Update: {
          agent_id?: string
          compression_level?: number | null
          created_at?: string
          fts?: unknown
          id?: string
          key_facts_extracted?: Json
          original_message_count?: number | null
          parent_summary_id?: string | null
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_parent_summary_id_fkey"
            columns: ["parent_summary_id"]
            isOneToOne: false
            referencedRelation: "conversation_summaries"
            referencedColumns: ["id"]
          },
        ]
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
      customs_declarations: {
        Row: {
          created_at: string
          estimated_duties: number | null
          hs_code: string | null
          id: string
          importer_id: string | null
          item_description: string | null
          shipment_id: string
          status: string | null
          tariff_rate: number | null
          value_nzd: number | null
        }
        Insert: {
          created_at?: string
          estimated_duties?: number | null
          hs_code?: string | null
          id?: string
          importer_id?: string | null
          item_description?: string | null
          shipment_id: string
          status?: string | null
          tariff_rate?: number | null
          value_nzd?: number | null
        }
        Update: {
          created_at?: string
          estimated_duties?: number | null
          hs_code?: string | null
          id?: string
          importer_id?: string | null
          item_description?: string | null
          shipment_id?: string
          status?: string | null
          tariff_rate?: number | null
          value_nzd?: number | null
        }
        Relationships: []
      }
      customs_workflow_records: {
        Row: {
          created_at: string
          duty_savings_nzd: number | null
          hs_code: string | null
          id: string
          landed_cost_nzd: number | null
          origin_country: string | null
          payload: Json
          result_summary: string | null
          run_id: string | null
          shipment_ref: string | null
          user_id: string
          workflow_type: string
        }
        Insert: {
          created_at?: string
          duty_savings_nzd?: number | null
          hs_code?: string | null
          id?: string
          landed_cost_nzd?: number | null
          origin_country?: string | null
          payload?: Json
          result_summary?: string | null
          run_id?: string | null
          shipment_ref?: string | null
          user_id: string
          workflow_type: string
        }
        Update: {
          created_at?: string
          duty_savings_nzd?: number | null
          hs_code?: string | null
          id?: string
          landed_cost_nzd?: number | null
          origin_country?: string | null
          payload?: Json
          result_summary?: string | null
          run_id?: string | null
          shipment_ref?: string | null
          user_id?: string
          workflow_type?: string
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
      engineering_workflow_records: {
        Row: {
          created_at: string
          id: string
          metric_label: string | null
          metric_value: number | null
          payload: Json
          project_ref: string | null
          result_summary: string | null
          run_id: string | null
          user_id: string
          workflow_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_label?: string | null
          metric_value?: number | null
          payload?: Json
          project_ref?: string | null
          result_summary?: string | null
          run_id?: string | null
          user_id: string
          workflow_type: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_label?: string | null
          metric_value?: number | null
          payload?: Json
          project_ref?: string | null
          result_summary?: string | null
          run_id?: string | null
          user_id?: string
          workflow_type?: string
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
      esign_audit_events: {
        Row: {
          created_at: string
          envelope_id: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          envelope_id: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          envelope_id?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esign_audit_events_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "esign_envelopes"
            referencedColumns: ["id"]
          },
        ]
      }
      esign_envelopes: {
        Row: {
          created_at: string
          created_by: string | null
          document_name: string
          document_sha256: string | null
          document_url: string
          expires_at: string
          id: string
          message: string | null
          sent_at: string
          signed_at: string | null
          signed_ip: string | null
          signed_pdf_url: string | null
          signed_typed_name: string | null
          signed_user_agent: string | null
          signer_email: string
          signer_name: string
          status: string
          tenant_id: string
          token: string
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          document_name: string
          document_sha256?: string | null
          document_url: string
          expires_at?: string
          id?: string
          message?: string | null
          sent_at?: string
          signed_at?: string | null
          signed_ip?: string | null
          signed_pdf_url?: string | null
          signed_typed_name?: string | null
          signed_user_agent?: string | null
          signer_email: string
          signer_name: string
          status?: string
          tenant_id: string
          token: string
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          document_name?: string
          document_sha256?: string | null
          document_url?: string
          expires_at?: string
          id?: string
          message?: string | null
          sent_at?: string
          signed_at?: string | null
          signed_ip?: string | null
          signed_pdf_url?: string | null
          signed_typed_name?: string | null
          signed_user_agent?: string | null
          signer_email?: string
          signer_name?: string
          status?: string
          tenant_id?: string
          token?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esign_envelopes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      evidence_packs: {
        Row: {
          action_type: string
          created_at: string | null
          evidence_json: Json
          id: string
          kete: string
          request_id: string
          signed_at: string | null
          signed_by: string | null
          user_id: string
          watermark: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          evidence_json?: Json
          id?: string
          kete: string
          request_id: string
          signed_at?: string | null
          signed_by?: string | null
          user_id: string
          watermark: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          evidence_json?: Json
          id?: string
          kete?: string
          request_id?: string
          signed_at?: string | null
          signed_by?: string | null
          user_id?: string
          watermark?: string
        }
        Relationships: []
      }
      explanation_objects: {
        Row: {
          action: string
          confidence: number | null
          created_at: string | null
          id: string
          reasoning: string
          regulations: string[] | null
          request_id: string
          sources: string[] | null
        }
        Insert: {
          action: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          reasoning: string
          regulations?: string[] | null
          request_id: string
          sources?: string[] | null
        }
        Update: {
          action?: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          reasoning?: string
          regulations?: string[] | null
          request_id?: string
          sources?: string[] | null
        }
        Relationships: []
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
      flint_proposals: {
        Row: {
          audit_id: string | null
          created_at: string
          current_content: string | null
          guard_details: Json | null
          id: string
          instructions: string | null
          page_id: string
          proposed_content: string
          region: string
          review_notes: string | null
          reviewed_by: string | null
          seo_target: string | null
          status: string
          updated_at: string
          verdict: string
        }
        Insert: {
          audit_id?: string | null
          created_at?: string
          current_content?: string | null
          guard_details?: Json | null
          id?: string
          instructions?: string | null
          page_id: string
          proposed_content: string
          region: string
          review_notes?: string | null
          reviewed_by?: string | null
          seo_target?: string | null
          status?: string
          updated_at?: string
          verdict?: string
        }
        Update: {
          audit_id?: string | null
          created_at?: string
          current_content?: string | null
          guard_details?: Json | null
          id?: string
          instructions?: string | null
          page_id?: string
          proposed_content?: string
          region?: string
          review_notes?: string | null
          reviewed_by?: string | null
          seo_target?: string | null
          status?: string
          updated_at?: string
          verdict?: string
        }
        Relationships: []
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
      governance_gates: {
        Row: {
          benefit_hypothesis: string | null
          conditions: string | null
          created_at: string
          dataset_id: string | null
          decided_at: string | null
          expiry: string | null
          gate_type: string
          governance_pack: Json | null
          harm_hypothesis: string | null
          id: string
          kaitiaki_decision_by: string | null
          kete: string | null
          purpose: string
          request_id: string
          requested_by: string | null
          simulator_results: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          benefit_hypothesis?: string | null
          conditions?: string | null
          created_at?: string
          dataset_id?: string | null
          decided_at?: string | null
          expiry?: string | null
          gate_type?: string
          governance_pack?: Json | null
          harm_hypothesis?: string | null
          id?: string
          kaitiaki_decision_by?: string | null
          kete?: string | null
          purpose: string
          request_id: string
          requested_by?: string | null
          simulator_results?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          benefit_hypothesis?: string | null
          conditions?: string | null
          created_at?: string
          dataset_id?: string | null
          decided_at?: string | null
          expiry?: string | null
          gate_type?: string
          governance_pack?: Json | null
          harm_hypothesis?: string | null
          id?: string
          kaitiaki_decision_by?: string | null
          kete?: string | null
          purpose?: string
          request_id?: string
          requested_by?: string | null
          simulator_results?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_gates_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "maori_data_registry"
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
      hsno_classification: {
        Row: {
          created_at: string
          description: string | null
          hazard_class: string
          id: string
          special_handling: boolean | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          hazard_class: string
          id?: string
          special_handling?: boolean | null
        }
        Update: {
          created_at?: string
          description?: string | null
          hazard_class?: string
          id?: string
          special_handling?: boolean | null
        }
        Relationships: []
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
      industry_kb_chunks: {
        Row: {
          applicable_agents: Json
          chunk_index: number
          chunk_text: string
          created_at: string
          doc_title: string | null
          document_id: string
          embedding: string | null
          id: string
          kete: string
          source_url: string | null
          tier: number
          token_estimate: number | null
        }
        Insert: {
          applicable_agents?: Json
          chunk_index: number
          chunk_text: string
          created_at?: string
          doc_title?: string | null
          document_id: string
          embedding?: string | null
          id?: string
          kete: string
          source_url?: string | null
          tier: number
          token_estimate?: number | null
        }
        Update: {
          applicable_agents?: Json
          chunk_index?: number
          chunk_text?: string
          created_at?: string
          doc_title?: string | null
          document_id?: string
          embedding?: string | null
          id?: string
          kete?: string
          source_url?: string | null
          tier?: number
          token_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "industry_kb_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "industry_knowledge_base"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_knowledge_base: {
        Row: {
          applicable_agents: Json
          chunk_count: number
          content: string | null
          content_hash: string | null
          created_at: string
          doc_source_publisher: string | null
          doc_source_url: string | null
          doc_title: string
          id: string
          kete: string
          last_fetch_status: string | null
          last_fetched_at: string | null
          last_reviewed: string | null
          next_review_due: string | null
          notes: string | null
          summary: string | null
          tags: Json | null
          tier: number
          update_cadence: string | null
          updated_at: string
        }
        Insert: {
          applicable_agents?: Json
          chunk_count?: number
          content?: string | null
          content_hash?: string | null
          created_at?: string
          doc_source_publisher?: string | null
          doc_source_url?: string | null
          doc_title: string
          id?: string
          kete: string
          last_fetch_status?: string | null
          last_fetched_at?: string | null
          last_reviewed?: string | null
          next_review_due?: string | null
          notes?: string | null
          summary?: string | null
          tags?: Json | null
          tier: number
          update_cadence?: string | null
          updated_at?: string
        }
        Update: {
          applicable_agents?: Json
          chunk_count?: number
          content?: string | null
          content_hash?: string | null
          created_at?: string
          doc_source_publisher?: string | null
          doc_source_url?: string | null
          doc_title?: string
          id?: string
          kete?: string
          last_fetch_status?: string | null
          last_fetched_at?: string | null
          last_reviewed?: string | null
          next_review_due?: string | null
          notes?: string | null
          summary?: string | null
          tags?: Json | null
          tier?: number
          update_cadence?: string | null
          updated_at?: string
        }
        Relationships: []
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
      ipp_consents: {
        Row: {
          action_type: string
          consented: boolean | null
          consented_at: string | null
          created_at: string
          id: string
          ipp_numbers: number[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type: string
          consented?: boolean | null
          consented_at?: string | null
          created_at?: string
          id?: string
          ipp_numbers?: number[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          consented?: boolean | null
          consented_at?: string | null
          created_at?: string
          id?: string
          ipp_numbers?: number[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      kb_priority_documents: {
        Row: {
          cadence: string | null
          content_excerpt: string | null
          content_hash: string | null
          created_at: string
          id: string
          last_refresh_status: string | null
          last_refreshed_at: string | null
          last_verified_at: string | null
          notes: string | null
          sectors: string[]
          source_name: string
          source_url: string | null
          tier: number
          title: string
          unblocks: string[]
          updated_at: string
        }
        Insert: {
          cadence?: string | null
          content_excerpt?: string | null
          content_hash?: string | null
          created_at?: string
          id?: string
          last_refresh_status?: string | null
          last_refreshed_at?: string | null
          last_verified_at?: string | null
          notes?: string | null
          sectors?: string[]
          source_name: string
          source_url?: string | null
          tier: number
          title: string
          unblocks?: string[]
          updated_at?: string
        }
        Update: {
          cadence?: string | null
          content_excerpt?: string | null
          content_hash?: string | null
          created_at?: string
          id?: string
          last_refresh_status?: string | null
          last_refreshed_at?: string | null
          last_verified_at?: string | null
          notes?: string | null
          sectors?: string[]
          source_name?: string
          source_url?: string | null
          tier?: number
          title?: string
          unblocks?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      kete_channel_config: {
        Row: {
          created_at: string
          id: string
          kete_code: string
          sms_enabled: boolean
          updated_at: string
          user_id: string
          whatsapp_enabled: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          kete_code: string
          sms_enabled?: boolean
          updated_at?: string
          user_id: string
          whatsapp_enabled?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          kete_code?: string
          sms_enabled?: boolean
          updated_at?: string
          user_id?: string
          whatsapp_enabled?: boolean
        }
        Relationships: []
      }
      kete_definitions: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_name: string
          display_order: number | null
          handler_fn: string | null
          icon: string | null
          id: string
          is_active: boolean
          keywords: string[]
          slug: string
          te_reo_name: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_name: string
          display_order?: number | null
          handler_fn?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          keywords?: string[]
          slug: string
          te_reo_name?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          display_order?: number | null
          handler_fn?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          keywords?: string[]
          slug?: string
          te_reo_name?: string | null
          updated_at?: string
        }
        Relationships: []
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
      logistics_workflow_records: {
        Row: {
          created_at: string
          driver_ref: string | null
          exposure_nzd: number | null
          id: string
          payload: Json
          result_summary: string | null
          risk_rating: string | null
          run_id: string | null
          user_id: string
          vehicle_ref: string | null
          workflow_type: string
        }
        Insert: {
          created_at?: string
          driver_ref?: string | null
          exposure_nzd?: number | null
          id?: string
          payload?: Json
          result_summary?: string | null
          risk_rating?: string | null
          run_id?: string | null
          user_id: string
          vehicle_ref?: string | null
          workflow_type: string
        }
        Update: {
          created_at?: string
          driver_ref?: string | null
          exposure_nzd?: number | null
          id?: string
          payload?: Json
          result_summary?: string | null
          risk_rating?: string | null
          run_id?: string | null
          user_id?: string
          vehicle_ref?: string | null
          workflow_type?: string
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
      manaaki_food_diary: {
        Row: {
          business_name: string | null
          completed_by: string | null
          corrective_actions: string | null
          created_at: string
          entry_date: string
          entry_type: string
          id: string
          supplier_records: Json | null
          temperature_logs: Json | null
          user_id: string
          verified: boolean | null
          verifier_notes: string | null
        }
        Insert: {
          business_name?: string | null
          completed_by?: string | null
          corrective_actions?: string | null
          created_at?: string
          entry_date?: string
          entry_type?: string
          id?: string
          supplier_records?: Json | null
          temperature_logs?: Json | null
          user_id: string
          verified?: boolean | null
          verifier_notes?: string | null
        }
        Update: {
          business_name?: string | null
          completed_by?: string | null
          corrective_actions?: string | null
          created_at?: string
          entry_date?: string
          entry_type?: string
          id?: string
          supplier_records?: Json | null
          temperature_logs?: Json | null
          user_id?: string
          verified?: boolean | null
          verifier_notes?: string | null
        }
        Relationships: []
      }
      manaaki_pricing: {
        Row: {
          accepted: boolean | null
          competitor_rates: Json | null
          created_at: string
          current_rate_cents: number | null
          id: string
          local_events: Json | null
          occupancy_pct: number | null
          reasoning: string | null
          recommended_rate_cents: number | null
          target_date: string
          user_id: string
        }
        Insert: {
          accepted?: boolean | null
          competitor_rates?: Json | null
          created_at?: string
          current_rate_cents?: number | null
          id?: string
          local_events?: Json | null
          occupancy_pct?: number | null
          reasoning?: string | null
          recommended_rate_cents?: number | null
          target_date: string
          user_id: string
        }
        Update: {
          accepted?: boolean | null
          competitor_rates?: Json | null
          created_at?: string
          current_rate_cents?: number | null
          id?: string
          local_events?: Json | null
          occupancy_pct?: number | null
          reasoning?: string | null
          recommended_rate_cents?: number | null
          target_date?: string
          user_id?: string
        }
        Relationships: []
      }
      manaaki_reviews: {
        Row: {
          created_at: string
          id: string
          platform: string
          rating: number | null
          response_draft: string | null
          response_sent_at: string | null
          response_status: string | null
          review_date: string | null
          review_text: string | null
          reviewer_name: string | null
          sentiment: string | null
          themes: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform?: string
          rating?: number | null
          response_draft?: string | null
          response_sent_at?: string | null
          response_status?: string | null
          review_date?: string | null
          review_text?: string | null
          reviewer_name?: string | null
          sentiment?: string | null
          themes?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          rating?: number | null
          response_draft?: string | null
          response_sent_at?: string | null
          response_status?: string | null
          review_date?: string | null
          review_text?: string | null
          reviewer_name?: string | null
          sentiment?: string | null
          themes?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      manaaki_workflow_records: {
        Row: {
          created_at: string
          id: string
          metric_label: string | null
          metric_value: number | null
          payload: Json
          result_summary: string | null
          risk_rating: string | null
          run_id: string | null
          user_id: string
          venue_ref: string | null
          workflow_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_label?: string | null
          metric_value?: number | null
          payload?: Json
          result_summary?: string | null
          risk_rating?: string | null
          run_id?: string | null
          user_id: string
          venue_ref?: string | null
          workflow_type: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_label?: string | null
          metric_value?: number | null
          payload?: Json
          result_summary?: string | null
          risk_rating?: string | null
          run_id?: string | null
          user_id?: string
          venue_ref?: string | null
          workflow_type?: string
        }
        Relationships: []
      }
      maori_data_registry: {
        Row: {
          approval_expiry: string | null
          created_at: string
          created_by: string | null
          dataset_description: string | null
          dataset_name: string
          governance_status: string
          id: string
          is_maori_data: boolean
          iwi_hapu_relevance: string[] | null
          kaitiaki_contact: Json | null
          locality_restriction: string
          notes: string | null
          permitted_purposes: string[] | null
          provenance: Json | null
          source_kete: string | null
          source_table: string | null
          tapu_noa_classification: string
          updated_at: string
        }
        Insert: {
          approval_expiry?: string | null
          created_at?: string
          created_by?: string | null
          dataset_description?: string | null
          dataset_name: string
          governance_status?: string
          id?: string
          is_maori_data?: boolean
          iwi_hapu_relevance?: string[] | null
          kaitiaki_contact?: Json | null
          locality_restriction?: string
          notes?: string | null
          permitted_purposes?: string[] | null
          provenance?: Json | null
          source_kete?: string | null
          source_table?: string | null
          tapu_noa_classification?: string
          updated_at?: string
        }
        Update: {
          approval_expiry?: string | null
          created_at?: string
          created_by?: string | null
          dataset_description?: string | null
          dataset_name?: string
          governance_status?: string
          id?: string
          is_maori_data?: boolean
          iwi_hapu_relevance?: string[] | null
          kaitiaki_contact?: Json | null
          locality_restriction?: string
          notes?: string | null
          permitted_purposes?: string[] | null
          provenance?: Json | null
          source_kete?: string | null
          source_table?: string | null
          tapu_noa_classification?: string
          updated_at?: string
        }
        Relationships: []
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
          awaiting_kete_pick: boolean
          channel: string
          consent_status: string
          contact_name: string | null
          created_at: string | null
          first_contact_at: string | null
          id: string
          identification_sent: boolean
          metadata: Json | null
          opt_out_at: string | null
          opted_out_keyword: string | null
          phone_number: string
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_agent?: string | null
          assigned_pack?: string | null
          awaiting_kete_pick?: boolean
          channel: string
          consent_status?: string
          contact_name?: string | null
          created_at?: string | null
          first_contact_at?: string | null
          id?: string
          identification_sent?: boolean
          metadata?: Json | null
          opt_out_at?: string | null
          opted_out_keyword?: string | null
          phone_number: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_agent?: string | null
          assigned_pack?: string | null
          awaiting_kete_pick?: boolean
          channel?: string
          consent_status?: string
          contact_name?: string | null
          created_at?: string | null
          first_contact_at?: string | null
          id?: string
          identification_sent?: boolean
          metadata?: Json | null
          opt_out_at?: string | null
          opted_out_keyword?: string | null
          phone_number?: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messaging_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "messaging_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      mpi_import_standards: {
        Row: {
          clearance_required: boolean | null
          created_at: string
          id: string
          item_category: string
          origin_country: string
          prohibited: boolean | null
          standard_reference: string | null
        }
        Insert: {
          clearance_required?: boolean | null
          created_at?: string
          id?: string
          item_category: string
          origin_country: string
          prohibited?: boolean | null
          standard_reference?: string | null
        }
        Update: {
          clearance_required?: boolean | null
          created_at?: string
          id?: string
          item_category?: string
          origin_country?: string
          prohibited?: boolean | null
          standard_reference?: string | null
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
      output_feedback: {
        Row: {
          action: string
          agent_id: string
          created_at: string | null
          edit_diff: string | null
          id: string
          metadata: Json | null
          original_output: string | null
          output_type: string
          user_id: string
        }
        Insert: {
          action?: string
          agent_id: string
          created_at?: string | null
          edit_diff?: string | null
          id?: string
          metadata?: Json | null
          original_output?: string | null
          output_type?: string
          user_id: string
        }
        Update: {
          action?: string
          agent_id?: string
          created_at?: string | null
          edit_diff?: string | null
          id?: string
          metadata?: Json | null
          original_output?: string | null
          output_type?: string
          user_id?: string
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
      pakihi_clients: {
        Row: {
          client_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          engagement_letter_sent: boolean | null
          engagement_signed_date: string | null
          engagement_type: string | null
          fee_estimate_cents: number | null
          id: string
          industry: string | null
          notes: string | null
          probability_pct: number | null
          renewal_date: string | null
          source: string | null
          stage: string | null
          total_billed_cents: number | null
          total_paid_cents: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          engagement_letter_sent?: boolean | null
          engagement_signed_date?: string | null
          engagement_type?: string | null
          fee_estimate_cents?: number | null
          id?: string
          industry?: string | null
          notes?: string | null
          probability_pct?: number | null
          renewal_date?: string | null
          source?: string | null
          stage?: string | null
          total_billed_cents?: number | null
          total_paid_cents?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          engagement_letter_sent?: boolean | null
          engagement_signed_date?: string | null
          engagement_type?: string | null
          fee_estimate_cents?: number | null
          id?: string
          industry?: string | null
          notes?: string | null
          probability_pct?: number | null
          renewal_date?: string | null
          source?: string | null
          stage?: string | null
          total_billed_cents?: number | null
          total_paid_cents?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pakihi_time_entries: {
        Row: {
          billable: boolean | null
          client_id: string | null
          created_at: string
          description: string
          entry_date: string
          hours: number
          id: string
          invoice_id: string | null
          invoiced: boolean | null
          matter: string | null
          rate_cents: number | null
          user_id: string
        }
        Insert: {
          billable?: boolean | null
          client_id?: string | null
          created_at?: string
          description: string
          entry_date?: string
          hours: number
          id?: string
          invoice_id?: string | null
          invoiced?: boolean | null
          matter?: string | null
          rate_cents?: number | null
          user_id: string
        }
        Update: {
          billable?: boolean | null
          client_id?: string | null
          created_at?: string
          description?: string
          entry_date?: string
          hours?: number
          id?: string
          invoice_id?: string | null
          invoiced?: boolean | null
          matter?: string | null
          rate_cents?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pakihi_time_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "pakihi_clients"
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
      permissions: {
        Row: {
          action: string
          allowed: boolean | null
          id: string
          kete: string
          role_id: string
        }
        Insert: {
          action: string
          allowed?: boolean | null
          id?: string
          kete: string
          role_id: string
        }
        Update: {
          action?: string
          allowed?: boolean | null
          id?: string
          kete?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_audit_logs: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          hash_current: string | null
          hash_prev: string | null
          id: string
          kete: string
          request_id: string
          status: string
          step: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: Json | null
          hash_current?: string | null
          hash_prev?: string | null
          id?: string
          kete: string
          request_id: string
          status: string
          step: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: Json | null
          hash_current?: string | null
          hash_prev?: string | null
          id?: string
          kete?: string
          request_id?: string
          status?: string
          step?: string
          user_id?: string | null
        }
        Relationships: []
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
      policy_rules: {
        Row: {
          applicable_action_types: string[] | null
          applicable_kete: string[] | null
          conditions: Json | null
          created_at: string | null
          effective_date: string | null
          expiry_date: string | null
          id: string
          legislation_code: string
          legislation_title: string
          policy_type: string
          rule_text: string
          section: string | null
          severity: string | null
          updated_at: string | null
        }
        Insert: {
          applicable_action_types?: string[] | null
          applicable_kete?: string[] | null
          conditions?: Json | null
          created_at?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          legislation_code: string
          legislation_title: string
          policy_type?: string
          rule_text: string
          section?: string | null
          severity?: string | null
          updated_at?: string | null
        }
        Update: {
          applicable_action_types?: string[] | null
          applicable_kete?: string[] | null
          conditions?: Json | null
          created_at?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          legislation_code?: string
          legislation_title?: string
          policy_type?: string
          rule_text?: string
          section?: string | null
          severity?: string | null
          updated_at?: string | null
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
          notify_channel: string | null
          notify_enabled: boolean | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          notify_channel?: string | null
          notify_enabled?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          notify_channel?: string | null
          notify_enabled?: boolean | null
          phone?: string | null
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
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      routing_log: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          detected_intent: string | null
          id: string
          request_id: string
          routing_time_ms: number | null
          selected_agent: string
          selected_kete: string
          selected_model: string
          user_input: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          detected_intent?: string | null
          id?: string
          request_id: string
          routing_time_ms?: number | null
          selected_agent: string
          selected_kete: string
          selected_model: string
          user_input: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          detected_intent?: string | null
          id?: string
          request_id?: string
          routing_time_ms?: number | null
          selected_agent?: string
          selected_kete?: string
          selected_model?: string
          user_input?: string
        }
        Relationships: []
      }
      sar_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          request_type: string
          response_deadline: string | null
          status: string | null
          subject_description: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          request_type?: string
          response_deadline?: string | null
          status?: string | null
          subject_description?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          request_type?: string
          response_deadline?: string | null
          status?: string | null
          subject_description?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_destinations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          notes: string | null
          rating: number | null
          region: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          rating?: number | null
          region?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          rating?: number | null
          region?: string | null
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
      scheduled_tasks: {
        Row: {
          agent_id: string
          created_at: string
          description: string | null
          error_message: string | null
          id: string
          last_run_at: string | null
          max_runs: number | null
          next_run_at: string
          payload: Json | null
          result: Json | null
          run_count: number
          schedule_cron: string | null
          status: string
          task_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          description?: string | null
          error_message?: string | null
          id?: string
          last_run_at?: string | null
          max_runs?: number | null
          next_run_at?: string
          payload?: Json | null
          result?: Json | null
          run_count?: number
          schedule_cron?: string | null
          status?: string
          task_type?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          description?: string | null
          error_message?: string | null
          id?: string
          last_run_at?: string | null
          max_runs?: number | null
          next_run_at?: string
          payload?: Json | null
          result?: Json | null
          run_count?: number
          schedule_cron?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
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
      shipments: {
        Row: {
          broker_code: string | null
          carrier: string | null
          country_of_origin: string | null
          created_at: string
          dangerous_goods: boolean | null
          description: string
          destination: string
          hs_code: string | null
          id: string
          incoterm: string | null
          notes: string | null
          origin: string
          status: string
          tracking_code: string | null
          updated_at: string
          user_id: string
          value_nzd: number | null
        }
        Insert: {
          broker_code?: string | null
          carrier?: string | null
          country_of_origin?: string | null
          created_at?: string
          dangerous_goods?: boolean | null
          description: string
          destination: string
          hs_code?: string | null
          id?: string
          incoterm?: string | null
          notes?: string | null
          origin: string
          status?: string
          tracking_code?: string | null
          updated_at?: string
          user_id: string
          value_nzd?: number | null
        }
        Update: {
          broker_code?: string | null
          carrier?: string | null
          country_of_origin?: string | null
          created_at?: string
          dangerous_goods?: boolean | null
          description?: string
          destination?: string
          hs_code?: string | null
          id?: string
          incoterm?: string | null
          notes?: string | null
          origin?: string
          status?: string
          tracking_code?: string | null
          updated_at?: string
          user_id?: string
          value_nzd?: number | null
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
      sovereignty_audit_log: {
        Row: {
          action_type: string
          agent_code: string | null
          created_at: string
          dataset_id: string | null
          decision: string
          id: string
          kete: string | null
          metadata: Json | null
          obligations: Json | null
          provenance_chain: Json | null
          purpose_declared: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          agent_code?: string | null
          created_at?: string
          dataset_id?: string | null
          decision?: string
          id?: string
          kete?: string | null
          metadata?: Json | null
          obligations?: Json | null
          provenance_chain?: Json | null
          purpose_declared?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          agent_code?: string | null
          created_at?: string
          dataset_id?: string | null
          decision?: string
          id?: string
          kete?: string | null
          metadata?: Json | null
          obligations?: Json | null
          provenance_chain?: Json | null
          purpose_declared?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sovereignty_audit_log_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "maori_data_registry"
            referencedColumns: ["id"]
          },
        ]
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
      tariff_classification: {
        Row: {
          created_at: string
          description: string | null
          dual_use_flag: boolean | null
          hs_code: string
          id: string
          tariff_rate: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          dual_use_flag?: boolean | null
          hs_code: string
          id?: string
          tariff_rate?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          dual_use_flag?: boolean | null
          hs_code?: string
          id?: string
          tariff_rate?: number | null
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
      tenant_consent: {
        Row: {
          consent_timestamp: string
          consent_version: string
          contact_email: string
          created_at: string
          id: string
          intake_id: string | null
          ip_hash: string | null
        }
        Insert: {
          consent_timestamp: string
          consent_version: string
          contact_email: string
          created_at?: string
          id?: string
          intake_id?: string | null
          ip_hash?: string | null
        }
        Update: {
          consent_timestamp?: string
          consent_version?: string
          contact_email?: string
          created_at?: string
          id?: string
          intake_id?: string | null
          ip_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_consent_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "tenant_intake"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_intake: {
        Row: {
          auth_user_id: string | null
          business_name: string | null
          consent_timestamp: string
          consent_version: string
          contact_email: string
          contact_name: string
          created_at: string
          exception_path: string | null
          exception_reason: string | null
          id: string
          kete_requested: string
          magic_link_sent: boolean | null
          pain_points: string[]
          personalised_plan: Json | null
          pipeline_status: string
          plan_html_url: string | null
          priority_workflow: string | null
          provisioned_at: string | null
          scrape_companies_office: Json | null
          scrape_google: Json | null
          scrape_linkedin: Json | null
          scrape_nzbn: Json | null
          scrape_website: Json | null
          team_size: string
          tenant_id: string | null
          website_url: string
        }
        Insert: {
          auth_user_id?: string | null
          business_name?: string | null
          consent_timestamp: string
          consent_version: string
          contact_email: string
          contact_name: string
          created_at?: string
          exception_path?: string | null
          exception_reason?: string | null
          id?: string
          kete_requested: string
          magic_link_sent?: boolean | null
          pain_points: string[]
          personalised_plan?: Json | null
          pipeline_status?: string
          plan_html_url?: string | null
          priority_workflow?: string | null
          provisioned_at?: string | null
          scrape_companies_office?: Json | null
          scrape_google?: Json | null
          scrape_linkedin?: Json | null
          scrape_nzbn?: Json | null
          scrape_website?: Json | null
          team_size: string
          tenant_id?: string | null
          website_url: string
        }
        Update: {
          auth_user_id?: string | null
          business_name?: string | null
          consent_timestamp?: string
          consent_version?: string
          contact_email?: string
          contact_name?: string
          created_at?: string
          exception_path?: string | null
          exception_reason?: string | null
          id?: string
          kete_requested?: string
          magic_link_sent?: boolean | null
          pain_points?: string[]
          personalised_plan?: Json | null
          pipeline_status?: string
          plan_html_url?: string | null
          priority_workflow?: string | null
          provisioned_at?: string | null
          scrape_companies_office?: Json | null
          scrape_google?: Json | null
          scrape_linkedin?: Json | null
          scrape_nzbn?: Json | null
          scrape_website?: Json | null
          team_size?: string
          tenant_id?: string | null
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_intake_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_ketes: {
        Row: {
          config: Json
          created_at: string
          display_name: string | null
          enabled: boolean
          id: string
          kete_id: string
          tenant_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          display_name?: string | null
          enabled?: boolean
          id?: string
          kete_id: string
          tenant_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          display_name?: string | null
          enabled?: boolean
          id?: string
          kete_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_ketes_kete_id_fkey"
            columns: ["kete_id"]
            isOneToOne: false
            referencedRelation: "kete_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_ketes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      tenant_phone_numbers: {
        Row: {
          channel: string
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          phone_number: string
          tenant_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone_number: string
          tenant_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone_number?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_phone_numbers_tenant_id_fkey"
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
      tenant_tool_connections: {
        Row: {
          connected_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          provider: string
          provider_label: string
          scopes: string[] | null
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          connected_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          provider: string
          provider_label?: string
          scopes?: string[] | null
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          connected_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          provider_label?: string
          scopes?: string[] | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_tool_connections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          billing_email: string | null
          brand_color: string | null
          created_at: string | null
          credit_nzd: number | null
          id: string
          is_active: boolean | null
          kete_primary: string | null
          logo_url: string | null
          metadata: Json | null
          name: string
          onboarding_complete: boolean | null
          plan: string
          slug: string | null
          status: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          billing_email?: string | null
          brand_color?: string | null
          created_at?: string | null
          credit_nzd?: number | null
          id?: string
          is_active?: boolean | null
          kete_primary?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name: string
          onboarding_complete?: boolean | null
          plan?: string
          slug?: string | null
          status?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          billing_email?: string | null
          brand_color?: string | null
          created_at?: string | null
          credit_nzd?: number | null
          id?: string
          is_active?: boolean | null
          kete_primary?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          onboarding_complete?: boolean | null
          plan?: string
          slug?: string | null
          status?: string
          updated_at?: string | null
          website_url?: string | null
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
      tool_registry: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          requires_integration: string[] | null
          tool_category: string | null
          tool_name: string
          tool_schema: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          requires_integration?: string[] | null
          tool_category?: string | null
          tool_name: string
          tool_schema?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          requires_integration?: string[] | null
          tool_category?: string | null
          tool_name?: string
          tool_schema?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      toroa_appointments: {
        Row: {
          appointment_at: string
          category: string | null
          child_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          family_id: string
          id: string
          is_overdue: boolean | null
          location: string | null
          member_id: string | null
          notes: string | null
          pet_id: string | null
          recurrence: string | null
          reminder_sent: boolean | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          appointment_at: string
          category?: string | null
          child_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          family_id: string
          id?: string
          is_overdue?: boolean | null
          location?: string | null
          member_id?: string | null
          notes?: string | null
          pet_id?: string | null
          recurrence?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          appointment_at?: string
          category?: string | null
          child_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          family_id?: string
          id?: string
          is_overdue?: boolean | null
          location?: string | null
          member_id?: string | null
          notes?: string | null
          pet_id?: string | null
          recurrence?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toroa_appointments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "toroa_children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toroa_appointments_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toroa_appointments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "toroa_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toroa_appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "toroa_pets"
            referencedColumns: ["id"]
          },
        ]
      }
      toroa_budgets: {
        Row: {
          categories: Json | null
          created_at: string
          family_id: string
          id: string
          month: string
          total_expenses: number | null
          total_income: number | null
          updated_at: string
        }
        Insert: {
          categories?: Json | null
          created_at?: string
          family_id: string
          id?: string
          month: string
          total_expenses?: number | null
          total_income?: number | null
          updated_at?: string
        }
        Update: {
          categories?: Json | null
          created_at?: string
          family_id?: string
          id?: string
          month?: string
          total_expenses?: number | null
          total_income?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toroa_budgets_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
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
      toroa_calendar_events: {
        Row: {
          category: string
          created_at: string
          date: string
          end_time: string | null
          family_id: string
          id: string
          location: string | null
          member_id: string | null
          notes: string | null
          time: string | null
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          date: string
          end_time?: string | null
          family_id: string
          id?: string
          location?: string | null
          member_id?: string | null
          notes?: string | null
          time?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          end_time?: string | null
          family_id?: string
          id?: string
          location?: string | null
          member_id?: string | null
          notes?: string | null
          time?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "toroa_calendar_events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toroa_calendar_events_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "toroa_members"
            referencedColumns: ["id"]
          },
        ]
      }
      toroa_children: {
        Row: {
          activities: Json | null
          age: number | null
          created_at: string
          dietary_requirements: Json | null
          family_id: string
          id: string
          name: string
          school: string | null
          school_id: string | null
          year_level: number | null
        }
        Insert: {
          activities?: Json | null
          age?: number | null
          created_at?: string
          dietary_requirements?: Json | null
          family_id: string
          id?: string
          name: string
          school?: string | null
          school_id?: string | null
          year_level?: number | null
        }
        Update: {
          activities?: Json | null
          age?: number | null
          created_at?: string
          dietary_requirements?: Json | null
          family_id?: string
          id?: string
          name?: string
          school?: string | null
          school_id?: string | null
          year_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "toroa_children_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
        ]
      }
      toroa_conversations: {
        Row: {
          created_at: string
          direction: string
          family_id: string
          id: string
          intent: string | null
          member_id: string | null
          message: string
          phone: string
          response: string | null
          tokens_used: number | null
        }
        Insert: {
          created_at?: string
          direction?: string
          family_id: string
          id?: string
          intent?: string | null
          member_id?: string | null
          message: string
          phone: string
          response?: string | null
          tokens_used?: number | null
        }
        Update: {
          created_at?: string
          direction?: string
          family_id?: string
          id?: string
          intent?: string | null
          member_id?: string | null
          message?: string
          phone?: string
          response?: string | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "toroa_conversations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toroa_conversations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "toroa_members"
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
          monthly_sms_limit: number
          name: string | null
          plan: string
          preferences: Json | null
          primary_phone: string
          reminders: Json | null
          sms_used_this_month: number
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_id: string | null
          tenant_id: string | null
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
          monthly_sms_limit?: number
          name?: string | null
          plan?: string
          preferences?: Json | null
          primary_phone: string
          reminders?: Json | null
          sms_used_this_month?: number
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_id?: string | null
          tenant_id?: string | null
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
          monthly_sms_limit?: number
          name?: string | null
          plan?: string
          preferences?: Json | null
          primary_phone?: string
          reminders?: Json | null
          sms_used_this_month?: number
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "toroa_families_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      toroa_family_locations: {
        Row: {
          address: string | null
          created_at: string
          family_id: string
          id: string
          label: string
          lat: number | null
          location_type: string
          lon: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          family_id: string
          id?: string
          label: string
          lat?: number | null
          location_type?: string
          lon?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string
          family_id?: string
          id?: string
          label?: string
          lat?: number | null
          location_type?: string
          lon?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "toroa_family_locations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
        ]
      }
      toroa_family_memory: {
        Row: {
          category: string
          confidence: number | null
          created_at: string
          expires_at: string | null
          family_id: string
          id: string
          memory_key: string
          memory_value: Json
          source: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          confidence?: number | null
          created_at?: string
          expires_at?: string | null
          family_id: string
          id?: string
          memory_key: string
          memory_value?: Json
          source?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string
          expires_at?: string | null
          family_id?: string
          id?: string
          memory_key?: string
          memory_value?: Json
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toroa_family_memory_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
        ]
      }
      toroa_homework: {
        Row: {
          child_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          due_time: string | null
          estimated_hours: number | null
          family_id: string
          id: string
          status: string
          subject: string | null
          title: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_hours?: number | null
          family_id: string
          id?: string
          status?: string
          subject?: string | null
          title: string
        }
        Update: {
          child_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_hours?: number | null
          family_id?: string
          id?: string
          status?: string
          subject?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "toroa_homework_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "toroa_children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toroa_homework_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
        ]
      }
      toroa_meal_plans: {
        Row: {
          created_at: string
          estimated_cost: number | null
          family_id: string
          id: string
          meals: Json | null
          shopping_list: Json | null
          week_start: string
        }
        Insert: {
          created_at?: string
          estimated_cost?: number | null
          family_id: string
          id?: string
          meals?: Json | null
          shopping_list?: Json | null
          week_start: string
        }
        Update: {
          created_at?: string
          estimated_cost?: number | null
          family_id?: string
          id?: string
          meals?: Json | null
          shopping_list?: Json | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "toroa_meal_plans_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
        ]
      }
      toroa_members: {
        Row: {
          created_at: string
          email: string | null
          family_id: string
          id: string
          name: string
          phone: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          family_id: string
          id?: string
          name: string
          phone?: string | null
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          family_id?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "toroa_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
        ]
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
      toroa_newsletters: {
        Row: {
          action_items: Json | null
          created_at: string
          family_id: string
          id: string
          raw_text: string
          school_name: string | null
        }
        Insert: {
          action_items?: Json | null
          created_at?: string
          family_id: string
          id?: string
          raw_text: string
          school_name?: string | null
        }
        Update: {
          action_items?: Json | null
          created_at?: string
          family_id?: string
          id?: string
          raw_text?: string
          school_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "toroa_newsletters_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
        ]
      }
      toroa_pets: {
        Row: {
          breed: string | null
          created_at: string
          date_of_birth: string | null
          family_id: string
          id: string
          insurance_policy: string | null
          insurance_provider: string | null
          medications: Json | null
          microchip_number: string | null
          name: string
          notes: string | null
          photo_url: string | null
          species: string
          updated_at: string
          vaccinations: Json | null
          vet_clinic: string | null
          vet_phone: string | null
          weight_kg: number | null
        }
        Insert: {
          breed?: string | null
          created_at?: string
          date_of_birth?: string | null
          family_id: string
          id?: string
          insurance_policy?: string | null
          insurance_provider?: string | null
          medications?: Json | null
          microchip_number?: string | null
          name: string
          notes?: string | null
          photo_url?: string | null
          species?: string
          updated_at?: string
          vaccinations?: Json | null
          vet_clinic?: string | null
          vet_phone?: string | null
          weight_kg?: number | null
        }
        Update: {
          breed?: string | null
          created_at?: string
          date_of_birth?: string | null
          family_id?: string
          id?: string
          insurance_policy?: string | null
          insurance_provider?: string | null
          medications?: Json | null
          microchip_number?: string | null
          name?: string
          notes?: string | null
          photo_url?: string | null
          species?: string
          updated_at?: string
          vaccinations?: Json | null
          vet_clinic?: string | null
          vet_phone?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "toroa_pets_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
        ]
      }
      toroa_proactive_alerts: {
        Row: {
          acknowledged: boolean | null
          alert_key: string
          alert_type: string
          family_id: string
          id: string
          message: string
          sent_at: string
        }
        Insert: {
          acknowledged?: boolean | null
          alert_key: string
          alert_type: string
          family_id: string
          id?: string
          message: string
          sent_at?: string
        }
        Update: {
          acknowledged?: boolean | null
          alert_key?: string
          alert_type?: string
          family_id?: string
          id?: string
          message?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toroa_proactive_alerts_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
        ]
      }
      toroa_shopping: {
        Row: {
          actual_cost_cents: number | null
          added_by: string | null
          category: string | null
          created_at: string
          estimated_cost_cents: number | null
          family_id: string
          id: string
          item: string
          notes: string | null
          priority: string | null
          purchased: boolean | null
          purchased_at: string | null
          quantity: number | null
          store: string | null
        }
        Insert: {
          actual_cost_cents?: number | null
          added_by?: string | null
          category?: string | null
          created_at?: string
          estimated_cost_cents?: number | null
          family_id: string
          id?: string
          item: string
          notes?: string | null
          priority?: string | null
          purchased?: boolean | null
          purchased_at?: string | null
          quantity?: number | null
          store?: string | null
        }
        Update: {
          actual_cost_cents?: number | null
          added_by?: string | null
          category?: string | null
          created_at?: string
          estimated_cost_cents?: number | null
          family_id?: string
          id?: string
          item?: string
          notes?: string | null
          priority?: string | null
          purchased?: boolean | null
          purchased_at?: string | null
          quantity?: number | null
          store?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "toroa_shopping_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "toroa_families"
            referencedColumns: ["id"]
          },
        ]
      }
      toroa_smart_home_events: {
        Row: {
          action: string | null
          created_at: string | null
          device_id: string | null
          event_type: string
          family_id: string
          id: string
          platform: string
          result: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          device_id?: string | null
          event_type: string
          family_id: string
          id?: string
          platform: string
          result?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          device_id?: string | null
          event_type?: string
          family_id?: string
          id?: string
          platform?: string
          result?: string | null
        }
        Relationships: []
      }
      toroa_smart_home_links: {
        Row: {
          alexa_token: string | null
          created_at: string | null
          devices: Json | null
          family_id: string
          google_token: string | null
          home_assistant_token: string | null
          home_assistant_url: string | null
          id: string
          is_active: boolean | null
          platform: string
          updated_at: string | null
        }
        Insert: {
          alexa_token?: string | null
          created_at?: string | null
          devices?: Json | null
          family_id: string
          google_token?: string | null
          home_assistant_token?: string | null
          home_assistant_url?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          updated_at?: string | null
        }
        Update: {
          alexa_token?: string | null
          created_at?: string | null
          devices?: Json | null
          family_id?: string
          google_token?: string | null
          home_assistant_token?: string | null
          home_assistant_url?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      toroa_uniforms: {
        Row: {
          child_id: string | null
          color: string | null
          condition: string | null
          cost_cents: number | null
          created_at: string
          family_id: string
          id: string
          item_type: string
          needs_replacement: boolean | null
          notes: string | null
          purchase_date: string | null
          quantity: number
          school: string | null
          size: string | null
          updated_at: string
        }
        Insert: {
          child_id?: string | null
          color?: string | null
          condition?: string | null
          cost_cents?: number | null
          created_at?: string
          family_id: string
          id?: string
          item_type: string
          needs_replacement?: boolean | null
          notes?: string | null
          purchase_date?: string | null
          quantity?: number
          school?: string | null
          size?: string | null
          updated_at?: string
        }
        Update: {
          child_id?: string | null
          color?: string | null
          condition?: string | null
          cost_cents?: number | null
          created_at?: string
          family_id?: string
          id?: string
          item_type?: string
          needs_replacement?: boolean | null
          notes?: string | null
          purchase_date?: string | null
          quantity?: number
          school?: string | null
          size?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toroa_uniforms_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "toroa_children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "toroa_uniforms_family_id_fkey"
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
      travel_itineraries: {
        Row: {
          accommodation_style: string | null
          budget_nzd: number | null
          created_at: string | null
          destination: string
          end_date: string | null
          id: string
          interests: string[] | null
          itinerary: Json | null
          start_date: string | null
          status: string | null
          summary: string | null
          travellers: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accommodation_style?: string | null
          budget_nzd?: number | null
          created_at?: string | null
          destination: string
          end_date?: string | null
          id?: string
          interests?: string[] | null
          itinerary?: Json | null
          start_date?: string | null
          status?: string | null
          summary?: string | null
          travellers?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accommodation_style?: string | null
          budget_nzd?: number | null
          created_at?: string | null
          destination?: string
          end_date?: string | null
          id?: string
          interests?: string[] | null
          itinerary?: Json | null
          start_date?: string | null
          status?: string | null
          summary?: string | null
          travellers?: number | null
          updated_at?: string | null
          user_id?: string
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
      trip_activities: {
        Row: {
          activity_type: string
          booked: boolean
          cost: number | null
          created_at: string
          day_id: string
          duration_minutes: number | null
          id: string
          link: string | null
          name: string
          note: string | null
          sort_order: number
          start_time: string | null
          trip_id: string
          urgent: boolean
        }
        Insert: {
          activity_type?: string
          booked?: boolean
          cost?: number | null
          created_at?: string
          day_id: string
          duration_minutes?: number | null
          id?: string
          link?: string | null
          name: string
          note?: string | null
          sort_order?: number
          start_time?: string | null
          trip_id: string
          urgent?: boolean
        }
        Update: {
          activity_type?: string
          booked?: boolean
          cost?: number | null
          created_at?: string
          day_id?: string
          duration_minutes?: number | null
          id?: string
          link?: string | null
          name?: string
          note?: string | null
          sort_order?: number
          start_time?: string | null
          trip_id?: string
          urgent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "trip_activities_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_activities_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_convoys: {
        Row: {
          arrive_at: string | null
          created_at: string
          day_id: string
          depart_at: string | null
          destination_label: string | null
          destination_lat: number | null
          destination_lng: number | null
          distance_km: number | null
          family_id: string
          id: string
          origin_label: string | null
          origin_lat: number | null
          origin_lng: number | null
          route_polyline: Json | null
          status: string
          trip_id: string
        }
        Insert: {
          arrive_at?: string | null
          created_at?: string
          day_id: string
          depart_at?: string | null
          destination_label?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          distance_km?: number | null
          family_id: string
          id?: string
          origin_label?: string | null
          origin_lat?: number | null
          origin_lng?: number | null
          route_polyline?: Json | null
          status?: string
          trip_id: string
        }
        Update: {
          arrive_at?: string | null
          created_at?: string
          day_id?: string
          depart_at?: string | null
          destination_label?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          distance_km?: number | null
          family_id?: string
          id?: string
          origin_label?: string | null
          origin_lat?: number | null
          origin_lng?: number | null
          route_polyline?: Json | null
          status?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_convoys_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_convoys_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "trip_families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_convoys_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_days: {
        Row: {
          created_at: string
          date: string
          destination_id: string | null
          id: string
          summary: string | null
          title: string | null
          trip_id: string
          weather_note: string | null
        }
        Insert: {
          created_at?: string
          date: string
          destination_id?: string | null
          id?: string
          summary?: string | null
          title?: string | null
          trip_id: string
          weather_note?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          destination_id?: string | null
          id?: string
          summary?: string | null
          title?: string | null
          trip_id?: string
          weather_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_days_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "trip_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_days_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_destinations: {
        Row: {
          arrival_date: string
          color: string
          created_at: string
          departure_date: string
          id: string
          lat: number
          lng: number
          name: string
          region: string | null
          sort_order: number
          trip_id: string
        }
        Insert: {
          arrival_date: string
          color?: string
          created_at?: string
          departure_date: string
          id?: string
          lat: number
          lng: number
          name: string
          region?: string | null
          sort_order?: number
          trip_id: string
        }
        Update: {
          arrival_date?: string
          color?: string
          created_at?: string
          departure_date?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          region?: string | null
          sort_order?: number
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_destinations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_families: {
        Row: {
          accent_color: string
          created_at: string
          home_city: string | null
          home_lat: number | null
          home_lng: number | null
          id: string
          member_count: number
          members: Json | null
          name: string
          trip_id: string
        }
        Insert: {
          accent_color?: string
          created_at?: string
          home_city?: string | null
          home_lat?: number | null
          home_lng?: number | null
          id?: string
          member_count?: number
          members?: Json | null
          name: string
          trip_id: string
        }
        Update: {
          accent_color?: string
          created_at?: string
          home_city?: string | null
          home_lat?: number | null
          home_lng?: number | null
          id?: string
          member_count?: number
          members?: Json | null
          name?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_families_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          base_lat: number | null
          base_lng: number | null
          base_zoom: number | null
          created_at: string
          currency: string
          end_date: string
          id: string
          is_sample: boolean
          name: string
          owner_id: string | null
          start_date: string
          tagline: string | null
          updated_at: string
        }
        Insert: {
          base_lat?: number | null
          base_lng?: number | null
          base_zoom?: number | null
          created_at?: string
          currency?: string
          end_date: string
          id?: string
          is_sample?: boolean
          name: string
          owner_id?: string | null
          start_date: string
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          base_lat?: number | null
          base_lng?: number | null
          base_zoom?: number | null
          created_at?: string
          currency?: string
          end_date?: string
          id?: string
          is_sample?: boolean
          name?: string
          owner_id?: string | null
          start_date?: string
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
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
      vehicles: {
        Row: {
          cof_expiry: string | null
          created_at: string
          fleet_id: string | null
          id: string
          make: string | null
          model: string | null
          registration: string | null
          status: string | null
          updated_at: string
          user_id: string
          vehicle_id: string
          wof_expiry: string | null
          year: number | null
        }
        Insert: {
          cof_expiry?: string | null
          created_at?: string
          fleet_id?: string | null
          id?: string
          make?: string | null
          model?: string | null
          registration?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          vehicle_id: string
          wof_expiry?: string | null
          year?: number | null
        }
        Update: {
          cof_expiry?: string | null
          created_at?: string
          fleet_id?: string | null
          id?: string
          make?: string | null
          model?: string | null
          registration?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          vehicle_id?: string
          wof_expiry?: string | null
          year?: number | null
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
      waihanga_consent_checks: {
        Row: {
          ambers: Json
          consent_type: string
          council: string
          created_at: string
          drawings_provided: boolean
          greens: Json
          id: string
          project_ref: string
          ps1_drafted: boolean
          readiness_verdict: string
          reds: Json
          run_id: string | null
          user_id: string
        }
        Insert: {
          ambers?: Json
          consent_type: string
          council: string
          created_at?: string
          drawings_provided?: boolean
          greens?: Json
          id?: string
          project_ref: string
          ps1_drafted?: boolean
          readiness_verdict?: string
          reds?: Json
          run_id?: string | null
          user_id: string
        }
        Update: {
          ambers?: Json
          consent_type?: string
          council?: string
          created_at?: string
          drawings_provided?: boolean
          greens?: Json
          id?: string
          project_ref?: string
          ps1_drafted?: boolean
          readiness_verdict?: string
          reds?: Json
          run_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waihanga_consent_checks_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "waihanga_workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      waihanga_payment_claims_v2: {
        Row: {
          cca_section_20_compliant: boolean
          claim_document_md: string | null
          claim_period: string
          contract_ref: string
          created_at: string
          due_date: string
          gst_nzd: number
          id: string
          principal_email: string
          principal_name: string
          retention_deduction_nzd: number
          run_id: string | null
          schedule_deadline: string | null
          schedule_received: boolean
          status: string
          sum_claimed_nzd: number
          total_due_nzd: number
          user_id: string
        }
        Insert: {
          cca_section_20_compliant?: boolean
          claim_document_md?: string | null
          claim_period: string
          contract_ref: string
          created_at?: string
          due_date: string
          gst_nzd: number
          id?: string
          principal_email: string
          principal_name: string
          retention_deduction_nzd?: number
          run_id?: string | null
          schedule_deadline?: string | null
          schedule_received?: boolean
          status?: string
          sum_claimed_nzd: number
          total_due_nzd: number
          user_id: string
        }
        Update: {
          cca_section_20_compliant?: boolean
          claim_document_md?: string | null
          claim_period?: string
          contract_ref?: string
          created_at?: string
          due_date?: string
          gst_nzd?: number
          id?: string
          principal_email?: string
          principal_name?: string
          retention_deduction_nzd?: number
          run_id?: string | null
          schedule_deadline?: string | null
          schedule_received?: boolean
          status?: string
          sum_claimed_nzd?: number
          total_due_nzd?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waihanga_payment_claims_v2_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "waihanga_workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      waihanga_retention_ledger: {
        Row: {
          amount_nzd: number
          contract_ref: string
          created_at: string
          id: string
          last_movement_date: string
          retention_held_nzd: number
          retention_pct: number
          run_id: string | null
          status: string
          subcontractor_name: string
          trigger_event: string
          trust_account_ref: string | null
          user_id: string
        }
        Insert: {
          amount_nzd: number
          contract_ref: string
          created_at?: string
          id?: string
          last_movement_date?: string
          retention_held_nzd: number
          retention_pct: number
          run_id?: string | null
          status?: string
          subcontractor_name: string
          trigger_event: string
          trust_account_ref?: string | null
          user_id: string
        }
        Update: {
          amount_nzd?: number
          contract_ref?: string
          created_at?: string
          id?: string
          last_movement_date?: string
          retention_held_nzd?: number
          retention_pct?: number
          run_id?: string | null
          status?: string
          subcontractor_name?: string
          trigger_event?: string
          trust_account_ref?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waihanga_retention_ledger_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "waihanga_workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      waihanga_safety_log: {
        Row: {
          attendees: Json
          created_at: string
          hazards: Json
          id: string
          incidents: Json
          log_date: string
          notifiable_event: boolean
          run_id: string | null
          toolbox_topic: string
          user_id: string
          worksafe_draft: string | null
        }
        Insert: {
          attendees?: Json
          created_at?: string
          hazards?: Json
          id?: string
          incidents?: Json
          log_date?: string
          notifiable_event?: boolean
          run_id?: string | null
          toolbox_topic: string
          user_id: string
          worksafe_draft?: string | null
        }
        Update: {
          attendees?: Json
          created_at?: string
          hazards?: Json
          id?: string
          incidents?: Json
          log_date?: string
          notifiable_event?: boolean
          run_id?: string | null
          toolbox_topic?: string
          user_id?: string
          worksafe_draft?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waihanga_safety_log_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "waihanga_workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      waihanga_workflow_runs: {
        Row: {
          agent_chain: Json
          completed_at: string | null
          evidence_pack_id: string | null
          id: string
          result: Json | null
          started_at: string
          status: string
          trigger_payload: Json
          user_id: string
          workflow_type: string
        }
        Insert: {
          agent_chain?: Json
          completed_at?: string | null
          evidence_pack_id?: string | null
          id?: string
          result?: Json | null
          started_at?: string
          status?: string
          trigger_payload?: Json
          user_id: string
          workflow_type: string
        }
        Update: {
          agent_chain?: Json
          completed_at?: string | null
          evidence_pack_id?: string | null
          id?: string
          result?: Json | null
          started_at?: string
          status?: string
          trigger_payload?: Json
          user_id?: string
          workflow_type?: string
        }
        Relationships: []
      }
      waka_customer_vehicles: {
        Row: {
          churn_risk_pct: number | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          finance_balloon_date: string | null
          id: string
          last_contact_date: string | null
          last_service_date: string | null
          lifetime_value_cents: number | null
          make_model: string | null
          next_service_due: string | null
          notes: string | null
          rego: string | null
          updated_at: string
          user_id: string
          vehicle_id: string | null
          wof_expiry: string | null
        }
        Insert: {
          churn_risk_pct?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          finance_balloon_date?: string | null
          id?: string
          last_contact_date?: string | null
          last_service_date?: string | null
          lifetime_value_cents?: number | null
          make_model?: string | null
          next_service_due?: string | null
          notes?: string | null
          rego?: string | null
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
          wof_expiry?: string | null
        }
        Update: {
          churn_risk_pct?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          finance_balloon_date?: string | null
          id?: string
          last_contact_date?: string | null
          last_service_date?: string | null
          lifetime_value_cents?: number | null
          make_model?: string | null
          next_service_due?: string | null
          notes?: string | null
          rego?: string | null
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
          wof_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waka_customer_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "waka_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      waka_vehicles: {
        Row: {
          colour: string | null
          created_at: string
          current_location: string | null
          fuel_type: string | null
          id: string
          listing_url: string | null
          make: string | null
          model: string | null
          notes: string | null
          odometer_km: number | null
          photos: string[] | null
          purchase_date: string | null
          purchase_price_cents: number | null
          rego: string
          rego_expiry: string | null
          ruc_avg_weekly_km: number | null
          ruc_balance_km: number | null
          service_history: Json | null
          status: string | null
          updated_at: string
          user_id: string
          vin: string | null
          wof_expiry: string | null
          year: number | null
        }
        Insert: {
          colour?: string | null
          created_at?: string
          current_location?: string | null
          fuel_type?: string | null
          id?: string
          listing_url?: string | null
          make?: string | null
          model?: string | null
          notes?: string | null
          odometer_km?: number | null
          photos?: string[] | null
          purchase_date?: string | null
          purchase_price_cents?: number | null
          rego: string
          rego_expiry?: string | null
          ruc_avg_weekly_km?: number | null
          ruc_balance_km?: number | null
          service_history?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
          vin?: string | null
          wof_expiry?: string | null
          year?: number | null
        }
        Update: {
          colour?: string | null
          created_at?: string
          current_location?: string | null
          fuel_type?: string | null
          id?: string
          listing_url?: string | null
          make?: string | null
          model?: string | null
          notes?: string | null
          odometer_km?: number | null
          photos?: string[] | null
          purchase_date?: string | null
          purchase_price_cents?: number | null
          rego?: string
          rego_expiry?: string | null
          ruc_avg_weekly_km?: number | null
          ruc_balance_km?: number | null
          service_history?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
          vin?: string | null
          wof_expiry?: string | null
          year?: number | null
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
      whenua_maintenance: {
        Row: {
          completed_at: string | null
          contractor_name: string | null
          contractor_phone: string | null
          cost_cents: number | null
          created_at: string
          description: string | null
          id: string
          notes: string | null
          photos: string[] | null
          property_id: string | null
          reported_at: string | null
          status: string | null
          title: string
          user_id: string
          warranty_until: string | null
        }
        Insert: {
          completed_at?: string | null
          contractor_name?: string | null
          contractor_phone?: string | null
          cost_cents?: number | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          photos?: string[] | null
          property_id?: string | null
          reported_at?: string | null
          status?: string | null
          title: string
          user_id: string
          warranty_until?: string | null
        }
        Update: {
          completed_at?: string | null
          contractor_name?: string | null
          contractor_phone?: string | null
          cost_cents?: number | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          photos?: string[] | null
          property_id?: string | null
          reported_at?: string | null
          status?: string | null
          title?: string
          user_id?: string
          warranty_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whenua_maintenance_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "whenua_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      whenua_properties: {
        Row: {
          address: string
          bathrooms: number | null
          bedrooms: number | null
          bond_cents: number | null
          city: string | null
          created_at: string
          current_tenant_name: string | null
          gross_yield_pct: number | null
          healthy_homes_drainage: string | null
          healthy_homes_draught: string | null
          healthy_homes_heating: string | null
          healthy_homes_insulation: string | null
          healthy_homes_moisture: string | null
          healthy_homes_ventilation: string | null
          id: string
          insurance_premium_cents: number | null
          insurance_provider: string | null
          insurance_renewal: string | null
          lease_end: string | null
          lease_start: string | null
          net_yield_pct: number | null
          notes: string | null
          property_type: string | null
          rates_annual_cents: number | null
          suburb: string | null
          updated_at: string
          user_id: string
          weekly_rent_cents: number | null
        }
        Insert: {
          address: string
          bathrooms?: number | null
          bedrooms?: number | null
          bond_cents?: number | null
          city?: string | null
          created_at?: string
          current_tenant_name?: string | null
          gross_yield_pct?: number | null
          healthy_homes_drainage?: string | null
          healthy_homes_draught?: string | null
          healthy_homes_heating?: string | null
          healthy_homes_insulation?: string | null
          healthy_homes_moisture?: string | null
          healthy_homes_ventilation?: string | null
          id?: string
          insurance_premium_cents?: number | null
          insurance_provider?: string | null
          insurance_renewal?: string | null
          lease_end?: string | null
          lease_start?: string | null
          net_yield_pct?: number | null
          notes?: string | null
          property_type?: string | null
          rates_annual_cents?: number | null
          suburb?: string | null
          updated_at?: string
          user_id: string
          weekly_rent_cents?: number | null
        }
        Update: {
          address?: string
          bathrooms?: number | null
          bedrooms?: number | null
          bond_cents?: number | null
          city?: string | null
          created_at?: string
          current_tenant_name?: string | null
          gross_yield_pct?: number | null
          healthy_homes_drainage?: string | null
          healthy_homes_draught?: string | null
          healthy_homes_heating?: string | null
          healthy_homes_insulation?: string | null
          healthy_homes_moisture?: string | null
          healthy_homes_ventilation?: string | null
          id?: string
          insurance_premium_cents?: number | null
          insurance_provider?: string | null
          insurance_renewal?: string | null
          lease_end?: string | null
          lease_start?: string | null
          net_yield_pct?: number | null
          notes?: string | null
          property_type?: string | null
          rates_annual_cents?: number | null
          suburb?: string | null
          updated_at?: string
          user_id?: string
          weekly_rent_cents?: number | null
        }
        Relationships: []
      }
      whenua_tenants: {
        Row: {
          bond_lodged: boolean | null
          bond_reference: string | null
          communication_log: Json | null
          created_at: string
          id: string
          lease_end: string | null
          lease_start: string | null
          property_id: string | null
          status: string | null
          tenant_email: string | null
          tenant_name: string
          tenant_phone: string | null
          updated_at: string
          user_id: string
          weekly_rent_cents: number | null
        }
        Insert: {
          bond_lodged?: boolean | null
          bond_reference?: string | null
          communication_log?: Json | null
          created_at?: string
          id?: string
          lease_end?: string | null
          lease_start?: string | null
          property_id?: string | null
          status?: string | null
          tenant_email?: string | null
          tenant_name: string
          tenant_phone?: string | null
          updated_at?: string
          user_id: string
          weekly_rent_cents?: number | null
        }
        Update: {
          bond_lodged?: boolean | null
          bond_reference?: string | null
          communication_log?: Json | null
          created_at?: string
          id?: string
          lease_end?: string | null
          lease_start?: string | null
          property_id?: string | null
          status?: string | null
          tenant_email?: string | null
          tenant_name?: string
          tenant_phone?: string | null
          updated_at?: string
          user_id?: string
          weekly_rent_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "whenua_tenants_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "whenua_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      wof_bookings: {
        Row: {
          booked_at: string
          created_at: string
          fleet_id: string | null
          id: string
          status: string | null
          vehicle_id: string
        }
        Insert: {
          booked_at?: string
          created_at?: string
          fleet_id?: string | null
          id?: string
          status?: string | null
          vehicle_id: string
        }
        Update: {
          booked_at?: string
          created_at?: string
          fleet_id?: string | null
          id?: string
          status?: string | null
          vehicle_id?: string
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
          relevant_acts: string[]
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
          relevant_acts?: string[]
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
          relevant_acts?: string[]
          steps?: Json
          trigger_agent?: string
          trigger_event?: string
          user_id?: string | null
        }
        Relationships: []
      }
      workshop_jobs: {
        Row: {
          created_at: string
          fleet_id: string | null
          id: string
          job_id: string
          job_type: string | null
          notes: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          status: string | null
          updated_at: string
          user_id: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          fleet_id?: string | null
          id?: string
          job_id?: string
          job_type?: string | null
          notes?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string
          fleet_id?: string | null
          id?: string
          job_id?: string
          job_type?: string | null
          notes?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string
        }
        Relationships: []
      }
      xero_oauth_state: {
        Row: {
          created_at: string
          expires_at: string
          return_url: string | null
          state: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          return_url?: string | null
          state: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          return_url?: string | null
          state?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xero_oauth_state_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      xero_tokens: {
        Row: {
          access_token: string
          connected_by: string | null
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          scopes: string[] | null
          tenant_id: string
          updated_at: string
          xero_org_name: string | null
          xero_tenant_id: string
        }
        Insert: {
          access_token: string
          connected_by?: string | null
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          scopes?: string[] | null
          tenant_id: string
          updated_at?: string
          xero_org_name?: string | null
          xero_tenant_id: string
        }
        Update: {
          access_token?: string
          connected_by?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          scopes?: string[] | null
          tenant_id?: string
          updated_at?: string
          xero_org_name?: string | null
          xero_tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xero_tokens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_trip: { Args: { _trip_id: string }; Returns: boolean }
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
      owns_trip: { Args: { _trip_id: string }; Returns: boolean }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      resolve_tenant_from_phone: {
        Args: { p_channel: string; p_phone: string }
        Returns: string
      }
      search_industry_kb: {
        Args: {
          filter_agent?: string
          filter_kete?: string
          match_count?: number
          min_similarity?: number
          query_embedding: string
        }
        Returns: {
          chunk_id: string
          chunk_text: string
          doc_title: string
          document_id: string
          kete: string
          similarity: number
          source_url: string
          tier: number
        }[]
      }
      search_memory: {
        Args: {
          p_agent_id?: string
          p_limit?: number
          p_query: string
          p_user_id: string
        }
        Returns: {
          agent_id: string
          created_at: string
          key_facts: Json
          rank: number
          summary: string
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
