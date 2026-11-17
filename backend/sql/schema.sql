-- NovaWorks CRM schema. Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run again: it does not delete existing data.

create table if not exists users (
  id bigint generated always as identity primary key,
  ref text unique not null,                 -- directory code used by the AI: PM01, DEV01 ...
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('ADMIN', 'MANAGER', 'AGENT')),
  specialization text,
  skills text[] not null default '{}'
);

create table if not exists projects (
  id bigint generated always as identity primary key,
  name text not null,
  client_name text not null,
  description text,
  manager_id bigint not null references users (id),
  deadline date not null,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id bigint generated always as identity primary key,
  project_id bigint not null references projects (id) on delete cascade,
  title text not null,
  description text,
  assignee_id bigint not null references users (id),
  deadline date not null,
  estimated_hours numeric not null check (estimated_hours > 0),
  created_at timestamptz not null default now()
);

create index if not exists tasks_project_idx on tasks (project_id);
create index if not exists tasks_assignee_idx on tasks (assignee_id);
create index if not exists projects_manager_idx on projects (manager_id);

-- Only the backend (secret key) may touch these tables. Browser keys get nothing.
alter table users enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;

-- Saves all projects and their tasks in ONE transaction.
-- If any insert fails, Postgres rolls everything back, so nothing is left half created.
create or replace function create_projects_from_draft(draft jsonb, replace_existing boolean default true)
returns jsonb
language plpgsql
as $$
declare
  p jsonb;
  t jsonb;
  new_project_id bigint;
  project_count int := 0;
  task_count int := 0;
begin
  for p in select * from jsonb_array_elements(draft -> 'projects')
  loop
    if replace_existing then
      delete from projects where lower(name) = lower(p ->> 'name');
    end if;

    insert into projects (name, client_name, description, manager_id, deadline)
    values (
      p ->> 'name',
      p ->> 'clientName',
      p ->> 'description',
      (p ->> 'managerId')::bigint,
      (p ->> 'deadline')::date
    )
    returning id into new_project_id;
    project_count := project_count + 1;

    for t in select * from jsonb_array_elements(p -> 'tasks')
    loop
      insert into tasks (project_id, title, description, assignee_id, deadline, estimated_hours)
      values (
        new_project_id,
        t ->> 'title',
        t ->> 'description',
        (t ->> 'assigneeId')::bigint,
        (t ->> 'deadline')::date,
        (t ->> 'estimatedHours')::numeric
      );
      task_count := task_count + 1;
    end loop;
  end loop;

  return jsonb_build_object('projects', project_count, 'tasks', task_count);
end;
$$;

-- Tell the API layer about the new tables and function.
notify pgrst, 'reload schema';
