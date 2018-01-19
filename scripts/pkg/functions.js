'use strict';
const common = require('../../tasks/common');
const fsTasks = require('../../tasks/fs')(common);
const shell = require('../../tasks/shell')(common);
const copy = require('copy');
const fs = require('fs-extra');
const path = require('path');
const util = require('../util');


module.exports = {

  clean: function (directories = []) {
    return directories.map(function(dir) {
      dir.map(function(nestedDir) {
        return fs.emptyDirSync(nestedDir);
      });
    });
  },

  copyOp: function(src = [], dest = '') {
    return src.map(function(reference) {
      copy(reference, dest, {srcBase: '.'}, function(err, files) {
        if (err) throw err;
      });
    });
  },

  pgkCli: function() {
    this.clean([fsTasks.clean.cli.build, fsTasks.clean.cli.dist]);
    this.copyOp(common.files.build, 'build/cli/');
    const pkgCmd = this.cliPkgTask();
    util.shellExec(pkgCmd);
    return this;
  },

  pkgInstaller: function(platform) {
    switch (platform) {
      case 'osx':
        return shell.sh(shell.scriptTask('../build-osx.sh'));
      case 'linux':
        return shell.sh(shell.scriptTask('../build-linux.sh'));
      case 'win':
        return shell.sh(shell.scriptTask('../build-win32.ps1'));
    }
  },

  pkgFull: function() {
    this.clean(common.files.installerBuild);
    this.clean(common.files.installerDist);
    this.copy(['installer/' + common.system.platform + '/**'], 'build/installer/', {mode: true});
    this.pkgCli();
    this.pkgInstaller(common.system.platform);
    this.copy([fsTasks.copy.installer.dist.cwd + '/**'], 'dist/');
  },

  /*
   * Constructs the CLI PKG task
   */
  cliPkgTask: function() {

    // Path to the pkg command
    var binDir = path.resolve(__dirname, '..', '..', 'node_modules', 'pkg');
    var pkg = path.join(binDir, 'lib-es5', 'bin.js');

    // Get target info
    var node = 'node8';
    var os = process.platform;
    var arch = 'x64';

    // Rename the OS because i guess we want to be different than process.platform?
    if (process.platform === 'darwin') {
      os = 'macos';
    }
    else if (process.platform === 'win32') {
      os = 'win';
    }

    // Exec options
    var pkgName = 'lando-' + common.lando.pkgSuffix;
    var configFile = path.join('package.json');
    var entrypoint = path.join('bin', 'lando.js');
    var target = [node, os, arch].join('-');
    var shellOpts = {
      execOptions: {
        stdout: true,
        stderr: true,
        stdin: true,
        failOnError: true,
        stdinRawMode: false,
        preferLocal: true,
        maxBuffer: 20 * 1024 * 1024,
        cwd: 'build/cli'
      }
    };

    // Package command
    var pkgCmd = [
      'node',
      pkg,
      '--targets ' + target,
      '--config ' + configFile,
      '--output ' + pkgName,
      entrypoint
    ];

    // Start to build the command
    var cmd = [];
    cmd.push('cd build/cli');
    cmd.push('yarn --production');
    cmd.push(pkgCmd.join(' '));

    // Add executable perms on POSIX
    if (process.platform !== 'win32') {
      cmd.push('chmod +x ' + pkgName);
      cmd.push('sleep 2');
    }

    // Return the CLI build task
    return {
      options: shellOpts,
      command: cmd.join(' && ')
    };

  }


};
