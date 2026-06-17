insert into interests (name)
select seed.name
from (values
  ('Gaming'), ('Gym'), ('Travel'), ('Movies'), ('Anime'), ('Music'), ('Cars'),
  ('Technology'), ('Reading'), ('Sports'), ('Photography'), ('Business'),
  ('Fashion'), ('Cooking')
) as seed(name)
where not exists (
  select 1 from interests existing where lower(existing.name) = lower(seed.name)
);
