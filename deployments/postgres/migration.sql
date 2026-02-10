DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'run_status') THEN
        CREATE TYPE run_status AS ENUM ('queued', 'ready', 'failed');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,

    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,

    has_access BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS runs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    config JSONB NOT NULL,

    results JSONB,

    status run_status NOT NULL DEFAULT 'queued',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_runs_user_id ON runs(user_id);

CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);

CREATE INDEX IF NOT EXISTS idx_runs_config ON runs USING gin(config);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_runs_updated_at ON runs;
CREATE TRIGGER update_runs_updated_at
    BEFORE UPDATE ON runs
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();