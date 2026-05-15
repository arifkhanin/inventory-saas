+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Create Table Generator
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

with cols as (
  select
    c.table_schema,
    c.table_name,
    c.ordinal_position,
    c.column_name,
    case
      when c.data_type = 'USER-DEFINED' then c.udt_name
      when c.data_type = 'ARRAY' then c.udt_name
      else c.data_type
    end as final_type,
    c.is_nullable,
    c.column_default
  from information_schema.columns c
  where c.table_schema = 'public'
)
select
'create table ' || table_schema || '.' || table_name || ' (' || chr(10) ||
string_agg(
'  ' || column_name || ' ' ||
final_type ||
case when is_nullable='NO' then ' not null' else '' end ||
case when column_default is not null then ' default ' || column_default else '' end,
',' || chr(10)
order by ordinal_position
) ||
chr(10) || ');' as ddl
from cols
group by table_schema, table_name
order by table_name;

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Alter Table Constraints Generator
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
select
'alter table ' ||
n.nspname || '.' || t.relname ||
' add constraint ' || c.conname || ' ' ||
pg_get_constraintdef(c.oid) || ';' as ddl
from pg_constraint c
join pg_class t on t.oid = c.conrelid
join pg_namespace n on n.oid = t.relnamespace
where n.nspname = 'public'
order by t.relname, c.conname;

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Indexes Generator
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
select indexdef as ddl
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Row LEvel Security Status
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
select
schemaname,
tablename,
rowsecurity,
forcerowsecurity
from pg_tables
where schemaname='public'
order by tablename;

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Row Level Policies
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
select
schemaname,
tablename,
policyname,
permissive,
roles,
cmd,
qual,
with_check
from pg_policies
where schemaname='public'
order by tablename, policyname;

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Create Trigger Generator
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
select
'create trigger ' || trigger_name ||
' ' || action_timing ||
' ' || event_manipulation ||
' on ' || event_object_schema || '.' || event_object_table ||
' execute procedure ' || action_statement || ';' as ddl
from information_schema.triggers
where trigger_schema='public'
order by event_object_table, trigger_name;

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Create Functions and Stored Procedures Generator
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
select
pg_get_functiondef(p.oid) as ddl
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public'
order by proname;

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Create Views Generator
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

select
'create or replace view ' ||
schemaname || '.' || viewname ||
' as ' || definition || ';' as ddl
from pg_views
where schemaname='public'
order by viewname;

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Create Sequences Generator
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
select
sequence_schema,
sequence_name
from information_schema.sequences
where sequence_schema='public'
order by sequence_name;