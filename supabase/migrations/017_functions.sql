-- supabase/migrations/017_functions.sql
-- Database utility functions

-- Function to soft delete records
CREATE OR REPLACE FUNCTION soft_delete_record(table_name text, record_id uuid)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('UPDATE %I SET deleted_at = now() WHERE id = %L', table_name, record_id);
END;
$$;
