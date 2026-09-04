const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed: 2 Cooperatives, 10 Skills, 20 Workers...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ==========================================================================
  // 1. COOPERATIVES (with Admin Login Credentials)
  // ==========================================================================
  const pragatiCoop = await prisma.cooperative.upsert({
    where: { registrationNumber: 'COOP-WB-2024-001' },
    update: {
      adminEmail: 'admin.pragati@a2zee.local',
      adminPasswordHash: passwordHash,
      adminPhone: '+913322891101',
    },
    create: {
      name: 'Pragati Labour Cooperative Society',
      registrationNumber: 'COOP-WB-2024-001',
      adminEmail: 'admin.pragati@a2zee.local',
      adminPasswordHash: passwordHash,
      adminPhone: '+913322891101',
    },
  });

  const navchetanaCoop = await prisma.cooperative.upsert({
    where: { registrationNumber: 'COOP-WB-2024-002' },
    update: {
      adminEmail: 'admin.navchetana@a2zee.local',
      adminPasswordHash: passwordHash,
      adminPhone: '+913322891102',
    },
    create: {
      name: 'Navchetana Labour Cooperative Society',
      registrationNumber: 'COOP-WB-2024-002',
      adminEmail: 'admin.navchetana@a2zee.local',
      adminPasswordHash: passwordHash,
      adminPhone: '+913322891102',
    },
  });

  console.log('✔ 2 Cooperatives seeded with Admin credentials:');
  console.log('  1. Pragati: admin.pragati@a2zee.local / password123');
  console.log('  2. Navchetana: admin.navchetana@a2zee.local / password123');

  // ==========================================================================
  // 2. THE 10 SKILLS REQUIRED
  // ==========================================================================
  const skillNames = [
    'Electrician',
    'Plumbers',
    'Househelp',
    'Carpenters',
    'Painters',
    'Caregivers',
    'Drivers',
    'Gardeners',
    'Cleaners',
    'Technicians',
  ];

  const skillMap = {};
  for (const name of skillNames) {
    const s = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    skillMap[name] = s;
  }
  console.log('✔ 10 Skills seeded:', Object.keys(skillMap).join(', '));

  // ==========================================================================
  // 3. CATALOG SERVICES FOR ALL 10 SKILLS
  // ==========================================================================
  const servicesConfig = [
    { skill: 'Electrician', name: 'Ceiling Fan Repair & Capacitor Check', desc: 'Capacitor, blade alignment, motor noise diagnosis', price: 199.0 },
    { skill: 'Electrician', name: 'Switchboard & Modular Socket Repair', desc: 'Replacement of burnt switches and earthing fix', price: 99.0 },
    { skill: 'Plumbers', name: 'Leaking Tap & Valve Replacement', desc: 'Cartridge change, Teflon sealing, and pressure check', price: 149.0 },
    { skill: 'Plumbers', name: 'Kitchen Sink & Drain Trap Unblocking', desc: 'Mechanical clearing of severe grease/hair clogs', price: 299.0 },
    { skill: 'Househelp', name: 'Daily Household Chores & Cooking Support', desc: 'Meal preparation, dusting, and kitchen assistance', price: 249.0 },
    { skill: 'Househelp', name: 'Deep Kitchen Degreasing & Dishwashing', desc: 'Stove, chimney tile, and countertop thorough clean', price: 349.0 },
    { skill: 'Carpenters', name: 'Door Lock / Latch Alignment', desc: 'Mortise lock fitting and strike plate realignment', price: 199.0 },
    { skill: 'Carpenters', name: 'Furniture Hinge & Slider Repair', desc: 'Hydraulic hinges fix for wardrobes and cabinets', price: 299.0 },
    { skill: 'Painters', name: 'Wall Touch-Up & Damp Proof Patching', desc: 'Putty application, sanding, and anti-damp primer', price: 399.0 },
    { skill: 'Caregivers', name: 'Elderly Assistance & Bedside Care', desc: 'Vital monitoring, mobility assistance, medication reminder', price: 499.0 },
    { skill: 'Drivers', name: 'On-Demand Local City Driver (4 Hours)', desc: 'Verified cooperative chauffeur for manual/automatic car', price: 399.0 },
    { skill: 'Gardeners', name: 'Balcony & Lawn Pruning & Soil Aeration', desc: 'Potting mix, weeding, fertilization, and trimming', price: 299.0 },
    { skill: 'Cleaners', name: 'Deep Bathroom Sanitization & Descaling', desc: 'Tile acid-wash, hard water stain removal, germ shield', price: 299.0 },
    { skill: 'Cleaners', name: 'Full Home Vacuuming & Floor Mopping', desc: 'Herbal floor disinfection and curtain dust extraction', price: 599.0 },
    { skill: 'Technicians', name: 'AC Filter Cleaning & Gas Leak Diagnosis', desc: 'Blower coil cleaning, drainage flush, amp test', price: 349.0 },
    { skill: 'Technicians', name: 'Washing Machine & Microwave Diagnosis', desc: 'Drum spin motor, PCB check, and earthing test', price: 249.0 },
  ];

  for (const s of servicesConfig) {
    const sk = skillMap[s.skill];
    const existing = await prisma.service.findFirst({
      where: { name: s.name, skillId: sk.id },
    });
    if (!existing) {
      await prisma.service.create({
        data: {
          skillId: sk.id,
          name: s.name,
          description: s.desc,
          basePrice: s.price,
        },
      });
    }
  }
  console.log('✔ Catalog services seeded for all 10 skills');

  // ==========================================================================
  // 4. CUSTOMER USER
  // ==========================================================================
  const customerUser = await prisma.user.upsert({
    where: { phone: '+919899011223' },
    update: {
      latitude: 22.6950,
      longitude: 88.4550,
    },
    create: {
      fullName: 'Priya Soni',
      email: 'priya.soni@a2zee.local',
      phone: '+919899011223',
      passwordHash,
      role: 'CUSTOMER',
      latitude: 22.6950,
      longitude: 88.4550,
    },
  });
  console.log('✔ Customer seeded: Priya Soni (Madhyamgram, Lat: 22.6950, Lng: 88.4550)');

  // ==========================================================================
  // 5. 20 WORKERS (10 PER COOPERATIVE ACROSS ALL 10 SKILLS)
  // ==========================================================================
  // Cooperative 1: Pragati Labour Cooperative Society (Madhyamgram / Barasat)
  const pragatiWorkers = [
    { name: 'Ramesh Kumar', skill: 'Electrician', phone: '+919876543210', rating: 4.9, jobs: 142, lat: 22.6980, lng: 88.4520, status: 'AVAILABLE', bio: 'Certified Master Electrician, 10+ yrs exp.' },
    { name: 'Bikash Roy', skill: 'Plumbers', phone: '+919876543211', rating: 4.8, jobs: 98, lat: 22.7010, lng: 88.4480, status: 'AVAILABLE', bio: 'Sanitary and CPVC plumbing expert.' },
    { name: 'Sunita Mondal', skill: 'Househelp', phone: '+919876543212', rating: 4.9, jobs: 120, lat: 22.6940, lng: 88.4580, status: 'AVAILABLE', bio: 'Dedicated home assistant and cook.' },
    { name: 'Gopal Mistri', skill: 'Carpenters', phone: '+919876543213', rating: 4.7, jobs: 64, lat: 22.7120, lng: 88.4710, status: 'AVAILABLE', bio: 'Traditional teak & modular woodwork specialist.' },
    { name: 'Tapas Biswas', skill: 'Painters', phone: '+919876543214', rating: 4.6, jobs: 42, lat: 22.7050, lng: 88.4600, status: 'AVAILABLE', bio: 'Interior emulsions & waterproof putty painter.' },
    { name: 'Maya Sengupta', skill: 'Caregivers', phone: '+919876543215', rating: 5.0, jobs: 55, lat: 22.6920, lng: 88.4490, status: 'AVAILABLE', bio: 'Certified patient & elderly healthcare aide.' },
    { name: 'Pranab Ghosh', skill: 'Drivers', phone: '+919876543216', rating: 4.8, jobs: 89, lat: 22.6880, lng: 88.4530, status: 'AVAILABLE', bio: 'Safe defensive driver, commercial license.' },
    { name: 'Subal Das', skill: 'Gardeners', phone: '+919876543217', rating: 4.5, jobs: 31, lat: 22.7180, lng: 88.4790, status: 'AVAILABLE', bio: 'Horticulture & terrace garden caretaker.' },
    { name: 'Anita Das', skill: 'Cleaners', phone: '+919876543218', rating: 4.7, jobs: 73, lat: 22.6960, lng: 88.4610, status: 'AVAILABLE', bio: 'Deep sanitization & upholstery dry cleaner.' },
    { name: 'Ashok Halder', skill: 'Technicians', phone: '+919876543219', rating: 4.9, jobs: 115, lat: 22.6910, lng: 88.4570, status: 'AVAILABLE', bio: 'Inverter AC & refrigerator diagnosis technician.' },
  ];

  // Cooperative 2: Navchetana Labour Cooperative Society (Rajarhat / New Town)
  const navchetanaWorkers = [
    { name: 'Debashis Pal', skill: 'Electrician', phone: '+919876543220', rating: 4.7, jobs: 18, lat: 22.6250, lng: 88.4850, status: 'AVAILABLE', bio: 'Wiring and home automation installer.' },
    { name: 'Chandan Naskar', skill: 'Plumbers', phone: '+919876543221', rating: 4.6, jobs: 14, lat: 22.6320, lng: 88.4420, status: 'AVAILABLE', bio: 'Drainage and water purifier technician.' },
    { name: 'Jhuma Sarkar', skill: 'Househelp', phone: '+919876543222', rating: 4.8, jobs: 35, lat: 22.6100, lng: 88.4600, status: 'AVAILABLE', bio: 'Reliable household maintenance assistant.' },
    { name: 'Uttam Karmakar', skill: 'Carpenters', phone: '+919876543223', rating: 4.5, jobs: 9, lat: 22.6410, lng: 88.4350, status: 'AVAILABLE', bio: 'Door fittings and modular kitchen repairer.' },
    { name: 'Sujit Roy', skill: 'Painters', phone: '+919876543224', rating: 4.8, jobs: 24, lat: 22.5890, lng: 88.4700, status: 'AVAILABLE', bio: 'Texture painting and exterior waterproof coating.' },
    { name: 'Anima Bagchi', skill: 'Caregivers', phone: '+919876543225', rating: 4.9, jobs: 28, lat: 22.6050, lng: 88.4550, status: 'AVAILABLE', bio: 'Trained geriatric care nurse.' },
    { name: 'Dipak Barman', skill: 'Drivers', phone: '+919876543226', rating: 4.6, jobs: 12, lat: 22.6200, lng: 88.4400, status: 'AVAILABLE', bio: 'Punctual city and highway experienced driver.' },
    { name: 'Shyamal Murmu', skill: 'Gardeners', phone: '+919876543227', rating: 4.9, jobs: 8, lat: 22.5950, lng: 88.4800, status: 'AVAILABLE', bio: 'Bonsai and landscape lawn maintenance expert.' },
    { name: 'Rekha Mallick', skill: 'Cleaners', phone: '+919876543228', rating: 4.8, jobs: 22, lat: 22.6150, lng: 88.4650, status: 'AVAILABLE', bio: 'Chemical-free eco steam cleaning specialist.' },
    { name: 'Ranjit Dutta', skill: 'Technicians', phone: '+919876543229', rating: 4.7, jobs: 15, lat: 22.6300, lng: 88.4500, status: 'OFFLINE', bio: 'Appliance repair technician (offline for study).' },
  ];

  async function seedWorkerList(list, coop) {
    for (const w of list) {
      const cleanPhone = w.phone;
      const email = `${cleanPhone.replace(/[^0-9]/g, '')}@a2zee.local`;

      // 1. Create/Update User
      const user = await prisma.user.upsert({
        where: { phone: cleanPhone },
        update: {
          fullName: w.name,
          email,
          role: 'WORKER',
          latitude: w.lat,
          longitude: w.lng,
        },
        create: {
          fullName: w.name,
          email,
          phone: cleanPhone,
          passwordHash,
          role: 'WORKER',
          latitude: w.lat,
          longitude: w.lng,
        },
      });

      // 2. Create/Update Worker
      const worker = await prisma.worker.upsert({
        where: { userId: user.id },
        update: {
          cooperativeId: coop.id,
          bio: w.bio,
          averageRating: w.rating,
          totalJobs: w.jobs,
          verificationStatus: 'VERIFIED',
          availabilityStatus: w.status,
          latitude: w.lat,
          longitude: w.lng,
        },
        create: {
          userId: user.id,
          cooperativeId: coop.id,
          bio: w.bio,
          averageRating: w.rating,
          totalJobs: w.jobs,
          verificationStatus: 'VERIFIED',
          availabilityStatus: w.status,
          latitude: w.lat,
          longitude: w.lng,
        },
      });

      // 3. Link Skill
      const sk = skillMap[w.skill];
      if (sk) {
        await prisma.workerSkill.upsert({
          where: {
            workerId_skillId: {
              workerId: worker.id,
              skillId: sk.id,
            },
          },
          update: {},
          create: {
            workerId: worker.id,
            skillId: sk.id,
          },
        });
      }
    }
  }

  await seedWorkerList(pragatiWorkers, pragatiCoop);
  console.log('✔ Seeded 10 workers for Pragati Labour Cooperative Society');

  await seedWorkerList(navchetanaWorkers, navchetanaCoop);
  console.log('✔ Seeded 10 workers for Navchetana Labour Cooperative Society');

  console.log('🎉 Seeding successfully completed! 2 Cooperatives, 10 Skills, 20 Verified Artisans in database.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
