-- supabase/migrations/00002_enable_pgvector.sql

-- Enable pgvector extension
create extension if not exists vector;

-- Add embedding column to findings for similarity search
alter table findings add column embedding vector(384);

-- Create index for fast similarity search
create index findings_embedding_idx on findings
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Function to search similar findings
create or replace function search_similar_findings(
  query_embedding vector(384),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  inspection_id uuid,
  title text,
  description text,
  category finding_category,
  severity severity,
  cost_estimate float,
  similarity float
)
language sql stable
as $$
  select
    findings.id,
    findings.inspection_id,
    findings.title,
    findings.description,
    findings.category,
    findings.severity,
    findings.cost_estimate,
    1 - (findings.embedding <=> query_embedding) as similarity
  from findings
  where findings.embedding is not null
    and 1 - (findings.embedding <=> query_embedding) > match_threshold
  order by findings.embedding <=> query_embedding
  limit match_count;
$$;
