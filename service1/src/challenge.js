const { Op } = require('sequelize');
const { ChallengeModel } = require('../models/challenge');
const logger = require('./logger');
const config = require('config');
const sanitizeHtml = require('sanitize-html');
const colors = require('colors/safe');
const utils = require('./utils');
const { calculateCheatScore, calculateFindItCheatScore, calculateFixItCheatScore } = require('./antiCheat');
const webhook = require('./webhook');
const accuracy = require('./accuracy');
const { AllHtmlEntities } = require('html-entities');
const { challenges, notifications } = require('../data/datacache');

const entities = new AllHtmlEntities();

const globalWithSocketIO = global;
globalWithSocketIO.io = globalWithSocketIO.io || { emit: () => {} };

function solveIf(challenge, criteria, isRestore = false) {
  if (notSolved(challenge) && criteria()) {
    solve(challenge, isRestore);
  }
}

function solve(challenge, isRestore = false) {
  challenge.solved = true;
  challenge.save().then((solvedChallenge) => {
    logger.info(
      `${isRestore ? colors.grey('Restored') : colors.green('Solved')} ${solvedChallenge.difficulty}-star ${colors.cyan(solvedChallenge.key)} (${solvedChallenge.name})`
    );
    sendNotification(solvedChallenge, isRestore);
    if (!isRestore) {
      const cheatScore = calculateCheatScore(challenge);
      if (process.env.SOLUTIONS_WEBHOOK) {
        webhook.notify(solvedChallenge, cheatScore).catch((error) => {
          logger.error('Webhook notification failed: ' + colors.red(utils.getErrorMessage(error)));
        });
      }
    }
  });
}

function sendNotification(challenge, isRestore) {
  if (!notSolved(challenge)) {
    const flag = utils.ctfFlag(challenge.name);
    const notification = {
      key: challenge.key,
      name: challenge.name,
      challenge: challenge.name + ' (' + entities.decode(sanitizeHtml(challenge.description, { allowedTags: [], allowedAttributes: {} })) + ')',
      flag,
      hidden: !config.get('challenges.showSolvedNotifications'),
      isRestore
    };
    const wasPreviouslyShown = notifications.some(({ key }) => key === challenge.key);
    notifications.push(notification);

    if (globalWithSocketIO.io && (isRestore || !wasPreviouslyShown)) {
      globalWithSocketIO.io.emit('challenge solved', notification);
    }
  }
}

function sendCodingChallengeNotification(challenge) {
  if (challenge.codingChallengeStatus > 0) {
    const notification = {
      key: challenge.key,
      codingChallengeStatus: challenge.codingChallengeStatus
    };
    if (globalWithSocketIO.io) {
      globalWithSocketIO.io.emit('code challenge solved', notification);
    }
  }
}

function notSolved(challenge) {
  return challenge && !challenge.solved;
}

function findChallengeByName(challengeName) {
  for (const c in challenges) {
    if (Object.prototype.hasOwnProperty.call(challenges, c)) {
      if (challenges[c].name === challengeName) {
        return challenges[c];
      }
    }
  }
  logger.warn('Missing challenge with name: ' + challengeName);
}

function findChallengeById(challengeId) {
  for (const c in challenges) {
    if (Object.prototype.hasOwnProperty.call(challenges, c)) {
      if (challenges[c].id === challengeId) {
        return challenges[c];
      }
    }
  }
  logger.warn('Missing challenge with id: ' + challengeId);
}

async function solveFindIt(key, isRestore) {
  const solvedChallenge = challenges[key];
  await ChallengeModel.update({ codingChallengeStatus: 1 }, { where: { key, codingChallengeStatus: { [Op.lt]: 2 } } });
  logger.info(`${isRestore ? colors.grey('Restored') : colors.green('Solved')} 'Find It' phase of coding challenge ${colors.cyan(solvedChallenge.key)} (${solvedChallenge.name})`);
  if (!isRestore) {
    accuracy.storeFindItVerdict(solvedChallenge.key, true);
    accuracy.calculateFindItAccuracy(solvedChallenge.key);
    await calculateFindItCheatScore(solvedChallenge);
    sendCodingChallengeNotification({ key, codingChallengeStatus: 1 });
  }
}

async function solveFixIt(key, isRestore) {
  const solvedChallenge = challenges[key];
  await ChallengeModel.update({ codingChallengeStatus: 2 }, { where: { key } });
  logger.info(`${isRestore ? colors.grey('Restored') : colors.green('Solved')} 'Fix It' phase of coding challenge ${colors.cyan(solvedChallenge.key)} (${solvedChallenge.name})`);
  if (!isRestore) {
    accuracy.storeFixItVerdict(solvedChallenge.key, true);
    accuracy.calculateFixItAccuracy(solvedChallenge.key);
    await calculateFixItCheatScore(solvedChallenge);
    sendCodingChallengeNotification({ key, codingChallengeStatus: 2 });
  }
}

module.exports = {
  solveIf,
  solve,
  sendNotification,
  sendCodingChallengeNotification,
  notSolved,
  findChallengeByName,
  findChallengeById,
  solveFindIt,
  solveFixIt
};
