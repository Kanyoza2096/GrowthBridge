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
  public: {
    Tables: {
      announcements: {
        Row: {
          audience: string
          content: string
          created_at: string
          expires_at: string | null
          id: string
          priority: string
          published_at: string | null
          scheduled_at: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          audience?: string
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          priority?: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          audience?: string
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          priority?: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          applicant_name: string
          assignee_id: string | null
          email: string
          history: Json
          id: string
          message: string | null
          notes: Json
          phone: string | null
          portfolio: string | null
          role: string | null
          skills: Json
          status: string
          subject: string | null
          submitted_at: string
          type: string
          updated_at: string
        }
        Insert: {
          applicant_name: string
          assignee_id?: string | null
          email: string
          history?: Json
          id?: string
          message?: string | null
          notes?: Json
          phone?: string | null
          portfolio?: string | null
          role?: string | null
          skills?: Json
          status?: string
          subject?: string | null
          submitted_at?: string
          type?: string
          updated_at?: string
        }
        Update: {
          applicant_name?: string
          assignee_id?: string | null
          email?: string
          history?: Json
          id?: string
          message?: string | null
          notes?: Json
          phone?: string | null
          portfolio?: string | null
          role?: string | null
          skills?: Json
          status?: string
          subject?: string | null
          submitted_at?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string
          changes: Json | null
          created_at: string
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_name: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name: string
          changes?: Json | null
          created_at?: string
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string
          changes?: Json | null
          created_at?: string
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string
          category: string
          content: string
          cover_image: string | null
          created_at: string
          deleted_at: string | null
          excerpt: string | null
          featured: boolean
          id: string
          published_at: string | null
          read_time: number | null
          scheduled_at: string | null
          slug: string
          status: string
          tags: Json
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string
          category: string
          content: string
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          featured?: boolean
          id?: string
          published_at?: string | null
          read_time?: number | null
          scheduled_at?: string | null
          slug: string
          status?: string
          tags?: Json
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string
          category?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          featured?: boolean
          id?: string
          published_at?: string | null
          read_time?: number | null
          scheduled_at?: string | null
          slug?: string
          status?: string
          tags?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          subject: string
          type: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          subject: string
          type?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string
          type?: string
        }
        Relationships: []
      }
      director_approvals: {
        Row: {
          actor: string
          approved: boolean
          inserted_at: string | null
          task_id: string
          timestamp: string
        }
        Insert: {
          actor: string
          approved: boolean
          inserted_at?: string | null
          task_id: string
          timestamp: string
        }
        Update: {
          actor?: string
          approved?: boolean
          inserted_at?: string | null
          task_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      director_decisions: {
        Row: {
          id: string
          inserted_at: string | null
          payload: Json
          timestamp: string
        }
        Insert: {
          id: string
          inserted_at?: string | null
          payload: Json
          timestamp: string
        }
        Update: {
          id?: string
          inserted_at?: string | null
          payload?: Json
          timestamp?: string
        }
        Relationships: []
      }
      director_learnings: {
        Row: {
          id: string
          inserted_at: string | null
          payload: Json
          timestamp: string
        }
        Insert: {
          id: string
          inserted_at?: string | null
          payload: Json
          timestamp: string
        }
        Update: {
          id?: string
          inserted_at?: string | null
          payload?: Json
          timestamp?: string
        }
        Relationships: []
      }
      director_observations: {
        Row: {
          id: number
          inserted_at: string | null
          payload: Json
          timestamp: string
        }
        Insert: {
          id?: number
          inserted_at?: string | null
          payload: Json
          timestamp: string
        }
        Update: {
          id?: number
          inserted_at?: string | null
          payload?: Json
          timestamp?: string
        }
        Relationships: []
      }
      director_tasks: {
        Row: {
          created_at: string
          id: string
          inserted_at: string | null
          payload: Json
          status: string
        }
        Insert: {
          created_at: string
          id: string
          inserted_at?: string | null
          payload: Json
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          inserted_at?: string | null
          payload?: Json
          status?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          display_order: number
          id: string
          question: string
          status: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          question: string
          status?: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          question?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      impact_stats: {
        Row: {
          active_members: number
          client_satisfaction: number
          communities_served: number
          events_hosted: number
          id: string
          projects_completed: number
          updated_at: string
          youth_empowered: number
        }
        Insert: {
          active_members?: number
          client_satisfaction?: number
          communities_served?: number
          events_hosted?: number
          id?: string
          projects_completed?: number
          updated_at?: string
          youth_empowered?: number
        }
        Update: {
          active_members?: number
          client_satisfaction?: number
          communities_served?: number
          events_hosted?: number
          id?: string
          projects_completed?: number
          updated_at?: string
          youth_empowered?: number
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          folder_id: string | null
          height: number | null
          id: string
          mime_type: string
          name: string
          size_bytes: number
          uploaded_by: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          folder_id?: string | null
          height?: number | null
          id?: string
          mime_type: string
          name: string
          size_bytes: number
          uploaded_by?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          folder_id?: string | null
          height?: number | null
          id?: string
          mime_type?: string
          name?: string
          size_bytes?: number
          uploaded_by?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          address: string | null
          contact_person: string
          created_at: string
          description: string | null
          email: string
          id: string
          industry: string | null
          logo: string | null
          notes: string | null
          organization_name: string
          partnership_end_date: string | null
          partnership_start_date: string | null
          partnership_type: string
          phone: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_person: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          industry?: string | null
          logo?: string | null
          notes?: string | null
          organization_name: string
          partnership_end_date?: string | null
          partnership_start_date?: string | null
          partnership_type?: string
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          industry?: string | null
          logo?: string | null
          notes?: string | null
          organization_name?: string
          partnership_end_date?: string | null
          partnership_start_date?: string | null
          partnership_type?: string
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      partnership_requests: {
        Row: {
          contact_person: string
          created_at: string
          email: string
          id: string
          message: string
          organization_name: string
          partnership_type: string
          phone: string | null
          status: string
        }
        Insert: {
          contact_person: string
          created_at?: string
          email: string
          id?: string
          message: string
          organization_name: string
          partnership_type?: string
          phone?: string | null
          status?: string
        }
        Update: {
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          organization_name?: string
          partnership_type?: string
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          active: boolean
          articles: Json
          bio: string
          category: string
          certifications: Json
          created_at: string
          deleted_at: string | null
          department: string | null
          display_order: number
          email: string | null
          featured: boolean
          full_name: string
          id: string
          joined_at: string | null
          location: string | null
          phone: string | null
          photo: string | null
          projects: Json
          short_bio: string | null
          skills: Json
          slug: string
          social_links: Json
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          articles?: Json
          bio?: string
          category?: string
          certifications?: Json
          created_at?: string
          deleted_at?: string | null
          department?: string | null
          display_order?: number
          email?: string | null
          featured?: boolean
          full_name: string
          id?: string
          joined_at?: string | null
          location?: string | null
          phone?: string | null
          photo?: string | null
          projects?: Json
          short_bio?: string | null
          skills?: Json
          slug: string
          social_links?: Json
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          articles?: Json
          bio?: string
          category?: string
          certifications?: Json
          created_at?: string
          deleted_at?: string | null
          department?: string | null
          display_order?: number
          email?: string | null
          featured?: boolean
          full_name?: string
          id?: string
          joined_at?: string | null
          location?: string | null
          phone?: string | null
          photo?: string | null
          projects?: Json
          short_bio?: string | null
          skills?: Json
          slug?: string
          social_links?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string
          client: string
          completed_at: string | null
          created_at: string
          deleted_at: string | null
          description: string
          featured: boolean
          gallery: Json
          id: string
          image: string | null
          impact: Json | null
          published_at: string | null
          service_division: string | null
          short_description: string | null
          slug: string
          start_date: string | null
          status: string
          technologies: Json
          testimonial: Json | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category: string
          client: string
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description: string
          featured?: boolean
          gallery?: Json
          id?: string
          image?: string | null
          impact?: Json | null
          published_at?: string | null
          service_division?: string | null
          short_description?: string | null
          slug: string
          start_date?: string | null
          status?: string
          technologies?: Json
          testimonial?: Json | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string
          client?: string
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          featured?: boolean
          gallery?: Json
          id?: string
          image?: string | null
          impact?: Json | null
          published_at?: string | null
          service_division?: string | null
          short_description?: string | null
          slug?: string
          start_date?: string | null
          status?: string
          technologies?: Json
          testimonial?: Json | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          benefits: Json
          color: string | null
          created_at: string
          deleted_at: string | null
          description: string
          display_order: number
          division: string
          features: Json
          icon: string | null
          id: string
          image: string | null
          process: Json
          published_at: string | null
          seo_description: string | null
          seo_keywords: Json
          seo_title: string | null
          slug: string
          status: string
          tagline: string | null
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: Json
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          description: string
          display_order?: number
          division: string
          features?: Json
          icon?: string | null
          id?: string
          image?: string | null
          process?: Json
          published_at?: string | null
          seo_description?: string | null
          seo_keywords?: Json
          seo_title?: string | null
          slug: string
          status?: string
          tagline?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: Json
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          display_order?: number
          division?: string
          features?: Json
          icon?: string | null
          id?: string
          image?: string | null
          process?: Json
          published_at?: string | null
          seo_description?: string | null
          seo_keywords?: Json
          seo_title?: string | null
          slug?: string
          status?: string
          tagline?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_profiles: {
        Row: {
          availability: string
          avatar: string | null
          bio: string | null
          categories: Json
          created_at: string
          email: string
          experience: number | null
          experience_level: string | null
          full_name: string
          id: string
          phone: string | null
          portfolio: string | null
          resume_url: string | null
          skills: Json
          updated_at: string
          verification_status: string
        }
        Insert: {
          availability?: string
          avatar?: string | null
          bio?: string | null
          categories?: Json
          created_at?: string
          email: string
          experience?: number | null
          experience_level?: string | null
          full_name: string
          id?: string
          phone?: string | null
          portfolio?: string | null
          resume_url?: string | null
          skills?: Json
          updated_at?: string
          verification_status?: string
        }
        Update: {
          availability?: string
          avatar?: string | null
          bio?: string | null
          categories?: Json
          created_at?: string
          email?: string
          experience?: number | null
          experience_level?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          portfolio?: string | null
          resume_url?: string | null
          skills?: Json
          updated_at?: string
          verification_status?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_avatar: string | null
          author_name: string
          author_organization: string | null
          author_role: string | null
          created_at: string
          featured: boolean
          id: string
          project_id: string | null
          quote: string
          rating: number
          service_id: string | null
          status: string
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          author_organization?: string | null
          author_role?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          project_id?: string | null
          quote: string
          rating?: number
          service_id?: string | null
          status?: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          author_organization?: string | null
          author_role?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          project_id?: string | null
          quote?: string
          rating?: number
          service_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: { id: string; recipient_id: string; type: string; title: string; message: string; link: string | null; read: boolean; created_at: string }
        Insert: { id?: string; recipient_id: string; type: string; title: string; message: string; link?: string | null; read?: boolean; created_at?: string }
        Update: { id?: string; recipient_id?: string; type?: string; title?: string; message?: string; link?: string | null; read?: boolean; created_at?: string }
        Relationships: [{ foreignKeyName: "admin_notifications_recipient_id_fkey"; columns: ["recipient_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      kdo_website_event_outbox: {
        Row: { id: string; integration_id: string; event_id: string; event_type: string; event_version: string; occurred_at: string; payload: Json; status: string; attempt_count: number; next_attempt_at: string; locked_until: string | null; last_error: string | null; created_at: string; delivered_at: string | null }
        Insert: { id?: string; integration_id: string; event_id: string; event_type: string; event_version?: string; occurred_at: string; payload?: Json; status?: string; attempt_count?: number; next_attempt_at?: string; locked_until?: string | null; last_error?: string | null; created_at?: string; delivered_at?: string | null }
        Update: { id?: string; integration_id?: string; event_id?: string; event_type?: string; event_version?: string; occurred_at?: string; payload?: Json; status?: string; attempt_count?: number; next_attempt_at?: string; locked_until?: string | null; last_error?: string | null; created_at?: string; delivered_at?: string | null }
        Relationships: []
      }
      kdo_content_idempotency: {
        Row: { idempotency_key: string; workspace_id: string; request_sha256: string; response_json: Json | null; created_at: string; updated_at: string }
        Insert: { idempotency_key: string; workspace_id: string; request_sha256: string; response_json?: Json | null; created_at?: string; updated_at?: string }
        Update: { idempotency_key?: string; workspace_id?: string; request_sha256?: string; response_json?: Json | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
    }
    Views: {
      public_people: {
        Row: {
          active: boolean | null
          articles: Json | null
          bio: string | null
          category: string | null
          certifications: Json | null
          created_at: string | null
          department: string | null
          display_order: number | null
          featured: boolean | null
          full_name: string | null
          id: string | null
          joined_at: string | null
          location: string | null
          photo: string | null
          projects: Json | null
          short_bio: string | null
          skills: Json | null
          slug: string | null
          social_links: Json | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          articles?: Json | null
          bio?: string | null
          category?: string | null
          certifications?: Json | null
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          featured?: boolean | null
          full_name?: string | null
          id?: string | null
          joined_at?: string | null
          location?: string | null
          photo?: string | null
          projects?: Json | null
          short_bio?: string | null
          skills?: Json | null
          slug?: string | null
          social_links?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          articles?: Json | null
          bio?: string | null
          category?: string | null
          certifications?: Json | null
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          featured?: boolean | null
          full_name?: string | null
          id?: string | null
          joined_at?: string | null
          location?: string | null
          photo?: string | null
          projects?: Json | null
          short_bio?: string | null
          skills?: Json | null
          slug?: string | null
          social_links?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_admin_permission: {
        Args: { p_action: string; p_resource: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      purge_soft_deleted: {
        Args: { retention_days?: number }
        Returns: {
          rows_deleted: number
          table_name: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      soft_delete_record: {
        Args: { record_id: string; table_name: string }
        Returns: undefined
      }
      unaccent: { Args: { "": string }; Returns: string }
      claim_kdo_website_event_outbox: { Args: { p_limit?: number; p_lease_seconds?: number }; Returns: Database["public"]["Tables"]["kdo_website_event_outbox"]["Row"][] }
      publish_kdo_blog_content: { Args: { p_idempotency_key: string; p_workspace_id: string; p_request_sha256: string; p_title: string; p_slug: string; p_content: string; p_excerpt: string | null; p_cover_image: string | null; p_status: string }; Returns: Json }
    }
    Enums: {
      user_role:
        | "growthbridge_super_admin"
        | "growthbridge_admin"
        | "growthbridge_content_manager"
        | "growthbridge_project_manager"
        | "growthbridge_recruiter"
        | "growthbridge_analyst"
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
    Enums: {
      user_role: [
        "growthbridge_super_admin",
        "growthbridge_admin",
        "growthbridge_content_manager",
        "growthbridge_project_manager",
        "growthbridge_recruiter",
        "growthbridge_analyst",
      ],
    },
  },
} as const

// Explicit row contracts for the KDO integration persistence boundary.
export type KdoWebsiteEventOutboxRow = Database["public"]["Tables"]["kdo_website_event_outbox"]["Row"];
export type KdoContentIdempotencyRow = Database["public"]["Tables"]["kdo_content_idempotency"]["Row"];
