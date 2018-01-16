'use strict';

const {spawnSync} = require('child_process');
const semver = require('semver');

module.exports = {

  /**
   * Helper to run Git Comamnds
   * @see https://github.com/pankajladhar/run-git-command/blob/master/index.js
   * @param args
   * @param customMsg
   */
  execGitCmd: function(args, customMsg) {
    console.log(customMsg);
    return spawnSync('git', args, {stdio: [0, 'pipe', 'pipe'], encoding: 'utf8'}).stdout;
  },

  /**
   * Bump the Version of a Package.json given a json object and stage.
   *
   * @param {Object} pkgJson Package.json file as a loaded object.
   * @param {String} stage The release stage.
   * @returns {String} New version number.
   */
  setVersion: function(pkgJson, stage) {
    const current = pkgJson.version;
    switch (stage) {
      case 'prerelease':
        return semver.inc(current, 'prerelease');
      case 'patch':
        return semver.inc(current, 'patch');
      case 'minor':
        return semver.inc(current, 'minor');
      case 'major':
        return semver.inc(current, 'major');
      default:
        return semver.inc(current, stage);
    }
}
};
