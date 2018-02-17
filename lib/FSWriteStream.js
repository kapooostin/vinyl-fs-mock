(function() {
  var FSWriteStream, FileSystem, Writable, createWriteStream, deprecate, isBinarySync, pathUtil,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  pathUtil = require('path');

  FileSystem = require('./FileSystem');

  Writable = require('readable-stream/writable');

  deprecate = require('util-deprecate');

  isBinarySync = require('istextorbinary').isBinarySync;

  FSWriteStream = (function(superClass) {
    extend(FSWriteStream, superClass);

    function FSWriteStream(fileSystem, folder, cwd) {
      this.fileSystem = fileSystem;
      FSWriteStream.__super__.constructor.call(this, {
        objectMode: true
      });
      this.cwd = cwd != null ? cwd : this.fileSystem.fullpath();
      folder = folder != null ? folder : '.';
      this.path = pathUtil.resolve(this.cwd, folder);
      this.fileSystem.openFolder(this.path, true);
    }

    FSWriteStream.prototype._write = function(file, encoding, next) {
      var ex;
      try {
        this.fileSystem.writeFile(this.resolvePath(file), this.dumpFile(file), true);
        return next();
      } catch (error) {
        ex = error;
        return next(ex);
      }
    };

    FSWriteStream.prototype.resolvePath = function(file) {
      var relativePath;
      if (this.path == null) {
        return file.path;
      }
      relativePath = pathUtil.relative(file.base, file.path);
      return pathUtil.join(this.path, relativePath);
    };

    FSWriteStream.prototype.dumpFile = function(file) {
      if (file.isBuffer() && isBinarySync(file.basename, file.contents)) {
        return file.contents.toString('hex');
      }
      if (file.isBuffer()) {
        return file.contents.toString('utf8');
      }
      if (file.isNull()) {
        return '';
      }
      throw new Error('Not Supported');
    };

    FSWriteStream.prototype.onFinished = function(done, callback) {
      return this.on('finish', (function(_this) {
        return function() {
          var ex;
          try {
            callback(_this.fileSystem.openFolder(_this.path));
            return done();
          } catch (error) {
            ex = error;
            return done(ex);
          }
        };
      })(this));
    };

    return FSWriteStream;

  })(Writable);

  module.exports = FSWriteStream;

  createWriteStream = function(path) {
    return new FSWriteStream(this, path);
  };

  FileSystem.prototype.createWriteStream = deprecate(createWriteStream, 'fileSystem.createWriteStream is deprecated, use fileSystem.dest instead');

  FileSystem.prototype.dest = function(folder, options) {
    if (options == null) {
      options = {};
    }
    return new FSWriteStream(this, folder, options.cwd);
  };

}).call(this);
