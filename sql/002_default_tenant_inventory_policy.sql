insert into public.tenant_inventory_policies (
  client_id,
  branch_id,
  negative_stock_policy
)
select
  id,
  null,
  'block'
from public.clients;