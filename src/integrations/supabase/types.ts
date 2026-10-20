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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      bot_admins: {
        Row: {
          created_at: string
          tg_id: number
        }
        Insert: {
          created_at?: string
          tg_id: number
        }
        Update: {
          created_at?: string
          tg_id?: number
        }
        Relationships: []
      }
      bot_sessions: {
        Row: {
          draft: Json
          step: string | null
          tg_id: number
          updated_at: string
        }
        Insert: {
          draft?: Json
          step?: string | null
          tg_id: number
          updated_at?: string
        }
        Update: {
          draft?: Json
          step?: string | null
          tg_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      daily_posts: {
        Row: {
          caption: string | null
          created_at: string
          error: string | null
          image_url: string | null
          post_date: string
          status: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          error?: string | null
          image_url?: string | null
          post_date: string
          status?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          error?: string | null
          image_url?: string | null
          post_date?: string
          status?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          balance: number
          created_at: string
          first_name: string
          gram_balance: number
          is_blocked: boolean
          mining_started_at: string | null
          photo_url: string | null
          referred_by: number | null
          tg_id: number
          updated_at: string
          username: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          first_name?: string
          gram_balance?: number
          is_blocked?: boolean
          mining_started_at?: string | null
          photo_url?: string | null
          referred_by?: number | null
          tg_id: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          first_name?: string
          gram_balance?: number
          is_blocked?: boolean
          mining_started_at?: string | null
          photo_url?: string | null
          referred_by?: number | null
          tg_id?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      task_completions: {
        Row: {
          created_at: string
          task_id: string
          tg_id: number
        }
        Insert: {
          created_at?: string
          task_id: string
          tg_id: number
        }
        Update: {
          created_at?: string
          task_id?: string
          tg_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_completions_tg_id_fkey"
            columns: ["tg_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["tg_id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          link: string
          reward: number
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          link: string
          reward?: number
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          link?: string
          reward?: number
          title?: string
        }
        Relationships: []
      }
      user_nfts: {
        Row: {
          created_at: string
          nft_id: string
          tg_id: number
        }
        Insert: {
          created_at?: string
          nft_id: string
          tg_id: number
        }
        Update: {
          created_at?: string
          nft_id?: string
          tg_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_nfts_tg_id_fkey"
            columns: ["tg_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["tg_id"]
          },
        ]
      }
      wallet_requests: {
        Row: {
          address: string | null
          amount: number
          created_at: string
          id: string
          kind: string
          memo: string | null
          status: string
          tg_id: number
          tx_ref: string | null
        }
        Insert: {
          address?: string | null
          amount: number
          created_at?: string
          id?: string
          kind: string
          memo?: string | null
          status?: string
          tg_id: number
          tx_ref?: string | null
        }
        Update: {
          address?: string | null
          amount?: number
          created_at?: string
          id?: string
          kind?: string
          memo?: string | null
          status?: string
          tg_id?: number
          tx_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_requests_tg_id_fkey"
            columns: ["tg_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["tg_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_balance: { Args: { _delta: number; _tg_id: number }; Returns: number }
      add_gram: { Args: { _delta: number; _tg_id: number }; Returns: number }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
