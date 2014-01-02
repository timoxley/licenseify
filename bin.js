#!/usr/bin/env node

var fs = require('fs');

var log = require('kenny-loggins'),
    colors = require('ansicolors');

var generate = require('./generate'),
    ls = require('./list')(),
    pretty = require('./pretty-error');

log.info(colors.cyan('YES THIS IS LICENSEIFY'));
log.info('');

process.on('uncaughtException', function (err) {
  pretty(err).split('\n').forEach(function (m) {
    log.error(m);
  });
  help();
  log.error('NOT OK');
});

if (process.argv.length !== 3) {
  help();
  log.info('TOTALLY OK');
  process.exit(0);
}

var type = process.argv.slice().pop();

if (type === '.') {
  try {
    log.info('READING LICENSE FROM package.json');
    var pkg = JSON.parse(fs.readFileSync(process.cwd() + '/package.json', 'utf8'));
    type = pkg.license;
    log.info('FOUND %s', type);
  }
  catch (err) {
    log.error('ERROR READING package.json');
    throw err;
  }
}

if (ls.indexOf(type) !== -1) {
  var e;
  try {
    fs.statSync(process.cwd() + '/LICENSE');
  }
  catch (err) {
    if (err.code != 'ENOENT') throw err;

    return generate(type, function (err) {
      if (err) throw err;
      log.info('TOTALLY OK');
    });
  }
  throw new Error('LICENSE file already exists! Refusing2overwrite');
}
else {
  throw new Error('Type `' + type + '` does not exist!');
}

function help() {
  log.info('USAGE: licenseify {{license-type}}');
  log.info('Available license types:');
  log.info('');
  ls.forEach(function (type) {
    log.info('\t* %s', type);
  });
  log.info('');
}
