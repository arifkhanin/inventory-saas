"create table public.Invoices (
  id uuid not null default gen_random_uuid(),
  invoice_number text,
  product_id uuid,
  quantity integer,
  price numeric,
  gst_rate numeric,
  total_amount numeric,
  customer_name text,
  created_at timestamp without time zone default now(),
  customer_id uuid,
  client_id uuid not null,
  branch_id uuid not null
);"
"create table public.Profiles (
  id uuid not null,
  company_name text,
  gst_number text,
  address text
);"
"create table public.Sales (
  id bigint not null,
  created_at timestamp with time zone not null default now(),
  product_id uuid,
  quantity real not null,
  total_price real not null,
  client_id uuid not null,
  branch_id uuid not null
);"
"create table public.StockLogs (
  id uuid not null default gen_random_uuid(),
  product_id uuid,
  change integer,
  type text,
  created_at timestamp without time zone default now(),
  client_id uuid not null,
  branch_id uuid not null
);"
"create table public.audit_logs (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  branch_id uuid,
  user_id uuid not null,
  module text not null,
  action text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  metadata jsonb,
  created_at timestamp without time zone default now()
);"
"create table public.branches (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  name text,
  address text
);"
"create table public.categories (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  name text not null,
  parent_id uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_active boolean not null default true
);"
"create table public.clients (
  id uuid not null default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text not null,
  phone text,
  address_line1 text,
  city text,
  state text,
  pincode text,
  country text default 'India'::text,
  pan_number text,
  gst_number text,
  status text default 'active'::text,
  created_at timestamp without time zone default now(),
  activated_at timestamp without time zone,
  plan text default 'basic'::text
);"
"create table public.financial_years (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  branch_id uuid not null,
  start_date date not null,
  end_date date not null,
  is_closed boolean default false,
  created_at timestamp without time zone default now()
);"
"create table public.group_permissions (
  group_id uuid not null,
  permission_id uuid not null
);"
"create table public.groups (
  id uuid not null default gen_random_uuid(),
  name text,
  client_id uuid
);"
"create table public.inventory_batches (
  id uuid not null default gen_random_uuid(),
  variant_id uuid not null,
  batch_number text,
  expiry_date date,
  purchase_price numeric,
  quantity_remaining numeric,
  created_at timestamp with time zone default now()
);"
"create table public.inventory_period_snapshots (
  id uuid not null default gen_random_uuid(),
  financial_year_id uuid not null,
  variant_id uuid not null,
  branch_id uuid not null,
  client_id uuid not null,
  opening_quantity numeric default 0,
  closing_quantity numeric default 0,
  created_at timestamp without time zone default now()
);"
"create table public.inventory_snapshots (
  id uuid not null default gen_random_uuid(),
  variant_id uuid not null,
  branch_id uuid not null,
  client_id uuid not null,
  quantity numeric not null default 0,
  snapshot_date date not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);"
"create table public.inventory_stock (
  id uuid not null default gen_random_uuid(),
  variant_id uuid not null,
  branch_id uuid not null,
  client_id uuid not null,
  quantity numeric not null default 0,
  updated_at timestamp with time zone default now()
);"
"create table public.inventory_transactions (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  branch_id uuid not null,
  variant_id uuid not null,
  type text not null,
  quantity numeric not null,
  unit_cost numeric,
  reference_type text,
  reference_id uuid,
  created_at timestamp with time zone default now(),
  created_by uuid,
  stock_direction smallint not null default 1
);"
"create table public.permission_definitions (
  id uuid not null default gen_random_uuid(),
  module_code text not null,
  action_code text not null,
  code text,
  label text not null,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamp without time zone default now()
);"
"create table public.product_attribute_values (
  id uuid not null default gen_random_uuid(),
  variant_id uuid not null,
  attribute_id uuid not null,
  value_text text,
  value_number numeric,
  value_date date
);"
"create table public.product_attributes (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  name text not null,
  data_type text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_active boolean not null default true
);"
"create table public.product_variants (
  id uuid not null default gen_random_uuid(),
  product_id uuid not null,
  client_id uuid not null,
  variant_name text,
  sku text,
  barcode text,
  created_at timestamp with time zone default now(),
  is_default boolean not null default false,
  updated_at timestamp with time zone default now(),
  is_active boolean not null default true
);"
"create table public.products (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  name text not null,
  sku text,
  category_id uuid,
  base_unit_id uuid,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  description text,
  hsn_code text,
  gst_rate numeric
);"
"create table public.reorder_rules (
  id uuid not null default gen_random_uuid(),
  variant_id uuid not null,
  branch_id uuid not null,
  reorder_level numeric not null,
  reorder_quantity numeric,
  updated_at timestamp with time zone default now()
);"
"create table public.units (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  name text not null,
  symbol text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_active boolean not null default true
);"
"create table public.user_groups (
  user_id uuid not null,
  group_id uuid not null
);"
"create table public.users (
  id uuid not null default gen_random_uuid(),
  client_id uuid,
  branch_id uuid,
  name text,
  email text,
  auth_user_id uuid,
  role text default 'branch_user'::text
);"

