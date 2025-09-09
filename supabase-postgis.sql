-- Enable PostGIS for geospatial queries (idempotent)
create extension if not exists postgis;

-- Add a geography(Point, 4326) column for Courses if not present
alter table if exists courses
  add column if not exists geom geography(Point, 4326);

-- Backfill geom from existing latitude/longitude values
update courses
set geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
where longitude is not null and latitude is not null and geom is null;

-- Create a spatial index to speed up proximity searches
create index if not exists courses_geom_idx on courses using gist (geom);

-- Example proximity query (within 25km)
-- select id, name, location, par
-- from courses
-- where geom is not null
--   and ST_DWithin(
--     geom,
--     ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
--     25000
--   )
-- order by ST_Distance(
--   geom,
--   ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
-- );
