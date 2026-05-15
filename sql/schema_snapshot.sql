"create table public.Profiles (
  id uuid not null,
  company_name text,
  gst_number text,
  address text
);"
"create table public.audit_logs (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  branch_id uuid,
  user_id uuid,
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
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);"
"create table public.inventory_transactions (
  id uuid not null default gen_random_uuid (),
  client_id uuid not null,
  branch_id uuid not null,
  variant_id uuid not null,
  inventory_transaction_group_id uuid not null default gen_random_uuid(),
  parent_transaction_id uuid null,
  transaction_sequence integer not null default 1,
  transaction_type text not null,
  quantity numeric not null,
  unit_cost numeric null,
  reference_type text null,
  reference_id uuid null,
  created_at timestamp with time zone null default now(),
  created_by uuid null,
  remarks text null,
  metadata jsonb null default '{}'::jsonb,
  constraint inventory_transactions_pkey primary key (id),
  constraint fk_inventory_variant foreign KEY (variant_id) references product_variants (id)
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
  status text NOT NULL DEFAULT 'active',
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
"create table public.tenant_inventory_policies (
  id uuid not null default gen_random_uuid(),

  client_id uuid not null,
  branch_id uuid null,

  negative_stock_policy text not null default 'block',

  is_active boolean not null default true,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  constraint tenant_inventory_policies_pkey primary key (id)
);"

indexdef
CREATE UNIQUE INDEX invoices_pkey ON public."Invoices" USING btree (id)
CREATE UNIQUE INDEX profiles_pkey ON public."Profiles" USING btree (id)
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
create unique index ux_inventory_snapshot_unique on inventory_snapshots (client_id, branch_id, variant_id);
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
create index if not exists idx_inventory_tx_group on inventory_transactions(inventory_transaction_group_id);
create index if not exists idx_inventory_tx_parent on inventory_transactions(parent_transaction_id);
create index if not exists idx_inventory_tx_sequence on inventory_transactions(inventory_transaction_group_id, transaction_sequence);
create unique index ux_tenant_inventory_policy on public.tenant_inventory_policies (client_id, branch_id);

alter table public.Profiles add constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.Profiles add constraint profiles_pkey PRIMARY KEY (id);
alter table public.audit_logs add constraint audit_logs_pkey PRIMARY KEY (id);
alter table public.branches add constraint branches_pkey PRIMARY KEY (id);
alter table public.categories add constraint categories_pkey PRIMARY KEY (id);
alter table public.clients add constraint clients_email_unique UNIQUE (email);
alter table public.clients add constraint clients_pkey PRIMARY KEY (id);
alter table public.financial_years add constraint financial_years_pkey PRIMARY KEY (id);
alter table public.group_permissions add constraint fk_group_permissions_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
alter table public.group_permissions add constraint group_permissions_group_permission UNIQUE (group_id, permission_id);
alter table public.group_permissions add constraint group_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES permission_definitions(id) ON DELETE CASCADE;
alter table public.group_permissions add constraint group_permissions_pkey PRIMARY KEY (group_id, permission_id);
alter table public.group_permissions add constraint unique_group_permission UNIQUE (group_id, permission_id);
alter table public.groups add constraint groups_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id);
alter table public.groups add constraint groups_pkey PRIMARY KEY (id);
alter table public.groups add constraint unique_group_per_client UNIQUE (client_id, name);
alter table public.inventory_batches add constraint fk_batch_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id);
alter table public.inventory_batches add constraint inventory_batches_pkey PRIMARY KEY (id);
alter table public.inventory_period_snapshots add constraint inventory_period_snapshots_financial_year_id_fkey FOREIGN KEY (financial_year_id) REFERENCES financial_years(id);
alter table public.inventory_period_snapshots add constraint inventory_period_snapshots_pkey PRIMARY KEY (id);
alter table public.inventory_snapshots add constraint fk_snap_branch FOREIGN KEY (branch_id) REFERENCES branches(id);
alter table public.inventory_snapshots add constraint fk_snap_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id);
alter table public.inventory_snapshots add constraint inventory_snapshots_pkey PRIMARY KEY (id);
alter table public.inventory_transactions add constraint fk_inventory_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id);
alter table public.inventory_transactions add constraint inventory_transactions_pkey PRIMARY KEY (id);
alter table public.permission_definitions add constraint permission_definitions_module_action_key UNIQUE (module_code, action_code);
alter table public.permission_definitions add constraint permission_definitions_module_code_action_code_key UNIQUE (module_code, action_code);
alter table public.permission_definitions add constraint permission_definitions_pkey PRIMARY KEY (id);
alter table public.product_attribute_values add constraint fk_attr_definition FOREIGN KEY (attribute_id) REFERENCES product_attributes(id);
alter table public.product_attribute_values add constraint fk_attr_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id);
alter table public.product_attribute_values add constraint product_attribute_values_pkey PRIMARY KEY (id);
alter table public.product_attributes add constraint chk_attribute_data_type CHECK ((data_type = ANY (ARRAY['text'::text, 'number'::text, 'date'::text, 'boolean'::text, 'select'::text])));
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
alter table public.user_groups add constraint unique_user_group UNIQUE (user_id, group_id);
alter table public.user_groups add constraint user_groups_user_group UNIQUE (user_id, group_id);
alter table public.users add constraint users_auth_user_id_unique UNIQUE (auth_user_id);
alter table public.users add constraint users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES branches(id);
alter table public.users add constraint users_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id);
alter table public.users add constraint users_pkey PRIMARY KEY (id);
alter table inventory_transactions add constraint fk_inventory_parent_transaction foreign key (parent_transaction_id) references inventory_transactions(id);

