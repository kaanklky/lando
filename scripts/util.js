'use strict';

const  chalk = require('chalk'),
  child = require('child_process'),
  semver = require('semver');

module.exports = {

  /**
   * Helper to run Git Comamnds
   * @see https://github.com/pankajladhar/run-git-command/blob/master/index.js
   * @param args
   * @param customMsg
   */
  execGitCmd: function(args, customMsg) {
    console.log(customMsg);
    return child.spawnSync('git', args, {stdio: [0, 'pipe', 'pipe'], encoding: 'utf8'}).stdout;
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
  },

  shellExec: function(data) {
    const opts = {
      stdout: true,
      stderr: true,
      stdin: true,
      failOnError: true,
      stdinRawMode: false,
      preferLocal: true,
      execOptions: {
        env: data.options.execOptions.env || process.env
      }
    };

    const cmd = typeof data === 'string' ? data : data.command;

    if (cmd === undefined) {
      throw new Error('`command` required');
    }

    opts.execOptions = Object.assign(data.options, opts.execOptions);

    const cp = child.exec(cmd, opts.execOptions, (err, stdout, stderr) => {
        if (err && opts.failOnError) {
          console.warn(err);
        }
        console.log(stdout);
        return console.log('done!');
    });

    const captureOutput = (child, output) => {
        child.pipe(output);
    };

    console.log('Command:', chalk.yellow(cmd));

    if (opts.stdout) {
      captureOutput(cp.stdout, process.stdout);
    }

    if (opts.stderr) {
      captureOutput(cp.stderr, process.stderr);
    }
  }
};
