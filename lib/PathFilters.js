(function() {
  var Minimatch, Type, _, checkFilterType, createFilterChain, createVerifier, glob2base, log, negativeFiler, neutralFilter, passThrough, pathUtil, positiveFiler, terminator, unrelativeGlob;

  pathUtil = require('path');

  Type = require('type-of-is');

  Minimatch = require('minimatch').Minimatch;

  glob2base = require('glob2base');

  _ = require('lodash');

  log = function(msg) {
    return log.log(msg);
  };

  log.enableLog = function(enabled) {
    if (enabled) {
      return log.log = console.log;
    } else {
      return log.log = function() {};
    }
  };

  log.enableLog(false);

  createFilterChain = function(globs, options) {
    var chainer, filter, glob, i, len, ref, verifier;
    if (globs.length === 0) {
      return passThrough;
    }
    filter = terminator;
    ref = globs.slice(0).reverse();
    for (i = 0, len = ref.length; i < len; i++) {
      glob = ref[i];
      verifier = createVerifier(glob, options.cwd);
      chainer = checkFilterType(glob);
      filter = chainer(verifier, filter);
    }
    return function(input) {
      var result;
      result = filter(input, null) === true;
      log("\noutput: " + result + "\n");
      return result;
    };
  };

  positiveFiler = function(verifier, next) {
    return function(input, previousResult) {
      var newResult;
      log("Positve: " + verifier.verifierName);
      log("  (" + input + ", " + previousResult + ") -> ");
      switch (previousResult) {
        case true:
          log("    next(true): bypassed");
          return next(input, true);
        case null:
          newResult = verifier(input) ? true : null;
          log("    next(" + newResult + "): checked");
          return next(input, newResult);
        case false:
          log("    false: determined");
          return false;
      }
    };
  };

  negativeFiler = function(verifier, next) {
    return function(input, previousResult) {
      log("Negative: " + verifier.verifierName);
      log("  (" + input + ", " + previousResult + ") -> ");
      switch (previousResult) {
        case true:
        case null:
          if (verifier(input)) {
            log("    next(" + previousResult + "): keep");
            return next(input, previousResult);
          } else {
            log("    false: rejected");
            return false;
          }
          break;
        case false:
          log("    false: determined");
          return false;
      }
    };
  };

  neutralFilter = function(verifier, next) {
    return function(input, previousResult) {
      return verifier(input, previousResult, next);
    };
  };

  passThrough = function(input, previousResult) {
    return true;
  };

  terminator = function(input, result) {
    log("terminator: " + result);
    return result;
  };

  createVerifier = function(glob, basepath) {
    var base, minimatch, verifier;
    verifier = (function() {
      switch (Type.of(glob)) {
        case RegExp:
          return function(file) {
            return glob.test(file.path);
          };
        case Function:
          return glob;
        case String:
          glob = unrelativeGlob(glob, basepath);
          minimatch = new Minimatch(glob, {
            matchBase: true
          });
          base = pathUtil.resolve(glob2base.minimatch(minimatch.set));
          return function(file) {
            if (minimatch.match(file.path)) {
              file.base = base;
              return true;
            } else {
              return false;
            }
          };
      }
    })();
    verifier.verifierName = glob;
    return verifier;
  };

  checkFilterType = function(glob) {
    if (Type.is(glob, RegExp)) {
      return negativeFiler;
    } else if (Type.is(glob, Function)) {
      return neutralFilter;
    } else if (glob[0] === '!') {
      return negativeFiler;
    } else {
      return positiveFiler;
    }
  };

  unrelativeGlob = function(glob, basepath) {
    var prefix;
    if (Type.is(glob, RegExp) || Type.is(glob, Function)) {
      return glob;
    }
    if (glob[0] === '!') {
      prefix = '!';
      glob = glob.slice(1);
    } else {
      prefix = '';
    }
    return prefix + pathUtil.join(basepath, glob);
  };

  module.exports = {
    createFilterChain: createFilterChain,
    positiveFiler: positiveFiler,
    negativeFiler: negativeFiler,
    neutralFilter: neutralFilter,
    passThrough: passThrough,
    terminator: terminator,
    createVerifier: createVerifier,
    checkFilterType: checkFilterType,
    unrelativeGlob: unrelativeGlob,
    enableLog: log.enableLog
  };

}).call(this);
