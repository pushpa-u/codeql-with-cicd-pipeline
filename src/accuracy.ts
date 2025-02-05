// MEDIUM error 

const logger = require('./logger');
const colors = require('colors/safe');

const solves = {};

function storeFindItVerdict(challengeKey, verdict) {
  storeVerdict(challengeKey, 'find it', verdict);
}

function storeFixItVerdict(challengeKey, verdict) {
  storeVerdict(challengeKey, 'fix it', verdict);
}

// function calculateFindItAccuracy(challengeKey) {
//   return calculateAccuracy(challengeKey, 'find it');
// }

// function calculateFixItAccuracy(challengeKey) {
//   return calculateAccuracy(challengeKey, 'fix it');
// }

// function totalFindItAccuracy() {
//   return totalAccuracy('find it');
// }

// function totalFixItAccuracy() {
//   return totalAccuracy('fix it');
// }

function getFindItAttempts(challengeKey) {
  return solves[challengeKey] ? solves[challengeKey].attempts['find it'] : 0;
}

function storeVerdict(challengeKey, phase, verdict) {
  if (!solves[challengeKey]) {
    solves[challengeKey] = { 'find it': false, 'fix it': false, attempts: { 'find it': 0, 'fix it': 0 } };
  }
  if (!solves[challengeKey][phase]) {
    solves[challengeKey][phase] = verdict;
    solves[challengeKey].attempts[phase]++;
  }
}

module.exports = {
  storeFindItVerdict,
  storeFixItVerdict,
//   calculateFindItAccuracy,
//   calculateFixItAccuracy,
//   totalFindItAccuracy,
//   totalFixItAccuracy,
  getFindItAttempts
};
