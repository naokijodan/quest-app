export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      preset_quests: {
        Row: {
          category: string
          created_at: string
          description: string
          description_en: string | null
          difficulty: number
          icon: string
          id: string
          is_active: boolean
          max_tokens_limit: number
          output_type: string
          prompt_template: string
          quest_identifier: string
          required_inputs: Json
          sort_order: number
          title: string
          title_en: string | null
          updated_at: string
          version: number
          xp_reward: number
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          description_en?: string | null
          difficulty?: number
          icon?: string
          id?: string
          is_active?: boolean
          max_tokens_limit?: number
          output_type?: string
          prompt_template: string
          quest_identifier: string
          required_inputs?: Json
          sort_order?: number
          title: string
          title_en?: string | null
          updated_at?: string
          version?: number
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          description_en?: string | null
          difficulty?: number
          icon?: string
          id?: string
          is_active?: boolean
          max_tokens_limit?: number
          output_type?: string
          prompt_template?: string
          quest_identifier?: string
          required_inputs?: Json
          sort_order?: number
          title?: string
          title_en?: string | null
          updated_at?: string
          version?: number
          xp_reward?: number
        }
        Relationships: []
      }
      quest_runs: {
        Row: {
          actual_tokens_used: number | null
          completed_at: string | null
          error_message: string | null
          id: string
          input_data: Json
          output_data: string | null
          output_type: string
          partial_output: string | null
          preset_quest_id: string | null
          retry_count: number
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          actual_tokens_used?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json
          output_data?: string | null
          output_type?: string
          partial_output?: string | null
          preset_quest_id?: string | null
          retry_count?: number
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          actual_tokens_used?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json
          output_data?: string | null
          output_type?: string
          partial_output?: string | null
          preset_quest_id?: string | null
          retry_count?: number
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_runs_preset_quest_id_fkey"
            columns: ["preset_quest_id"]
            isOneToOne: false
            referencedRelation: "preset_quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_quotas: {
        Row: {
          api_calls_made: number
          id: string
          last_reset_at: string
          quota_date: string
          tokens_used: number
          user_id: string
        }
        Insert: {
          api_calls_made?: number
          id?: string
          last_reset_at?: string
          quota_date?: string
          tokens_used?: number
          user_id: string
        }
        Update: {
          api_calls_made?: number
          id?: string
          last_reset_at?: string
          quota_date?: string
          tokens_used?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_quotas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_type: string
          created_at: string
          experience_points: number
          id: string
          level: number
          mascot_type: string
          onboarding_completed: boolean
          quest_count: number
          unlocked_categories: Json
          updated_at: string
          username: string
        }
        Insert: {
          avatar_type?: string
          created_at?: string
          experience_points?: number
          id: string
          level?: number
          mascot_type?: string
          onboarding_completed?: boolean
          quest_count?: number
          unlocked_categories?: Json
          updated_at?: string
          username: string
        }
        Update: {
          avatar_type?: string
          created_at?: string
          experience_points?: number
          id?: string
          level?: number
          mascot_type?: string
          onboarding_completed?: boolean
          quest_count?: number
          unlocked_categories?: Json
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