create or replace function create_product_with_default_variant(
  p_client_id uuid,
  p_name text,
  p_category_id uuid,
  p_base_unit_id uuid,
  p_description text,
  p_hsn_code text,
  p_gst_rate numeric,
  p_sku text,
  p_barcode text
)
returns json
language plpgsql
as $$
declare
  v_product_id uuid;
  v_result json;
begin

  -- 1. Create Product (minimal + flexible)
  insert into products (
    client_id,
    name,
    category_id,
    base_unit_id,
    description,
    hsn_code,
    gst_rate
  )
  values (
    p_client_id,
    trim(p_name),
    p_category_id,
    p_base_unit_id,
    p_description,
    p_hsn_code,
    p_gst_rate
  )
  returning id into v_product_id;

  -- 2. Create default variant (MUST EXIST ALWAYS)
  insert into product_variants (
    product_id,
    client_id,
    sku,
    barcode,
    is_default,
    is_active
  )
  values (
    v_product_id,
    p_client_id,
    p_sku,
    p_barcode,
    true,
    true
  );

  -- 3. Return product (clean response shape)
  select json_build_object(
    'id', p.id,
    'name', p.name,
    'category_id', p.category_id,
    'base_unit_id', p.base_unit_id,
    'description', p.description,
    'hsn_code', p.hsn_code,
    'gst_rate', p.gst_rate,
    'created_at', p.created_at
  )
  into v_result
  from products p
  where p.id = v_product_id;

  return json_build_object(
    'success', true,
    'data', v_result
  );

exception
  when others then
    raise exception 'PRODUCT_CREATE_FAILED: %', SQLERRM;
end;
$$;

create or replace function set_default_variant(
  p_variant_id uuid,
  p_client_id uuid
)
returns json
language plpgsql
as $$
declare
  v_product_id uuid;
begin

  -- STEP 1: Fetch variant safely
  select product_id
  into v_product_id
  from product_variants
  where id = p_variant_id
    and client_id = p_client_id;

  if not found then
    raise exception 'NOT_FOUND';
  end if;

  -- STEP 2: Clear existing default
  update product_variants
  set is_default = false,
      updated_at = now()
  where product_id = v_product_id
    and client_id = p_client_id;

  -- STEP 3: Set new default
  update product_variants
  set is_default = true,
      updated_at = now()
  where id = p_variant_id
    and client_id = p_client_id;

  -- STEP 4: Return success
  return json_build_object(
    'success', true,
    'variant_id', p_variant_id,
    'product_id', v_product_id
  );

end;
$$;

