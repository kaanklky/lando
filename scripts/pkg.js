#!/usr/bin/env node
'use strict';

const argv = require('yargs').argv,
  pkg = require('./pkg/functions');

if (argv.stage === 'cli') {
  return pkg.pgkCli();
}
else if (argv.stage === 'full') {
  return pkg.pkgFull(common.system.platform);
}
