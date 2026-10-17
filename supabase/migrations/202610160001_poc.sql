-- Single vendor POC. All grants are explicit; private state is never public data.
create extension if not exists pgcrypto with schema extensions;
create table public.vendor_admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table public.app_settings (id boolean primary key default true check(id), demo boolean not null default true);
insert into public.app_settings values(true,true);
create table public.categories (id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 2 and 60), slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), active boolean not null default true);
create table public.inventory_items (
 id uuid primary key default gen_random_uuid(), name text not null,
 on_hand_g bigint not null default 0 check(on_hand_g between 0 and 100000000),
 reserved_g bigint not null default 0 check(reserved_g >= 0 and reserved_g <= on_hand_g),
 target_g bigint not null default 50000 check(target_g between 1 and 1000000),
 threshold_percent integer not null default 10 check(threshold_percent between 1 and 100)
);
create table public.products (
 id uuid primary key default gen_random_uuid(), category_id uuid not null references public.categories,
 stock_id uuid not null references public.inventory_items, slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null check(length(name) between 2 and 100), description text not null default '' check(length(description)<=600),
 price_cents bigint not null check(price_cents between 0 and 100000000),
 min_g integer not null check(min_g between 1 and 1000000), step_g integer not null check(step_g between 1 and 1000000),
 cuts text[] not null check(cardinality(cuts) between 1 and 12), pack_sizes_g integer[] not null check(cardinality(pack_sizes_g) between 1 and 12 and 0 < all(pack_sizes_g)),
 allow_remainder boolean not null default false, fixed_packs jsonb not null default '[]' check(jsonb_typeof(fixed_packs)='array'),
 active boolean not null default true
);
create index on public.products(category_id); create index on public.products(stock_id);
create table public.delivery_zones (
 id uuid primary key default gen_random_uuid(), name text not null unique,
 fee_cents bigint not null check(fee_cents between 0 and 100000000), weekdays integer[] not null check(0<=all(weekdays) and 6>=all(weekdays)),
 cutoff_time time not null default '16:00', cutoff_days integer not null default 1 check(cutoff_days between 0 and 14),
 guidance text not null default '' check(length(guidance)<=300), active boolean not null default true
);
create table public.delivery_exceptions (zone_id uuid references public.delivery_zones, date date not null, offered boolean not null, primary key(zone_id,date));
create table public.payment_settings (method text primary key check(method in ('cash_on_delivery','mcb_juice','bank_transfer')), enabled boolean not null default true, instructions text not null default '' check(length(instructions)<=1000));
create table public.orders (
 id uuid primary key default gen_random_uuid(), reference text not null unique default ('LV-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 origin text not null check(origin in ('website','vendor_entered')),
 status text not null default 'pending_review' check(status in ('pending_review','awaiting_customer_confirmation','confirmed','preparing','ready_for_delivery','out_for_delivery','delivered','cancelled','rejected')),
 request_key uuid not null unique, request_digest bytea not null, request jsonb not null, estimate jsonb not null,
 latest_version integer not null default 0, payment_status text not null default 'unpaid' check(payment_status in ('unpaid','payment_reported','paid','refunded','failed')),
 created_at timestamptz not null default now()
);
create table public.quotations (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders, version integer not null,
 operation_key uuid not null unique, input_digest bytea not null,
 status text not null default 'issued' check(status in ('issued','superseded','approved','void')),
 snapshot jsonb not null, zone_id uuid not null references public.delivery_zones, date date not null,
 note text not null default '' check(length(note)<=1000), expires_at timestamptz not null,
 issued_at timestamptz not null default now(), approved_at timestamptz,
 unique(order_id,version)
);
create table public.guest_tokens (
 digest bytea primary key, order_id uuid not null references public.orders, quote_id uuid references public.quotations,
 purpose text not null check(purpose in ('status','approve')), expires_at timestamptz not null,
 revoked_at timestamptz, consumed_at timestamptz,
 check((purpose='status' and quote_id is null) or (purpose='approve' and quote_id is not null))
);
create index on public.guest_tokens(order_id); create index on public.guest_tokens(quote_id);
create table public.inventory_reservations (
 order_id uuid not null references public.orders, stock_id uuid not null references public.inventory_items,
 quote_id uuid not null references public.quotations, grams bigint not null check(grams>0),
 state text not null check(state in ('reserved','consumed','released')), primary key(order_id,stock_id)
);
create index on public.inventory_reservations(stock_id); create index on public.inventory_reservations(quote_id);
create table public.inventory_movements (
 id uuid primary key default gen_random_uuid(), stock_id uuid not null references public.inventory_items, order_id uuid references public.orders,
 operation_key text not null unique, kind text not null check(kind in ('replenish','adjust','reserve','release','consume')),
 on_hand_delta bigint not null, reserved_delta bigint not null, reason text not null,
 actor uuid references auth.users, created_at timestamptz not null default now()
);
create index on public.inventory_movements(stock_id); create index on public.inventory_movements(order_id);
create table public.quotation_approvals (quote_id uuid primary key references public.quotations, order_id uuid not null references public.orders, approved_at timestamptz not null default now());
create index on public.quotation_approvals(order_id);
create table public.order_events (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders, kind text not null, note text not null default '', actor uuid references auth.users, created_at timestamptz not null default now());
create index on public.order_events(order_id);
create table public.payment_records (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders, operation_key uuid not null unique, status text not null, reference text not null, actor uuid references auth.users, created_at timestamptz not null default now());
create index on public.payment_records(order_id);
create table public.operation_receipts (operation_key uuid primary key, kind text not null, input_digest bytea not null);
create table public.rate_buckets (bucket text primary key, hits integer not null, expires_at timestamptz not null);

create function public.is_vendor() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.vendor_admins where user_id=(select auth.uid())); $$;
create function public.require_vendor() returns void language plpgsql security definer set search_path='' as $$ begin if not public.is_vendor() then raise exception 'Vendor authorization required' using errcode='42501'; end if; end; $$;
create function public.date_available(z uuid, d date) returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((select active and d between (now() at time zone 'Indian/Mauritius')::date and (now() at time zone 'Indian/Mauritius')::date+28
 and coalesce((select offered from public.delivery_exceptions where zone_id=z and date=d),extract(dow from d)::integer=any(weekdays))
 and now()<((d-cutoff_days+cutoff_time) at time zone 'Indian/Mauritius') from public.delivery_zones where id=z),false);
