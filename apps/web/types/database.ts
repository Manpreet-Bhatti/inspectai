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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      findings: {
        Row: {
          category: Database["public"]["Enums"]["finding_category"]
          confidence: number | null
          cost_estimate: number | null
          cost_max: number | null
          cost_min: number | null
          created_at: string | null
          description: string
          embedding: string | null
          id: string
          inspection_id: string
          is_ai_generated: boolean | null
          location: string | null
          photo_id: string | null
          severity: Database["public"]["Enums"]["severity"]
          status: Database["public"]["Enums"]["finding_status"] | null
          title: string
          updated_at: string | null
          voice_note_id: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["finding_category"]
          confidence?: number | null
          cost_estimate?: number | null
          cost_max?: number | null
          cost_min?: number | null
          created_at?: string | null
          description: string
          embedding?: string | null
          id?: string
          inspection_id: string
          is_ai_generated?: boolean | null
          location?: string | null
          photo_id?: string | null
          severity: Database["public"]["Enums"]["severity"]
          status?: Database["public"]["Enums"]["finding_status"] | null
          title: string
          updated_at?: string | null
          voice_note_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["finding_category"]
          confidence?: number | null
          cost_estimate?: number | null
          cost_max?: number | null
          cost_min?: number | null
          created_at?: string | null
          description?: string
          embedding?: string | null
          id?: string
          inspection_id?: string
          is_ai_generated?: boolean | null
          location?: string | null
          photo_id?: string | null
          severity?: Database["public"]["Enums"]["severity"]
          status?: Database["public"]["Enums"]["finding_status"] | null
          title?: string
          updated_at?: string | null
          voice_note_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "findings_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_voice_note_id_fkey"
            columns: ["voice_note_id"]
            isOneToOne: false
            referencedRelation: "voice_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          address: string
          city: string
          completed_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          property_type: Database["public"]["Enums"]["property_type"]
          scheduled_at: string | null
          state: string
          status: Database["public"]["Enums"]["inspection_status"] | null
          title: string
          updated_at: string | null
          user_id: string
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          property_type: Database["public"]["Enums"]["property_type"]
          scheduled_at?: string | null
          state: string
          status?: Database["public"]["Enums"]["inspection_status"] | null
          title: string
          updated_at?: string | null
          user_id: string
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          property_type?: Database["public"]["Enums"]["property_type"]
          scheduled_at?: string | null
          state?: string
          status?: Database["public"]["Enums"]["inspection_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          ai_caption: string | null
          ai_condition: string | null
          ai_confidence: number | null
          ai_objects: Json | null
          category: Database["public"]["Enums"]["photo_category"] | null
          created_at: string | null
          error: string | null
          file_name: string
          height: number | null
          id: string
          inspection_id: string
          location: string | null
          processed_at: string | null
          storage_path: string
          thumbnail_path: string | null
          width: number | null
        }
        Insert: {
          ai_caption?: string | null
          ai_condition?: string | null
          ai_confidence?: number | null
          ai_objects?: Json | null
          category?: Database["public"]["Enums"]["photo_category"] | null
          created_at?: string | null
          error?: string | null
          file_name: string
          height?: number | null
          id?: string
          inspection_id: string
          location?: string | null
          processed_at?: string | null
          storage_path: string
          thumbnail_path?: string | null
          width?: number | null
        }
        Update: {
          ai_caption?: string | null
          ai_condition?: string | null
          ai_confidence?: number | null
          ai_objects?: Json | null
          category?: Database["public"]["Enums"]["photo_category"] | null
          created_at?: string | null
          error?: string | null
          file_name?: string
          height?: number | null
          id?: string
          inspection_id?: string
          location?: string | null
          processed_at?: string | null
          storage_path?: string
          thumbnail_path?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          generated_at: string | null
          id: string
          inspection_id: string
          storage_path: string | null
          summary: string | null
          total_cost: number | null
          type: Database["public"]["Enums"]["report_type"]
        }
        Insert: {
          generated_at?: string | null
          id?: string
          inspection_id: string
          storage_path?: string | null
          summary?: string | null
          total_cost?: number | null
          type: Database["public"]["Enums"]["report_type"]
        }
        Update: {
          generated_at?: string | null
          id?: string
          inspection_id?: string
          storage_path?: string | null
          summary?: string | null
          total_cost?: number | null
          type?: Database["public"]["Enums"]["report_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_notes: {
        Row: {
          created_at: string | null
          duration: number
          error: string | null
          id: string
          inspection_id: string
          processed_at: string | null
          storage_path: string
          summary: string | null
          transcript: string | null
        }
        Insert: {
          created_at?: string | null
          duration: number
          error?: string | null
          id?: string
          inspection_id: string
          processed_at?: string | null
          storage_path: string
          summary?: string | null
          transcript?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number
          error?: string | null
          id?: string
          inspection_id?: string
          processed_at?: string | null
          storage_path?: string
          summary?: string | null
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_notes_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_similar_findings: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: Database["public"]["Enums"]["finding_category"]
          cost_estimate: number
          description: string
          id: string
          inspection_id: string
          severity: Database["public"]["Enums"]["severity"]
          similarity: number
          title: string
        }[]
      }
    }
    Enums: {
      finding_category:
        | "structural"
        | "electrical"
        | "plumbing"
        | "hvac"
        | "roofing"
        | "exterior"
        | "interior"
        | "appliances"
        | "safety"
        | "cosmetic"
      finding_status: "active" | "resolved" | "disputed"
      inspection_status:
        | "draft"
        | "in_progress"
        | "review"
        | "completed"
        | "archived"
      photo_category:
        | "exterior"
        | "interior"
        | "roof"
        | "foundation"
        | "electrical"
        | "plumbing"
        | "hvac"
        | "structural"
        | "other"
      property_type:
        | "single_family"
        | "multi_family"
        | "condo"
        | "townhouse"
        | "commercial"
        | "industrial"
      report_type: "full" | "summary" | "defects"
      severity: "critical" | "major" | "minor" | "cosmetic" | "info"
      user_role: "inspector" | "manager" | "admin"
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
      finding_category: [
        "structural",
        "electrical",
        "plumbing",
        "hvac",
        "roofing",
        "exterior",
        "interior",
        "appliances",
        "safety",
        "cosmetic",
      ],
      finding_status: ["active", "resolved", "disputed"],
      inspection_status: [
        "draft",
        "in_progress",
        "review",
        "completed",
        "archived",
      ],
      photo_category: [
        "exterior",
        "interior",
        "roof",
        "foundation",
        "electrical",
        "plumbing",
        "hvac",
        "structural",
        "other",
      ],
      property_type: [
        "single_family",
        "multi_family",
        "condo",
        "townhouse",
        "commercial",
        "industrial",
      ],
      report_type: ["full", "summary", "defects"],
      severity: ["critical", "major", "minor", "cosmetic", "info"],
      user_role: ["inspector", "manager", "admin"],
    },
  },
} as const
