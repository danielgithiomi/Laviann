-- DEMO ONLY. No real customer records, vendor credentials or merchant instructions.
insert into public.categories(id,name,slug) values
 ('00000000-0000-4000-8000-000000000001','Chicken','chicken'),('00000000-0000-4000-8000-000000000002','Beef','beef') on conflict do nothing;
with demo(n,slug,name,price,category) as (values
 (0,'whole-chicken','Whole chicken',23500,1),(1,'chicken-breast','Chicken breast',47500,1),(2,'chicken-drumsticks','Chicken drumsticks',29000,1),(3,'chicken-thighs','Chicken thighs',35000,1),(4,'chicken-wings','Chicken wings',22000,1),(5,'beef-mince','Beef mince',83000,2),(6,'beef-cubes','Beef cubes',83000,2),(7,'rump-steak','Rump steak',110000,2))
insert into public.inventory_items(id,name,on_hand_g) select ('00000000-0000-4000-8000-'||lpad((100+n)::text,12,'0'))::uuid,name,case when n=4 then 5000 else 50000 end from demo on conflict do nothing;
with demo(n,slug,name,price,category) as (values
 (0,'whole-chicken','Whole chicken',23500,1),(1,'chicken-breast','Chicken breast',47500,1),(2,'chicken-drumsticks','Chicken drumsticks',29000,1),(3,'chicken-thighs','Chicken thighs',35000,1),(4,'chicken-wings','Chicken wings',22000,1),(5,'beef-mince','Beef mince',83000,2),(6,'beef-cubes','Beef cubes',83000,2),(7,'rump-steak','Rump steak',110000,2))
insert into public.products(id,category_id,stock_id,slug,name,description,price_cents,min_g,step_g,cuts,pack_sizes_g,fixed_packs)
select ('00000000-0000-4000-8000-'||lpad((10+n)::text,12,'0'))::uuid,('00000000-0000-4000-8000-'||lpad(category::text,12,'0'))::uuid,('00000000-0000-4000-8000-'||lpad((100+n)::text,12,'0'))::uuid,slug,name,'Raw meat, portioned to your plans. Choose your weight, cutting and packaging for vendor review.',price,500,250,case when n=0 then array['whole','curry pieces'] else array['as supplied','small pieces'] end,array[500,1000],jsonb_build_array(jsonb_build_object('id','500g','grams',500,'price_cents',price/2),jsonb_build_object('id','1kg','grams',1000,'price_cents',price)) from demo on conflict do nothing;
insert into public.delivery_zones(id,name,fee_cents,weekdays,guidance) values
 ('00000000-0000-4000-8000-000000000200','Central',7500,array[1],'Demo coverage; confirm your locality with the vendor.'),
 ('00000000-0000-4000-8000-000000000201','North',12500,array[4],'Demo coverage; confirm your locality with the vendor.'),
 ('00000000-0000-4000-8000-000000000202','West',15000,array[2],'Demo coverage; confirm your locality with the vendor.'),
 ('00000000-0000-4000-8000-000000000203','East',17500,array[3],'Demo coverage; confirm your locality with the vendor.'),
 ('00000000-0000-4000-8000-000000000204','South',22500,array[5],'Demo coverage; confirm your locality with the vendor.') on conflict do nothing;
insert into public.payment_settings(method,instructions) values
 ('cash_on_delivery','Pay the vendor on delivery. Payment is recorded manually.'),
 ('mcb_juice','DEMO: ask the vendor for verified MCB Juice details. No real merchant account is configured.'),
 ('bank_transfer','DEMO: ask the vendor for verified bank details. No real bank account is configured.') on conflict do nothing;
