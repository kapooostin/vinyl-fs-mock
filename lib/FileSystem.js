(function() {
  var Buffer, FileSystem, PathNotExistsException, Type, _, pathUtil;

  pathUtil = require('path');

  _ = require('lodash');

  Type = require('type-of-is');

  PathNotExistsException = require('./PathNotExistsException');

  Buffer = require('buffer').Buffer;

  FileSystem = (function() {
    function FileSystem(directory) {
      this.directory = directory;
    }

    FileSystem.prototype.name = function() {
      if (arguments.length === 0) {
        return this.directory['.'];
      } else {
        return this.directory['.'] = arguments[0];
      }
    };

    FileSystem.prototype.path = function() {
      if (arguments.length === 0) {
        return this.directory['..'];
      } else {
        return this.directory['..'] = arguments[0];
      }
    };

    FileSystem.prototype.fullpath = function() {
      return pathUtil.join(this.path(), this.name());
    };

    FileSystem.prototype._localPath = function(path) {
      var localPath;
      path = this.resolvePath(path);
      localPath = pathUtil.relative(this.fullpath(), path);
      return localPath.split(pathUtil.sep);
    };

    FileSystem.prototype.createFolder = function(path) {
      return this.openFolder(path, true);
    };

    FileSystem.prototype.openFolder = function(path, create) {
      var i, len, name, result;
      if (typeof path === 'string') {
        path = this._localPath(path);
      }
      result = this.directory;
      for (i = 0, len = path.length; i < len; i++) {
        name = path[i];
        if (!(name !== '')) {
          continue;
        }
        if (result[name] == null) {
          if (create) {
            result[name] = {};
          } else {
            throw new PathNotExistsException("path " + (path.join(pathUtil.sep)) + " is invalid");
          }
        }
        result = result[name];
      }
      return result;
    };

    FileSystem.prototype.resolvePath = function(path) {
      return pathUtil.resolve(this.fullpath(), path);
    };

    FileSystem.prototype.listFiles = function(path) {
      var folder;
      path = this.resolvePath(path);
      folder = this.openFolder(path);
      return _.chain(folder).keys().filter(function(name) {
        return name !== '.' && name !== '..';
      }).map(function(name) {
        return pathUtil.join(path, name);
      }).value();
    };

    FileSystem.prototype.writeFile = function(path, content, create) {
      var filename, folder;
      path = this._localPath(path);
      filename = path.pop();
      folder = this.openFolder(path, create);
      return folder[filename] = content;
    };

    FileSystem.prototype.readFile = function(path) {
      var filename, folder;
      path = this._localPath(path);
      filename = path.pop();
      folder = this.openFolder(path);
      return folder[filename];
    };

    FileSystem.prototype.deleteFile = function(path) {
      var filename, folder;
      path = this._localPath(path);
      filename = path.pop();
      folder = this.openFolder(path);
      return delete folder[filename];
    };

    FileSystem.prototype.exists = function(path) {
      var ex;
      try {
        this.openFolder(path);
        return true;
      } catch (error) {
        ex = error;
        if (Type.is(ex, PathNotExistsException)) {
          return false;
        }
        throw ex;
      }
    };

    FileSystem.prototype.readFileAsBuffer = function(path) {
      var content;
      content = this.readFile(path);
      if (!Buffer.isBuffer(content)) {
        content = new Buffer(content);
      }
      return content;
    };

    FileSystem.prototype.readFileAsString = function(path, encoding) {
      var content;
      if (encoding == null) {
        encoding = 'utf8';
      }
      content = this.readFile(path);
      if (!_.isString(content)) {
        content = content.toString(encoding);
      }
      return content;
    };

    FileSystem.prototype.entryType = function(path) {
      var content, ex;
      try {
        content = this.readFile(path);
      } catch (error) {
        ex = error;
        if (Type.is(ex, PathNotExistsException)) {
          content = void 0;
        }
      }
      switch (Type.string(content)) {
        case 'Object':
          return 'folder';
        case 'Buffer':
          return 'file.binary';
        case 'String':
          return 'file.text';
        default:
          return 'unknown';
      }
    };

    FileSystem.prototype.isFolder = function(path) {
      return this.entryType(path) === 'folder';
    };

    FileSystem.prototype.isFile = function(path) {
      var type;
      type = this.entryType(path);
      return type.slice(0, 5) === 'file.';
    };

    FileSystem.prototype.subFileSystem = function(path, create) {
      var folder;
      path = this.resolvePath(path);
      folder = this.openFolder(path, create);
      return FileSystem.create(path, folder);
    };

    return FileSystem;

  })();

  module.exports = FileSystem;

}).call(this);
