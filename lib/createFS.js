(function() {
  var FileSystem, createFS, pathUtil;

  pathUtil = require('path');

  FileSystem = require('./FileSystem');

  createFS = FileSystem.create = function(name, path, fs) {
    var root;
    switch (arguments.length) {
      case 1:
        fs = name;
        root = process.cwd();
        if (fs['.'] == null) {
          fs['.'] = pathUtil.basename(root);
        }
        if (fs['..'] == null) {
          fs['..'] = pathUtil.dirname(root);
        }
        break;
      case 2:
        fs = path;
        name = pathUtil.resolve(name);
        fs['.'] = pathUtil.basename(name);
        fs['..'] = pathUtil.dirname(name);
        break;
      case 3:
        fs['.'] = name;
        fs['..'] = path;
    }
    return new FileSystem(fs);
  };

  module.exports = createFS;

}).call(this);
