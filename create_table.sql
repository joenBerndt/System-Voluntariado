CREATE TABLE kv_store_f99e977c (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Optional: Enable RLS but allow public access for now since logic is handled in Edge Function
ALTER TABLE kv_store_f99e977c ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for service role" ON kv_store_f99e977c
AS PERMISSIVE FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