create or replace function soft_delete_product_with_variants(
    p_product_id uuid,
    p_client_id uuid,
    p_reason text,
    p_requested_by uuid
)
returns json
language plpgsql
as $$
declare
    v_variant_count int;
    v_inventory_exists int;
begin

    -- =========================================
    -- 1. VALIDATE PRODUCT
    -- =========================================

    if not exists (
        select 1
        from products
        where id = p_product_id
          and client_id = p_client_id
          and status != 'deleted'
    ) then
        raise exception 'NOT_FOUND';
    end if;

    -- =========================================
    -- 2. INVENTORY LINEAGE CHECK
    -- =========================================

    select count(*)
    into v_inventory_exists
    from inventory_transactions it
    join product_variants pv
      on pv.id = it.variant_id
    where pv.product_id = p_product_id
      and pv.client_id = p_client_id
    limit 1;

    if v_inventory_exists > 0 then
        raise exception 'PRODUCT_HAS_INVENTORY_HISTORY';
    end if;

    -- =========================================
    -- 3. COUNT ACTIVE VARIANTS
    -- =========================================

    select count(*)
    into v_variant_count
    from product_variants
    where product_id = p_product_id
      and client_id = p_client_id
      and is_active = true;

    -- =========================================
    -- 4. SOFT DELETE VARIANTS
    -- =========================================

    update product_variants
    set
        is_active = false,
        updated_at = now()
    where product_id = p_product_id
      and client_id = p_client_id;

    -- =========================================
    -- 5. SOFT DELETE PRODUCT
    -- =========================================

    update products
    set
        status = 'deleted',
        updated_at = now()
    where id = p_product_id
      and client_id = p_client_id;

    -- =========================================
    -- 6. AUDIT LOG
    -- =========================================

    insert into audit_logs (
        client_id,
        user_id,
        module,
        action,
        entity_id,
        metadata,
        created_at
    )
    values (
        p_client_id,
        p_requested_by,
        'products',
        'soft_delete',
        p_product_id,
        jsonb_build_object(
            'reason', p_reason,
            'variants_deactivated', v_variant_count
        ),
        now()
    );

    -- =========================================
    -- 7. RESPONSE
    -- =========================================

    return json_build_object(
        'success', true,
        'product_id', p_product_id,
        'variants_deactivated', v_variant_count,
        'inventory_safe', true
    );

exception
    when others then
        return json_build_object(
            'success', false,
            'error', sqlerrm
        );
end;
$$;

-- -----------------------------------------
-- BLOCK UPDATE
-- -----------------------------------------

create or replace function prevent_inventory_transaction_update()
returns trigger
language plpgsql
as $$
begin
    raise exception 'INVENTORY_TRANSACTIONS_ARE_IMMUTABLE';
end;
$$;

create trigger trg_prevent_inventory_transaction_update
before update on inventory_transactions
for each row
execute function prevent_inventory_transaction_update();

-- -----------------------------------------
-- BLOCK DELETE
-- -----------------------------------------

create or replace function prevent_inventory_transaction_delete()
returns trigger
language plpgsql
as $$
begin
    raise exception 'INVENTORY_TRANSACTIONS_CANNOT_BE_DELETED';
end;
$$;

create trigger trg_prevent_inventory_transaction_delete
before delete on inventory_transactions
for each row
execute function prevent_inventory_transaction_delete();

create or replace function create_inventory_transaction(
    p_client_id uuid,
    p_branch_id uuid,
    p_variant_id uuid,
    p_transaction_type text,
    p_quantity numeric,
    p_unit_cost numeric default null,
    p_reference_type text default null,
    p_reference_id uuid default null,
    p_created_by uuid default null,
    p_inventory_transaction_group_id uuid default gen_random_uuid(),
    p_parent_transaction_id uuid default null,
    p_transaction_sequence integer default 1,
    p_remarks text default null,
    p_metadata jsonb default '{}'::jsonb
)
returns json
language plpgsql
as $$
declare

    ----------------------------------------------------
    -- STOCK VARIABLES
    ----------------------------------------------------
    v_delta numeric := 0;
    v_current_stock numeric := 0;
    v_resulting_stock numeric := 0;

    ----------------------------------------------------
    -- POLICY VARIABLES
    ----------------------------------------------------
    v_negative_stock_policy text := 'block';

