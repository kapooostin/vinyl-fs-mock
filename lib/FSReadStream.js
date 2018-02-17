(function() {
  var FSReadStream, File, FileSystem, FileSystemIterator, Readable, _, createReadStreamDeprecated, deprecate, pathUtil,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  pathUtil = require('path');

  File = require('vinyl');

  FileSystem = require('./FileSystem');

  Readable = require('readable-stream/readable');

  FileSystemIterator = require('./FileSystemIterator');

  _ = require('lodash');

  deprecate = require('util-deprecate');

  FSReadStream = (function(superClass) {
    extend(FSReadStream, superClass);

    function FSReadStream(fileSystem, iterator1, defaults) {
      this.fileSystem = fileSystem;
      this.iterator = iterator1;
      this.defaults = defaults != null ? defaults : {};
      FSReadStream.__super__.constructor.call(this, {
        objectMode: true
      });
      _.defaults(this.defaults, {
        cwd: this.fileSystem.fullpath(),
        base: this.fileSystem.fullpath()
      });
      this.defaults.cwd = this.fileSystem.resolvePath(this.defaults.cwd);
      this.defaults.base = this.fileSystem.resolvePath(this.defaults.base);
    }

    FSReadStream.prototype.createFile = function(file) {
      return new File(_.merge({}, this.defaults, file, {
        contents: this.fileSystem.readFileAsBuffer(file.path)
      }));
    };

    FSReadStream.prototype._read = function() {
      var path;
      path = this.iterator.next();
      if (path != null) {
        return this.push(this.createFile(path));
      } else {
        return this.push(null);
      }
    };

    return FSReadStream;

  })(Readable);

  module.exports = FSReadStream;

  createReadStreamDeprecated = function(path) {
    var iterator;
    if (path == null) {
      path = '.';
    }
    iterator = new FileSystemIterator(this, [], {
      cwd: path
    });
    return new FSReadStream(this, iterator, {
      cwd: path
    });
  };

  FileSystem.prototype.createReadStream = deprecate(createReadStreamDeprecated, 'fileSystem.createReadStream is deprecated, use fileSystem.src instead.');

  FileSystem.prototype.src = function(patterns, options) {
    var iterator;
    iterator = new FileSystemIterator(this, patterns, options);
    return new FSReadStream(this, iterator, options);
  };

}).call(this);