$$;
create function public.catalog_data(p_vendor boolean default false) returns jsonb language plpgsql stable security definer set search_path='' as $$
 begin
 if p_vendor then perform public.require_vendor(); end if;
 return jsonb_build_object(
  'demo',(select demo from public.app_settings where id),
  'categories',coalesce((select jsonb_agg(to_jsonb(c) order by name) from public.categories c where p_vendor or active),'[]'),
  'products',coalesce((select jsonb_agg(to_jsonb(p)||jsonb_build_object('available_g',i.on_hand_g-i.reserved_g) order by p.name) from public.products p join public.inventory_items i on i.id=p.stock_id join public.categories c on c.id=p.category_id where p_vendor or(p.active and c.active)),'[]'),
  'zones',coalesce((select jsonb_agg(to_jsonb(z) order by fee_cents) from public.delivery_zones z where p_vendor or active),'[]'),
  'offers',coalesce((select jsonb_agg(jsonb_build_object('zone_id',z.id,'date',d::date) order by d) from public.delivery_zones z cross join generate_series((now() at time zone 'Indian/Mauritius')::date::timestamp,((now() at time zone 'Indian/Mauritius')::date+28)::timestamp,interval '1 day') d where public.date_available(z.id,d::date)),'[]'),
  'payments',coalesce((select jsonb_agg(to_jsonb(p) order by method) from public.payment_settings p where p_vendor or enabled),'[]'));
 end; $$;

