(function() {
  var FileSystem, FileSystemIterator, Type, _, createFilterChain, deprecate;

  FileSystem = require('./FileSystem');

  Type = require('type-of-is');

  deprecate = require('util-deprecate');

  _ = require('lodash');

  createFilterChain = require('./PathFilters').createFilterChain;

  FileSystemIterator = (function() {
    function FileSystemIterator(fileSystem, patterns, options) {
      this.fileSystem = fileSystem;
      this.patterns = patterns;
      if (options == null) {
        options = {};
      }
      this.options = _.defaults(options, {
        cwd: '.'
      });
      this.options.cwd = this.fileSystem.resolvePath(this.options.cwd);
      if (!Type.is(this.patterns, Array)) {
        this.patterns = [this.patterns];
      }
      this.filterChain = createFilterChain(this.patterns, this.options);
      this.candidates = [];
      this.traversal(this.options.cwd, this.options.cwd);
      this.reset();
    }

    FileSystemIterator.prototype.traversal = function(path, cwd) {
      var file, files, i, len;
      if (!this.fileSystem.exists(path)) {
        return;
      }
      files = this.fileSystem.listFiles(path);
      for (i = 0, len = files.length; i < len; i++) {
        file = files[i];
        if (this.fileSystem.isFolder(file)) {
          this.traversal(file);
        } else {
          this.candidates.push({
            path: file,
            cwd: cwd,
            contents: void 0,
            base: void 0
          });
        }
      }
    };

    FileSystemIterator.prototype.reset = function() {
      return this.result = this.candidates.filter(this.filterChain);
    };

    FileSystemIterator.prototype.next = function() {
      return this.result.shift();
    };

    FileSystemIterator.prototype.batchFetch = function() {
      return this.result;
    };

    return FileSystemIterator;

  })();

  module.exports = FileSystemIterator;

}).call(this);
