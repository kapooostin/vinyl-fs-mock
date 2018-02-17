(function() {
  var PathNotExistsException,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  PathNotExistsException = (function(superClass) {
    extend(PathNotExistsException, superClass);

    function PathNotExistsException(message) {
      this.name = this.constructor.name;
      this.message = message;
      this.stack = (new Error()).stack;
    }

    return PathNotExistsException;

  })(Error);

  module.exports = PathNotExistsException;

}).call(this);
