-- supabase/migrations/016_rls.sql
-- Row Level Security (RLS) policies for all tables

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has admin privileges
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN (
      'growthbridge_super_admin',
      'growthbridge_admin',
      'growthbridge_content_manager',
      'growthbridge_project_manager',
      'growthbridge_recruiter',
      'growthbridge_analyst'
    )
  );
$$;

-- 1. Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Services
CREATE POLICY "Published services are viewable by everyone" ON services
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (is_admin());

-- 3. Projects
CREATE POLICY "Published projects are viewable by everyone" ON projects
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "Admins can manage projects" ON projects
  FOR ALL USING (is_admin());

-- 4. Blog Posts
CREATE POLICY "Published blog posts are viewable by everyone" ON blog_posts
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "Admins can manage blog posts" ON blog_posts
  FOR ALL USING (is_admin());

-- 5. People
CREATE POLICY "Active people are viewable by everyone" ON people
  FOR SELECT USING (active = true AND deleted_at IS NULL);
CREATE POLICY "Admins can manage people" ON people
  FOR ALL USING (is_admin());

-- 6. Testimonials
CREATE POLICY "Approved testimonials are viewable by everyone" ON testimonials
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Admins can manage testimonials" ON testimonials
  FOR ALL USING (is_admin());

-- 7. Talent Profiles
CREATE POLICY "Admins can view talent profiles" ON talent_profiles
  FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage talent profiles" ON talent_profiles
  FOR ALL USING (is_admin());

-- 8. Applications
CREATE POLICY "Anyone can submit application" ON applications
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view and manage applications" ON applications
  FOR ALL USING (is_admin());

-- 9. FAQs
CREATE POLICY "Published FAQs are viewable by everyone" ON faqs
  FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage FAQs" ON faqs
  FOR ALL USING (is_admin());

-- 10. Announcements
CREATE POLICY "Published announcements are viewable by everyone" ON announcements
  FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (is_admin());

-- 11. Partners
CREATE POLICY "Active partners are viewable by everyone" ON partners
  FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage partners" ON partners
  FOR ALL USING (is_admin());

-- 12. Media & Media Folders
CREATE POLICY "Media is viewable by everyone" ON media
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage media" ON media
  FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage media folders" ON media_folders
  FOR ALL USING (is_admin());

-- 13. Site Settings
CREATE POLICY "Site settings viewable by everyone" ON site_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can update site settings" ON site_settings
  FOR ALL USING (is_admin());

-- 14. Impact Stats
CREATE POLICY "Impact stats viewable by everyone" ON impact_stats
  FOR SELECT USING (true);
CREATE POLICY "Admins can update impact stats" ON impact_stats
  FOR ALL USING (is_admin());

-- 15. Contact Submissions & Partnership Requests
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact submissions" ON contact_submissions
  FOR ALL USING (is_admin());

CREATE POLICY "Anyone can submit partnership request" ON partnership_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view partnership requests" ON partnership_requests
  FOR ALL USING (is_admin());

-- 16. Audit Logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (is_admin());
