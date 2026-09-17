-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Add PostGIS geography(Point, 4326) column to Worker
ALTER TABLE "Worker" 
ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- Add PostGIS geography(Point, 4326) column to Booking
ALTER TABLE "Booking" 
ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- Backfill existing Worker coordinates into PostGIS geography location
UPDATE "Worker"
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;

-- Backfill existing Booking coordinates into PostGIS geography location
UPDATE "Booking"
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;

-- Create GiST Spatial Indexes
CREATE INDEX IF NOT EXISTS idx_worker_location_gist 
ON "Worker" USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_booking_location_gist 
ON "Booking" USING GIST(location);

-- Create Composite Index for Emergency Booking queries
CREATE INDEX IF NOT EXISTS idx_booking_emergency_status 
ON "Booking"("isEmergency", status);

-- Bidirectional synchronization trigger function for Worker
CREATE OR REPLACE FUNCTION sync_worker_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSIF NEW.location IS NOT NULL THEN
    NEW.latitude := ST_Y(NEW.location::geometry);
    NEW.longitude := ST_X(NEW.location::geometry);
  ELSE
    NEW.location := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_worker_location_sync ON "Worker";
CREATE TRIGGER trg_worker_location_sync
BEFORE INSERT OR UPDATE OF latitude, longitude, location
ON "Worker"
FOR EACH ROW
EXECUTE FUNCTION sync_worker_location();

-- Bidirectional synchronization trigger function for Booking
CREATE OR REPLACE FUNCTION sync_booking_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSIF NEW.location IS NOT NULL THEN
    NEW.latitude := ST_Y(NEW.location::geometry);
    NEW.longitude := ST_X(NEW.location::geometry);
  ELSE
    NEW.location := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_location_sync ON "Booking";
CREATE TRIGGER trg_booking_location_sync
BEFORE INSERT OR UPDATE OF latitude, longitude, location
ON "Booking"
FOR EACH ROW
EXECUTE FUNCTION sync_booking_location();
