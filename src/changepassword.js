/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const challengeUtils = require('../lib/challengeUtils');
const security = require('../lib/insecurity');
const cache = require('../data/datacache');
const UserModel = require('../models/user');

const challenges = cache.challenges;

module.exports = function changePassword() {
  return (req, res, next) => {
    const { query, headers, connection } = req;
    const currentPassword = query.current;
    const newPassword = query.new;
    const newPasswordInString = newPassword ? newPassword.toString() : null;
    const repeatPassword = query.repeat;

    if (!newPassword || newPassword === 'undefined') {
      res.status(401).send(res.__('Password cannot be empty.'));
    } else if (newPassword !== repeatPassword) {
      res.status(401).send(res.__('New and repeated password do not match.'));
    } else {
      const token = headers.authorization ? headers.authorization.substr('Bearer='.length) : null;
      const loggedInUser = security.authenticatedUsers.get(token);

      if (loggedInUser) {
        if (currentPassword && security.hash(currentPassword) !== loggedInUser.data.password) {
          res.status(401).send(res.__('Current password is not correct.'));
        } else {
          UserModel.findByPk(loggedInUser.data.id)
            .then((user) => {
              if (user != null) {
                user.update({ password: newPasswordInString })
                  .then((updatedUser) => {
                    challengeUtils.solveIf(
                      challenges.changePasswordBenderChallenge,
                      () => updatedUser.id === 3 && !currentPassword && updatedUser.password === security.hash('slurmCl4ssic')
                    );
                    res.json({ user: updatedUser });
                  })
                  .catch((error) => next(error));
              }
            })
            .catch((error) => next(error));
        }
      } else {
        next(new Error('Blocked illegal activity by ' + connection.remoteAddress));
      }
    }
  };
};
