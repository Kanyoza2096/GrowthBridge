// Generated from the checked-in GrowthBridge Supabase migrations.
// Keep this schema aligned with supabase/migrations; regenerate from the GrowthBridge
// project before adding schema changes that are not represented in those migrations.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Table<Row extends Record<string, unknown>, Relations extends Relationship[] = []> = {
  Row: Row;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: Relations;
};

type View<Row extends Record<string, unknown>> = {
  Row: Row;
  Relationships: Relationship[];
};

type UserRole =
  | 'growthbridge_super_admin'
  | 'growthbridge_admin'
  | 'growthbridge_content_manager'
  | 'growthbridge_project_manager'
  | 'growthbridge_recruiter'
  | 'growthbridge_analyst';

export type Database = {
  public: {
    Tables: {
      profiles: Table<{
        id: string; email: string; full_name: string | null; avatar_url: string | null;
        role: UserRole; department: string | null; is_active: boolean;
        created_at: string; updated_at: string;
      }>;
      services: Table<{
        id: string; slug: string; title: string; division: string; tagline: string | null;
        description: string; icon: string | null; color: string | null; features: Json;
        benefits: Json; process: Json; image: string | null; display_order: number;
        status: 'draft' | 'published' | 'archived'; seo_title: string | null;
        seo_description: string | null; seo_keywords: Json; created_at: string;
        updated_at: string; published_at: string | null; deleted_at: string | null;
      }>;
      projects: Table<{
        id: string; slug: string; title: string; client: string; category: string;
        description: string; short_description: string | null; image: string | null;
        gallery: Json; technologies: Json; impact: Json | null; testimonial: Json | null;
        service_division: string | null; featured: boolean;
        status: 'draft' | 'published' | 'archived'; start_date: string | null;
        completed_at: string | null; url: string | null; created_at: string;
        updated_at: string; published_at: string | null; deleted_at: string | null;
      }>;
      blog_posts: Table<{
        id: string; slug: string; title: string; excerpt: string | null; content: string;
        author_id: string | null; author_name: string; cover_image: string | null;
        tags: Json; category: string;
        status: 'draft' | 'scheduled' | 'published' | 'archived';
        scheduled_at: string | null; published_at: string | null; read_time: number | null;
        featured: boolean; created_at: string; updated_at: string; deleted_at: string | null;
      }, [{
        foreignKeyName: 'blog_posts_author_id_fkey'; columns: ['author_id'];
        isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'];
      }]>;
      people: Table<{
        id: string; slug: string;
        category: 'team' | 'advisor' | 'board' | 'alumni' | 'partner_rep' | 'contributor';
        full_name: string; title: string; department: string | null; bio: string;
        short_bio: string | null; photo: string | null; email: string | null;
        phone: string | null; location: string | null; joined_at: string | null;
        skills: Json; certifications: Json; social_links: Json; projects: Json;
        articles: Json; display_order: number; featured: boolean; active: boolean;
        created_at: string; updated_at: string; deleted_at: string | null;
      }>;
      testimonials: Table<{
        id: string; quote: string; author_name: string; author_role: string | null;
        author_organization: string | null; author_avatar: string | null; rating: number;
        project_id: string | null; service_id: string | null; featured: boolean;
        status: 'pending' | 'approved' | 'rejected'; created_at: string;
      }, [
        { foreignKeyName: 'testimonials_project_id_fkey'; columns: ['project_id'];
          isOneToOne: false; referencedRelation: 'projects'; referencedColumns: ['id']; },
        { foreignKeyName: 'testimonials_service_id_fkey'; columns: ['service_id'];
          isOneToOne: false; referencedRelation: 'services'; referencedColumns: ['id']; }
      ]>;
      talent_profiles: Table<{
        id: string; full_name: string; email: string; phone: string | null; bio: string | null;
        avatar: string | null; skills: Json; experience: number | null; experience_level: string | null;
        portfolio: string | null; resume_url: string | null;
        availability: 'available' | 'interviewing' | 'hired' | 'unavailable';
        verification_status: 'unverified' | 'pending' | 'verified'; categories: Json;
        created_at: string; updated_at: string;
      }>;
      applications: Table<{
        id: string; type: 'talent' | 'partnership' | 'client' | 'volunteer';
        applicant_name: string; email: string; phone: string | null; subject: string | null;
        message: string | null; role: string | null; skills: Json; portfolio: string | null;
        status: 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'completed';
        assignee_id: string | null; notes: Json; history: Json; submitted_at: string;
        updated_at: string;
      }, [{
        foreignKeyName: 'applications_assignee_id_fkey'; columns: ['assignee_id'];
        isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'];
      }]>;
      faqs: Table<{
        id: string; question: string; answer: string; category: string; display_order: number;
        status: 'draft' | 'published'; created_at: string; updated_at: string;
      }>;
      announcements: Table<{
        id: string; title: string; content: string;
        type: 'info' | 'warning' | 'success' | 'urgent';
        priority: 'low' | 'medium' | 'high';
        audience: 'public' | 'talent' | 'partners' | 'admin';
        status: 'draft' | 'scheduled' | 'published' | 'archived';
        scheduled_at: string | null; published_at: string | null; expires_at: string | null;
        created_at: string; updated_at: string;
      }>;
      partners: Table<{
        id: string; organization_name: string; contact_person: string; email: string;
        phone: string | null; website: string | null; logo: string | null;
        industry: string | null; description: string | null;
        status: 'prospect' | 'active' | 'inactive' | 'terminated';
        partnership_type: 'sponsor' | 'client' | 'collaborator' | 'vendor';
        partnership_start_date: string | null; partnership_end_date: string | null;
        address: string | null; notes: string | null; created_at: string; updated_at: string;
      }>;
      media_folders: Table<{
        id: string; name: string; parent_id: string | null; created_at: string;
      }, [{
        foreignKeyName: 'media_folders_parent_id_fkey'; columns: ['parent_id'];
        isOneToOne: false; referencedRelation: 'media_folders'; referencedColumns: ['id'];
      }]>;
      media: Table<{
        id: string; name: string; file_name: string; url: string; mime_type: string;
        size_bytes: number; width: number | null; height: number | null; folder_id: string | null;
        uploaded_by: string | null; alt_text: string | null; created_at: string;
      }, [
        { foreignKeyName: 'media_folder_id_fkey'; columns: ['folder_id'];
          isOneToOne: false; referencedRelation: 'media_folders'; referencedColumns: ['id']; },
        { foreignKeyName: 'media_uploaded_by_fkey'; columns: ['uploaded_by'];
          isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id']; }
      ]>;
      site_settings: Table<{
        id: string; key: string; value: Json; updated_by: string | null; updated_at: string;
      }, [{
        foreignKeyName: 'site_settings_updated_by_fkey'; columns: ['updated_by'];
        isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'];
      }]>;
      impact_stats: Table<{
        id: string; projects_completed: number; youth_empowered: number;
        communities_served: number; client_satisfaction: number; active_members: number;
        events_hosted: number; updated_at: string;
      }>;
      contact_submissions: Table<{
        id: string; name: string; email: string; phone: string | null; subject: string;
        message: string; type: 'general' | 'partnership' | 'talent';
        status: 'new' | 'read' | 'archived' | 'replied'; created_at: string;
      }>;
      partnership_requests: Table<{
        id: string; organization_name: string; contact_person: string; email: string;
        phone: string | null; partnership_type: string; message: string;
        status: 'new' | 'reviewing' | 'approved' | 'declined'; created_at: string;
      }>;
      audit_logs: Table<{
        id: string; actor_id: string | null; actor_name: string; action: string;
        resource_type: string; resource_id: string | null; resource_name: string | null;
        changes: Json | null; ip_address: string | null; user_agent: string | null; created_at: string;
      }, [{
        foreignKeyName: 'audit_logs_actor_id_fkey'; columns: ['actor_id'];
        isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'];
      }]>;
      admin_notifications: Table<{
        id: string; recipient_id: string; type: 'application' | 'contact' | 'partnership' | 'system' | 'content';
        title: string; message: string; link: string | null; read: boolean; created_at: string;
      }, [{
        foreignKeyName: 'admin_notifications_recipient_id_fkey'; columns: ['recipient_id'];
        isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'];
      }]>;
      kdo_website_event_outbox: Table<{
        id: string; integration_id: string; event_id: string;
        event_type: 'project.created' | 'project.updated' | 'project.deleted' |
          'service.created' | 'service.updated' | 'blog.created' | 'blog.published' |
          'application.created' | 'application.updated' | 'contact.submitted' |
          'partnership.requested' | 'talent.profile.created' | 'testimonial.created' | 'settings.updated';
        event_version: string; occurred_at: string; payload: Json;
        status: 'pending' | 'processing' | 'delivered' | 'failed'; attempt_count: number;
        next_attempt_at: string; locked_until: string | null; last_error: string | null;
        created_at: string; delivered_at: string | null;
      }>;
      kdo_content_idempotency: Table<{
        idempotency_key: string; workspace_id: string; request_sha256: string;
        response_json: Json | null; created_at: string; updated_at: string;
      }>;
    };
    Views: {
      public_people: View<{
        id: string; slug: string; category: string; full_name: string; title: string;
        department: string | null; bio: string; short_bio: string | null; photo: string | null;
        location: string | null; joined_at: string | null; skills: Json; certifications: Json;
        social_links: Json; projects: Json; articles: Json; display_order: number;
        featured: boolean; active: boolean; created_at: string; updated_at: string;
      }>;
    };
    Functions: {
      has_admin_permission: { Args: { p_resource: string; p_action: string }; Returns: boolean };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      soft_delete_record: { Args: { table_name: string; record_id: string }; Returns: undefined };
      purge_soft_deleted: { Args: { retention_days?: number }; Returns: { table_name: string; rows_deleted: number }[] };
      claim_kdo_website_event_outbox: { Args: { p_limit?: number; p_lease_seconds?: number }; Returns: Database['public']['Tables']['kdo_website_event_outbox']['Row'][] };
      publish_kdo_blog_content: { Args: {
        p_idempotency_key: string; p_workspace_id: string; p_request_sha256: string;
        p_title: string; p_slug: string; p_content: string; p_excerpt: string | null;
        p_cover_image: string | null; p_status: string;
      }; Returns: Json };
    };
    Enums: { user_role: UserRole };
    CompositeTypes: Record<string, never>;
  };
};