indexdef
CREATE UNIQUE INDEX invoices_pkey ON public."Invoices" USING btree (id)
CREATE UNIQUE INDEX profiles_pkey ON public."Profiles" USING btree (id)
CREATE UNIQUE INDEX sales_pkey ON public."Sales" USING btree (id)
CREATE UNIQUE INDEX stocklogs_pkey ON public."StockLogs" USING btree (id)
CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id)
CREATE INDEX idx_audit_logs_client ON public.audit_logs USING btree (client_id)
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at)
CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_id)
CREATE UNIQUE INDEX branches_pkey ON public.branches USING btree (id)
CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id)
CREATE UNIQUE INDEX ux_categories_client_parent_name ON public.categories USING btree (client_id, parent_id, lower(name))
CREATE UNIQUE INDEX clients_email_unique ON public.clients USING btree (email)
CREATE UNIQUE INDEX clients_pkey ON public.clients USING btree (id)
CREATE UNIQUE INDEX financial_years_pkey ON public.financial_years USING btree (id)
CREATE UNIQUE INDEX group_permissions_group_permission ON public.group_permissions USING btree (group_id, permission_id)
CREATE UNIQUE INDEX group_permissions_pkey ON public.group_permissions USING btree (group_id, permission_id)
CREATE INDEX idx_group_permissions_group ON public.group_permissions USING btree (group_id)
CREATE UNIQUE INDEX unique_group_permission ON public.group_permissions USING btree (group_id, permission_id)
CREATE UNIQUE INDEX groups_pkey ON public.groups USING btree (id)
CREATE UNIQUE INDEX unique_group_per_client ON public.groups USING btree (client_id, name)
CREATE UNIQUE INDEX inventory_batches_pkey ON public.inventory_batches USING btree (id)
CREATE UNIQUE INDEX inventory_period_snapshots_pkey ON public.inventory_period_snapshots USING btree (id)
CREATE UNIQUE INDEX inventory_snapshots_pkey ON public.inventory_snapshots USING btree (id)
CREATE UNIQUE INDEX inventory_stock_pkey ON public.inventory_stock USING btree (id)
CREATE UNIQUE INDEX unique_variant_branch ON public.inventory_stock USING btree (variant_id, branch_id)
CREATE UNIQUE INDEX inventory_transactions_pkey ON public.inventory_transactions USING btree (id)
CREATE UNIQUE INDEX permission_definitions_module_action_key ON public.permission_definitions USING btree (module_code, action_code)
CREATE UNIQUE INDEX permission_definitions_module_code_action_code_key ON public.permission_definitions USING btree (module_code, action_code)
CREATE UNIQUE INDEX permission_definitions_pkey ON public.permission_definitions USING btree (id)
CREATE UNIQUE INDEX product_attribute_values_pkey ON public.product_attribute_values USING btree (id)
CREATE UNIQUE INDEX product_attributes_pkey ON public.product_attributes USING btree (id)
CREATE UNIQUE INDEX ux_attribute_client_name ON public.product_attributes USING btree (client_id, lower(name))
CREATE INDEX ix_product_variants_product_id ON public.product_variants USING btree (product_id)
CREATE UNIQUE INDEX product_variants_pkey ON public.product_variants USING btree (id)
CREATE UNIQUE INDEX ux_product_one_default_variant ON public.product_variants USING btree (product_id) WHERE (is_default = true)
CREATE UNIQUE INDEX ux_variant_client_barcode ON public.product_variants USING btree (client_id, barcode) WHERE (barcode IS NOT NULL)
CREATE UNIQUE INDEX ux_variant_client_sku ON public.product_variants USING btree (client_id, sku) WHERE (sku IS NOT NULL)
CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id)
CREATE UNIQUE INDEX reorder_rules_pkey ON public.reorder_rules USING btree (id)
CREATE UNIQUE INDEX ux_reorder_branch_variant ON public.reorder_rules USING btree (branch_id, variant_id)
CREATE UNIQUE INDEX units_pkey ON public.units USING btree (id)
CREATE UNIQUE INDEX ux_units_client_name ON public.units USING btree (client_id, lower(name))
CREATE INDEX idx_user_groups_user ON public.user_groups USING btree (user_id)
CREATE UNIQUE INDEX unique_user_group ON public.user_groups USING btree (user_id, group_id)
CREATE UNIQUE INDEX user_groups_user_group ON public.user_groups USING btree (user_id, group_id)
CREATE UNIQUE INDEX users_auth_user_id_unique ON public.users USING btree (auth_user_id)
CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id)