-- SQL validation is independent of browser/TypeScript validation.
create function public.calculate_estimate(p_items jsonb,p_zone uuid,p_date date) returns jsonb language plpgsql security definer set search_path='' as $$
 declare l jsonb; p public.products; qty bigint; portion integer; n integer; amount bigint; pack jsonb; lines jsonb:='[]'; subtotal bigint:=0; z public.delivery_zones; r record;
 begin
 if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) not between 1 and 30 then raise exception 'Choose between 1 and 30 items'; end if;
 select * into z from public.delivery_zones where id=p_zone for share;
 if not found or not public.date_available(p_zone,p_date) then raise exception 'Delivery date is no longer available; choose an offered date'; end if;
 perform 1 from public.products where id in(select (value->>'product_id')::uuid from jsonb_array_elements(p_items)) order by id for share;
 for l in select value from jsonb_array_elements(p_items) loop
  select * into p from public.products where id=(l->>'product_id')::uuid and active;
  if not found or not exists(select 1 from public.categories where id=p.category_id and active) then raise exception 'Product is unavailable'; end if;
  if (l->>'grams') !~ '^[0-9]+$' or (l->>'pack_g') !~ '^[0-9]+$' then raise exception 'Weight and portions must be integer grams'; end if;
  qty:=(l->>'grams')::bigint; portion:=(l->>'pack_g')::integer;
  if qty is null or qty not between 1 and 1000000 or portion is null or not portion=any(p.pack_sizes_g) or l->>'cut' is null or not(l->>'cut'=any(p.cuts)) or length(coalesce(l->>'note',''))>500 then raise exception 'Invalid weight, cut or packaging'; end if;
  if qty%portion<>0 and not p.allow_remainder then raise exception 'Weight must divide evenly into the selected portions'; end if;
  if l->>'mode'='pack' then
   select value into pack from jsonb_array_elements(p.fixed_packs) where value->>'id'=l->>'pack_id';
   if (l->>'pack_count') !~ '^[0-9]+$' then raise exception 'Invalid pack count'; end if;
   n:=(l->>'pack_count')::integer;
   if pack is null or n is null or n not between 1 and 1000 or qty<>(pack->>'grams')::bigint*n then raise exception 'Invalid fixed pack'; end if;
   amount:=(pack->>'price_cents')::bigint*n;
  elsif l->>'mode'='weight' then
   if qty<p.min_g or qty%p.step_g<>0 then raise exception 'Invalid weight increment'; end if;
   amount:=(p.price_cents*qty+500)/1000;
  else raise exception 'Choose weight or fixed packs'; end if;
  if amount>100000000 then raise exception 'Line exceeds POC order limit'; end if;
  lines:=lines||jsonb_build_array(jsonb_build_object('product_id',p.id,'stock_id',p.stock_id,'name',p.name,'grams',qty,'cut',l->>'cut','pack_g',portion,'note',coalesce(l->>'note',''),'mode',l->>'mode','pack_id',coalesce(l->>'pack_id',''),'pack_count',coalesce((l->>'pack_count')::integer,1),'unit_cents',p.price_cents,'line_cents',amount,'package_count',qty/portion,'remainder_g',qty%portion));
  subtotal:=subtotal+amount;
 end loop;
 for r in select (value->>'stock_id')::uuid id,sum((value->>'grams')::bigint) qty from jsonb_array_elements(lines) group by 1 loop
  if not exists(select 1 from public.inventory_items where id=r.id and on_hand_g-reserved_g>=r.qty) then raise exception 'Requested stock is unavailable; ask the vendor to review'; end if;
 end loop;
 if subtotal+z.fee_cents>100000000 then raise exception 'Order exceeds POC limit'; end if;
 return jsonb_build_object('items',lines,'subtotal_cents',subtotal,'fee_cents',z.fee_cents,'total_cents',subtotal+z.fee_cents,'zone_id',z.id,'zone_name',z.name,'date',p_date);
 end; $$;

create function public.order_view(p_order uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',o.id,'reference',o.reference,'status',o.status,'origin',o.origin,'request',o.request,'estimate',o.estimate,'payment_status',o.payment_status,'created_at',o.created_at,
 'quotes',coalesce((select jsonb_agg(q.snapshot||jsonb_build_object('id',q.id,'version',q.version,'status',q.status,'note',q.note,'expires_at',q.expires_at,'issued_at',q.issued_at,'approved_at',q.approved_at) order by q.version desc) from public.quotations q where q.order_id=o.id),'[]'),
 'events',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'kind',e.kind,'note',e.note,'created_at',e.created_at) order by e.created_at) from public.order_events e where e.order_id=o.id),'[]')) from public.orders o where o.id=p_order;