begin

    ----------------------------------------------------
    -- 1. BASIC VALIDATION
    ----------------------------------------------------

    if p_quantity is null or p_quantity <= 0 then
        raise exception 'INVALID_QUANTITY';
    end if;

    ----------------------------------------------------
    -- 2. VALIDATE VARIANT
    ----------------------------------------------------

    if not exists (
        select 1
        from product_variants
        where id = p_variant_id
          and client_id = p_client_id
          and is_active = true
    ) then
        raise exception 'VARIANT_NOT_FOUND';
    end if;

	----------------------------------------------------
	-- 3. RESOLVE DELTA
	----------------------------------------------------

	v_delta := get_inventory_transaction_delta(
		p_transaction_type,
		p_quantity
	);
    ----------------------------------------------------
    -- 4. ENSURE SNAPSHOT ROW EXISTS
    ----------------------------------------------------

    insert into inventory_snapshots (
        client_id,
        branch_id,
        variant_id,
        quantity,
        created_at,
        updated_at
    )
    values (
        p_client_id,
        p_branch_id,
        p_variant_id,
        0,
        now(),
        now()
    )
    on conflict (client_id, branch_id, variant_id)
    do nothing;

    ----------------------------------------------------
    -- 5. LOCK SNAPSHOT ROW
    ----------------------------------------------------

    select quantity
    into v_current_stock
    from inventory_snapshots
    where client_id = p_client_id
      and branch_id = p_branch_id
      and variant_id = p_variant_id
    for update;


    ----------------------------------------------------
    -- 6. SNAPSHOT LOCK VALIDATION
    ----------------------------------------------------

    if not found then
        raise exception 'SNAPSHOT_LOCK_FAILED';
    end if;

    ----------------------------------------------------
    -- 7. RESOLVE RESULTING STOCK
    ----------------------------------------------------

    v_resulting_stock := v_current_stock + v_delta;

    ----------------------------------------------------
    -- 8. LOAD NEGATIVE STOCK POLICY
    ----------------------------------------------------

    select negative_stock_policy
    into v_negative_stock_policy
    from tenant_inventory_policies
    where client_id = p_client_id
      and (
            branch_id = p_branch_id
            or branch_id is null
      )
      and is_active = true
    order by
        case
            when branch_id = p_branch_id then 1
            else 2
        end
    limit 1;

    ----------------------------------------------------
    -- 9. DEFAULT POLICY
    ----------------------------------------------------

    if v_negative_stock_policy is null then
        v_negative_stock_policy := 'block';
    end if;

    ----------------------------------------------------
    -- 10. VALIDATE POLICY VALUE
    ----------------------------------------------------

    if v_negative_stock_policy not in ('block', 'allow') then
        raise exception 'INVALID_NEGATIVE_STOCK_POLICY';
    end if;

    ----------------------------------------------------
    -- 11. ENFORCE NEGATIVE STOCK POLICY
    ----------------------------------------------------

    if v_negative_stock_policy = 'block'
       and v_resulting_stock < 0 then

        raise exception 'NEGATIVE_STOCK_NOT_ALLOWED';

    end if;

    ----------------------------------------------------
    -- 12. INSERT IMMUTABLE LEDGER ENTRY
    ----------------------------------------------------

    insert into inventory_transactions (
        id,
        client_id,
        branch_id,
        variant_id,
        inventory_transaction_group_id,
        parent_transaction_id,
        transaction_sequence,
        transaction_type,
        quantity,
        unit_cost,
        reference_type,
        reference_id,
        created_by,
        remarks,
        metadata,
        created_at
    )
    values (
        gen_random_uuid(),
        p_client_id,
        p_branch_id,
        p_variant_id,
        p_inventory_transaction_group_id,
        p_parent_transaction_id,
        p_transaction_sequence,
        p_transaction_type,
        p_quantity,
        p_unit_cost,
        p_reference_type,
        p_reference_id,
        p_created_by,
        p_remarks,
        p_metadata,
        now()
    );

    ----------------------------------------------------
    -- 13. UPDATE LOCKED SNAPSHOT
    ----------------------------------------------------

    update inventory_snapshots
    set
        quantity = v_resulting_stock,
        updated_at = now()
    where client_id = p_client_id
      and branch_id = p_branch_id
      and variant_id = p_variant_id;

    ----------------------------------------------------
    -- 14. AUDIT LOG
    ----------------------------------------------------

    insert into audit_logs (
        client_id,
        branch_id,
        user_id,
        module,
        action,
        entity_id,
        metadata,
        created_at
    )
    values (
        p_client_id,
        p_branch_id,
        p_created_by,
        'inventory',
        'inventory_transaction_create',
        p_variant_id,

        jsonb_build_object(

            'transaction_type', p_transaction_type,

            'transaction_group_id',
            p_inventory_transaction_group_id,

            'parent_transaction_id',
            p_parent_transaction_id,

            'transaction_sequence',
            p_transaction_sequence,

            'quantity', p_quantity,

            'applied_delta', v_delta,

            'previous_stock', v_current_stock,

            'current_stock', v_resulting_stock,

            'negative_stock_policy',
            v_negative_stock_policy,

            'reference_type', p_reference_type,

            'reference_id', p_reference_id,

            'remarks', p_remarks,

            'metadata', p_metadata

        ),

        now()
    );
    ----------------------------------------------------
    -- 15. RETURN RESPONSE
    ----------------------------------------------------

    return json_build_object(
        'success', true,
        'transaction_group_id', p_inventory_transaction_group_id,
        'variant_id', p_variant_id,
        'transaction_type', p_transaction_type,
        'quantity', p_quantity,
        'applied_delta', v_delta,
        'previous_stock', v_current_stock,
        'current_stock', v_resulting_stock,
        'negative_stock_policy', v_negative_stock_policy
    );

