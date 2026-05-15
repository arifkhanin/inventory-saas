-- ==================================================
-- SEED: PERMISSION DEFINITIONS (FIXED VERSION)
-- IMPORTANT: "code" is GENERATED COLUMN → DO NOT INSERT
-- ==================================================

-- -----------------------
-- UNITS
-- -----------------------
insert into public.permission_definitions (
  module_code,
  action_code,
  label,
  sort_order,
  is_active
) values
('units','view','View Units',1,true),
('units','add','Create Units',2,true),
('units','update','Update Units',3,true),
('units','delete','Delete Units',4,true)
on conflict (module_code, action_code) do nothing;

-- -----------------------
-- CATEGORIES
-- -----------------------
insert into public.permission_definitions (
  module_code,
  action_code,
  label,
  sort_order,
  is_active
) values
('categories','view','View Categories',1,true),
('categories','add','Create Categories',2,true),
('categories','update','Update Categories',3,true),
('categories','delete','Delete Categories',4,true)
on conflict (module_code, action_code) do nothing;

-- -----------------------
-- PRODUCTS
-- -----------------------
insert into public.permission_definitions (
  module_code,
  action_code,
  label,
  sort_order,
  is_active
) values
('products','view','View Products',1,true),
('products','add','Create Products',2,true),
('products','update','Update Products',3,true),
('products','archive','Archive Products',4,true),
('products','restore','Restore Products',5,true),
('products','delete','Delete Products',6,true)
on conflict (module_code, action_code) do nothing;

-- -----------------------
-- VARIANTS
-- -----------------------
insert into public.permission_definitions (
  module_code,
  action_code,
  label,
  sort_order,
  is_active
) values
('variants','view','View Variants',1,true),
('variants','add','Create Variants',2,true),
('variants','update','Update Variants',3,true),
('variants','set_default','Set Default Variants',4,true),
('variants','delete','Delete Variants',5,true)
on conflict (module_code, action_code) do nothing;

-- -----------------------
-- INVENTORY
-- -----------------------
insert into public.permission_definitions (
  module_code,
  action_code,
  label,
  sort_order,
  is_active
) values
('inventory','view','View Inventory',1,true),
('inventory','adjust','Adjust Inventory',2,true),
('inventory','rebuild','Rebuild Inventory',3,true),
('inventory','validate','Validate Inventory',4,true)
on conflict (module_code, action_code) do nothing;

-- -----------------------
-- ADMIN
-- -----------------------
insert into public.permission_definitions (
  module_code,
  action_code,
  label,
  sort_order,
  is_active
) values
('admin','create_user','Create User',1,true)
on conflict (module_code, action_code) do nothing;