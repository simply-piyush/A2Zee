/**
 * Intelligent Cooperative Dispatch Engine
 * Supports Emergency & Standard (Non-Emergency) Dispatch with Fair-Share Workload Balancing,
 * Schedule Collision Checking, and Cascading Rejection Reassignment.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates great-circle distance between two GPS coordinates using Haversine formula
 * @returns distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lat1 === undefined || lon1 === null || lon1 === undefined ||
      lat2 === null || lat2 === undefined || lon2 === null || lon2 === undefined) {
    return 5.0; // Default distance fallback (5km) if coordinates not provided
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 100) / 100;
}

/**
 * Checks if a worker has an overlapping booking for the given time slot
 */
export function hasScheduleCollision(worker, startTime, endTime) {
  if (!worker.bookings || worker.bookings.length === 0 || !startTime || !endTime) {
    return false;
  }

  const targetStart = new Date(startTime).getTime();
  const targetEnd = new Date(endTime).getTime();

  for (const b of worker.bookings) {
    // Only check active or scheduled bookings
    if (['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status)) {
      const bStart = b.scheduledStartTime ? new Date(b.scheduledStartTime).getTime() : new Date(b.bookingDate).getTime();
      const bEnd = b.scheduledEndTime ? new Date(b.scheduledEndTime).getTime() : bStart + 2 * 60 * 60 * 1000; // default 2h

      // Overlap condition: targetStart < bEnd && targetEnd > bStart
      if (targetStart < bEnd && targetEnd > bStart) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculates estimated arrival time (ETA) in minutes based on distance
 */
export function calculateETA(distanceKm) {
  const avgSpeedKmh = 20; // 20 km/h city transit speed
  const transitMinutes = (distanceKm / avgSpeedKmh) * 60;
  const prepMinutes = 5; // 5 min preparation & gear check
  return Math.max(8, Math.round(transitMinutes + prepMinutes));
}

/**
 * Canonicalizes any variation of trade / skill name to the exact DB Skill.name
 * (e.g. 'Plumbing', 'plumber' -> 'Plumbers', 'Cleaning' -> 'Cleaners', 'Carpentry' -> 'Carpenters')
 */
export function getCanonicalSkillName(input) {
  if (!input || typeof input !== 'string') return null;
  const s = input.trim().toLowerCase();
  if (s.includes('electr') || s.includes('wiring') || s.includes('fuse') || s.includes('switch') || s.includes('fan')) return 'Electrician';
  if (s.includes('plumb') || s.includes('tap') || s.includes('pipe') || s.includes('drain') || s.includes('leak') || s.includes('water')) return 'Plumbers';
  if (s.includes('carpent') || s.includes('wood') || s.includes('door') || s.includes('lock') || s.includes('furniture')) return 'Carpenters';
  if (s.includes('clean') || s.includes('scrub') || s.includes('sanitiz') || s.includes('vacuum') || s.includes('sweep') || s.includes('mop')) return 'Cleaners';
  if (s.includes('house') || s.includes('maid') || s.includes('cook') || s.includes('chore')) return 'Househelp';
  if (s.includes('paint') || s.includes('wall') || s.includes('color') || s.includes('damp')) return 'Painters';
  if (s.includes('care') || s.includes('elder') || s.includes('patient') || s.includes('nurse')) return 'Caregivers';
  if (s.includes('driv') || s.includes('car') || s.includes('transit') || s.includes('chauffeur')) return 'Drivers';
  if (s.includes('garden') || s.includes('lawn') || s.includes('plant') || s.includes('prun')) return 'Gardeners';
  if (s.includes('technic') || s.includes('appliance') || s.includes('ac') || s.includes('fridge') || s.includes('microwave')) return 'Technicians';
  return input.trim();
}

/**
 * Core Artisan Ranking Function
 * 
 * @param {Object} options
 * @param {number} options.userLat - User/Job Latitude
 * @param {number} options.userLng - User/Job Longitude
 * @param {Array} options.workers - List of candidate Worker records with user, skills, cooperative
 * @param {boolean} options.isEmergency - True for emergency, False for standard
 * @param {Date|string} options.startTime - Scheduled start
 * @param {Date|string} options.endTime - Scheduled end
 * @param {Array<string>} options.excludedWorkerIds - Worker IDs who declined or are excluded
 * @param {string} options.requiredSkillId - Specific Skill UUID required for this job
 * @param {string} options.requiredSkillName - Specific Skill Name required for this job
 * @returns {Object} { topCandidate, rankedCandidates, totalCandidatesEvaluated }
 */
export function rankArtisans({
  userLat,
  userLng,
  workers = [],
  isEmergency = false,
  startTime = null,
  endTime = null,
  excludedWorkerIds = [],
  requiredSkillId = null,
  requiredSkillName = null,
}) {
  const excludedSet = new Set(excludedWorkerIds || []);
  const canonicalReqName = requiredSkillName ? getCanonicalSkillName(requiredSkillName) : null;

  // 1. Filter out excluded workers, unverified workers, and workers WITHOUT the required skill
  let eligibleWorkers = workers.filter((w) => {
    if (excludedSet.has(w.id)) return false;
    if (w.verificationStatus !== 'VERIFIED') return false;

    // Strict Skill Match: Worker MUST possess the requested skill
    if (requiredSkillId) {
      const hasSkill = w.skills?.some((ws) =>
        ws.skillId === requiredSkillId ||
        ws.skill?.id === requiredSkillId ||
        ws.id === requiredSkillId
      );
      if (!hasSkill) return false;
    } else if (canonicalReqName) {
      const hasSkill = w.skills?.some((ws) => {
        const sName = ws.skill?.name || ws.name || (typeof ws === 'string' ? ws : '');
        return getCanonicalSkillName(sName) === canonicalReqName;
      });
      if (!hasSkill) return false;
    }

    // For Emergency: Worker MUST be currently AVAILABLE and online
    if (isEmergency) {
      if (w.availabilityStatus !== 'AVAILABLE') return false;
    }

    // Check schedule collision if time provided
    if (startTime && endTime && hasScheduleCollision(w, startTime, endTime)) {
      return false;
    }

    return true;
  });

  if (eligibleWorkers.length === 0) {
    return {
      topCandidate: null,
      rankedCandidates: [],
      totalCandidatesEvaluated: 0,
    };
  }

  // Find maximum job count among eligible workers for fair-share normalization
  const maxJobs = Math.max(...eligibleWorkers.map((w) => w.totalJobs || 0), 1);

  // Maximum radii (20km radius standard for emergency and local artisan dispatch)
  const maxRadiusKm = 20;

  // 2. Score each eligible worker
  const scoredWorkers = eligibleWorkers.map((worker) => {
    // Check worker's current active address if present
    const activeAddress = worker.addresses?.find(a => a.isCurrent) || worker.addresses?.find(a => a.isDefault) || worker.addresses?.[0];
    const workerLat = activeAddress?.latitude ?? worker.latitude ?? 22.695;
    const workerLng = activeAddress?.longitude ?? worker.longitude ?? 88.455;

    const distance = haversineDistance(userLat, userLng, workerLat, workerLng);
    const rating = Number(worker.averageRating || 4.5);
    const jobsCount = worker.totalJobs || 0;
    const etaMinutes = calculateETA(distance);

    // Component Scores (0 to 1)
    // Distance score: 1 if distance is 0, decays to 0 at maxRadiusKm
    const distanceScore = Math.max(0, Math.min(1, 1 - distance / maxRadiusKm));

    // Rating score: normalized (1 to 5 stars -> 0 to 1)
    const ratingScore = Math.max(0, Math.min(1, (rating - 1) / 4.0));

    let compositeScore = 0;
    let scoreBreakdown = {};

    if (isEmergency) {
      // Emergency Mode: Heavy proximity bias for fastest physical response
      // 60% Distance, 30% Rating, 10% Experience
      const experienceScore = Math.min(1.0, jobsCount / 100);
      compositeScore = (0.60 * distanceScore) + (0.30 * ratingScore) + (0.10 * experienceScore);

      scoreBreakdown = {
        mode: 'EMERGENCY_PRIORITY',
        distanceScore: Math.round(distanceScore * 100) / 100,
        ratingScore: Math.round(ratingScore * 100) / 100,
        experienceScore: Math.round(experienceScore * 100) / 100,
        weights: '60% Proximity | 30% Rating | 10% Experience',
      };
    } else {
      // Standard Mode: Fair cooperative distribution & high quality
      // 35% Rating, 35% Distance, 30% Job Equity (fewer jobs = higher priority boost)
      const equityScore = Math.max(0.1, 1 - (jobsCount / (maxJobs * 1.25)));
      compositeScore = (0.35 * ratingScore) + (0.35 * distanceScore) + (0.30 * equityScore);

      scoreBreakdown = {
        mode: 'COOPERATIVE_FAIR_SHARE',
        ratingScore: Math.round(ratingScore * 100) / 100,
        distanceScore: Math.round(distanceScore * 100) / 100,
        equityScore: Math.round(equityScore * 100) / 100,
        weights: '35% Rating | 35% Proximity | 30% Load Balancing Equity',
      };
    }

    return {
      worker,
      workerId: worker.id,
      workerName: worker.user?.fullName || 'Cooperative Artisan',
      phone: worker.user?.phone,
      cooperative: worker.cooperative?.name,
      rating,
      totalJobs: jobsCount,
      distanceKm: distance,
      etaMinutes,
      availabilityStatus: worker.availabilityStatus,
      compositeScore: Math.round(compositeScore * 1000) / 1000,
      scoreBreakdown,
    };
  });

  // 3. Sort by composite score descending
  scoredWorkers.sort((a, b) => b.compositeScore - a.compositeScore);

  return {
    topCandidate: scoredWorkers[0] || null,
    rankedCandidates: scoredWorkers,
    totalCandidatesEvaluated: scoredWorkers.length,
  };
}