end;
$$;

create or replace function rebuild_inventory_snapshot(
    p_client_id uuid,
    p_branch_id uuid default null,
    p_variant_id uuid default null
)
returns json
language plpgsql
as $$
declare
    rec record;
    v_delta numeric := 0;
	v_lock_key bigint;
begin

    ----------------------------------------------------
    -- ACQUIRE REBUILD LOCK
    ----------------------------------------------------

    v_lock_key := hashtextextended(

        concat_ws(
            ':',
            'inventory_rebuild',
            p_client_id::text,
            coalesce(p_branch_id::text, 'all_branches'),
            coalesce(p_variant_id::text, 'all_variants')
        ),

        0
    );

    perform pg_advisory_xact_lock(v_lock_key);
	
    ----------------------------------------------------
    -- 1. WIPE SNAPSHOT SCOPE
    ----------------------------------------------------
    delete from inventory_snapshots
    where client_id = p_client_id
      and (p_branch_id is null or branch_id = p_branch_id)
      and (p_variant_id is null or variant_id = p_variant_id);

    ----------------------------------------------------
    -- 2. REPLAY LEDGER IN ORDER
    ----------------------------------------------------
    for rec in
        select *
        from inventory_transactions
        where client_id = p_client_id
          and (p_branch_id is null or branch_id = p_branch_id)
          and (p_variant_id is null or variant_id = p_variant_id)
        order by
            client_id,
            branch_id,
            variant_id,
            inventory_transaction_group_id,
            transaction_sequence,
            created_at,
            id
    loop

		------------------------------------------------
		-- 3. RESOLVE DELTA
		------------------------------------------------

		v_delta := get_inventory_transaction_delta(
			rec.transaction_type,
			rec.quantity
		);
        ------------------------------------------------
        -- 4. UPSERT SNAPSHOT (RECONSTRUCTION)
        ------------------------------------------------
        insert into inventory_snapshots (
            client_id,
            branch_id,
            variant_id,
            quantity,
            updated_at
        )
        values (
            rec.client_id,
            rec.branch_id,
            rec.variant_id,
            v_delta,
            now()
        )
        on conflict (client_id, branch_id, variant_id)
        do update set
            quantity = inventory_snapshots.quantity + excluded.quantity,
            updated_at = now();

    end loop;

    ----------------------------------------------------
    -- 5. RETURN SUMMARY
    ----------------------------------------------------
    return json_build_object(
        'success', true,
        'client_id', p_client_id,
        'branch_id', p_branch_id,
        'variant_id', p_variant_id,
        'mode', 'deterministic_rebuild_completed'
    );

