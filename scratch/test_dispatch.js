const { haversineDistance, rankArtisans } = require('../lib/dispatchAlgorithm.js');

// Mock candidate workers
const mockWorkers = [
  {
    id: 'w1_ramesh',
    user: { fullName: 'Ramesh Kumar', phone: '+919876543210' },
    cooperative: { name: 'Pragati Labour Coop' },
    verificationStatus: 'VERIFIED',
    availabilityStatus: 'AVAILABLE',
    latitude: 22.6980,
    longitude: 88.4520,
    averageRating: 4.9,
    totalJobs: 142,
  },
  {
    id: 'w2_subhash',
    user: { fullName: 'Subhash Ghosh', phone: '+919876543211' },
    cooperative: { name: 'Pragati Labour Coop' },
    verificationStatus: 'VERIFIED',
    availabilityStatus: 'AVAILABLE',
    latitude: 22.7020,
    longitude: 88.4500,
    averageRating: 4.8,
    totalJobs: 12, // Lower jobs -> higher equity boost in standard mode!
  },
  {
    id: 'w3_offline_debashis',
    user: { fullName: 'Debashis Pal', phone: '+919876543212' },
    cooperative: { name: 'Navchetana Labour Coop' },
    verificationStatus: 'VERIFIED',
    availabilityStatus: 'OFFLINE', // Offline!
    latitude: 22.6990,
    longitude: 88.4510,
    averageRating: 4.7,
    totalJobs: 20,
  }
];

const userLat = 22.6950;
const userLng = 88.4550;

console.log('--- TEST 1: Distance Calculation ---');
console.log('Distance to Ramesh:', haversineDistance(userLat, userLng, mockWorkers[0].latitude, mockWorkers[0].longitude), 'km');

console.log('\n--- TEST 2: Emergency Mode (Requires Online, Proximity + Rating Biased) ---');
const emergencyResult = rankArtisans({
  userLat,
  userLng,
  workers: mockWorkers,
  isEmergency: true,
});
console.log('Top Emergency Candidate:', emergencyResult.topCandidate.workerName, 'Score:', emergencyResult.topCandidate.compositeScore);
console.log('Online candidates ranked:', emergencyResult.rankedCandidates.length);
console.log('Offline worker included in emergency?', emergencyResult.rankedCandidates.some(c => c.workerId === 'w3_offline_debashis'));

console.log('\n--- TEST 3: Standard Mode (Allows Offline, Load Balances Jobs) ---');
const standardResult = rankArtisans({
  userLat,
  userLng,
  workers: mockWorkers,
  isEmergency: false,
});
console.log('Top Standard Candidate:', standardResult.topCandidate.workerName, 'Score:', standardResult.topCandidate.compositeScore);
console.log('Offline worker included in standard scheduled mode?', standardResult.rankedCandidates.some(c => c.workerId === 'w3_offline_debashis'));

console.log('\n--- TEST 4: Cascading Rejection ---');
const rejectedWorkerIds = [emergencyResult.topCandidate.workerId];
const cascadedResult = rankArtisans({
  userLat,
  userLng,
  workers: mockWorkers,
  isEmergency: true,
  excludedWorkerIds: rejectedWorkerIds,
});
console.log('After top worker rejected, next assigned candidate:', cascadedResult.topCandidate?.workerName, 'Score:', cascadedResult.topCandidate?.compositeScore);

console.log('\n✔ All tests completed successfully!');
