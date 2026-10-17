export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never;
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            graphql: { Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json }; Returns: Json };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    public: {
        Tables: {
            app_settings: {
                Row: {
                    demo: boolean;
                    id: boolean;
                };
                ComputedFields: never;
                Insert: {
                    demo?: boolean;
                    id?: boolean;
                };
                Update: {
                    demo?: boolean;
                    id?: boolean;
                };
                Relationships: [];
            };
            categories: {
                Row: {
                    active: boolean;
                    id: string;
                    name: string;
                    slug: string;
                };
                ComputedFields: never;
                Insert: {
                    active?: boolean;
                    id?: string;
                    name: string;
                    slug: string;
                };
                Update: {
                    active?: boolean;
                    id?: string;
                    name?: string;
                    slug?: string;
                };
                Relationships: [];
            };
            delivery_exceptions: {
                Row: {
                    date: string;
                    offered: boolean;
                    zone_id: string;
                };
                ComputedFields: never;
                Insert: {
                    date: string;
                    offered: boolean;
                    zone_id: string;
                };
                Update: {
                    date?: string;
                    offered?: boolean;
                    zone_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'delivery_exceptions_zone_id_fkey';
                        columns: ['zone_id'];
                        isOneToOne: false;
                        referencedRelation: 'delivery_zones';
                        referencedColumns: ['id'];
                    },
                ];
            };
            delivery_zones: {
                Row: {
                    active: boolean;
                    cutoff_days: number;
                    cutoff_time: string;
                    fee_cents: number;
                    guidance: string;
                    id: string;
                    name: string;
                    weekdays: number[];
                };
                ComputedFields: never;
                Insert: {
                    active?: boolean;
                    cutoff_days?: number;
                    cutoff_time?: string;
                    fee_cents: number;
                    guidance?: string;
                    id?: string;
                    name: string;
                    weekdays: number[];
                };
                Update: {
                    active?: boolean;
                    cutoff_days?: number;
                    cutoff_time?: string;
                    fee_cents?: number;
                    guidance?: string;
                    id?: string;
                    name?: string;
                    weekdays?: number[];
                };
                Relationships: [];
            };
            guest_tokens: {
                Row: {
                    consumed_at: string | null;
                    digest: string;
                    expires_at: string;
                    order_id: string;
                    purpose: string;
                    quote_id: string | null;
                    revoked_at: string | null;
                };
                ComputedFields: never;
                Insert: {
                    consumed_at?: string | null;
                    digest: string;
                    expires_at: string;
                    order_id: string;
                    purpose: string;
                    quote_id?: string | null;
                    revoked_at?: string | null;
                };
                Update: {
                    consumed_at?: string | null;
                    digest?: string;
                    expires_at?: string;
                    order_id?: string;
                    purpose?: string;
                    quote_id?: string | null;
                    revoked_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'guest_tokens_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'orders';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'guest_tokens_quote_id_fkey';
                        columns: ['quote_id'];
                        isOneToOne: false;
                        referencedRelation: 'quotations';
                        referencedColumns: ['id'];
                    },
                ];
            };
            inventory_items: {
                Row: {
                    id: string;
                    name: string;
                    on_hand_g: number;
                    reserved_g: number;
                    target_g: number;
                    threshold_percent: number;
                };
                ComputedFields: never;
                Insert: {
                    id?: string;
                    name: string;
                    on_hand_g?: number;
                    reserved_g?: number;
                    target_g?: number;
                    threshold_percent?: number;
                };
                Update: {
                    id?: string;
                    name?: string;
                    on_hand_g?: number;
                    reserved_g?: number;
                    target_g?: number;
                    threshold_percent?: number;
                };
                Relationships: [];
            };
            inventory_movements: {
                Row: {
                    actor: string | null;
                    created_at: string;
                    id: string;
                    kind: string;
                    on_hand_delta: number;
                    operation_key: string;
                    order_id: string | null;
                    reason: string;
                    reserved_delta: number;
                    stock_id: string;
                };
                ComputedFields: never;
                Insert: {
                    actor?: string | null;
                    created_at?: string;
                    id?: string;
                    kind: string;
                    on_hand_delta: number;
                    operation_key: string;
                    order_id?: string | null;
                    reason: string;
                    reserved_delta: number;
                    stock_id: string;
                };
                Update: {
                    actor?: string | null;
                    created_at?: string;
                    id?: string;
                    kind?: string;
                    on_hand_delta?: number;
                    operation_key?: string;
                    order_id?: string | null;
                    reason?: string;
                    reserved_delta?: number;
                    stock_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'inventory_movements_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'orders';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'inventory_movements_stock_id_fkey';
                        columns: ['stock_id'];
                        isOneToOne: false;
                        referencedRelation: 'inventory_items';
                        referencedColumns: ['id'];
                    },
                ];
            };
            inventory_reservations: {
                Row: {
                    grams: number;
                    order_id: string;
                    quote_id: string;
                    state: string;
                    stock_id: string;
                };
                ComputedFields: never;
                Insert: {
                    grams: number;
                    order_id: string;
                    quote_id: string;
                    state: string;
                    stock_id: string;
                };
                Update: {
                    grams?: number;
                    order_id?: string;
                    quote_id?: string;
                    state?: string;
                    stock_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'inventory_reservations_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'orders';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'inventory_reservations_quote_id_fkey';
                        columns: ['quote_id'];
                        isOneToOne: false;
                        referencedRelation: 'quotations';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'inventory_reservations_stock_id_fkey';
                        columns: ['stock_id'];
                        isOneToOne: false;
                        referencedRelation: 'inventory_items';
                        referencedColumns: ['id'];
                    },
                ];
            };
            operation_receipts: {
                Row: {
                    input_digest: string;
                    kind: string;
                    operation_key: string;
                };
                ComputedFields: never;
                Insert: {
                    input_digest: string;
                    kind: string;
                    operation_key: string;
                };
                Update: {
                    input_digest?: string;
                    kind?: string;
                    operation_key?: string;
                };
                Relationships: [];
            };
            order_events: {
                Row: {
                    actor: string | null;
                    created_at: string;
                    id: string;
                    kind: string;
                    note: string;
                    order_id: string;
                };
                ComputedFields: never;
                Insert: {
                    actor?: string | null;
                    created_at?: string;
                    id?: string;
                    kind: string;
                    note?: string;
                    order_id: string;
                };
                Update: {
                    actor?: string | null;
                    created_at?: string;
                    id?: string;
                    kind?: string;
                    note?: string;
                    order_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'order_events_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'orders';
                        referencedColumns: ['id'];
                    },
                ];
            };
            orders: {
                Row: {
                    created_at: string;
                    estimate: NonNullable<Json>;
                    id: string;
                    latest_version: number;
                    origin: string;
                    payment_status: string;
                    reference: string;
                    request: NonNullable<Json>;
                    request_digest: string;
                    request_key: string;
                    status: string;
                };
                ComputedFields: never;
                Insert: {
                    created_at?: string;
                    estimate: NonNullable<Json>;
                    id?: string;
                    latest_version?: number;
                    origin: string;
                    payment_status?: string;
                    reference?: string;
                    request: NonNullable<Json>;
                    request_digest: string;
                    request_key: string;
                    status?: string;
                };
                Update: {
                    created_at?: string;
                    estimate?: NonNullable<Json>;
                    id?: string;
                    latest_version?: number;
                    origin?: string;
                    payment_status?: string;
                    reference?: string;
                    request?: NonNullable<Json>;
                    request_digest?: string;
                    request_key?: string;
                    status?: string;
                };
                Relationships: [];
            };
            payment_records: {
                Row: {
                    actor: string | null;
                    created_at: string;
                    id: string;
                    operation_key: string;
                    order_id: string;
                    reference: string;
                    status: string;
                };
                ComputedFields: never;
                Insert: {
                    actor?: string | null;
                    created_at?: string;
                    id?: string;
                    operation_key: string;
                    order_id: string;
                    reference: string;
                    status: string;
                };
                Update: {
                    actor?: string | null;
                    created_at?: string;
                    id?: string;
                    operation_key?: string;
                    order_id?: string;
                    reference?: string;
                    status?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'payment_records_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'orders';
                        referencedColumns: ['id'];
                    },
                ];
            };
            payment_settings: {
                Row: {
                    enabled: boolean;
                    instructions: string;
                    method: string;
                };
                ComputedFields: never;
                Insert: {
                    enabled?: boolean;
                    instructions?: string;
                    method: string;
                };
                Update: {
                    enabled?: boolean;
                    instructions?: string;
                    method?: string;
                };
                Relationships: [];
            };
            products: {
                Row: {
                    active: boolean;
                    allow_remainder: boolean;
                    category_id: string;
                    cuts: string[];
                    description: string;
                    fixed_packs: NonNullable<Json>;
                    id: string;
                    min_g: number;
                    name: string;
                    pack_sizes_g: number[];
                    price_cents: number;
                    slug: string;
                    step_g: number;
                    stock_id: string;
                };
                ComputedFields: never;
                Insert: {
                    active?: boolean;
                    allow_remainder?: boolean;
                    category_id: string;
                    cuts: string[];
                    description?: string;
                    fixed_packs?: NonNullable<Json>;
                    id?: string;
                    min_g: number;
                    name: string;
                    pack_sizes_g: number[];
                    price_cents: number;
                    slug: string;
                    step_g: number;
                    stock_id: string;
                };
                Update: {
                    active?: boolean;
                    allow_remainder?: boolean;
                    category_id?: string;
                    cuts?: string[];
                    description?: string;
                    fixed_packs?: NonNullable<Json>;
                    id?: string;
                    min_g?: number;
                    name?: string;
                    pack_sizes_g?: number[];
                    price_cents?: number;
                    slug?: string;
                    step_g?: number;
                    stock_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'products_category_id_fkey';
                        columns: ['category_id'];
                        isOneToOne: false;
                        referencedRelation: 'categories';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'products_stock_id_fkey';
                        columns: ['stock_id'];
                        isOneToOne: false;
                        referencedRelation: 'inventory_items';
                        referencedColumns: ['id'];
                    },
                ];
            };
            quotation_approvals: {
                Row: {
                    approved_at: string;
                    order_id: string;
                    quote_id: string;
                };
                ComputedFields: never;
                Insert: {
                    approved_at?: string;
                    order_id: string;
                    quote_id: string;
                };
                Update: {
                    approved_at?: string;
                    order_id?: string;
                    quote_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'quotation_approvals_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'orders';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'quotation_approvals_quote_id_fkey';
                        columns: ['quote_id'];
                        isOneToOne: true;
                        referencedRelation: 'quotations';
                        referencedColumns: ['id'];
                    },
                ];
            };
            quotations: {
                Row: {
                    approved_at: string | null;
                    date: string;
                    expires_at: string;
                    id: string;
                    input_digest: string;
                    issued_at: string;
                    note: string;
                    operation_key: string;
                    order_id: string;
                    snapshot: NonNullable<Json>;
                    status: string;
                    version: number;
                    zone_id: string;
                };
                ComputedFields: never;
                Insert: {
                    approved_at?: string | null;
                    date: string;
                    expires_at: string;
                    id?: string;
                    input_digest: string;
                    issued_at?: string;
                    note?: string;
                    operation_key: string;
                    order_id: string;
                    snapshot: NonNullable<Json>;
                    status?: string;
                    version: number;
                    zone_id: string;
                };
                Update: {
                    approved_at?: string | null;
                    date?: string;
                    expires_at?: string;
                    id?: string;
                    input_digest?: string;
                    issued_at?: string;
                    note?: string;
                    operation_key?: string;
                    order_id?: string;
                    snapshot?: NonNullable<Json>;
                    status?: string;
                    version?: number;
                    zone_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'quotations_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'orders';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'quotations_zone_id_fkey';
                        columns: ['zone_id'];
                        isOneToOne: false;
                        referencedRelation: 'delivery_zones';
                        referencedColumns: ['id'];
                    },
                ];
            };
            rate_buckets: {
                Row: {
                    bucket: string;
                    expires_at: string;
                    hits: number;
                };
                ComputedFields: never;
                Insert: {
                    bucket: string;
                    expires_at: string;
                    hits: number;
                };
                Update: {
                    bucket?: string;
                    expires_at?: string;
                    hits?: number;
                };
                Relationships: [];
            };
            vendor_admins: {
                Row: {
                    user_id: string;
                };
                ComputedFields: never;
                Insert: {
                    user_id: string;
                };
                Update: {
                    user_id?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            add_order_note: { Args: { p_note: string; p_order: string }; Returns: undefined };
            adjust_stock: { Args: { p: Json }; Returns: Json };
            approve_quote: { Args: { p_token: string }; Returns: Json };
            calculate_estimate: { Args: { p_date: string; p_items: Json; p_zone: string }; Returns: Json };
            catalog_data: { Args: { p_vendor?: boolean }; Returns: Json };
            claim_operation: { Args: { p: Json; p_key: string; p_kind: string }; Returns: boolean };
            create_request: { Args: { p: Json; p_origin?: string; p_status_digest: string }; Returns: Json };
            date_available: { Args: { d: string; z: string }; Returns: boolean };
            guest_order: { Args: { p_token: string }; Returns: Json };
            is_vendor: { Args: Record<PropertyKey, never>; Returns: boolean };
            issue_quote: { Args: { p: Json; p_token_digest: string }; Returns: Json };
            order_view: { Args: { p_order: string }; Returns: Json };
            rate_limit: { Args: { p_bucket: string; p_limit: number }; Returns: boolean };
            record_payment: { Args: { p: Json }; Returns: Json };
            report_payment: { Args: { p_reference: string; p_token: string }; Returns: Json };
            require_vendor: { Args: Record<PropertyKey, never>; Returns: undefined };
            resolve_guest: {
                Args: { p_purpose?: string; p_token: string };
                Returns: {
                    consumed_at: string | null;
                    digest: string;
                    expires_at: string;
                    order_id: string;
                    purpose: string;
                    quote_id: string | null;
                    revoked_at: string | null;
                };
                SetofOptions: {
                    from: '*';
                    to: 'guest_tokens';
                    isOneToOne: true;
                    isSetofReturn: false;
                };
            };
            save_category: { Args: { p: Json }; Returns: undefined };
            save_exception: { Args: { p_date: string; p_offered: boolean; p_zone: string }; Returns: undefined };
            save_payment_setting: { Args: { p: Json }; Returns: undefined };
            save_product: { Args: { p: Json }; Returns: undefined };
            save_zone: { Args: { p: Json }; Returns: undefined };
            transition_order: { Args: { p: Json }; Returns: Json };
            vendor_data: { Args: Record<PropertyKey, never>; Returns: Json };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        keyof (DefaultSchema['Tables'] & DefaultSchema['Views']) | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
      ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
    EnumName extends (DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
        : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
      ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
        : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
      ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    graphql_public: {
        Enums: {},
    },
    public: {
        Enums: {},
    },
} as const;
