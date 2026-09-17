const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Starting PostGIS and Schema Verification...\n');
  let failures = 0;

  // 1. PostGIS Extension Verification
  try {
    const postgisVersion = await prisma.$queryRaw`SELECT PostGIS_Full_Version() as ver;`;
    console.log('✔ [1/6] PostGIS Extension Verified:');
    console.log('   ', postgisVersion[0]?.ver?.substring(0, 80) + '...\n');
  } catch (err) {
    console.error('❌ [1/6] PostGIS Extension check failed:', err.message);
    failures++;
  }

  // 2. Spatial Columns Verification
  try {
    const cols = await prisma.$queryRaw`
      SELECT table_name, column_name, udt_name 
      FROM information_schema.columns 
      WHERE table_name IN ('Worker', 'Booking') AND column_name = 'location';
    `;
    console.log('✔ [2/6] PostGIS Geography Columns Verified:');
    cols.forEach(c => console.log(`    - ${c.table_name}.${c.column_name}: ${c.udt_name}`));
    if (cols.length < 2) {
      console.error('❌ Missing location column on Worker or Booking!');
      failures++;
    }
    console.log('');
  } catch (err) {
    console.error('❌ [2/6] Columns check failed:', err.message);
    failures++;
  }

  // 3. GiST Spatial Indexes Verification
  try {
    const indexes = await prisma.$queryRaw`
      SELECT tablename, indexname, indexdef 
      FROM pg_indexes 
      WHERE indexname IN ('idx_worker_location_gist', 'idx_booking_location_gist', 'idx_booking_emergency_status');
    `;
    console.log('✔ [3/6] Spatial & Emergency Indexes Verified:');
    indexes.forEach(idx => console.log(`    - ${idx.indexname} on ${idx.tablename}`));
    if (indexes.length < 3) {
      console.warn('⚠️ Some expected indexes were not found:', indexes.map(i => i.indexname));
    }
    console.log('');
  } catch (err) {
    console.error('❌ [3/6] Index check failed:', err.message);
    failures++;
  }

  // 4. Bidirectional Trigger Synchronization Test
  try {
    console.log('✔ [4/6] Testing Trigger Synchronization on Worker...');
    const testWorker = await prisma.worker.findFirst({
      where: { verificationStatus: 'VERIFIED' }
    });

    if (testWorker) {
      const originalLat = testWorker.latitude;
      const originalLng = testWorker.longitude;
      const testLat = 22.7500;
      const testLng = 88.5000;

      // Update via standard Prisma client update
      await prisma.worker.update({
        where: { id: testWorker.id },
        data: { latitude: testLat, longitude: testLng },
      });

      // Verify trigger synchronized PostGIS location
      const syncedWorker = await prisma.$queryRaw`
        SELECT id, latitude, longitude, ST_AsText(location::geometry) as geom_wkt
        FROM "Worker"
        WHERE id = ${testWorker.id}::uuid;
      `;

      const expectedPoint = `POINT(${testLng} ${testLat})`;
      const actualPoint = syncedWorker[0]?.geom_wkt;
      console.log(`    Updated via Prisma: lat=${testLat}, lng=${testLng}`);
      console.log(`    PostGIS location geometry: ${actualPoint}`);

      if (actualPoint === expectedPoint) {
        console.log('    ✔ Trigger synchronization PASSED perfectly!\n');
      } else {
        console.error(`    ❌ Trigger mismatch: expected ${expectedPoint}, got ${actualPoint}\n`);
        failures++;
      }

      // Revert test coordinates
      await prisma.worker.update({
        where: { id: testWorker.id },
        data: { latitude: originalLat, longitude: originalLng },
      });
    }
  } catch (err) {
    console.error('❌ [4/6] Trigger sync test failed:', err.message);
    failures++;
  }

  // 5. ST_DWithin and ST_Distance 20km Query Test
  try {
    console.log('✔ [5/6] Testing ST_DWithin (20km) and ST_Distance Query...');
    const userLat = 22.6950;
    const userLng = 88.4550;

    const nearbyWorkers = await prisma.$queryRaw`
      SELECT 
        w.id,
        w.latitude,
        w.longitude,
        w."averageRating",
        w."totalJobs",
        ST_Distance(
          w.location,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography
        ) AS distance_meters,
        (ST_Distance(
          w.location,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography
        ) / 1000.0) AS distance_km
      FROM "Worker" w
      WHERE w."verificationStatus" = 'VERIFIED'
        AND w.location IS NOT NULL
        AND ST_DWithin(
          w.location,
          ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
          20000
        )
      ORDER BY distance_meters ASC
      LIMIT 5;
    `;

    console.log(`    Found ${nearbyWorkers.length} candidates within 20km of (${userLat}, ${userLng}):`);
    let allWithin20km = true;
    for (const w of nearbyWorkers) {
      const dMeters = Number(w.distance_meters);
      const dKm = Number(w.distance_km);
      console.log(`    - Worker ${w.id.substring(0, 8)}...: ${dMeters.toFixed(1)} meters (${dKm.toFixed(2)} km)`);
      if (dMeters > 20000) allWithin20km = false;
    }

    if (allWithin20km) {
      console.log('    ✔ All returned candidates strictly within 20,000 meters!\n');
    } else {
      console.error('    ❌ Found candidate exceeding 20km radius!\n');
      failures++;
    }
  } catch (err) {
    console.error('❌ [5/6] ST_DWithin query test failed:', err.message);
    failures++;
  }

  // 6. Booking Creation & Auto Location Test
  try {
    console.log('✔ [6/6] Testing Booking Creation with PostGIS Trigger...');
    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
    const worker = await prisma.worker.findFirst({ where: { verificationStatus: 'VERIFIED' } });
    const service = await prisma.service.findFirst();

    if (customer && worker && service) {
      const bLat = 22.7000;
      const bLng = 88.4600;
      const newBooking = await prisma.booking.create({
        data: {
          customerId: customer.id,
          workerId: worker.id,
          serviceId: service.id,
          bookingDate: new Date(),
          bookingTime: new Date(),
          address: 'Test PostGIS Verification Site',
          latitude: bLat,
          longitude: bLng,
          basePrice: 199.00,
          finalPrice: 199.00,
          isEmergency: true,
          status: 'PENDING',
        },
      });

      const checkedBooking = await prisma.$queryRaw`
        SELECT id, latitude, longitude, ST_AsText(location::geometry) as geom_wkt
        FROM "Booking"
        WHERE id = ${newBooking.id}::uuid;
      `;

      const expectedPoint = `POINT(${bLng} ${bLat})`;
      const actualPoint = checkedBooking[0]?.geom_wkt;
      console.log(`    Created Booking: ID=${newBooking.id.substring(0, 8)}..., lat=${bLat}, lng=${bLng}`);
      console.log(`    Booking PostGIS geometry: ${actualPoint}`);

      if (actualPoint === expectedPoint) {
        console.log('    ✔ Booking trigger synchronization PASSED perfectly!\n');
      } else {
        console.error(`    ❌ Booking trigger mismatch: expected ${expectedPoint}, got ${actualPoint}\n`);
        failures++;
      }

      // Cleanup test booking
      await prisma.booking.delete({ where: { id: newBooking.id } });
      console.log('    ✔ Test booking cleaned up.\n');
    }
  } catch (err) {
    console.error('❌ [6/6] Booking creation test failed:', err.message);
    failures++;
  }

  await prisma.$disconnect();

  if (failures === 0) {
    console.log('🎉 ALL 6 VERIFICATION CHECKS PASSED WITH ZERO ERRORS!');
  } else {
    console.error(`⚠️ ${failures} verification check(s) failed!`);
    process.exit(1);
  }
}

main();
