-- Para la base ya creada: suma sin deduplicar y token de un solo uso. No borra ni cambia filas.
begin;
alter table public.donors add column envio uuid unique;
create or replace view api.donantes as
select name, sum(total) as total, year
from public.donors
group by name, year
order by min(id);
commit;
