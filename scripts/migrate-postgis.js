const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting PostGIS spatial migration...');

  try {
    // 1. Enable PostGIS Extension
    console.log('1. Enabling PostGIS extension...');
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS postgis;`);
    const versionResult = await prisma.$queryRawUnsafe(`SELECT PostGIS_Full_Version() as version;`);
    console.log('✔ PostGIS Enabled:', versionResult[0]?.version);

    // 2. Add location column to Worker
    console.log('2. Adding location geography(Point, 4326) column to Worker...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Worker" 
      ADD COLUMN IF NOT EXISTS location geography(Point, 4326);
    `);

    // 3. Add location column to Booking
    console.log('3. Adding location geography(Point, 4326) column to Booking...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Booking" 
      ADD COLUMN IF NOT EXISTS location geography(Point, 4326);
    `);

    // 4. Backfill existing Worker coordinates into PostGIS geography location
    console.log('4. Backfilling existing Worker locations from latitude/longitude...');
    const updatedWorkers = await prisma.$executeRawUnsafe(`
      UPDATE "Worker"
      SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;
    `);
    console.log(`✔ Backfilled ${updatedWorkers} workers with PostGIS location.`);

    // 5. Backfill existing Booking coordinates into PostGIS geography location
    console.log('5. Backfilling existing Booking locations from latitude/longitude...');
    const updatedBookings = await prisma.$executeRawUnsafe(`
      UPDATE "Booking"
      SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;
    `);
    console.log(`✔ Backfilled ${updatedBookings} bookings with PostGIS location.`);

    // 6. Create GiST Indexes
    console.log('6. Creating GiST spatial indexes...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_worker_location_gist 
      ON "Worker" USING GIST(location);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_booking_location_gist 
      ON "Booking" USING GIST(location);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_booking_emergency_status 
      ON "Booking"("isEmergency", status);
    `);
    console.log('✔ GiST spatial and emergency indexes created successfully.');

    // 7. Install synchronization trigger for Worker
    console.log('7. Installing bidirectional sync trigger on Worker...');
    await prisma.$executeRawUnsafe(`
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
    `);

    await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_worker_location_sync ON "Worker";`);

    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_worker_location_sync
      BEFORE INSERT OR UPDATE OF latitude, longitude, location
      ON "Worker"
      FOR EACH ROW
      EXECUTE FUNCTION sync_worker_location();
    `);
    console.log('✔ Worker location sync trigger installed.');

    // 8. Install synchronization trigger for Booking
    console.log('8. Installing bidirectional sync trigger on Booking...');
    await prisma.$executeRawUnsafe(`
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
    `);

    await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_booking_location_sync ON "Booking";`);

    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_booking_location_sync
      BEFORE INSERT OR UPDATE OF latitude, longitude, location
      ON "Booking"
      FOR EACH ROW
      EXECUTE FUNCTION sync_booking_location();
    `);
    console.log('✔ Booking location sync trigger installed.');

    console.log('🎉 PostGIS migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
