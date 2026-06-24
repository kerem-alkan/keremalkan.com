// AISpear — DB şeması (idempotent). /api/setup bunları sırayla çalıştırır.
export const DDL = [
  `CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    pass_hash TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    status TEXT NOT NULL DEFAULT 'active',
    email_verified_at TIMESTAMPTZ,
    created_by TEXT NOT NULL DEFAULT 'self',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    allowed BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (role_id, feature_key)
  )`,

  `CREATE TABLE IF NOT EXISTS licenses (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'time',
    status TEXT NOT NULL DEFAULT 'pending_start',
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    seat_limit INTEGER NOT NULL DEFAULT 1,
    started_by_admin BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS license_features (
    license_id INTEGER NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    allowed BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (license_id, feature_key)
  )`,

  `CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fingerprint TEXT NOT NULL,
    label TEXT,
    first_ip TEXT,
    last_ip TEXT,
    country TEXT,
    city TEXT,
    is_vpn BOOLEAN NOT NULL DEFAULT false,
    approved BOOLEAN NOT NULL DEFAULT false,
    first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, fingerprint)
  )`,

  `CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
    ip TEXT,
    country TEXT,
    city TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    online BOOLEAN NOT NULL DEFAULT true
  )`,

  `CREATE TABLE IF NOT EXISTS feature_flags (
    feature_key TEXT PRIMARY KEY,
    state TEXT NOT NULL DEFAULT 'on',
    note TEXT,
    updated_by TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS register_requests (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    pass_hash TEXT NOT NULL,
    license_key TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    verify_token TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    ip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    actor_user_id INTEGER,
    action TEXT NOT NULL,
    target TEXT,
    meta JSONB,
    ip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS rate_limits (
    bucket TEXT NOT NULL,
    ip TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    banned_until TIMESTAMPTZ,
    PRIMARY KEY (bucket, ip)
  )`,
];

// Varsayılan roller
export const SEED_ROLES = [
  { name: 'admin', is_admin: true },
  { name: 'member', is_admin: false },
];
