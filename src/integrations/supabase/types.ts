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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          app_id: string
          appointment_date: string
          appointment_time: string
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          service_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          app_id: string
          appointment_date: string
          appointment_time: string
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          service_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          app_id?: string
          appointment_date?: string
          appointment_time?: string
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          service_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      apps: {
        Row: {
          allow_pdf_download: boolean | null
          api_token: string | null
          app_theme: string | null
          bonus1_label: string | null
          bonus1_url: string | null
          bonus10_label: string | null
          bonus10_url: string | null
          bonus11_label: string | null
          bonus11_url: string | null
          bonus12_label: string | null
          bonus12_url: string | null
          bonus13_label: string | null
          bonus13_url: string | null
          bonus14_label: string | null
          bonus14_url: string | null
          bonus15_label: string | null
          bonus15_url: string | null
          bonus16_label: string | null
          bonus16_url: string | null
          bonus17_label: string | null
          bonus17_url: string | null
          bonus18_label: string | null
          bonus18_url: string | null
          bonus19_label: string | null
          bonus19_url: string | null
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
          bonus8_label: string | null
          bonus8_url: string | null
          bonus9_label: string | null
          bonus9_url: string | null
          bonuses_label: string | null
          capa_url: string | null
          cor: string | null
          created_at: string
          descricao: string | null
          downloads: number
          icone_url: string | null
          id: string
          link_personalizado: string | null
          main_product_description: string | null
          main_product_label: string | null
          nome: string
          notification_button_color: string | null
          notification_enabled: boolean | null
          notification_icon: string | null
          notification_image: string | null
          notification_link: string | null
          notification_message: string | null
          notification_text: string | null
          notification_title: string | null
          produto_principal_url: string | null
          require_login: boolean | null
          slug: string
          status: string
          template: string | null
          theme_config: Json | null
          updated_at: string
          user_id: string
          video_course_enabled: boolean | null
          video_modules: Json | null
          view_button_label: string | null
          views: number
          whatsapp_button_color: string | null
          whatsapp_button_text: string | null
          whatsapp_enabled: boolean | null
          whatsapp_icon_size: string | null
          whatsapp_message: string | null
          whatsapp_phone: string | null
          whatsapp_position: string | null
          whatsapp_show_text: boolean | null
        }
        Insert: {
          allow_pdf_download?: boolean | null
          api_token?: string | null
          app_theme?: string | null
          bonus1_label?: string | null
          bonus1_url?: string | null
          bonus10_label?: string | null
          bonus10_url?: string | null
          bonus11_label?: string | null
          bonus11_url?: string | null
          bonus12_label?: string | null
          bonus12_url?: string | null
          bonus13_label?: string | null
          bonus13_url?: string | null
          bonus14_label?: string | null
          bonus14_url?: string | null
          bonus15_label?: string | null
          bonus15_url?: string | null
          bonus16_label?: string | null
          bonus16_url?: string | null
          bonus17_label?: string | null
          bonus17_url?: string | null
          bonus18_label?: string | null
          bonus18_url?: string | null
          bonus19_label?: string | null
          bonus19_url?: string | null
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
          bonus8_label?: string | null
          bonus8_url?: string | null
          bonus9_label?: string | null
          bonus9_url?: string | null
          bonuses_label?: string | null
          capa_url?: string | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          downloads?: number
          icone_url?: string | null
          id?: string
          link_personalizado?: string | null
          main_product_description?: string | null
          main_product_label?: string | null
          nome: string
          notification_button_color?: string | null
          notification_enabled?: boolean | null
          notification_icon?: string | null
          notification_image?: string | null
          notification_link?: string | null
          notification_message?: string | null
          notification_text?: string | null
          notification_title?: string | null
          produto_principal_url?: string | null
          require_login?: boolean | null
          slug: string
          status?: string
          template?: string | null
          theme_config?: Json | null
          updated_at?: string
          user_id: string
          video_course_enabled?: boolean | null
          video_modules?: Json | null
          view_button_label?: string | null
          views?: number
          whatsapp_button_color?: string | null
          whatsapp_button_text?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_icon_size?: string | null
          whatsapp_message?: string | null
          whatsapp_phone?: string | null
          whatsapp_position?: string | null
          whatsapp_show_text?: boolean | null
        }
        Update: {
          allow_pdf_download?: boolean | null
          api_token?: string | null
          app_theme?: string | null
          bonus1_label?: string | null
          bonus1_url?: string | null
          bonus10_label?: string | null
          bonus10_url?: string | null
          bonus11_label?: string | null
          bonus11_url?: string | null
          bonus12_label?: string | null
          bonus12_url?: string | null
          bonus13_label?: string | null
          bonus13_url?: string | null
          bonus14_label?: string | null
          bonus14_url?: string | null
          bonus15_label?: string | null
          bonus15_url?: string | null
          bonus16_label?: string | null
          bonus16_url?: string | null
          bonus17_label?: string | null
          bonus17_url?: string | null
          bonus18_label?: string | null
          bonus18_url?: string | null
          bonus19_label?: string | null
          bonus19_url?: string | null
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
          bonus8_label?: string | null
          bonus8_url?: string | null
          bonus9_label?: string | null
          bonus9_url?: string | null
          bonuses_label?: string | null
          capa_url?: string | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          downloads?: number
          icone_url?: string | null
          id?: string
          link_personalizado?: string | null
          main_product_description?: string | null
          main_product_label?: string | null
          nome?: string
          notification_button_color?: string | null
          notification_enabled?: boolean | null
          notification_icon?: string | null
          notification_image?: string | null
          notification_link?: string | null
          notification_message?: string | null
          notification_text?: string | null
          notification_title?: string | null
          produto_principal_url?: string | null
          require_login?: boolean | null
          slug?: string
          status?: string
          template?: string | null
          theme_config?: Json | null
          updated_at?: string
          user_id?: string
          video_course_enabled?: boolean | null
          video_modules?: Json | null
          view_button_label?: string | null
          views?: number
          whatsapp_button_color?: string | null
          whatsapp_button_text?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_icon_size?: string | null
          whatsapp_message?: string | null
          whatsapp_phone?: string | null
          whatsapp_position?: string | null
          whatsapp_show_text?: boolean | null
        }
        Relationships: []
      }
      cancellation_feedback: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          reason: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          reason: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          reason?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      custom_domains: {
        Row: {
          app_id: string | null
          app_link: string
          created_at: string | null
          dns_verified: boolean | null
          dns_verified_at: string | null
          domain: string
          favicon_url: string | null
          id: string
          is_verified: boolean | null
          last_dns_check: string | null
          nameservers: Json | null
          provider: string | null
          ssl_expires_at: string | null
          ssl_issued_at: string | null
          ssl_status: string | null
          status: string
          updated_at: string | null
          user_id: string | null
          verification_code: string
        }
        Insert: {
          app_id?: string | null
          app_link?: string
          created_at?: string | null
          dns_verified?: boolean | null
          dns_verified_at?: string | null
          domain: string
          favicon_url?: string | null
          id?: string
          is_verified?: boolean | null
          last_dns_check?: string | null
          nameservers?: Json | null
          provider?: string | null
          ssl_expires_at?: string | null
          ssl_issued_at?: string | null
          ssl_status?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          verification_code?: string
        }
        Update: {
          app_id?: string | null
          app_link?: string
          created_at?: string | null
          dns_verified?: boolean | null
          dns_verified_at?: string | null
          domain?: string
          favicon_url?: string | null
          id?: string
          is_verified?: boolean | null
          last_dns_check?: string | null
          nameservers?: Json | null
          provider?: string | null
          ssl_expires_at?: string | null
          ssl_issued_at?: string | null
          ssl_status?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_scripts: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          routes: string[]
          script_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          routes?: string[]
          script_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          routes?: string[]
          script_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      domain_app_mappings: {
        Row: {
          app_id: string
          app_link: string
          created_at: string | null
          custom_domain_id: string
          id: string
          path: string
          updated_at: string | null
        }
        Insert: {
          app_id: string
          app_link: string
          created_at?: string | null
          custom_domain_id: string
          id?: string
          path?: string
          updated_at?: string | null
        }
        Update: {
          app_id?: string
          app_link?: string
          created_at?: string | null
          custom_domain_id?: string
          id?: string
          path?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_app_mappings_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domain_app_mappings_custom_domain_id_fkey"
            columns: ["custom_domain_id"]
            isOneToOne: false
            referencedRelation: "custom_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      email_confirmation_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          link: string | null
          message: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          link?: string | null
          message: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          link?: string | null
          message?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_bump_access_codes: {
        Row: {
          access_code: string
          buyer_email: string
          created_at: string
          id: string
          is_used: boolean
          order_bump_id: string
          purchase_id: string | null
          used_at: string | null
        }
        Insert: {
          access_code: string
          buyer_email: string
          created_at?: string
          id?: string
          is_used?: boolean
          order_bump_id: string
          purchase_id?: string | null
          used_at?: string | null
        }
        Update: {
          access_code?: string
          buyer_email?: string
          created_at?: string
          id?: string
          is_used?: boolean
          order_bump_id?: string
          purchase_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_bump_access_codes_order_bump_id_fkey"
            columns: ["order_bump_id"]
            isOneToOne: false
            referencedRelation: "order_bumps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_bump_access_codes_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      order_bumps: {
        Row: {
          account_id: string | null
          affiliate_mode: boolean
          allow_pdf_download: boolean | null
          api_token: string | null
          app_id: string
          app_link: string | null
          app_theme: string | null
          basic_token: string | null
          bonus1_label: string | null
          bonus1_thumbnail: string | null
          bonus1_url: string | null
          bonus2_label: string | null
          bonus2_thumbnail: string | null
          bonus2_url: string | null
          bonus3_label: string | null
          bonus3_thumbnail: string | null
          bonus3_url: string | null
          bonus4_label: string | null
          bonus4_thumbnail: string | null
          bonus4_url: string | null
          bonus5_label: string | null
          bonus5_thumbnail: string | null
          bonus5_url: string | null
          bonus6_label: string | null
          bonus6_thumbnail: string | null
          bonus6_url: string | null
          bonus7_label: string | null
          bonus7_thumbnail: string | null
          bonus7_url: string | null
          bonus8_label: string | null
          bonus8_thumbnail: string | null
          bonus8_url: string | null
          bonus9_label: string | null
          bonus9_thumbnail: string | null
          bonus9_url: string | null
          bonuses_label: string | null
          bullet1: string | null
          bullet2: string | null
          bullet3: string | null
          capa_url: string | null
          client_id: string | null
          client_secret: string | null
          content_type: string | null
          content_url: string
          cor: string | null
          created_at: string
          default_language: string | null
          description: string | null
          display_order: number
          hottok: string | null
          icone_url: string | null
          id: string
          is_active: boolean
          label: string
          main_product_description: string | null
          main_product_label: string | null
          main_product_thumbnail: string | null
          nome: string | null
          postback_key: string | null
          premium_card_description: string | null
          premium_card_title: string | null
          premium_image_url: string | null
          product_id: string
          produto_principal_url: string | null
          provider: string
          purchase_link: string | null
          store_slug: string | null
          stripe_api_key: string | null
          template: string | null
          theme_config: Json | null
          unlock_button_color: string | null
          updated_at: string
          view_button_label: string | null
          webhook_token: string | null
          yampi_secret_key: string | null
        }
        Insert: {
          account_id?: string | null
          affiliate_mode?: boolean
          allow_pdf_download?: boolean | null
          api_token?: string | null
          app_id: string
          app_link?: string | null
          app_theme?: string | null
          basic_token?: string | null
          bonus1_label?: string | null
          bonus1_thumbnail?: string | null
          bonus1_url?: string | null
          bonus2_label?: string | null
          bonus2_thumbnail?: string | null
          bonus2_url?: string | null
          bonus3_label?: string | null
          bonus3_thumbnail?: string | null
          bonus3_url?: string | null
          bonus4_label?: string | null
          bonus4_thumbnail?: string | null
          bonus4_url?: string | null
          bonus5_label?: string | null
          bonus5_thumbnail?: string | null
          bonus5_url?: string | null
          bonus6_label?: string | null
          bonus6_thumbnail?: string | null
          bonus6_url?: string | null
          bonus7_label?: string | null
          bonus7_thumbnail?: string | null
          bonus7_url?: string | null
          bonus8_label?: string | null
          bonus8_thumbnail?: string | null
          bonus8_url?: string | null
          bonus9_label?: string | null
          bonus9_thumbnail?: string | null
          bonus9_url?: string | null
          bonuses_label?: string | null
          bullet1?: string | null
          bullet2?: string | null
          bullet3?: string | null
          capa_url?: string | null
          client_id?: string | null
          client_secret?: string | null
          content_type?: string | null
          content_url: string
          cor?: string | null
          created_at?: string
          default_language?: string | null
          description?: string | null
          display_order?: number
          hottok?: string | null
          icone_url?: string | null
          id?: string
          is_active?: boolean
          label: string
          main_product_description?: string | null
          main_product_label?: string | null
          main_product_thumbnail?: string | null
          nome?: string | null
          postback_key?: string | null
          premium_card_description?: string | null
          premium_card_title?: string | null
          premium_image_url?: string | null
          product_id: string
          produto_principal_url?: string | null
          provider: string
          purchase_link?: string | null
          store_slug?: string | null
          stripe_api_key?: string | null
          template?: string | null
          theme_config?: Json | null
          unlock_button_color?: string | null
          updated_at?: string
          view_button_label?: string | null
          webhook_token?: string | null
          yampi_secret_key?: string | null
        }
        Update: {
          account_id?: string | null
          affiliate_mode?: boolean
          allow_pdf_download?: boolean | null
          api_token?: string | null
          app_id?: string
          app_link?: string | null
          app_theme?: string | null
          basic_token?: string | null
          bonus1_label?: string | null
          bonus1_thumbnail?: string | null
          bonus1_url?: string | null
          bonus2_label?: string | null
          bonus2_thumbnail?: string | null
          bonus2_url?: string | null
          bonus3_label?: string | null
          bonus3_thumbnail?: string | null
          bonus3_url?: string | null
          bonus4_label?: string | null
          bonus4_thumbnail?: string | null
          bonus4_url?: string | null
          bonus5_label?: string | null
          bonus5_thumbnail?: string | null
          bonus5_url?: string | null
          bonus6_label?: string | null
          bonus6_thumbnail?: string | null
          bonus6_url?: string | null
          bonus7_label?: string | null
          bonus7_thumbnail?: string | null
          bonus7_url?: string | null
          bonus8_label?: string | null
          bonus8_thumbnail?: string | null
          bonus8_url?: string | null
          bonus9_label?: string | null
          bonus9_thumbnail?: string | null
          bonus9_url?: string | null
          bonuses_label?: string | null
          bullet1?: string | null
          bullet2?: string | null
          bullet3?: string | null
          capa_url?: string | null
          client_id?: string | null
          client_secret?: string | null
          content_type?: string | null
          content_url?: string
          cor?: string | null
          created_at?: string
          default_language?: string | null
          description?: string | null
          display_order?: number
          hottok?: string | null
          icone_url?: string | null
          id?: string
          is_active?: boolean
          label?: string
          main_product_description?: string | null
          main_product_label?: string | null
          main_product_thumbnail?: string | null
          nome?: string | null
          postback_key?: string | null
          premium_card_description?: string | null
          premium_card_title?: string | null
          premium_image_url?: string | null
          product_id?: string
          produto_principal_url?: string | null
          provider?: string
          purchase_link?: string | null
          store_slug?: string | null
          stripe_api_key?: string | null
          template?: string | null
          theme_config?: Json | null
          unlock_button_color?: string | null
          updated_at?: string
          view_button_label?: string | null
          webhook_token?: string | null
          yampi_secret_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_bumps_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      page_configurations: {
        Row: {
          created_at: string | null
          id: string
          page_name: string
          styles: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_name: string
          styles?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          page_name?: string
          styles?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      pending_users: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          full_name: string | null
          id: string
          phone: string | null
          plan_id: string | null
          plan_name: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          plan_id?: string | null
          plan_name?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          plan_id?: string | null
          plan_name?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_users_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          app_limit: number
          created_at: string
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          app_limit?: number
          created_at?: string
          id?: string
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          app_limit?: number
          created_at?: string
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      platform_oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          platform: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: string
          platform: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          platform?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          api_account_id: string | null
          api_token: string | null
          app_id: string | null
          app_link: string
          cakto_api_key: string | null
          cartpanda_bearer_token: string | null
          cartpanda_store_slug: string | null
          created_at: string | null
          default_language: string | null
          hottok: string | null
          id: string
          paypal_client_id: string | null
          paypal_secret: string | null
          postback_key: string | null
          product_id: string
          provider: string
          stripe_api_key: string | null
          updated_at: string | null
          user_id: string
          webhook_token: string | null
        }
        Insert: {
          api_account_id?: string | null
          api_token?: string | null
          app_id?: string | null
          app_link: string
          cakto_api_key?: string | null
          cartpanda_bearer_token?: string | null
          cartpanda_store_slug?: string | null
          created_at?: string | null
          default_language?: string | null
          hottok?: string | null
          id?: string
          paypal_client_id?: string | null
          paypal_secret?: string | null
          postback_key?: string | null
          product_id: string
          provider: string
          stripe_api_key?: string | null
          updated_at?: string | null
          user_id: string
          webhook_token?: string | null
        }
        Update: {
          api_account_id?: string | null
          api_token?: string | null
          app_id?: string | null
          app_link?: string
          cakto_api_key?: string | null
          cartpanda_bearer_token?: string | null
          cartpanda_store_slug?: string | null
          created_at?: string | null
          default_language?: string | null
          hottok?: string | null
          id?: string
          paypal_client_id?: string | null
          paypal_secret?: string | null
          postback_key?: string | null
          product_id?: string
          provider?: string
          stripe_api_key?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          app_id: string | null
          buyer_email: string
          buyer_language: string | null
          buyer_name: string
          created_at: string | null
          id: string
          price: number | null
          product_id: string
          provider: string
          status: string | null
          transaction_id: string
        }
        Insert: {
          app_id?: string | null
          buyer_email: string
          buyer_language?: string | null
          buyer_name: string
          created_at?: string | null
          id?: string
          price?: number | null
          product_id: string
          provider: string
          status?: string | null
          transaction_id: string
        }
        Update: {
          app_id?: string | null
          buyer_email?: string
          buyer_language?: string | null
          buyer_name?: string
          created_at?: string | null
          id?: string
          price?: number | null
          product_id?: string
          provider?: string
          status?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      social_proof_notifications: {
        Row: {
          action: string
          action_type: string | null
          avatar_url: string | null
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          plan_name: string | null
          updated_at: string
        }
        Insert: {
          action: string
          action_type?: string | null
          avatar_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          plan_name?: string | null
          updated_at?: string
        }
        Update: {
          action?: string
          action_type?: string | null
          avatar_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          plan_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_proof_settings: {
        Row: {
          created_at: string
          display_duration_seconds: number
          enable_pause: boolean | null
          id: string
          interval_seconds: number
          is_enabled: boolean
          max_display_seconds: number | null
          max_interval_seconds: number | null
          min_display_seconds: number | null
          min_interval_seconds: number | null
          notifications_before_pause: number | null
          pause_duration_seconds: number | null
          position: string
          randomize_order: boolean | null
          routes: string[]
          show_time_ago: boolean | null
          show_verified_badge: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_duration_seconds?: number
          enable_pause?: boolean | null
          id?: string
          interval_seconds?: number
          is_enabled?: boolean
          max_display_seconds?: number | null
          max_interval_seconds?: number | null
          min_display_seconds?: number | null
          min_interval_seconds?: number | null
          notifications_before_pause?: number | null
          pause_duration_seconds?: number | null
          position?: string
          randomize_order?: boolean | null
          routes?: string[]
          show_time_ago?: boolean | null
          show_verified_badge?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_duration_seconds?: number
          enable_pause?: boolean | null
          id?: string
          interval_seconds?: number
          is_enabled?: boolean
          max_display_seconds?: number | null
          max_interval_seconds?: number | null
          min_display_seconds?: number | null
          min_interval_seconds?: number | null
          notifications_before_pause?: number | null
          pause_duration_seconds?: number | null
          position?: string
          randomize_order?: boolean | null
          routes?: string[]
          show_time_ago?: boolean | null
          show_verified_badge?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_history: {
        Row: {
          can_restore: boolean | null
          created_at: string
          event_source: string
          event_type: string
          id: string
          new_plan_id: string | null
          new_plan_name: string | null
          new_status: string | null
          previous_plan_id: string | null
          previous_plan_name: string | null
          previous_status: string | null
          raw_data: Json | null
          restore_reason: string | null
          restored_at: string | null
          restored_by: string | null
          stripe_customer_id: string | null
          stripe_event_id: string | null
          stripe_subscription_id: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          can_restore?: boolean | null
          created_at?: string
          event_source: string
          event_type: string
          id?: string
          new_plan_id?: string | null
          new_plan_name?: string | null
          new_status?: string | null
          previous_plan_id?: string | null
          previous_plan_name?: string | null
          previous_status?: string | null
          raw_data?: Json | null
          restore_reason?: string | null
          restored_at?: string | null
          restored_by?: string | null
          stripe_customer_id?: string | null
          stripe_event_id?: string | null
          stripe_subscription_id?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          can_restore?: boolean | null
          created_at?: string
          event_source?: string
          event_type?: string
          id?: string
          new_plan_id?: string | null
          new_plan_name?: string | null
          new_status?: string | null
          previous_plan_id?: string | null
          previous_plan_name?: string | null
          previous_status?: string | null
          raw_data?: Json | null
          restore_reason?: string | null
          restored_at?: string | null
          restored_by?: string | null
          stripe_customer_id?: string | null
          stripe_event_id?: string | null
          stripe_subscription_id?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      tutorial_videos: {
        Row: {
          category: string
          created_at: string
          description: string | null
          description_en: string | null
          description_es: string | null
          id: string
          is_active: boolean
          section: string | null
          section_en: string | null
          section_es: string | null
          slug: string
          title: string
          title_en: string | null
          title_es: string | null
          updated_at: string
          video_url: string
          video_url_en: string | null
          video_url_es: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          id?: string
          is_active?: boolean
          section?: string | null
          section_en?: string | null
          section_es?: string | null
          slug: string
          title: string
          title_en?: string | null
          title_es?: string | null
          updated_at?: string
          video_url: string
          video_url_en?: string | null
          video_url_es?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          id?: string
          is_active?: boolean
          section?: string | null
          section_en?: string | null
          section_es?: string | null
          slug?: string
          title?: string
          title_en?: string | null
          title_es?: string | null
          updated_at?: string
          video_url?: string
          video_url_en?: string | null
          video_url_es?: string | null
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          config: Json
          created_at: string
          id: string
          integration_type: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          config: Json
          created_at?: string
          id?: string
          integration_type: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          integration_type?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_reads: {
        Row: {
          id: string
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_status: {
        Row: {
          bypass_stripe_check: boolean | null
          created_at: string
          id: string
          is_active: boolean
          last_renewal_date: string | null
          payment_method: string | null
          plan_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bypass_stripe_check?: boolean | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_renewal_date?: string | null
          payment_method?: string | null
          plan_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bypass_stripe_check?: boolean | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_renewal_date?: string | null
          payment_method?: string | null
          plan_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_status_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          is_used: boolean
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          is_used?: boolean
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_assign_role: {
        Args: { role_name: string; target_user_id: string }
        Returns: boolean
      }
      admin_delete_app: { Args: { app_id: string }; Returns: boolean }
      admin_delete_user_complete: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      admin_generate_order_bump_code: {
        Args: { p_buyer_email?: string; p_order_bump_id: string }
        Returns: string
      }
      delete_own_account: { Args: never; Returns: boolean }
      delete_user_integration: {
        Args: { p_integration_type: string }
        Returns: boolean
      }
      fetch_public_app: {
        Args: { app_slug: string }
        Returns: {
          allow_pdf_download: boolean
          bonus1_label: string
          bonus1_url: string
          bonus10_label: string
          bonus10_url: string
          bonus11_label: string
          bonus11_url: string
          bonus12_label: string
          bonus12_url: string
          bonus13_label: string
          bonus13_url: string
          bonus14_label: string
          bonus14_url: string
          bonus15_label: string
          bonus15_url: string
          bonus16_label: string
          bonus16_url: string
          bonus17_label: string
          bonus17_url: string
          bonus18_label: string
          bonus18_url: string
          bonus19_label: string
          bonus19_url: string
          bonus2_label: string
          bonus2_url: string
          bonus3_label: string
          bonus3_url: string
          bonus4_label: string
          bonus4_url: string
          bonus5_label: string
          bonus5_url: string
          bonus6_label: string
          bonus6_url: string
          bonus7_label: string
          bonus7_url: string
          bonus8_label: string
          bonus8_url: string
          bonus9_label: string
          bonus9_url: string
          bonuses_label: string
          capa_url: string
          cor: string
          created_at: string
          descricao: string
          downloads: number
          icone_url: string
          id: string
          link_personalizado: string
          main_product_description: string
          main_product_label: string
          nome: string
          produto_principal_url: string
          slug: string
          template: string
          theme_config: Json
          updated_at: string
          views: number
        }[]
      }
      generate_access_code: { Args: never; Returns: string }
      generate_unique_slug: { Args: { base_name: string }; Returns: string }
      get_integration_config: {
        Args: { p_integration_type: string }
        Returns: Json
      }
      get_pending_user_by_token: {
        Args: { p_token: string }
        Returns: {
          email: string
          expires_at: string
          plan_name: string
          used_at: string
        }[]
      }
      get_public_order_bumps: {
        Args: { p_app_id: string }
        Returns: {
          affiliate_mode: boolean
          bullet1: string
          bullet2: string
          bullet3: string
          content_type: string
          content_url: string
          description: string
          id: string
          label: string
          premium_card_description: string
          premium_card_title: string
          premium_image_url: string
          purchase_link: string
          unlock_button_color: string
        }[]
      }
      get_published_app: {
        Args: { app_slug: string }
        Returns: {
          allow_pdf_download: boolean
          bonus1_label: string
          bonus1_url: string
          bonus10_label: string
          bonus10_url: string
          bonus11_label: string
          bonus11_url: string
          bonus12_label: string
          bonus12_url: string
          bonus13_label: string
          bonus13_url: string
          bonus14_label: string
          bonus14_url: string
          bonus15_label: string
          bonus15_url: string
          bonus16_label: string
          bonus16_url: string
          bonus17_label: string
          bonus17_url: string
          bonus18_label: string
          bonus18_url: string
          bonus19_label: string
          bonus19_url: string
          bonus2_label: string
          bonus2_url: string
          bonus3_label: string
          bonus3_url: string
          bonus4_label: string
          bonus4_url: string
          bonus5_label: string
          bonus5_url: string
          bonus6_label: string
          bonus6_url: string
          bonus7_label: string
          bonus7_url: string
          bonus8_label: string
          bonus8_url: string
          bonus9_label: string
          bonus9_url: string
          bonuses_label: string
          capa_url: string
          cor: string
          created_at: string
          descricao: string
          downloads: number
          icone_url: string
          id: string
          link_personalizado: string
          main_product_description: string
          main_product_label: string
          nome: string
          produto_principal_url: string
          slug: string
          template: string
          theme_config: Json
          updated_at: string
          views: number
        }[]
      }
      get_users_with_metadata: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          email: string
          id: string
          phone: string
          updated_at: string
        }[]
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      log_admin_action: {
        Args: {
          action_details?: Json
          action_type: string
          target_user: string
        }
        Returns: undefined
      }
      save_user_integration: {
        Args: { p_config: Json; p_integration_type: string }
        Returns: {
          created_at: string
          id: string
          integration_type: string
          is_active: boolean
          updated_at: string
        }[]
      }
      setup_admin_user: { Args: { user_email: string }; Returns: boolean }
      unaccent_text: { Args: { input_text: string }; Returns: string }
      verify_purchase_email: {
        Args: { p_app_id: string; p_email: string }
        Returns: {
          buyer_email: string
          buyer_name: string
          purchase_id: string
        }[]
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
