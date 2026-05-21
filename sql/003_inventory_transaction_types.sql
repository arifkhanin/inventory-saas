insert into inventory_transaction_types (

    transaction_code,
    label,
    description,

    affects_stock,
    stock_effect,

    governance_type,

    is_reversal,

    is_reversible,
    requires_reference,
    affects_valuation,

    system_reserved,
    is_active,

    sort_order,
    metadata,

    created_at,
    updated_at

)

values

-- =========================================================
-- PURCHASE
-- =========================================================

(
    'purchase',
    'Purchase',

    'Inbound inventory received from supplier purchasing operations.',

    true,
    'in',

    'operational',

    false,

    true,
    true,
    true,

    true,
    true,

    10,
    '{}'::jsonb,

    now(),
    now()
),

-- =========================================================
-- SALE
-- =========================================================

(
    'sale',
    'Sale',

    'Outbound inventory issued through customer sales operations.',

    true,
    'out',

    'operational',

    false,

    true,
    true,
    true,

    true,
    true,

    20,
    '{}'::jsonb,

    now(),
    now()
),

-- =========================================================
-- TRANSFER IN
-- =========================================================

(
    'transfer_in',
    'Transfer In',

    'Inbound inventory received from another branch or warehouse.',

    true,
    'in',

    'operational',

    false,

    false,
    true,
    true,

    true,
    true,

    30,
    '{}'::jsonb,

    now(),
    now()
),

-- =========================================================
-- TRANSFER OUT
-- =========================================================

(
    'transfer_out',
    'Transfer Out',

    'Outbound inventory transferred to another branch or warehouse.',

    true,
    'out',

    'operational',

    false,

    false,
    true,
    true,

    true,
    true,

    40,
    '{}'::jsonb,

    now(),
    now()
),

-- =========================================================
-- RETURN IN
-- =========================================================

(
    'return_in',
    'Return In',

    'Inventory returned back into stock from customer or operational return flow.',

    true,
    'in',

    'operational',

    false,

    true,
    true,
    true,

    true,
    true,

    50,
    '{}'::jsonb,

    now(),
    now()
),

-- =========================================================
-- RETURN OUT
-- =========================================================

(
    'return_out',
    'Return Out',

    'Inventory returned outward to supplier or external operational flow.',

    true,
    'out',

    'operational',

    false,

    true,
    true,
    true,

    true,
    true,

    60,
    '{}'::jsonb,

    now(),
    now()
),

-- =========================================================
-- DAMAGE
-- =========================================================

(
    'damage',
    'Damage',

    'Inventory reduction caused by damaged, expired, or unusable stock.',

    true,
    'out',

    'correction',

    false,

    false,
    false,
    true,

    true,
    true,

    70,
    '{}'::jsonb,

    now(),
    now()
),

-- =========================================================
-- ADJUSTMENT POSITIVE
-- =========================================================

(
    'adjustment_positive',
    'Adjustment Positive',

    'Manual positive stock correction applied during reconciliation or operational adjustment.',

    true,
    'in',

    'correction',

    false,

    true,
    false,
    true,

    true,
    true,

    80,
    '{}'::jsonb,

    now(),
    now()
),

-- =========================================================
-- ADJUSTMENT NEGATIVE
-- =========================================================

(
    'adjustment_negative',
    'Adjustment Negative',

    'Manual negative stock correction applied during reconciliation or operational adjustment.',

    true,
    'out',

    'correction',

    false,

    true,
    false,
    true,

    true,
    true,

    90,
    '{}'::jsonb,

    now(),
    now()
),

-- =========================================================
-- OPENING BALANCE
-- =========================================================

(
    'opening_balance',
    'Opening Balance',

    'Inventory baseline initialization during implementation or controlled financial opening.',

    true,
    'in',

    'initialization',

    false,

    false,
    false,
    true,

    true,
    true,

    100,

    jsonb_build_object(
        'requires_governance', true,
        'restricted_operation', true,
        'intended_usage', 'implementation_or_period_opening_only'
    ),

    now(),
    now()
),

-- =========================================================
-- PRODUCTION CONSUMPTION
-- =========================================================

(
    'production_consumption',
    'Production Consumption',

    'Raw material inventory consumed during manufacturing or production operations.',

    true,
    'out',

    'operational',

    false,

    false,
    true,
    true,

    true,
    true,

    110,
    '{}'::jsonb,

    now(),
    now()
),

-- =========================================================
-- PRODUCTION OUTPUT
-- =========================================================

(
    'production_output',
    'Production Output',

    'Finished goods inventory produced through manufacturing operations.',

    true,
    'in',

    'operational',

    false,

    false,
    true,
    true,

    true,
    true,

    120,
    '{}'::jsonb,

    now(),
    now()
),

-- =========================================================
-- REVERSAL POSITIVE
-- =========================================================

(
    'reversal_positive',
    'Reversal Positive',

    'System-generated compensating inbound transaction used to reverse a prior outbound inventory movement.',

    true,
    'in',

    'correction',

    true,

    false,
    true,
    true,

    true,
    true,

    130,

    jsonb_build_object(
        'system_generated', true
    ),

    now(),
    now()
),

-- =========================================================
-- REVERSAL NEGATIVE
-- =========================================================

(
    'reversal_negative',
    'Reversal Negative',

    'System-generated compensating outbound transaction used to reverse a prior inbound inventory movement.',

    true,
    'out',

    'correction',

    true,

    false,
    true,
    true,

    true,
    true,

    140,

    jsonb_build_object(
        'system_generated', true
    ),

    now(),
    now()
);