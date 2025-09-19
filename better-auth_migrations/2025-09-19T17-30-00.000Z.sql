create table if not exists integration_installations (
  id bigserial primary key,
  provider text not null,
  installation_id text unique not null,
  user_id text,
  organization_id text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_integration_installations_user_provider
  on integration_installations (user_id, provider);