end;
$$;

create or replace function get_inventory_transaction_delta(
    p_transaction_type text,
    p_quantity numeric
)
returns numeric
language plpgsql
as $$
declare
    v_delta numeric := 0;
begin

    ----------------------------------------------------
    -- BASIC VALIDATION
    ----------------------------------------------------

    if p_quantity is null then
        raise exception 'QUANTITY_REQUIRED';
    end if;

    ----------------------------------------------------
    -- DELTA MAPPING
    ----------------------------------------------------

    case p_transaction_type

        when 'purchase' then
            v_delta := p_quantity;

        when 'sale' then
            v_delta := -p_quantity;

        when 'transfer_in' then
            v_delta := p_quantity;

        when 'transfer_out' then
            v_delta := -p_quantity;

        when 'return_in' then
            v_delta := p_quantity;

        when 'damage' then
            v_delta := -p_quantity;

        when 'adjustment' then
            v_delta := p_quantity;

        when 'opening_balance' then
            v_delta := p_quantity;

        else
            raise exception
            'INVALID_TRANSACTION_TYPE: %',
            p_transaction_type;

    end case;

    return v_delta;

end;
$$;
create or replace function validate_inventory_snapshot_drift(
    p_client_id uuid,
    p_branch_id uuid default null,
    p_variant_id uuid default null
)
returns json
language plpgsql
as $$
declare

    v_drift_count integer := 0;

begin

    ----------------------------------------------------
    -- COMPARE LEDGER VS SNAPSHOT
    ----------------------------------------------------

    with ledger_stock as (

        select
            it.client_id,
            it.branch_id,
            it.variant_id,

            sum(
                get_inventory_transaction_delta(
                    it.transaction_type,
                    it.quantity
                )
            ) as calculated_quantity

        from inventory_transactions it

        where it.client_id = p_client_id
          and (
                p_branch_id is null
                or it.branch_id = p_branch_id
          )
          and (
                p_variant_id is null
                or it.variant_id = p_variant_id
          )

        group by
            it.client_id,
            it.branch_id,
            it.variant_id

    ),

    snapshot_stock as (

        select
            s.client_id,
            s.branch_id,
            s.variant_id,
            s.quantity as snapshot_quantity

        from inventory_snapshots s

        where s.client_id = p_client_id
          and (
                p_branch_id is null
                or s.branch_id = p_branch_id
          )
          and (
                p_variant_id is null
                or s.variant_id = p_variant_id
          )

    ),

    drift_rows as (

        select

            coalesce(l.client_id, s.client_id) as client_id,
            coalesce(l.branch_id, s.branch_id) as branch_id,
            coalesce(l.variant_id, s.variant_id) as variant_id,

            coalesce(l.calculated_quantity, 0) as ledger_quantity,
            coalesce(s.snapshot_quantity, 0) as snapshot_quantity,

            (
                coalesce(l.calculated_quantity, 0)
                -
                coalesce(s.snapshot_quantity, 0)
            ) as drift_quantity

        from ledger_stock l

        full outer join snapshot_stock s
          on l.client_id = s.client_id
         and l.branch_id = s.branch_id
         and l.variant_id = s.variant_id

        where
            coalesce(l.calculated_quantity, 0)
            !=
            coalesce(s.snapshot_quantity, 0)

    )

    select count(*)
    into v_drift_count
    from drift_rows;

    ----------------------------------------------------
    -- RETURN RESULT
    ----------------------------------------------------

    return json_build_object(

        'success', true,

        'has_drift',
        case
            when v_drift_count > 0 then true
            else false
        end,

        'drift_count', v_drift_count,

        'scope', json_build_object(
            'client_id', p_client_id,
            'branch_id', p_branch_id,
            'variant_id', p_variant_id
        )

    );

end;
$$;