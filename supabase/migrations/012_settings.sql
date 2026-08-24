-- supabase/migrations/012_settings.sql
-- Site settings key-value store

CREATE TABLE IF NOT EXISTS site_settings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key        TEXT NOT NULL UNIQUE,
  value      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed initial settings row
INSERT INTO site_settings (key, value)
VALUES (
  'general',
  '{
    "organization": {
      "name": "Growthbridge Virtual Organization",
      "tagline": "Bridging Opportunities, Empowering Growth",
      "description": "Catalyzing innovation and community development across Africa and beyond.",
      "logo": "/images/logo.png",
      "address": "Virtual HQ",
      "phone": "+250 788 000 000",
      "email": "hello@growthbridge.org"
    },
    "social": {
      "linkedin": "https://linkedin.com/company/growthbridge",
      "twitter": "https://twitter.com/growthbridge",
      "facebook": "https://facebook.com/growthbridge",
      "instagram": "https://instagram.com/growthbridge"
    },
    "seo": {
      "defaultTitle": "Growthbridge | Bridging Opportunities",
      "defaultDescription": "Catalyzing innovation, youth empowerment, and technological advancement.",
      "defaultKeywords": ["Growthbridge", "Africa", "Tech", "Talent", "Innovation"]
    },
    "features": {
      "enableTalentHub": true,
      "enableBlog": true,
      "enablePartnerPortal": true,
      "enableAIAssistant": false,
      "enableAnalytics": true,
      "maintenanceMode": false
    }
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;