alter table public.Invoices add constraint fk_invoices_branch FOREIGN KEY (branch_id) REFERENCES branches(id);
alter table public.Invoices add constraint invoices_pkey PRIMARY KEY (id);
alter table public.Profiles add constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.Profiles add constraint profiles_pkey PRIMARY KEY (id);
alter table public.Sales add constraint fk_sales_branch FOREIGN KEY (branch_id) REFERENCES branches(id);
alter table public.Sales add constraint sales_pkey PRIMARY KEY (id);
alter table public.StockLogs add constraint fk_stocklogs_branch FOREIGN KEY (branch_id) REFERENCES branches(id);
alter table public.StockLogs add constraint stocklogs_pkey PRIMARY KEY (id);
alter table public.audit_logs add constraint audit_logs_pkey PRIMARY KEY (id);
alter table public.branches add constraint branches_pkey PRIMARY KEY (id);
alter table public.categories add constraint categories_pkey PRIMARY KEY (id);
alter table public.clients add constraint clients_email_unique UNIQUE (email);
alter table public.clients add constraint clients_pkey PRIMARY KEY (id);
alter table public.financial_years add constraint financial_years_pkey PRIMARY KEY (id);
alter table public.group_permissions add constraint fk_group_permissions_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
"alter table public.group_permissions add constraint group_permissions_group_permission UNIQUE (group_id, permission_id);"
alter table public.group_permissions add constraint group_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES permission_definitions(id) ON DELETE CASCADE;
"alter table public.group_permissions add constraint group_permissions_pkey PRIMARY KEY (group_id, permission_id);"
"alter table public.group_permissions add constraint unique_group_permission UNIQUE (group_id, permission_id);"
alter table public.groups add constraint groups_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id);
alter table public.groups add constraint groups_pkey PRIMARY KEY (id);
"alter table public.groups add constraint unique_group_per_client UNIQUE (client_id, name);"
alter table public.inventory_batches add constraint fk_batch_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id);
alter table public.inventory_batches add constraint inventory_batches_pkey PRIMARY KEY (id);
alter table public.inventory_period_snapshots add constraint inventory_period_snapshots_financial_year_id_fkey FOREIGN KEY (financial_year_id) REFERENCES financial_years(id);
alter table public.inventory_period_snapshots add constraint inventory_period_snapshots_pkey PRIMARY KEY (id);
alter table public.inventory_snapshots add constraint fk_snap_branch FOREIGN KEY (branch_id) REFERENCES branches(id);
alter table public.inventory_snapshots add constraint fk_snap_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id);
alter table public.inventory_snapshots add constraint inventory_snapshots_pkey PRIMARY KEY (id);
alter table public.inventory_stock add constraint fk_is_branch FOREIGN KEY (branch_id) REFERENCES branches(id);
alter table public.inventory_stock add constraint fk_is_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id);
alter table public.inventory_stock add constraint inventory_stock_pkey PRIMARY KEY (id);
"alter table public.inventory_stock add constraint unique_variant_branch UNIQUE (variant_id, branch_id);"
alter table public.inventory_transactions add constraint fk_inventory_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id);
alter table public.inventory_transactions add constraint inventory_transactions_pkey PRIMARY KEY (id);
"alter table public.permission_definitions add constraint permission_definitions_module_action_key UNIQUE (module_code, action_code);"
"alter table public.permission_definitions add constraint permission_definitions_module_code_action_code_key UNIQUE (module_code, action_code);"
alter table public.permission_definitions add constraint permission_definitions_pkey PRIMARY KEY (id);
alter table public.product_attribute_values add constraint fk_attr_definition FOREIGN KEY (attribute_id) REFERENCES product_attributes(id);
alter table public.product_attribute_values add constraint fk_attr_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id);
alter table public.product_attribute_values add constraint product_attribute_values_pkey PRIMARY KEY (id);
"alter table public.product_attributes add constraint chk_attribute_data_type CHECK ((data_type = ANY (ARRAY['text'::text, 'number'::text, 'date'::text, 'boolean'::text, 'select'::text])));"
alter table public.product_attributes add constraint product_attributes_pkey PRIMARY KEY (id);
alter table public.product_variants add constraint fk_variant_product FOREIGN KEY (product_id) REFERENCES products(id);
alter table public.product_variants add constraint product_variants_pkey PRIMARY KEY (id);
alter table public.products add constraint fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id);
alter table public.products add constraint fk_products_unit FOREIGN KEY (base_unit_id) REFERENCES units(id);
alter table public.products add constraint products_pkey PRIMARY KEY (id);
alter table public.reorder_rules add constraint fk_reorder_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id);
alter table public.reorder_rules add constraint reorder_rules_pkey PRIMARY KEY (id);
alter table public.units add constraint units_pkey PRIMARY KEY (id);
alter table public.user_groups add constraint fk_user_groups_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
alter table public.user_groups add constraint fk_user_groups_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
"alter table public.user_groups add constraint unique_user_group UNIQUE (user_id, group_id);"
"alter table public.user_groups add constraint user_groups_user_group UNIQUE (user_id, group_id);"
alter table public.users add constraint users_auth_user_id_unique UNIQUE (auth_user_id);
alter table public.users add constraint users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES branches(id);
alter table public.users add constraint users_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id);
alter table public.users add constraint users_pkey PRIMARY KEY (id);