$$;
create function public.create_request(p jsonb,p_status_digest text,p_origin text default 'website') returns jsonb language plpgsql security definer set search_path='' as $$
 declare o public.orders; estimate jsonb; fingerprint bytea;
 begin
 if p_origin='vendor_entered' then perform public.require_vendor(); elsif p_origin<>'website' or coalesce(auth.role(),'')<>'service_role' then raise exception 'Unauthorized request' using errcode='42501'; end if;
 if p_status_digest is null or p_status_digest !~ '^[a-f0-9]{64}$' then raise exception 'Invalid status capability'; end if;
 if jsonb_typeof(p->'contact') is distinct from 'object' or coalesce(length(trim(p#>>'{contact,name}')),0) not between 2 and 100 or coalesce(p#>>'{contact,phone}','') !~ '^\+?[0-9 ()-]{7,24}$' or coalesce(length(trim(p#>>'{contact,locality}')),0) not between 2 and 100 or coalesce(length(trim(p#>>'{contact,address}')),0) not between 5 and 500 then raise exception 'Provide valid contact and delivery details'; end if;
 fingerprint:=extensions.digest(p::text,'sha256');
 perform pg_advisory_xact_lock(hashtextextended(p->>'idempotency_key',0));
 select * into o from public.orders where request_key=(p->>'idempotency_key')::uuid;
 if found then
  if o.request_digest<>fingerprint or o.origin<>p_origin or not exists(select 1 from public.guest_tokens where order_id=o.id and digest=decode(p_status_digest,'hex') and purpose='status') then raise exception 'Request key already used with different details'; end if;
  return jsonb_build_object('id',o.id,'reference',o.reference,'status',o.status);
 end if;
 if not exists(select 1 from public.payment_settings where method=p->>'payment_method' and enabled) then raise exception 'Payment preference is unavailable'; end if;
 estimate:=public.calculate_estimate(p->'items',(p->>'zone_id')::uuid,(p->>'date')::date)||jsonb_build_object('payment_instructions',(select instructions from public.payment_settings where method=p->>'payment_method'));
 insert into public.orders(origin,request_key,request_digest,request,estimate) values(p_origin,(p->>'idempotency_key')::uuid,fingerprint,p,estimate) returning * into o;
 insert into public.guest_tokens(digest,order_id,purpose,expires_at) values(decode(p_status_digest,'hex'),o.id,'status',now()+interval '30 days');
 insert into public.order_events(order_id,kind,note,actor) values(o.id,'pending_review','Request received; stock is not reserved.',auth.uid());
 return jsonb_build_object('id',o.id,'reference',o.reference,'status',o.status);
 end; $$;

create function public.issue_quote(p jsonb,p_token_digest text) returns jsonb language plpgsql security definer set search_path='' as $$
 declare o public.orders; q public.quotations; snapshot jsonb; fingerprint bytea;
 begin
 perform public.require_vendor();
 if p_token_digest is null or p_token_digest !~ '^[a-f0-9]{64}$' then raise exception 'Invalid approval capability'; end if;
 select * into o from public.orders where id=(p->>'order_id')::uuid for update;
 if not found then raise exception 'Order unavailable'; end if;
 fingerprint:=extensions.digest(p::text,'sha256');
 select * into q from public.quotations where operation_key=(p->>'operation_key')::uuid;
 if found then
  if q.order_id<>o.id or q.input_digest<>fingerprint or not exists(select 1 from public.guest_tokens where quote_id=q.id and digest=decode(p_token_digest,'hex')) then raise exception 'Operation key already used'; end if;
  if q.version<>o.latest_version or q.status<>'issued' then raise exception 'This quotation has been updated; use the current version'; end if;
  return jsonb_build_object('quote_id',q.id,'version',q.version);
 end if;
 if o.status not in ('pending_review','awaiting_customer_confirmation') then raise exception 'Approved orders cannot be requoted; arrange a new request'; end if;
 if (p->>'expected_version')::integer is distinct from o.latest_version then raise exception 'A newer quotation exists; refresh before editing'; end if;
 if coalesce((p->>'expires_hours')::integer,0) not between 1 and 168 or length(coalesce(p->>'note',''))>1000 then raise exception 'Invalid quotation expiry or note'; end if;
 snapshot:=public.calculate_estimate(p->'items',(p->>'zone_id')::uuid,(p->>'date')::date)||jsonb_build_object('payment_instructions',(select instructions from public.payment_settings where method=o.request->>'payment_method'));
 update public.quotations set status='superseded' where order_id=o.id and status='issued';
 update public.guest_tokens set revoked_at=now() where order_id=o.id and purpose='approve' and revoked_at is null;
 insert into public.quotations(order_id,version,operation_key,input_digest,snapshot,zone_id,date,note,expires_at) values(o.id,o.latest_version+1,(p->>'operation_key')::uuid,fingerprint,snapshot,(p->>'zone_id')::uuid,(p->>'date')::date,coalesce(p->>'note',''),now()+make_interval(hours=>(p->>'expires_hours')::integer)) returning * into q;
 insert into public.guest_tokens(digest,order_id,quote_id,purpose,expires_at) values(decode(p_token_digest,'hex'),o.id,q.id,'approve',q.expires_at);
 update public.orders set status='awaiting_customer_confirmation',latest_version=q.version where id=o.id;
 insert into public.order_events(order_id,kind,note,actor) values(o.id,'awaiting_customer_confirmation','Quotation v'||q.version||' issued.',auth.uid());
 return jsonb_build_object('quote_id',q.id,'version',q.version);
 end; $$;

create function public.resolve_guest(p_token text,p_purpose text default null) returns public.guest_tokens language plpgsql security definer set search_path='' as $$
 declare t public.guest_tokens;
 begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'This link is invalid, expired or updated. Ask the vendor for a new link.' using errcode='42501'; end if;
 select * into t from public.guest_tokens where digest=extensions.digest(p_token,'sha256') and revoked_at is null and expires_at>now() and (p_purpose is null or purpose=p_purpose);
 if not found then raise exception 'This link is invalid, expired or updated. Ask the vendor for a new link.' using errcode='42501'; end if;
 if t.purpose='approve' and not exists(select 1 from public.quotations q join public.orders o on o.id=q.order_id where q.id=t.quote_id and q.version=o.latest_version and q.status in ('issued','approved')) then raise exception 'This quotation has been updated; ask the vendor for the latest link.' using errcode='42501'; end if;
 return t;
 end; $$;
create function public.guest_order(p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
 declare t public.guest_tokens; v jsonb;
 begin
 t:=public.resolve_guest(p_token);
 v:=public.order_view(t.order_id);
 -- Private contact/address and internal vendor event notes are excluded.
 return (v-'request'-'events'-'quotes')||jsonb_build_object('payment_method',v#>>'{request,payment_method}',
 'payment_instructions',coalesce(v#>>'{quotes,0,payment_instructions}',v#>>'{estimate,payment_instructions}',''),
 'events',coalesce((select jsonb_agg(jsonb_build_object('id',id,'kind',kind,'note','','created_at',created_at) order by created_at) from public.order_events where order_id=t.order_id),'[]'),
 'quotes',coalesce((select jsonb_agg(value) from jsonb_array_elements(v->'quotes') where (value->>'version')::integer=(select latest_version from public.orders where id=t.order_id)),'[]'),
 'can_approve',t.purpose='approve' and v->>'status'='awaiting_customer_confirmation');
 end; $$;
create function public.approve_quote(p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
 declare t public.guest_tokens; o public.orders; q public.quotations; r record;
 begin
 t:=public.resolve_guest(p_token,'approve');
 select * into o from public.orders where id=t.order_id for update;
 -- Recheck capability after waiting for a concurrent revision/cancellation.
 t:=public.resolve_guest(p_token,'approve');
 select * into q from public.quotations where id=t.quote_id;
 if q.status='approved' and exists(select 1 from public.quotation_approvals where quote_id=q.id) then return public.guest_order(p_token); end if;
 if o.status<>'awaiting_customer_confirmation' or q.status<>'issued' or q.version<>o.latest_version or q.expires_at<=now() then raise exception 'Quotation is no longer open for approval'; end if;
 perform 1 from public.delivery_zones where id=q.zone_id for share;
 if not public.date_available(q.zone_id,q.date) then raise exception 'Delivery date is no longer available. Ask the vendor for a revised quotation.'; end if;
 -- Shared-source lines aggregate before stock checks. UUID lock order is stable.
 perform 1 from public.inventory_items where id in(select (value->>'stock_id')::uuid from jsonb_array_elements(q.snapshot->'items')) order by id for update;
 for r in select (value->>'stock_id')::uuid id,sum((value->>'grams')::bigint) qty from jsonb_array_elements(q.snapshot->'items') group by 1 order by 1 loop
  if not exists(select 1 from public.inventory_items where id=r.id and on_hand_g-reserved_g>=r.qty) then raise exception 'Stock changed. Ask the vendor to revise your quotation; no stock was reserved.'; end if;
  update public.inventory_items set reserved_g=reserved_g+r.qty where id=r.id;
  insert into public.inventory_reservations(order_id,stock_id,quote_id,grams,state) values(o.id,r.id,q.id,r.qty,'reserved');
  insert into public.inventory_movements(stock_id,order_id,operation_key,kind,on_hand_delta,reserved_delta,reason) values(r.id,o.id,'reserve:'||o.id||':'||r.id,'reserve',0,r.qty,'Customer approved quotation v'||q.version);
 end loop;
 update public.quotations set status='approved',approved_at=now() where id=q.id;
 insert into public.quotation_approvals(quote_id,order_id) values(q.id,o.id);
 update public.guest_tokens set consumed_at=now() where digest=t.digest;
 update public.orders set status='confirmed' where id=o.id;
 insert into public.order_events(order_id,kind,note) values(o.id,'confirmed','Customer approved quotation v'||q.version||'; stock reserved.');
 return public.guest_order(p_token);
 end; $$;

create function public.transition_order(p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
 declare o public.orders; target text:=p->>'status'; r public.inventory_reservations; reason text:=coalesce(p->>'reason','');
 begin
 perform public.require_vendor();
 select * into o from public.orders where id=(p->>'order_id')::uuid for update;
 if not found then raise exception 'Order unavailable'; end if;
 if o.status=target then return public.order_view(o.id); end if;
 if not ((o.status='confirmed' and target='preparing') or(o.status='preparing' and target='ready_for_delivery') or(o.status='ready_for_delivery' and target='out_for_delivery') or(o.status='out_for_delivery' and target='delivered') or(target='cancelled' and o.status not in('cancelled','rejected','delivered')) or(target='rejected' and o.status in('pending_review','awaiting_customer_confirmation'))) then raise exception 'This order transition is not allowed'; end if;
 if length(reason)>500 or(target in('cancelled','rejected') and length(trim(reason))<3) then raise exception 'Provide a reason for cancellation or rejection'; end if;
 if target in('preparing','cancelled','rejected') then
  perform 1 from public.inventory_items where id in(select stock_id from public.inventory_reservations where order_id=o.id and state='reserved') order by id for update;
  for r in select * from public.inventory_reservations where order_id=o.id and state='reserved' order by stock_id loop
   update public.inventory_items set reserved_g=reserved_g-r.grams,on_hand_g=on_hand_g-case when target='preparing' then r.grams else 0 end where id=r.stock_id;
   update public.inventory_reservations set state=case when target='preparing' then 'consumed' else 'released' end where order_id=o.id and stock_id=r.stock_id;
   insert into public.inventory_movements(stock_id,order_id,operation_key,kind,on_hand_delta,reserved_delta,reason,actor) values(r.stock_id,o.id,target||':'||o.id||':'||r.stock_id,case when target='preparing' then 'consume' else 'release' end,case when target='preparing' then -r.grams else 0 end,-r.grams,coalesce(nullif(reason,''),'Preparation started'),auth.uid());
  end loop;
 end if;
 if target in('cancelled','rejected') then
  update public.guest_tokens set revoked_at=now() where order_id=o.id and purpose='approve';
  update public.quotations set status='void' where order_id=o.id and status='issued';
 end if;
 update public.orders set status=target where id=o.id;
 insert into public.order_events(order_id,kind,note,actor) values(o.id,target,reason,auth.uid());
 return public.order_view(o.id);
 end; $$;

create function public.claim_operation(p_key uuid,p_kind text,p jsonb) returns boolean language plpgsql security definer set search_path='' as $$
 declare old public.operation_receipts; fingerprint bytea:=extensions.digest(p::text,'sha256');
 begin
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,1));
 select * into old from public.operation_receipts where operation_key=p_key;
 if found then
  if old.kind<>p_kind or old.input_digest<>fingerprint then raise exception 'Operation key already used with different details'; end if;
  return false;
 end if;
 insert into public.operation_receipts values(p_key,p_kind,fingerprint); return true;
 end; $$;
create function public.adjust_stock(p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
 declare s public.inventory_items; delta bigint:=(p->>'delta_g')::bigint;
 begin
 perform public.require_vendor();
 if delta is null or delta not between -1000000 and 1000000 or coalesce(length(trim(p->>'reason')),0) not between 3 and 500 then raise exception 'Provide a valid adjustment and reason'; end if;
 if public.claim_operation((p->>'operation_key')::uuid,'stock',p) then
  update public.inventory_items set on_hand_g=on_hand_g+delta,target_g=(p->>'target_g')::bigint,threshold_percent=(p->>'threshold_percent')::integer where id=(p->>'stock_id')::uuid returning * into s;
  if not found then raise exception 'Stock source unavailable'; end if;
  insert into public.inventory_movements(stock_id,operation_key,kind,on_hand_delta,reserved_delta,reason,actor) values(s.id,p->>'operation_key',case when delta>0 then 'replenish' else 'adjust' end,delta,0,p->>'reason',auth.uid());
 else select * into s from public.inventory_items where id=(p->>'stock_id')::uuid; end if;
 return to_jsonb(s);
 end; $$;
create function public.record_payment(p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
 declare o public.orders; target text:=p->>'status';
 begin
 perform public.require_vendor();
 select * into o from public.orders where id=(p->>'order_id')::uuid for update;
 if not found then raise exception 'Order unavailable'; end if;
 if target is null or target not in('unpaid','payment_reported','paid','refunded','failed') or coalesce(length(trim(p->>'reference')),0) not between 3 and 200 then raise exception 'Record a payment reference or verification note'; end if;
 if public.claim_operation((p->>'operation_key')::uuid,'payment',p) then
  if (target='refunded' and o.payment_status<>'paid') or(o.payment_status='refunded' and target<>'refunded') or(o.payment_status='paid' and target not in('paid','refunded')) then raise exception 'Payment transition requires a valid paid/refund context'; end if;
  update public.orders set payment_status=target where id=o.id;
  insert into public.payment_records(order_id,operation_key,status,reference,actor) values(o.id,(p->>'operation_key')::uuid,target,p->>'reference',auth.uid());
  insert into public.order_events(order_id,kind,note,actor) values(o.id,'payment_'||target,p->>'reference',auth.uid());
 end if;
 return public.order_view(o.id);
 end; $$;
create function public.report_payment(p_token text,p_reference text) returns jsonb language plpgsql security definer set search_path='' as $$
 declare t public.guest_tokens; o public.orders;
 begin
 t:=public.resolve_guest(p_token);
 select * into o from public.orders where id=t.order_id for update;
 if o.status in('pending_review','awaiting_customer_confirmation','cancelled','rejected') or o.request->>'payment_method'='cash_on_delivery' or length(trim(p_reference)) not between 3 and 200 then raise exception 'Payment cannot be reported for this order'; end if;
 if o.payment_status in('unpaid','failed') then
  update public.orders set payment_status='payment_reported' where id=o.id;
  insert into public.payment_records(order_id,operation_key,status,reference) values(o.id,gen_random_uuid(),'payment_reported',p_reference);
  insert into public.order_events(order_id,kind,note) values(o.id,'payment_reported','Customer reports a transfer; vendor verification required.');
 end if;
 return public.guest_order(p_token);
 end; $$;
create function public.add_order_note(p_order uuid,p_note text) returns void language plpgsql security definer set search_path='' as $$
 begin perform public.require_vendor();
 if length(trim(p_note)) not between 3 and 500 then raise exception 'Provide a delivery follow-up note'; end if;
 insert into public.order_events(order_id,kind,note,actor) values(p_order,'vendor_note',p_note,auth.uid());
 end; $$;

create function public.save_category(p jsonb) returns void language plpgsql security definer set search_path='' as $$
 begin perform public.require_vendor();
 insert into public.categories(id,name,slug,active) values((p->>'id')::uuid,p->>'name',p->>'slug',(p->>'active')::boolean) on conflict(id) do update set name=excluded.name,slug=excluded.slug,active=excluded.active;
 end; $$;
create function public.save_product(p jsonb) returns void language plpgsql security definer set search_path='' as $$
 declare s uuid; pack jsonb; ids text[]:='{}';
 begin
 perform public.require_vendor();
 if jsonb_typeof(p->'fixed_packs') is distinct from 'array' or jsonb_array_length(p->'fixed_packs')>12 then raise exception 'Invalid fixed packs'; end if;
 for pack in select value from jsonb_array_elements(p->'fixed_packs') loop
  if coalesce(pack->>'id','')='' or pack->>'id'=any(ids) or coalesce((pack->>'grams')::bigint,0) not between 1 and 1000000 or coalesce((pack->>'price_cents')::bigint,-1) not between 0 and 100000000 then raise exception 'Invalid fixed pack settings'; end if;
  ids:=array_append(ids,pack->>'id');
 end loop;
 if exists(select 1 from jsonb_array_elements_text(p->'cuts') c where length(c) not between 1 and 50) then raise exception 'Invalid cut'; end if;
 select stock_id into s from public.products where id=(p->>'id')::uuid;
 if s is null then
  s:=gen_random_uuid(); insert into public.inventory_items(id,name) values(s,p->>'name');
 end if;
 insert into public.products(id,category_id,stock_id,slug,name,description,price_cents,min_g,step_g,cuts,pack_sizes_g,allow_remainder,fixed_packs,active)
 values((p->>'id')::uuid,(p->>'category_id')::uuid,s,p->>'slug',p->>'name',p->>'description',(p->>'price_cents')::bigint,(p->>'min_g')::integer,(p->>'step_g')::integer,array(select jsonb_array_elements_text(p->'cuts')),array(select jsonb_array_elements_text(p->'pack_sizes_g')::integer),(p->>'allow_remainder')::boolean,p->'fixed_packs',(p->>'active')::boolean)
 on conflict(id) do update set category_id=excluded.category_id,slug=excluded.slug,name=excluded.name,description=excluded.description,price_cents=excluded.price_cents,min_g=excluded.min_g,step_g=excluded.step_g,cuts=excluded.cuts,pack_sizes_g=excluded.pack_sizes_g,allow_remainder=excluded.allow_remainder,fixed_packs=excluded.fixed_packs,active=excluded.active;
 update public.inventory_items set name=p->>'name' where id=s;
 end; $$;
create function public.save_zone(p jsonb) returns void language plpgsql security definer set search_path='' as $$
 begin perform public.require_vendor();
 update public.delivery_zones set fee_cents=(p->>'fee_cents')::bigint,weekdays=array(select jsonb_array_elements_text(p->'weekdays')::integer),cutoff_time=(p->>'cutoff_time')::time,cutoff_days=(p->>'cutoff_days')::integer,guidance=p->>'guidance',active=(p->>'active')::boolean where id=(p->>'id')::uuid;
 if not found then raise exception 'Zone unavailable'; end if;
 end; $$;
create function public.save_exception(p_zone uuid,p_date date,p_offered boolean) returns void language plpgsql security definer set search_path='' as $$
 begin perform public.require_vendor();
 -- Date edits and approval share the same zone lock, including newly inserted exceptions.
 perform 1 from public.delivery_zones where id=p_zone for update;
 if not found then raise exception 'Zone unavailable'; end if;
 if p_date<(now() at time zone 'Indian/Mauritius')::date then raise exception 'Choose a future exception'; end if;
 insert into public.delivery_exceptions values(p_zone,p_date,p_offered) on conflict(zone_id,date) do update set offered=excluded.offered;
 end; $$;
create function public.save_payment_setting(p jsonb) returns void language plpgsql security definer set search_path='' as $$
 begin perform public.require_vendor();
 -- Serialize settings changes so simultaneous disables cannot remove every method.
 perform pg_advisory_xact_lock(106016);
 if not (p->>'enabled')::boolean and not exists(select 1 from public.payment_settings where method<>p->>'method' and enabled) then raise exception 'Keep at least one payment preference enabled'; end if;
 update public.payment_settings set enabled=(p->>'enabled')::boolean,instructions=p->>'instructions' where method=p->>'method';
 if not found then raise exception 'Unsupported payment method'; end if;
 end; $$;
create function public.vendor_data() returns jsonb language plpgsql stable security definer set search_path='' as $$
 begin perform public.require_vendor();
 return jsonb_build_object('catalog',public.catalog_data(true),'orders',coalesce((select jsonb_agg(public.order_view(id) order by created_at desc) from public.orders),'[]'),
 'inventory',coalesce((select jsonb_agg(to_jsonb(i) order by name) from public.inventory_items i),'[]'),
 'movements',coalesce((select jsonb_agg(to_jsonb(m) order by created_at desc) from (select id,stock_id,kind,on_hand_delta,reserved_delta,reason,created_at from public.inventory_movements order by created_at desc limit 100) m),'[]'),
 'exceptions',coalesce((select jsonb_agg(to_jsonb(e)) from public.delivery_exceptions e),'[]'));
 end; $$;
create function public.rate_limit(p_bucket text,p_limit integer) returns boolean language plpgsql security definer set search_path='' as $$
 declare n integer;
 begin
 if length(p_bucket)>100 or p_limit not between 1 and 100 then raise exception 'Invalid rate limit'; end if;
 delete from public.rate_buckets where expires_at<now()-interval '1 hour';
 insert into public.rate_buckets values(p_bucket,1,now()+interval '10 minutes') on conflict(bucket) do update set hits=case when public.rate_buckets.expires_at<=now() then 1 else public.rate_buckets.hits+1 end,expires_at=case when public.rate_buckets.expires_at<=now() then now()+interval '10 minutes' else public.rate_buckets.expires_at end returning hits into n;
 return n<=p_limit;
 end; $$;

-- Guard the immutable portions even against accidental privileged updates.
create function public.protect_snapshot() returns trigger language plpgsql set search_path='' as $$
 begin
 if tg_table_name='orders' then
  if new.request is distinct from old.request or new.estimate is distinct from old.estimate or new.request_key<>old.request_key then raise exception 'Original requests are immutable'; end if;
 else
  if new.snapshot is distinct from old.snapshot or new.version<>old.version or new.order_id<>old.order_id or new.zone_id<>old.zone_id or new.date<>old.date or new.note<>old.note or new.expires_at<>old.expires_at then raise exception 'Issued quotation snapshots are immutable'; end if;
 end if; return new;
 end; $$;
create trigger protect_order before update on public.orders for each row execute function public.protect_snapshot();
create trigger protect_quote before update on public.quotations for each row execute function public.protect_snapshot();

-- No direct browser writes. Owner reads use RLS; all mutations are checked RPCs.
do $$ declare t text; begin
 foreach t in array array['vendor_admins','app_settings','categories','inventory_items','products','delivery_zones','delivery_exceptions','payment_settings','orders','quotations','guest_tokens','inventory_reservations','inventory_movements','quotation_approvals','order_events','payment_records','operation_receipts','rate_buckets'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on table public.%I from anon, authenticated, service_role',t);
  if t not in('guest_tokens','rate_buckets','operation_receipts') then
   execute format('grant select on table public.%I to authenticated',t);
   execute format('create policy owner_read on public.%I for select to authenticated using ((select public.is_vendor()))',t);
  end if;
 end loop;
end; $$;
revoke all on all functions in schema public from public,anon,authenticated,service_role;
grant execute on function public.is_vendor() to authenticated;
grant execute on function public.catalog_data(boolean) to anon,authenticated,service_role;
grant execute on function public.calculate_estimate(jsonb,uuid,date), public.guest_order(text),public.approve_quote(text),public.report_payment(text,text),public.rate_limit(text,integer) to service_role;
grant execute on function public.create_request(jsonb,text,text) to service_role,authenticated;
grant execute on function public.issue_quote(jsonb,text), public.transition_order(jsonb),public.adjust_stock(jsonb),public.record_payment(jsonb),public.add_order_note(uuid,text),public.save_category(jsonb),public.save_product(jsonb),public.save_zone(jsonb),public.save_exception(uuid,date,boolean),public.save_payment_setting(jsonb),public.vendor_data() to authenticated;
