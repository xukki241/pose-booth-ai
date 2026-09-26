CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS booth_sessions (
  id uuid PRIMARY KEY, token_hash text NOT NULL UNIQUE, share_token_hash text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
  revoked boolean NOT NULL DEFAULT false,
  training_allowed boolean NOT NULL DEFAULT false CHECK (training_allowed = false)
);
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY, session_id uuid NOT NULL REFERENCES booth_sessions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(), bytes bigint NOT NULL CHECK (bytes > 0),
  sha256 text NOT NULL, client_key uuid NOT NULL,
  UNIQUE(session_id, client_key)
);
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY, session_id uuid NOT NULL REFERENCES booth_sessions(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind = 'thumbnail'),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','succeeded','failed','cancelled')),
  attempts integer NOT NULL DEFAULT 0, error_code text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS job_outbox (
  id bigserial PRIMARY KEY, job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  sent_at timestamptz
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON booth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS outbox_pending ON job_outbox(id) WHERE sent_at IS NULL;
INSERT INTO schema_migrations(version) VALUES (1) ON CONFLICT DO NOTHING;
