-- Advisor sessions for "Build My Crypto Stack" feature
CREATE TABLE advisor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  answers JSONB NOT NULL DEFAULT '{}',
  recommended_stack JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_advisor_sessions_token ON advisor_sessions(session_token);

-- RLS
ALTER TABLE advisor_sessions ENABLE ROW LEVEL SECURITY;

-- Public can read sessions by token (for sharing)
CREATE POLICY "advisor_sessions_select" ON advisor_sessions FOR SELECT
  TO public USING (true);

-- Public can insert new sessions
CREATE POLICY "advisor_sessions_insert" ON advisor_sessions FOR INSERT
  TO public WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON advisor_sessions TO anon;
GRANT SELECT, INSERT, UPDATE ON advisor_sessions TO authenticated;