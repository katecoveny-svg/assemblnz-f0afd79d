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
