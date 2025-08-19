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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      apps: {
        Row: {
          allow_pdf_download: boolean
          bonus1_label: string | null
          bonus1_url: string | null
          bonus2_label: string | null
          bonus2_url: string | null
          bonus3_label: string | null
          bonus3_url: string | null
          bonus4_label: string | null
          bonus4_url: string | null
          bonus5_label: string | null
          bonus5_url: string | null
          bonus6_label: string | null
          bonus6_url: string | null
          bonus7_label: string | null
          bonus7_url: string | null
          bonuses_label: string | null
          capa_url: string | null
          cor: string
          created_at: string
          descricao: string | null
          downloads: number | null
          icone_url: string | null
          id: string
          link_personalizado: string | null
          main_product_label: string | null
          nome: string
          produto_principal_url: string | null
          slug: string
          status: string
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          allow_pdf_download?: boolean
          bonus1_label?: string | null
          bonus1_url?: string | null
          bonus2_label?: string | null
          bonus2_url?: string | null
          bonus3_label?: string | null
          bonus3_url?: string | null
          bonus4_label?: string | null
          bonus4_url?: string | null
          bonus5_label?: string | null
          bonus5_url?: string | null
          bonus6_label?: string | null
          bonus6_url?: string | null
          bonus7_label?: string | null
          bonus7_url?: string | null
          bonuses_label?: string | null
          capa_url?: string | null
          cor: string
          created_at?: string
          descricao?: string | null
          downloads?: number | null
          icone_url?: string | null
          id?: string
          link_personalizado?: string | null
          main_product_label?: string | null
          nome: string
          produto_principal_url?: string | null
          slug: string
          status?: string
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          allow_pdf_download?: boolean
          bonus1_label?: string | null
          bonus1_url?: string | null
          bonus2_label?: string | null
          bonus2_url?: string | null
          bonus3_label?: string | null
          bonus3_url?: string | null
          bonus4_label?: string | null
          bonus4_url?: string | null
          bonus5_label?: string | null
          bonus5_url?: string | null
          bonus6_label?: string | null
          bonus6_url?: string | null
          bonus7_label?: string | null
          bonus7_url?: string | null
          bonuses_label?: string | null
          capa_url?: string | null
          cor?: string
          created_at?: string
          descricao?: string | null
          downloads?: number | null
          icone_url?: string | null
          id?: string
          link_personalizado?: string | null
          main_product_label?: string | null
          nome?: string
          produto_principal_url?: string | null
          slug?: string
          status?: string
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      draft_apps: {
        Row: {
          allow_pdf_download: boolean
          bonus1_label: string | null
          bonus1_url: string | null
          bonus2_label: string | null
          bonus2_url: string | null
          bonus3_label: string | null
          bonus3_url: string | null
          bonus4_label: string | null
          bonus4_url: string | null
          bonus5_label: string | null
          bonus5_url: string | null
          bonus6_label: string | null
          bonus6_url: string | null
          bonus7_label: string | null
          bonus7_url: string | null
          bonuses_label: string | null
          capa_url: string | null
          cor: string
          created_at: string
          descricao: string | null
          icone_url: string | null
          id: string
          link_personalizado: string | null
          main_product_label: string | null
          nome: string
          produto_principal_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_pdf_download?: boolean
          bonus1_label?: string | null
          bonus1_url?: string | null
          bonus2_label?: string | null
          bonus2_url?: string | null
          bonus3_label?: string | null
          bonus3_url?: string | null
          bonus4_label?: string | null
          bonus4_url?: string | null
          bonus5_label?: string | null
          bonus5_url?: string | null
          bonus6_label?: string | null
          bonus6_url?: string | null
          bonus7_label?: string | null
          bonus7_url?: string | null
          bonuses_label?: string | null
          capa_url?: string | null
          cor?: string
          created_at?: string
          descricao?: string | null
          icone_url?: string | null
          id?: string
          link_personalizado?: string | null
          main_product_label?: string | null
          nome?: string
          produto_principal_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_pdf_download?: boolean
          bonus1_label?: string | null
          bonus1_url?: string | null
          bonus2_label?: string | null
          bonus2_url?: string | null
          bonus3_label?: string | null
          bonus3_url?: string | null
          bonus4_label?: string | null
          bonus4_url?: string | null
          bonus5_label?: string | null
          bonus5_url?: string | null
          bonus6_label?: string | null
          bonus6_url?: string | null
          bonus7_label?: string | null
          bonus7_url?: string | null
          bonuses_label?: string | null
          capa_url?: string | null
          cor?: string
          created_at?: string
          descricao?: string | null
          icone_url?: string | null
          id?: string
          link_personalizado?: string | null
          main_product_label?: string | null
          nome?: string
          produto_principal_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          app_limit: number
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          app_limit: number
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          app_limit?: number
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_status: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_renewal_date: string | null
          phone: string | null
          plan_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_renewal_date?: string | null
          phone?: string | null
          plan_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_renewal_date?: string | null
          phone?: string | null
          plan_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_status_profiles"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_status_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_app: {
        Args: { app_id: string }
        Returns: undefined
      }
      admin_delete_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      admin_delete_user_complete: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      generate_unique_slug: {
        Args: { app_name: string; base_slug: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
