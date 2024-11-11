var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.ASSUME_ES5 = false;
$jscomp.ASSUME_NO_NATIVE_MAP = false;
$jscomp.ASSUME_NO_NATIVE_SET = false;
$jscomp.SIMPLE_FROUND_POLYFILL = false;
$jscomp.ISOLATE_POLYFILLS = false;
$jscomp.FORCE_POLYFILL_PROMISE = false;
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = false;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || typeof Object.defineProperties == 'function' ? Object.defineProperty : function(target, property, descriptor) {
  if (target == Array.prototype || target == Object.prototype) {
    return target;
  }
  target[property] = descriptor.value;
  return target;
};
$jscomp.getGlobal = function(passedInThis) {
  var possibleGlobals = ['object' == typeof globalThis && globalThis, passedInThis, 'object' == typeof window && window, 'object' == typeof self && self, 'object' == typeof global && global,];
  for (var i = 0; i < possibleGlobals.length; ++i) {
    var maybeGlobal = possibleGlobals[i];
    if (maybeGlobal && maybeGlobal['Math'] == Math) {
      return maybeGlobal;
    }
  }
  return {valueOf:function() {
    throw new Error('Cannot find global object');
  }}.valueOf();
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.IS_SYMBOL_NATIVE = typeof Symbol === 'function' && typeof Symbol('x') === 'symbol';
$jscomp.TRUST_ES6_POLYFILLS = !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = '$jscp$';
var $jscomp$lookupPolyfilledValue = function(target, property) {
  var obfuscatedName = $jscomp.propertyToPolyfillSymbol[property];
  if (obfuscatedName == null) {
    return target[property];
  }
  var polyfill = target[obfuscatedName];
  return polyfill !== undefined ? polyfill : target[property];
};
$jscomp.polyfill = function(target, polyfill, fromLang, toLang) {
  if (!polyfill) {
    return;
  }
  if ($jscomp.ISOLATE_POLYFILLS) {
    $jscomp.polyfillIsolated(target, polyfill, fromLang, toLang);
  } else {
    $jscomp.polyfillUnisolated(target, polyfill, fromLang, toLang);
  }
};
$jscomp.polyfillUnisolated = function(target, polyfill, fromLang, toLang) {
  var obj = $jscomp.global;
  var split = target.split('.');
  for (var i = 0; i < split.length - 1; i++) {
    var key = split[i];
    if (!(key in obj)) {
      return;
    }
    obj = obj[key];
  }
  var property = split[split.length - 1];
  var orig = obj[property];
  var impl = polyfill(orig);
  if (impl == orig || impl == null) {
    return;
  }
  $jscomp.defineProperty(obj, property, {configurable:true, writable:true, value:impl});
};
$jscomp.polyfillIsolated = function(target, polyfill, fromLang, toLang) {
  var split = target.split('.');
  var isSimpleName = split.length === 1;
  var root = split[0];
  var ownerObject;
  if (!isSimpleName && root in $jscomp.polyfills) {
    ownerObject = $jscomp.polyfills;
  } else {
    ownerObject = $jscomp.global;
  }
  for (var i = 0; i < split.length - 1; i++) {
    var key = split[i];
    if (!(key in ownerObject)) {
      return;
    }
    ownerObject = ownerObject[key];
  }
  var property = split[split.length - 1];
  var nativeImpl = $jscomp.IS_SYMBOL_NATIVE && fromLang === 'es6' ? ownerObject[property] : null;
  var impl = polyfill(nativeImpl);
  if (impl == null) {
    return;
  }
  if (isSimpleName) {
    $jscomp.defineProperty($jscomp.polyfills, property, {configurable:true, writable:true, value:impl});
  } else if (impl !== nativeImpl) {
    if ($jscomp.propertyToPolyfillSymbol[property] === undefined) {
      var BIN_ID = Math.random() * 1e9 >>> 0;
      $jscomp.propertyToPolyfillSymbol[property] = $jscomp.IS_SYMBOL_NATIVE ? $jscomp.global['Symbol'](property) : $jscomp.POLYFILL_PREFIX + BIN_ID + '$' + property;
    }
    var obfuscatedName = $jscomp.propertyToPolyfillSymbol[property];
    $jscomp.defineProperty(ownerObject, obfuscatedName, {configurable:true, writable:true, value:impl});
  }
};
$jscomp.polyfill('Array.prototype.copyWithin', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, start, opt_end) {
    var len = this.length;
    target = toInteger(target);
    start = toInteger(start);
    var end = opt_end === undefined ? len : toInteger(opt_end);
    var to = target < 0 ? Math.max(len + target, 0) : Math.min(target, len);
    var from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
    var final = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
    if (to < from) {
      while (from < final) {
        if (from in this) {
          this[to++] = this[from++];
        } else {
          delete this[to++];
          from++;
        }
      }
    } else {
      final = Math.min(final, len + from - to);
      to += final - from;
      while (final > from) {
        if (--final in this) {
          this[--to] = this[final];
        } else {
          delete this[--to];
        }
      }
    }
    return this;
  };
  function toInteger(arg) {
    var n = Number(arg);
    if (n === Infinity || n === -Infinity) {
      return n;
    }
    return n | 0;
  }
  return polyfill;
}, 'es6', 'es3');
$jscomp.arrayIteratorImpl = function(array) {
  var index = 0;
  return function() {
    if (index < array.length) {
      return {done:false, value:array[index++],};
    } else {
      return {done:true};
    }
  };
};
$jscomp.arrayIterator = function(array) {
  return {next:$jscomp.arrayIteratorImpl(array)};
};
$jscomp.initSymbol = function() {
};
$jscomp.polyfill('Symbol', function(orig) {
  if (orig) {
    return orig;
  }
  var SymbolClass = function(id, opt_description) {
    this.$jscomp$symbol$id_ = id;
    this.description;
    $jscomp.defineProperty(this, 'description', {configurable:true, writable:true, value:opt_description});
  };
  SymbolClass.prototype.toString = function() {
    return this.$jscomp$symbol$id_;
  };
  var BIN_ID = Math.random() * 1e9 >>> 0;
  var SYMBOL_PREFIX = 'jscomp_symbol_' + BIN_ID + '_';
  var counter = 0;
  var symbolPolyfill = function(opt_description) {
    if (this instanceof symbolPolyfill) {
      throw new TypeError('Symbol is not a constructor');
    }
    return new SymbolClass(SYMBOL_PREFIX + (opt_description || '') + '_' + counter++, opt_description);
  };
  return symbolPolyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Symbol.iterator', function(orig) {
  if (orig) {
    return orig;
  }
  var symbolIterator = Symbol('Symbol.iterator');
  var arrayLikes = ['Array', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array'];
  for (var i = 0; i < arrayLikes.length; i++) {
    var ArrayLikeCtor = $jscomp.global[arrayLikes[i]];
    if (typeof ArrayLikeCtor === 'function' && typeof ArrayLikeCtor.prototype[symbolIterator] != 'function') {
      $jscomp.defineProperty(ArrayLikeCtor.prototype, symbolIterator, {configurable:true, writable:true, value:function() {
        return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this));
      }});
    }
  }
  return symbolIterator;
}, 'es6', 'es3');
$jscomp.polyfill('Symbol.asyncIterator', function(orig) {
  if (orig) {
    return orig;
  }
  return Symbol('Symbol.asyncIterator');
}, 'es9', 'es3');
$jscomp.iteratorPrototype = function(next) {
  var iterator = {next:next};
  iterator[Symbol.iterator] = function() {
    return this;
  };
  return iterator;
};
$jscomp.iteratorFromArray = function(array, transform) {
  if (array instanceof String) {
    array = array + '';
  }
  var i = 0;
  var done = false;
  var iter = {next:function() {
    if (!done && i < array.length) {
      var index = i++;
      return {value:transform(index, array[index]), done:false};
    }
    done = true;
    return {done:true, value:void 0};
  }};
  iter[Symbol.iterator] = function() {
    return iter;
  };
  return iter;
};
$jscomp.polyfill('Array.prototype.entries', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function() {
    return $jscomp.iteratorFromArray(this, function(i, v) {
      return [i, v];
    });
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.prototype.fill', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(value, opt_start, opt_end) {
    var length = this.length || 0;
    if (opt_start < 0) {
      opt_start = Math.max(0, length + opt_start);
    }
    if (opt_end == null || opt_end > length) {
      opt_end = length;
    }
    opt_end = Number(opt_end);
    if (opt_end < 0) {
      opt_end = Math.max(0, length + opt_end);
    }
    for (var i = Number(opt_start || 0); i < opt_end; i++) {
      this[i] = value;
    }
    return this;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.findInternal = function(array, callback, thisArg) {
  if (array instanceof String) {
    array = String(array);
  }
  var len = array.length;
  for (var i = 0; i < len; i++) {
    var value = array[i];
    if (callback.call(thisArg, value, i, array)) {
      return {i:i, v:value};
    }
  }
  return {i:-1, v:void 0};
};
$jscomp.polyfill('Array.prototype.find', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(callback, opt_thisArg) {
    return $jscomp.findInternal(this, callback, opt_thisArg).v;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.prototype.findIndex', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(callback, opt_thisArg) {
    return $jscomp.findInternal(this, callback, opt_thisArg).i;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.prototype.flat', function(orig) {
  if (orig) {
    return orig;
  }
  var flat = function(depth) {
    depth = depth === undefined ? 1 : depth;
    var flattened = [];
    for (var i = 0; i < this.length; i++) {
      var element = this[i];
      if (Array.isArray(element) && depth > 0) {
        var inner = Array.prototype.flat.call(element, depth - 1);
        flattened.push.apply(flattened, inner);
      } else {
        flattened.push(element);
      }
    }
    return flattened;
  };
  return flat;
}, 'es9', 'es5');
$jscomp.polyfill('Array.prototype.flatMap', function(orig) {
  if (orig) {
    return orig;
  }
  var flatMap = function(callback, thisArg) {
    var mapped = [];
    for (var i = 0; i < this.length; i++) {
      var result = callback.call(thisArg, this[i], i, this);
      if (Array.isArray(result)) {
        mapped.push.apply(mapped, result);
      } else {
        mapped.push(result);
      }
    }
    return mapped;
  };
  return flatMap;
}, 'es9', 'es5');
$jscomp.polyfill('Array.from', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(arrayLike, opt_mapFn, opt_thisArg) {
    opt_mapFn = opt_mapFn != null ? opt_mapFn : function(x) {
      return x;
    };
    var result = [];
    var iteratorFunction = typeof Symbol != 'undefined' && Symbol.iterator && arrayLike[Symbol.iterator];
    if (typeof iteratorFunction == 'function') {
      arrayLike = iteratorFunction.call(arrayLike);
      var next;
      var k = 0;
      while (!(next = arrayLike.next()).done) {
        result.push(opt_mapFn.call(opt_thisArg, next.value, k++));
      }
    } else {
      var len = arrayLike.length;
      for (var i = 0; i < len; i++) {
        result.push(opt_mapFn.call(opt_thisArg, arrayLike[i], i));
      }
    }
    return result;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Object.is', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(left, right) {
    if (left === right) {
      return left !== 0 || 1 / left === 1 / right;
    } else {
      return left !== left && right !== right;
    }
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.prototype.includes', function(orig) {
  if (orig) {
    return orig;
  }
  var includes = function(searchElement, opt_fromIndex) {
    var array = this;
    if (array instanceof String) {
      array = String(array);
    }
    var len = array.length;
    var i = opt_fromIndex || 0;
    if (i < 0) {
      i = Math.max(i + len, 0);
    }
    for (; i < len; i++) {
      var element = array[i];
      if (element === searchElement || Object.is(element, searchElement)) {
        return true;
      }
    }
    return false;
  };
  return includes;
}, 'es7', 'es3');
$jscomp.polyfill('Array.prototype.keys', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function() {
    return $jscomp.iteratorFromArray(this, function(i) {
      return i;
    });
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.of', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(var_args) {
    return Array.from(arguments);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.prototype.values', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function() {
    return $jscomp.iteratorFromArray(this, function(k, v) {
      return v;
    });
  };
  return polyfill;
}, 'es8', 'es3');
$jscomp.makeIterator = function(iterable) {
  var iteratorFunction = typeof Symbol != 'undefined' && Symbol.iterator && iterable[Symbol.iterator];
  return iteratorFunction ? iteratorFunction.call(iterable) : $jscomp.arrayIterator(iterable);
};
$jscomp.makeAsyncIterator = function(iterable) {
  var asyncIteratorFunction = iterable[Symbol.asyncIterator];
  if (asyncIteratorFunction !== undefined) {
    return asyncIteratorFunction.call(iterable);
  }
  return new $jscomp.AsyncIteratorFromSyncWrapper($jscomp.makeIterator(iterable));
};
$jscomp.AsyncIteratorFromSyncWrapper = function(iterator) {
  this[Symbol.asyncIterator] = function() {
    return this;
  };
  this[Symbol.iterator] = function() {
    return iterator;
  };
  this.next = function(param) {
    return Promise.resolve(iterator.next(param));
  };
  if (iterator['throw'] !== undefined) {
    this['throw'] = function(param) {
      return Promise.resolve(iterator['throw'](param));
    };
  }
  if (iterator['return'] !== undefined) {
    this['return'] = function(param) {
      return Promise.resolve(iterator['return'](param));
    };
  }
};
$jscomp.AsyncGeneratorWrapper$ActionEnum = {YIELD_VALUE:0, YIELD_STAR:1, AWAIT_VALUE:2,};
$jscomp.AsyncGeneratorWrapper$ActionRecord = function(action, value) {
  this.action = action;
  this.value = value;
};
$jscomp.AsyncGeneratorWrapper$GeneratorMethod = {NEXT:'next', THROW:'throw', RETURN:'return',};
$jscomp.AsyncGeneratorWrapper$ExecutionFrame_ = function(method, param, resolve, reject) {
  this.method = method;
  this.param = param;
  this.resolve = resolve;
  this.reject = reject;
};
$jscomp.AsyncGeneratorWrapper$ExecutionNode_ = function(frame, next) {
  this.frame = frame;
  this.next = next;
};
$jscomp.AsyncGeneratorWrapper$ExecutionQueue_ = function() {
  this.head_ = null;
  this.tail_ = null;
};
$jscomp.AsyncGeneratorWrapper$ExecutionQueue_.prototype.isEmpty = function() {
  return this.head_ === null;
};
$jscomp.AsyncGeneratorWrapper$ExecutionQueue_.prototype.first = function() {
  if (this.head_) {
    return this.head_.frame;
  } else {
    throw new Error('no frames in executionQueue');
  }
};
$jscomp.AsyncGeneratorWrapper$ExecutionQueue_.prototype.drop = function() {
  if (this.head_) {
    this.head_ = this.head_.next;
    if (!this.head_) {
      this.tail_ = null;
    }
  }
};
$jscomp.AsyncGeneratorWrapper$ExecutionQueue_.prototype.enqueue = function(newFrame) {
  var node = new $jscomp.AsyncGeneratorWrapper$ExecutionNode_(newFrame, null);
  if (this.tail_) {
    this.tail_.next = node;
    this.tail_ = node;
  } else {
    this.head_ = node;
    this.tail_ = node;
  }
};
$jscomp.AsyncGeneratorWrapper = function(generator) {
  this.generator_ = generator;
  this.delegate_ = null;
  this.executionQueue_ = new $jscomp.AsyncGeneratorWrapper$ExecutionQueue_();
  this[Symbol.asyncIterator] = function() {
    return this;
  };
  var self = this;
  this.boundHandleDelegateResult_ = function(record) {
    self.handleDelegateResult_(record);
  };
  this.boundHandleDelegateError_ = function(thrownError) {
    self.handleDelegateError_(thrownError);
  };
  this.boundRejectAndClose_ = function(err) {
    self.rejectAndClose_(err);
  };
};
$jscomp.AsyncGeneratorWrapper.prototype.enqueueMethod_ = function(method, param) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var wasEmpty = self.executionQueue_.isEmpty();
    self.executionQueue_.enqueue(new $jscomp.AsyncGeneratorWrapper$ExecutionFrame_(method, param, resolve, reject));
    if (wasEmpty) {
      self.runFrame_();
    }
  });
};
$jscomp.AsyncGeneratorWrapper.prototype.next = function(opt_value) {
  return this.enqueueMethod_($jscomp.AsyncGeneratorWrapper$GeneratorMethod.NEXT, opt_value);
};
$jscomp.AsyncGeneratorWrapper.prototype["return"] = function(value) {
  return this.enqueueMethod_($jscomp.AsyncGeneratorWrapper$GeneratorMethod.RETURN, new $jscomp.AsyncGeneratorWrapper$ActionRecord($jscomp.AsyncGeneratorWrapper$ActionEnum.YIELD_VALUE, value));
};
$jscomp.AsyncGeneratorWrapper.prototype["throw"] = function(exception) {
  return this.enqueueMethod_($jscomp.AsyncGeneratorWrapper$GeneratorMethod.THROW, exception);
};
$jscomp.AsyncGeneratorWrapper.prototype.runFrame_ = function() {
  if (!this.executionQueue_.isEmpty()) {
    try {
      if (this.delegate_) {
        this.runDelegateFrame_();
      } else {
        this.runGeneratorFrame_();
      }
    } catch (err) {
      this.rejectAndClose_(err);
    }
  }
};
$jscomp.AsyncGeneratorWrapper.prototype.runGeneratorFrame_ = function() {
  var self = this;
  var frame = this.executionQueue_.first();
  try {
    var genRec = this.generator_[frame.method](frame.param);
    if (genRec.value instanceof $jscomp.AsyncGeneratorWrapper$ActionRecord) {
      switch(genRec.value.action) {
        case $jscomp.AsyncGeneratorWrapper$ActionEnum.YIELD_VALUE:
          Promise.resolve(genRec.value.value).then(function(resolvedValue) {
            frame.resolve({value:resolvedValue, done:genRec.done});
            self.executionQueue_.drop();
            self.runFrame_();
          }, function(e) {
            frame.reject(e);
            self.executionQueue_.drop();
            self.runFrame_();
          })["catch"](this.boundRejectAndClose_);
          return;
        case $jscomp.AsyncGeneratorWrapper$ActionEnum.YIELD_STAR:
          self.delegate_ = $jscomp.makeAsyncIterator(genRec.value.value);
          frame.method = $jscomp.AsyncGeneratorWrapper$GeneratorMethod.NEXT;
          frame.param = undefined;
          self.runFrame_();
          return;
        case $jscomp.AsyncGeneratorWrapper$ActionEnum.AWAIT_VALUE:
          Promise.resolve(genRec.value.value).then(function(resolvedValue) {
            frame.method = $jscomp.AsyncGeneratorWrapper$GeneratorMethod.NEXT;
            frame.param = resolvedValue;
            self.runFrame_();
          }, function(thrownErr) {
            frame.method = $jscomp.AsyncGeneratorWrapper$GeneratorMethod.THROW;
            frame.param = thrownErr;
            self.runFrame_();
          })["catch"](this.boundRejectAndClose_);
          return;
        default:
          throw new Error('Unrecognized AsyncGeneratorWrapper$ActionEnum');
      }
    } else {
      frame.resolve(genRec);
      self.executionQueue_.drop();
      self.runFrame_();
    }
  } catch (e) {
    frame.reject(e);
    self.executionQueue_.drop();
    self.runFrame_();
  }
};
$jscomp.AsyncGeneratorWrapper.prototype.runDelegateFrame_ = function() {
  if (!this.delegate_) {
    throw new Error('no delegate to perform execution');
  }
  var frame = this.executionQueue_.first();
  if (frame.method in this.delegate_) {
    try {
      this.delegate_[frame.method](frame.param).then(this.boundHandleDelegateResult_, this.boundHandleDelegateError_)["catch"](this.boundRejectAndClose_);
    } catch (err) {
      this.handleDelegateError_(err);
    }
  } else {
    this.delegate_ = null;
    this.runFrame_();
  }
};
$jscomp.AsyncGeneratorWrapper.prototype.handleDelegateResult_ = function(record) {
  var frame = this.executionQueue_.first();
  if (record.done === true) {
    this.delegate_ = null;
    frame.method = $jscomp.AsyncGeneratorWrapper$GeneratorMethod.NEXT;
    frame.param = record.value;
    this.runFrame_();
  } else {
    frame.resolve({value:record.value, done:false});
    this.executionQueue_.drop();
    this.runFrame_();
  }
};
$jscomp.AsyncGeneratorWrapper.prototype.handleDelegateError_ = function(thrownError) {
  var frame = this.executionQueue_.first();
  this.delegate_ = null;
  frame.method = $jscomp.AsyncGeneratorWrapper$GeneratorMethod.THROW;
  frame.param = thrownError;
  this.runFrame_();
};
$jscomp.AsyncGeneratorWrapper.prototype.rejectAndClose_ = function(err) {
  if (!this.executionQueue_.isEmpty()) {
    this.executionQueue_.first().reject(err);
    this.executionQueue_.drop();
  }
  if (this.delegate_ && 'return' in this.delegate_) {
    this.delegate_['return'](undefined);
    this.delegate_ = null;
  }
  this.generator_['return'](undefined);
  this.runFrame_();
};
$jscomp.underscoreProtoCanBeSet = function() {
  var x = {a:true};
  var y = {};
  try {
    y.__proto__ = x;
    return y.a;
  } catch (e) {
  }
  return false;
};
$jscomp.setPrototypeOf = $jscomp.TRUST_ES6_POLYFILLS && typeof Object.setPrototypeOf == 'function' ? Object.setPrototypeOf : $jscomp.underscoreProtoCanBeSet() ? function(target, proto) {
  target.__proto__ = proto;
  if (target.__proto__ !== proto) {
    throw new TypeError(target + ' is not extensible');
  }
  return target;
} : null;
$jscomp.generator = {};
$jscomp.generator.ensureIteratorResultIsObject_ = function(result) {
  if (result instanceof Object) {
    return;
  }
  throw new TypeError('Iterator result ' + result + ' is not an object');
};
$jscomp.generator.Context = function() {
  this.isRunning_ = false;
  this.yieldAllIterator_ = null;
  this.yieldResult = undefined;
  this.nextAddress = 1;
  this.catchAddress_ = 0;
  this.finallyAddress_ = 0;
  this.abruptCompletion_ = null;
  this.finallyContexts_ = null;
};
$jscomp.generator.Context.prototype.start_ = function() {
  if (this.isRunning_) {
    throw new TypeError('Generator is already running');
  }
  this.isRunning_ = true;
};
$jscomp.generator.Context.prototype.stop_ = function() {
  this.isRunning_ = false;
};
$jscomp.generator.Context.prototype.jumpToErrorHandler_ = function() {
  this.nextAddress = this.catchAddress_ || this.finallyAddress_;
};
$jscomp.generator.Context.prototype.next_ = function(value) {
  this.yieldResult = value;
};
$jscomp.generator.Context.prototype.throw_ = function(e) {
  this.abruptCompletion_ = {exception:e, isException:true};
  this.jumpToErrorHandler_();
};
$jscomp.generator.Context.prototype["return"] = function(value) {
  this.abruptCompletion_ = {'return':value};
  this.nextAddress = this.finallyAddress_;
};
$jscomp.generator.Context.prototype.jumpThroughFinallyBlocks = function(nextAddress) {
  this.abruptCompletion_ = {jumpTo:nextAddress};
  this.nextAddress = this.finallyAddress_;
};
$jscomp.generator.Context.prototype.yield = function(value, resumeAddress) {
  this.nextAddress = resumeAddress;
  return {value:value};
};
$jscomp.generator.Context.prototype.yieldAll = function(iterable, resumeAddress) {
  var iterator = $jscomp.makeIterator(iterable);
  var result = iterator.next();
  $jscomp.generator.ensureIteratorResultIsObject_(result);
  if (result.done) {
    this.yieldResult = result.value;
    this.nextAddress = resumeAddress;
    return;
  }
  this.yieldAllIterator_ = iterator;
  return this.yield(result.value, resumeAddress);
};
$jscomp.generator.Context.prototype.jumpTo = function(nextAddress) {
  this.nextAddress = nextAddress;
};
$jscomp.generator.Context.prototype.jumpToEnd = function() {
  this.nextAddress = 0;
};
$jscomp.generator.Context.prototype.setCatchFinallyBlocks = function(catchAddress, finallyAddress) {
  this.catchAddress_ = catchAddress;
  if (finallyAddress != undefined) {
    this.finallyAddress_ = finallyAddress;
  }
};
$jscomp.generator.Context.prototype.setFinallyBlock = function(finallyAddress) {
  this.catchAddress_ = 0;
  this.finallyAddress_ = finallyAddress || 0;
};
$jscomp.generator.Context.prototype.leaveTryBlock = function(nextAddress, catchAddress) {
  this.nextAddress = nextAddress;
  this.catchAddress_ = catchAddress || 0;
};
$jscomp.generator.Context.prototype.enterCatchBlock = function(nextCatchBlockAddress) {
  this.catchAddress_ = nextCatchBlockAddress || 0;
  var exception = this.abruptCompletion_.exception;
  this.abruptCompletion_ = null;
  return exception;
};
$jscomp.generator.Context.prototype.enterFinallyBlock = function(nextCatchAddress, nextFinallyAddress, finallyDepth) {
  if (!finallyDepth) {
    this.finallyContexts_ = [this.abruptCompletion_];
  } else {
    this.finallyContexts_[finallyDepth] = this.abruptCompletion_;
  }
  this.catchAddress_ = nextCatchAddress || 0;
  this.finallyAddress_ = nextFinallyAddress || 0;
};
$jscomp.generator.Context.prototype.leaveFinallyBlock = function(nextAddress, finallyDepth) {
  var preservedContext = this.finallyContexts_.splice(finallyDepth || 0)[0];
  var abruptCompletion = this.abruptCompletion_ = this.abruptCompletion_ || preservedContext;
  if (abruptCompletion) {
    if (abruptCompletion.isException) {
      return this.jumpToErrorHandler_();
    }
    if (abruptCompletion.jumpTo != undefined && this.finallyAddress_ < abruptCompletion.jumpTo) {
      this.nextAddress = abruptCompletion.jumpTo;
      this.abruptCompletion_ = null;
    } else {
      this.nextAddress = this.finallyAddress_;
    }
  } else {
    this.nextAddress = nextAddress;
  }
};
$jscomp.generator.Context.prototype.forIn = function(object) {
  return new $jscomp.generator.Context.PropertyIterator(object);
};
$jscomp.generator.Context.PropertyIterator = function(object) {
  this.object_ = object;
  this.properties_ = [];
  for (var property in object) {
    this.properties_.push(property);
  }
  this.properties_.reverse();
};
$jscomp.generator.Context.PropertyIterator.prototype.getNext = function() {
  while (this.properties_.length > 0) {
    var property = this.properties_.pop();
    if (property in this.object_) {
      return property;
    }
  }
  return null;
};
$jscomp.generator.Engine_ = function(program) {
  this.context_ = new $jscomp.generator.Context();
  this.program_ = program;
};
$jscomp.generator.Engine_.prototype.next_ = function(value) {
  this.context_.start_();
  if (this.context_.yieldAllIterator_) {
    return this.yieldAllStep_(this.context_.yieldAllIterator_.next, value, this.context_.next_);
  }
  this.context_.next_(value);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.return_ = function(value) {
  this.context_.start_();
  var yieldAllIterator = this.context_.yieldAllIterator_;
  if (yieldAllIterator) {
    var returnFunction = 'return' in yieldAllIterator ? yieldAllIterator['return'] : function(v) {
      return {value:v, done:true};
    };
    return this.yieldAllStep_(returnFunction, value, this.context_["return"]);
  }
  this.context_["return"](value);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.throw_ = function(exception) {
  this.context_.start_();
  if (this.context_.yieldAllIterator_) {
    return this.yieldAllStep_(this.context_.yieldAllIterator_['throw'], exception, this.context_.next_);
  }
  this.context_.throw_(exception);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.yieldAllStep_ = function(action, value, nextAction) {
  try {
    var result = action.call(this.context_.yieldAllIterator_, value);
    $jscomp.generator.ensureIteratorResultIsObject_(result);
    if (!result.done) {
      this.context_.stop_();
      return result;
    }
    var resultValue = result.value;
  } catch (e) {
    this.context_.yieldAllIterator_ = null;
    this.context_.throw_(e);
    return this.nextStep_();
  }
  this.context_.yieldAllIterator_ = null;
  nextAction.call(this.context_, resultValue);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.nextStep_ = function() {
  while (this.context_.nextAddress) {
    try {
      var yieldValue = this.program_(this.context_);
      if (yieldValue) {
        this.context_.stop_();
        return {value:yieldValue.value, done:false};
      }
    } catch (e) {
      this.context_.yieldResult = undefined;
      this.context_.throw_(e);
    }
  }
  this.context_.stop_();
  if (this.context_.abruptCompletion_) {
    var abruptCompletion = this.context_.abruptCompletion_;
    this.context_.abruptCompletion_ = null;
    if (abruptCompletion.isException) {
      throw abruptCompletion.exception;
    }
    return {value:abruptCompletion["return"], done:true};
  }
  return {value:undefined, done:true};
};
$jscomp.generator.Generator_ = function(engine) {
  this.next = function(opt_value) {
    return engine.next_(opt_value);
  };
  this["throw"] = function(exception) {
    return engine.throw_(exception);
  };
  this["return"] = function(value) {
    return engine.return_(value);
  };
  this[Symbol.iterator] = function() {
    return this;
  };
};
$jscomp.generator.createGenerator = function(generator, program) {
  var result = new $jscomp.generator.Generator_(new $jscomp.generator.Engine_(program));
  if ($jscomp.setPrototypeOf && generator.prototype) {
    $jscomp.setPrototypeOf(result, generator.prototype);
  }
  return result;
};
$jscomp.asyncExecutePromiseGenerator = function(generator) {
  function passValueToGenerator(value) {
    return generator.next(value);
  }
  function passErrorToGenerator(error) {
    return generator["throw"](error);
  }
  return new Promise(function(resolve, reject) {
    function handleGeneratorRecord(genRec) {
      if (genRec.done) {
        resolve(genRec.value);
      } else {
        Promise.resolve(genRec.value).then(passValueToGenerator, passErrorToGenerator).then(handleGeneratorRecord, reject);
      }
    }
    handleGeneratorRecord(generator.next());
  });
};
$jscomp.asyncExecutePromiseGeneratorFunction = function(generatorFunction) {
  return $jscomp.asyncExecutePromiseGenerator(generatorFunction());
};
$jscomp.asyncExecutePromiseGeneratorProgram = function(program) {
  return $jscomp.asyncExecutePromiseGenerator(new $jscomp.generator.Generator_(new $jscomp.generator.Engine_(program)));
};
$jscomp.polyfill('globalThis', function(orig) {
  return orig || $jscomp.global;
}, 'es_2020', 'es3');
$jscomp.checkEs6ConformanceViaProxy = function() {
  try {
    var proxied = {};
    var proxy = Object.create(new $jscomp.global['Proxy'](proxied, {'get':function(target, key, receiver) {
      return target == proxied && key == 'q' && receiver == proxy;
    }}));
    return proxy['q'] === true;
  } catch (err) {
    return false;
  }
};
$jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS = false;
$jscomp.ES6_CONFORMANCE = $jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS && $jscomp.checkEs6ConformanceViaProxy();
$jscomp.owns = function(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};
$jscomp.polyfill('WeakMap', function(NativeWeakMap) {
  function isConformant() {
    if (!NativeWeakMap || !Object.seal) {
      return false;
    }
    try {
      var x = Object.seal({});
      var y = Object.seal({});
      var map = new NativeWeakMap([[x, 2], [y, 3]]);
      if (map.get(x) != 2 || map.get(y) != 3) {
        return false;
      }
      map["delete"](x);
      map.set(y, 4);
      return !map.has(x) && map.get(y) == 4;
    } catch (err) {
      return false;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeWeakMap && $jscomp.ES6_CONFORMANCE) {
      return NativeWeakMap;
    }
  } else {
    if (isConformant()) {
      return NativeWeakMap;
    }
  }
  var prop = '$jscomp_hidden_' + Math.random();
  function WeakMapMembership() {
  }
  function isValidKey(key) {
    var type = typeof key;
    return type === 'object' && key !== null || type === 'function';
  }
  function insert(target) {
    if (!$jscomp.owns(target, prop)) {
      var obj = new WeakMapMembership();
      $jscomp.defineProperty(target, prop, {value:obj});
    }
  }
  function patch(name) {
    if ($jscomp.ISOLATE_POLYFILLS) {
      return;
    }
    var prev = Object[name];
    if (prev) {
      Object[name] = function(target) {
        if (target instanceof WeakMapMembership) {
          return target;
        } else {
          if (Object.isExtensible(target)) {
            insert(target);
          }
          return prev(target);
        }
      };
    }
  }
  patch('freeze');
  patch('preventExtensions');
  patch('seal');
  var index = 0;
  var PolyfillWeakMap = function(opt_iterable) {
    this.id_ = (index += Math.random() + 1).toString();
    if (opt_iterable) {
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.set(item[0], item[1]);
      }
    }
  };
  PolyfillWeakMap.prototype.set = function(key, value) {
    if (!isValidKey(key)) {
      throw new Error('Invalid WeakMap key');
    }
    insert(key);
    if (!$jscomp.owns(key, prop)) {
      throw new Error('WeakMap key fail: ' + key);
    }
    key[prop][this.id_] = value;
    return this;
  };
  PolyfillWeakMap.prototype.get = function(key) {
    return isValidKey(key) && $jscomp.owns(key, prop) ? key[prop][this.id_] : undefined;
  };
  PolyfillWeakMap.prototype.has = function(key) {
    return isValidKey(key) && $jscomp.owns(key, prop) && $jscomp.owns(key[prop], this.id_);
  };
  PolyfillWeakMap.prototype["delete"] = function(key) {
    if (!isValidKey(key) || !$jscomp.owns(key, prop) || !$jscomp.owns(key[prop], this.id_)) {
      return false;
    }
    return delete key[prop][this.id_];
  };
  return PolyfillWeakMap;
}, 'es6', 'es3');
$jscomp.MapEntry = function() {
  this.previous;
  this.next;
  this.head;
  this.key;
  this.value;
};
$jscomp.polyfill('Map', function(NativeMap) {
  function isConformant() {
    if ($jscomp.ASSUME_NO_NATIVE_MAP || !NativeMap || typeof NativeMap != 'function' || !NativeMap.prototype.entries || typeof Object.seal != 'function') {
      return false;
    }
    try {
      NativeMap = NativeMap;
      var key = Object.seal({x:4});
      var map = new NativeMap($jscomp.makeIterator([[key, 's']]));
      if (map.get(key) != 's' || map.size != 1 || map.get({x:4}) || map.set({x:4}, 't') != map || map.size != 2) {
        return false;
      }
      var iter = map.entries();
      var item = iter.next();
      if (item.done || item.value[0] != key || item.value[1] != 's') {
        return false;
      }
      item = iter.next();
      if (item.done || item.value[0].x != 4 || item.value[1] != 't' || !iter.next().done) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeMap && $jscomp.ES6_CONFORMANCE) {
      return NativeMap;
    }
  } else {
    if (isConformant()) {
      return NativeMap;
    }
  }
  var idMap = new WeakMap();
  var PolyfillMap = function(opt_iterable) {
    this.data_ = {};
    this.head_ = createHead();
    this.size = 0;
    if (opt_iterable) {
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.set(item[0], item[1]);
      }
    }
  };
  PolyfillMap.prototype.set = function(key, value) {
    key = key === 0 ? 0 : key;
    var r = maybeGetEntry(this, key);
    if (!r.list) {
      r.list = this.data_[r.id] = [];
    }
    if (!r.entry) {
      r.entry = {next:this.head_, previous:this.head_.previous, head:this.head_, key:key, value:value,};
      r.list.push(r.entry);
      this.head_.previous.next = r.entry;
      this.head_.previous = r.entry;
      this.size++;
    } else {
      r.entry.value = value;
    }
    return this;
  };
  PolyfillMap.prototype["delete"] = function(key) {
    var r = maybeGetEntry(this, key);
    if (r.entry && r.list) {
      r.list.splice(r.index, 1);
      if (!r.list.length) {
        delete this.data_[r.id];
      }
      r.entry.previous.next = r.entry.next;
      r.entry.next.previous = r.entry.previous;
      r.entry.head = null;
      this.size--;
      return true;
    }
    return false;
  };
  PolyfillMap.prototype.clear = function() {
    this.data_ = {};
    this.head_ = this.head_.previous = createHead();
    this.size = 0;
  };
  PolyfillMap.prototype.has = function(key) {
    return !!maybeGetEntry(this, key).entry;
  };
  PolyfillMap.prototype.get = function(key) {
    var entry = maybeGetEntry(this, key).entry;
    return entry && entry.value;
  };
  PolyfillMap.prototype.entries = function() {
    return makeIterator(this, function(entry) {
      return [entry.key, entry.value];
    });
  };
  PolyfillMap.prototype.keys = function() {
    return makeIterator(this, function(entry) {
      return entry.key;
    });
  };
  PolyfillMap.prototype.values = function() {
    return makeIterator(this, function(entry) {
      return entry.value;
    });
  };
  PolyfillMap.prototype.forEach = function(callback, opt_thisArg) {
    var iter = this.entries();
    var item;
    while (!(item = iter.next()).done) {
      var entry = item.value;
      callback.call(opt_thisArg, entry[1], entry[0], this);
    }
  };
  PolyfillMap.prototype[Symbol.iterator] = PolyfillMap.prototype.entries;
  var maybeGetEntry = function(map, key) {
    var id = getId(key);
    var list = map.data_[id];
    if (list && $jscomp.owns(map.data_, id)) {
      for (var index = 0; index < list.length; index++) {
        var entry = list[index];
        if (key !== key && entry.key !== entry.key || key === entry.key) {
          return {id:id, list:list, index:index, entry:entry};
        }
      }
    }
    return {id:id, list:list, index:-1, entry:undefined};
  };
  var makeIterator = function(map, func) {
    var entry = map.head_;
    return $jscomp.iteratorPrototype(function() {
      if (entry) {
        while (entry.head != map.head_) {
          entry = entry.previous;
        }
        while (entry.next != entry.head) {
          entry = entry.next;
          return {done:false, value:func(entry)};
        }
        entry = null;
      }
      return {done:true, value:void 0};
    });
  };
  var createHead = function() {
    var head = {};
    head.previous = head.next = head.head = head;
    return head;
  };
  var mapIndex = 0;
  var getId = function(obj) {
    var type = obj && typeof obj;
    if (type == 'object' || type == 'function') {
      obj = obj;
      if (!idMap.has(obj)) {
        var id = '' + ++mapIndex;
        idMap.set(obj, id);
        return id;
      }
      return idMap.get(obj);
    }
    return 'p_' + obj;
  };
  return PolyfillMap;
}, 'es6', 'es3');
$jscomp.polyfill('Math.acosh', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    return Math.log(x + Math.sqrt(x * x - 1));
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.asinh', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (x === 0) {
      return x;
    }
    var y = Math.log(Math.abs(x) + Math.sqrt(x * x + 1));
    return x < 0 ? -y : y;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.log1p', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (x < 0.25 && x > -0.25) {
      var y = x;
      var d = 1;
      var z = x;
      var zPrev = 0;
      var s = 1;
      while (zPrev != z) {
        y *= x;
        s *= -1;
        z = (zPrev = z) + s * y / ++d;
      }
      return z;
    }
    return Math.log(1 + x);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.atanh', function(orig) {
  if (orig) {
    return orig;
  }
  var log1p = Math.log1p;
  var polyfill = function(x) {
    x = Number(x);
    return (log1p(x) - log1p(-x)) / 2;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.cbrt', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    if (x === 0) {
      return x;
    }
    x = Number(x);
    var y = Math.pow(Math.abs(x), 1 / 3);
    return x < 0 ? -y : y;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.clz32', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x) >>> 0;
    if (x === 0) {
      return 32;
    }
    var result = 0;
    if ((x & 4294901760) === 0) {
      x <<= 16;
      result += 16;
    }
    if ((x & 4278190080) === 0) {
      x <<= 8;
      result += 8;
    }
    if ((x & 4026531840) === 0) {
      x <<= 4;
      result += 4;
    }
    if ((x & 3221225472) === 0) {
      x <<= 2;
      result += 2;
    }
    if ((x & 2147483648) === 0) {
      result++;
    }
    return result;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.cosh', function(orig) {
  if (orig) {
    return orig;
  }
  var exp = Math.exp;
  var polyfill = function(x) {
    x = Number(x);
    return (exp(x) + exp(-x)) / 2;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.expm1', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (x < .25 && x > -.25) {
      var y = x;
      var d = 1;
      var z = x;
      var zPrev = 0;
      while (zPrev != z) {
        y *= x / ++d;
        z = (zPrev = z) + y;
      }
      return z;
    }
    return Math.exp(x) - 1;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.fround', function(orig) {
  if (orig) {
    return orig;
  }
  if ($jscomp.SIMPLE_FROUND_POLYFILL || typeof Float32Array !== 'function') {
    return function(arg) {
      return arg;
    };
  }
  var arr = new Float32Array(1);
  var polyfill = function(arg) {
    arr[0] = arg;
    return arr[0];
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.hypot', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(var_args) {
    if (arguments.length < 2) {
      return arguments.length ? Math.abs(arguments[0]) : 0;
    }
    var i, z, sum, max;
    for (max = 0, i = 0; i < arguments.length; i++) {
      max = Math.max(max, Math.abs(arguments[i]));
    }
    if (max > 1e100 || max < 1e-100) {
      if (!max) {
        return max;
      }
      sum = 0;
      for (i = 0; i < arguments.length; i++) {
        z = Number(arguments[i]) / max;
        sum += z * z;
      }
      return Math.sqrt(sum) * max;
    } else {
      sum = 0;
      for (i = 0; i < arguments.length; i++) {
        z = Number(arguments[i]);
        sum += z * z;
      }
      return Math.sqrt(sum);
    }
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.imul', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(a, b) {
    a = Number(a);
    b = Number(b);
    var ah = a >>> 16 & 65535;
    var al = a & 65535;
    var bh = b >>> 16 & 65535;
    var bl = b & 65535;
    var lh = ah * bl + al * bh << 16 >>> 0;
    return al * bl + lh | 0;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.log10', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    return Math.log(x) / Math.LN10;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.log2', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    return Math.log(x) / Math.LN2;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.sign', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    return x === 0 || isNaN(x) ? x : x > 0 ? 1 : -1;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.sinh', function(orig) {
  if (orig) {
    return orig;
  }
  var exp = Math.exp;
  var polyfill = function(x) {
    x = Number(x);
    if (x === 0) {
      return x;
    }
    return (exp(x) - exp(-x)) / 2;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.tanh', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (x === 0) {
      return x;
    }
    var y = Math.exp(-2 * Math.abs(x));
    var z = (1 - y) / (1 + y);
    return x < 0 ? -z : z;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.trunc', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (isNaN(x) || x === Infinity || x === -Infinity || x === 0) {
      return x;
    }
    var y = Math.floor(Math.abs(x));
    return x < 0 ? -y : y;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Number.EPSILON', function(orig) {
  return Math.pow(2, -52);
}, 'es6', 'es3');
$jscomp.polyfill('Number.MAX_SAFE_INTEGER', function() {
  return 9007199254740991;
}, 'es6', 'es3');
$jscomp.polyfill('Number.MIN_SAFE_INTEGER', function() {
  return -9007199254740991;
}, 'es6', 'es3');
$jscomp.polyfill('Number.isFinite', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    if (typeof x !== 'number') {
      return false;
    }
    return !isNaN(x) && x !== Infinity && x !== -Infinity;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Number.isInteger', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    if (!Number.isFinite(x)) {
      return false;
    }
    return x === Math.floor(x);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Number.isNaN', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    return typeof x === 'number' && isNaN(x);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Number.isSafeInteger', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    return Number.isInteger(x) && Math.abs(x) <= Number.MAX_SAFE_INTEGER;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Number.parseFloat', function(orig) {
  return orig || parseFloat;
}, 'es6', 'es3');
$jscomp.polyfill('Number.parseInt', function(orig) {
  return orig || parseInt;
}, 'es6', 'es3');
$jscomp.assign = $jscomp.TRUST_ES6_POLYFILLS && typeof Object.assign == 'function' ? Object.assign : function(target, var_args) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    if (!source) {
      continue;
    }
    for (var key in source) {
      if ($jscomp.owns(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};
$jscomp.polyfill('Object.assign', function(orig) {
  return orig || $jscomp.assign;
}, 'es6', 'es3');
$jscomp.polyfill('Object.entries', function(orig) {
  if (orig) {
    return orig;
  }
  var entries = function(obj) {
    var result = [];
    for (var key in obj) {
      if ($jscomp.owns(obj, key)) {
        result.push([key, obj[key]]);
      }
    }
    return result;
  };
  return entries;
}, 'es8', 'es3');
$jscomp.polyfill('Object.fromEntries', function(orig) {
  if (orig) {
    return orig;
  }
  function fromEntries(iter) {
    var obj = {};
    if (!(Symbol.iterator in iter)) {
      throw new TypeError('' + iter + ' is not iterable');
    }
    var iteratorFn = iter[Symbol.iterator];
    var iterator = iteratorFn.call(iter);
    for (var result = iterator.next(); !result.done; result = iterator.next()) {
      var pair = result.value;
      if (Object(pair) !== pair) {
        throw new TypeError('iterable for fromEntries should yield objects');
      }
      var key = pair[0];
      var val = pair[1];
      obj[key] = val;
    }
    return obj;
  }
  return fromEntries;
}, 'es_2019', 'es3');
$jscomp.polyfill('Reflect', function(orig) {
  if (orig) {
    return orig;
  }
  return {};
}, 'es6', 'es3');
$jscomp.polyfill('Object.getOwnPropertySymbols', function(orig) {
  if (orig) {
    return orig;
  }
  return function() {
    return [];
  };
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.ownKeys', function(orig) {
  if (orig) {
    return orig;
  }
  var symbolPrefix = 'jscomp_symbol_';
  function isSymbol(key) {
    return key.substring(0, symbolPrefix.length) == symbolPrefix;
  }
  var polyfill = function(target) {
    var keys = [];
    var names = Object.getOwnPropertyNames(target);
    var symbols = Object.getOwnPropertySymbols(target);
    for (var i = 0; i < names.length; i++) {
      (isSymbol(names[i]) ? symbols : keys).push(names[i]);
    }
    return keys.concat(symbols);
  };
  return polyfill;
}, 'es6', 'es5');
$jscomp.polyfill('Object.getOwnPropertyDescriptors', function(orig) {
  if (orig) {
    return orig;
  }
  var getOwnPropertyDescriptors = function(obj) {
    var result = {};
    var keys = Reflect.ownKeys(obj);
    for (var i = 0; i < keys.length; i++) {
      result[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return result;
  };
  return getOwnPropertyDescriptors;
}, 'es8', 'es5');
$jscomp.polyfill('Object.setPrototypeOf', function(orig) {
  return orig || $jscomp.setPrototypeOf;
}, 'es6', 'es5');
$jscomp.polyfill('Object.values', function(orig) {
  if (orig) {
    return orig;
  }
  var values = function(obj) {
    var result = [];
    for (var key in obj) {
      if ($jscomp.owns(obj, key)) {
        result.push(obj[key]);
      }
    }
    return result;
  };
  return values;
}, 'es8', 'es3');
$jscomp.polyfill('Promise', function(NativePromise) {
  function platformSupportsPromiseRejectionEvents() {
    return typeof $jscomp.global['PromiseRejectionEvent'] !== 'undefined';
  }
  function globalPromiseIsNative() {
    return $jscomp.global['Promise'] && $jscomp.global['Promise'].toString().indexOf('[native code]') !== -1;
  }
  function shouldForcePolyfillPromise() {
    return ($jscomp.FORCE_POLYFILL_PROMISE || $jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION && !platformSupportsPromiseRejectionEvents()) && globalPromiseIsNative();
  }
  if (NativePromise && !shouldForcePolyfillPromise()) {
    return NativePromise;
  }
  function AsyncExecutor() {
    this.batch_ = null;
  }
  AsyncExecutor.prototype.asyncExecute = function(f) {
    if (this.batch_ == null) {
      this.batch_ = [];
      var self = this;
      this.asyncExecuteFunction(function() {
        self.executeBatch_();
      });
    }
    this.batch_.push(f);
  };
  var nativeSetTimeout = $jscomp.global['setTimeout'];
  AsyncExecutor.prototype.asyncExecuteFunction = function(f) {
    nativeSetTimeout(f, 0);
  };
  AsyncExecutor.prototype.executeBatch_ = function() {
    while (this.batch_ && this.batch_.length) {
      var executingBatch = this.batch_;
      this.batch_ = [];
      for (var i = 0; i < executingBatch.length; ++i) {
        var f = executingBatch[i];
        executingBatch[i] = null;
        try {
          f();
        } catch (error) {
          this.asyncThrow_(error);
        }
      }
    }
    this.batch_ = null;
  };
  AsyncExecutor.prototype.asyncThrow_ = function(exception) {
    this.asyncExecuteFunction(function() {
      throw exception;
    });
  };
  var PromiseState = {PENDING:0, FULFILLED:1, REJECTED:2};
  var PolyfillPromise = function(executor) {
    this.state_ = PromiseState.PENDING;
    this.result_ = undefined;
    this.onSettledCallbacks_ = [];
    this.isRejectionHandled_ = false;
    var resolveAndReject = this.createResolveAndReject_();
    try {
      executor(resolveAndReject.resolve, resolveAndReject.reject);
    } catch (e) {
      resolveAndReject.reject(e);
    }
  };
  PolyfillPromise.prototype.createResolveAndReject_ = function() {
    var thisPromise = this;
    var alreadyCalled = false;
    function firstCallWins(method) {
      return function(x) {
        if (!alreadyCalled) {
          alreadyCalled = true;
          method.call(thisPromise, x);
        }
      };
    }
    return {resolve:firstCallWins(this.resolveTo_), reject:firstCallWins(this.reject_)};
  };
  PolyfillPromise.prototype.resolveTo_ = function(value) {
    if (value === this) {
      this.reject_(new TypeError('A Promise cannot resolve to itself'));
    } else if (value instanceof PolyfillPromise) {
      this.settleSameAsPromise_(value);
    } else if (isObject(value)) {
      this.resolveToNonPromiseObj_(value);
    } else {
      this.fulfill_(value);
    }
  };
  PolyfillPromise.prototype.resolveToNonPromiseObj_ = function(obj) {
    var thenMethod = undefined;
    try {
      thenMethod = obj.then;
    } catch (error) {
      this.reject_(error);
      return;
    }
    if (typeof thenMethod == 'function') {
      this.settleSameAsThenable_(thenMethod, obj);
    } else {
      this.fulfill_(obj);
    }
  };
  function isObject(value) {
    switch(typeof value) {
      case 'object':
        return value != null;
      case 'function':
        return true;
      default:
        return false;
    }
  }
  PolyfillPromise.prototype.reject_ = function(reason) {
    this.settle_(PromiseState.REJECTED, reason);
  };
  PolyfillPromise.prototype.fulfill_ = function(value) {
    this.settle_(PromiseState.FULFILLED, value);
  };
  PolyfillPromise.prototype.settle_ = function(settledState, valueOrReason) {
    if (this.state_ != PromiseState.PENDING) {
      throw new Error('Cannot settle(' + settledState + ', ' + valueOrReason + '): Promise already settled in state' + this.state_);
    }
    this.state_ = settledState;
    this.result_ = valueOrReason;
    if (this.state_ === PromiseState.REJECTED) {
      this.scheduleUnhandledRejectionCheck_();
    }
    this.executeOnSettledCallbacks_();
  };
  PolyfillPromise.prototype.scheduleUnhandledRejectionCheck_ = function() {
    var self = this;
    nativeSetTimeout(function() {
      if (self.notifyUnhandledRejection_()) {
        var nativeConsole = $jscomp.global['console'];
        if (typeof nativeConsole !== 'undefined') {
          nativeConsole.error(self.result_);
        }
      }
    }, 1);
  };
  PolyfillPromise.prototype.notifyUnhandledRejection_ = function() {
    if (this.isRejectionHandled_) {
      return false;
    }
    var NativeCustomEvent = $jscomp.global['CustomEvent'];
    var NativeEvent = $jscomp.global['Event'];
    var nativeDispatchEvent = $jscomp.global['dispatchEvent'];
    if (typeof nativeDispatchEvent === 'undefined') {
      return true;
    }
    var event;
    if (typeof NativeCustomEvent === 'function') {
      event = new NativeCustomEvent('unhandledrejection', {cancelable:true});
    } else if (typeof NativeEvent === 'function') {
      event = new NativeEvent('unhandledrejection', {cancelable:true});
    } else {
      event = $jscomp.global['document'].createEvent('CustomEvent');
      event.initCustomEvent('unhandledrejection', false, true, event);
    }
    event.promise = this;
    event.reason = this.result_;
    return nativeDispatchEvent(event);
  };
  PolyfillPromise.prototype.executeOnSettledCallbacks_ = function() {
    if (this.onSettledCallbacks_ != null) {
      for (var i = 0; i < this.onSettledCallbacks_.length; ++i) {
        asyncExecutor.asyncExecute(this.onSettledCallbacks_[i]);
      }
      this.onSettledCallbacks_ = null;
    }
  };
  var asyncExecutor = new AsyncExecutor();
  PolyfillPromise.prototype.settleSameAsPromise_ = function(promise) {
    var methods = this.createResolveAndReject_();
    promise.callWhenSettled_(methods.resolve, methods.reject);
  };
  PolyfillPromise.prototype.settleSameAsThenable_ = function(thenMethod, thenable) {
    var methods = this.createResolveAndReject_();
    try {
      thenMethod.call(thenable, methods.resolve, methods.reject);
    } catch (error) {
      methods.reject(error);
    }
  };
  PolyfillPromise.prototype.then = function(onFulfilled, onRejected) {
    var resolveChild;
    var rejectChild;
    var childPromise = new PolyfillPromise(function(resolve, reject) {
      resolveChild = resolve;
      rejectChild = reject;
    });
    function createCallback(paramF, defaultF) {
      if (typeof paramF == 'function') {
        return function(x) {
          try {
            resolveChild(paramF(x));
          } catch (error) {
            rejectChild(error);
          }
        };
      } else {
        return defaultF;
      }
    }
    this.callWhenSettled_(createCallback(onFulfilled, resolveChild), createCallback(onRejected, rejectChild));
    return childPromise;
  };
  PolyfillPromise.prototype["catch"] = function(onRejected) {
    return this.then(undefined, onRejected);
  };
  PolyfillPromise.prototype.callWhenSettled_ = function(onFulfilled, onRejected) {
    var thisPromise = this;
    function callback() {
      switch(thisPromise.state_) {
        case PromiseState.FULFILLED:
          onFulfilled(thisPromise.result_);
          break;
        case PromiseState.REJECTED:
          onRejected(thisPromise.result_);
          break;
        default:
          throw new Error('Unexpected state: ' + thisPromise.state_);
      }
    }
    if (this.onSettledCallbacks_ == null) {
      asyncExecutor.asyncExecute(callback);
    } else {
      this.onSettledCallbacks_.push(callback);
    }
    this.isRejectionHandled_ = true;
  };
  function resolvingPromise(opt_value) {
    if (opt_value instanceof PolyfillPromise) {
      return opt_value;
    } else {
      return new PolyfillPromise(function(resolve, reject) {
        resolve(opt_value);
      });
    }
  }
  PolyfillPromise['resolve'] = resolvingPromise;
  PolyfillPromise['reject'] = function(opt_reason) {
    return new PolyfillPromise(function(resolve, reject) {
      reject(opt_reason);
    });
  };
  PolyfillPromise['race'] = function(thenablesOrValues) {
    return new PolyfillPromise(function(resolve, reject) {
      var iterator = $jscomp.makeIterator(thenablesOrValues);
      for (var iterRec = iterator.next(); !iterRec.done; iterRec = iterator.next()) {
        resolvingPromise(iterRec.value).callWhenSettled_(resolve, reject);
      }
    });
  };
  PolyfillPromise['all'] = function(thenablesOrValues) {
    var iterator = $jscomp.makeIterator(thenablesOrValues);
    var iterRec = iterator.next();
    if (iterRec.done) {
      return resolvingPromise([]);
    } else {
      return new PolyfillPromise(function(resolveAll, rejectAll) {
        var resultsArray = [];
        var unresolvedCount = 0;
        function onFulfilled(i) {
          return function(ithResult) {
            resultsArray[i] = ithResult;
            unresolvedCount--;
            if (unresolvedCount == 0) {
              resolveAll(resultsArray);
            }
          };
        }
        do {
          resultsArray.push(undefined);
          unresolvedCount++;
          resolvingPromise(iterRec.value).callWhenSettled_(onFulfilled(resultsArray.length - 1), rejectAll);
          iterRec = iterator.next();
        } while (!iterRec.done);
      });
    }
  };
  return PolyfillPromise;
}, 'es6', 'es3');
$jscomp.polyfill('Promise.allSettled', function(orig) {
  if (orig) {
    return orig;
  }
  function fulfilledResult(value) {
    return {status:'fulfilled', value:value};
  }
  function rejectedResult(reason) {
    return {status:'rejected', reason:reason};
  }
  var polyfill = function(thenablesOrValues) {
    var PromiseConstructor = this;
    function convertToAllSettledResult(maybeThenable) {
      return PromiseConstructor.resolve(maybeThenable).then(fulfilledResult, rejectedResult);
    }
    var wrappedResults = Array.from(thenablesOrValues, convertToAllSettledResult);
    return PromiseConstructor.all(wrappedResults);
  };
  return polyfill;
}, 'es_2020', 'es3');
$jscomp.polyfill('Promise.prototype.finally', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(onFinally) {
    return this.then(function(value) {
      var promise = Promise.resolve(onFinally());
      return promise.then(function() {
        return value;
      });
    }, function(reason) {
      var promise = Promise.resolve(onFinally());
      return promise.then(function() {
        throw reason;
      });
    });
  };
  return polyfill;
}, 'es9', 'es3');
$jscomp.objectCreate = $jscomp.ASSUME_ES5 || typeof Object.create == 'function' ? Object.create : function(prototype) {
  var ctor = function() {
  };
  ctor.prototype = prototype;
  return new ctor();
};
$jscomp.inherits = function(childCtor, parentCtor) {
  childCtor.prototype = $jscomp.objectCreate(parentCtor.prototype);
  childCtor.prototype.constructor = childCtor;
  if ($jscomp.setPrototypeOf) {
    var setPrototypeOf = $jscomp.setPrototypeOf;
    setPrototypeOf(childCtor, parentCtor);
  } else {
    for (var p in parentCtor) {
      if (p == 'prototype') {
        continue;
      }
      if (Object.defineProperties) {
        var descriptor = Object.getOwnPropertyDescriptor(parentCtor, p);
        if (descriptor) {
          Object.defineProperty(childCtor, p, descriptor);
        }
      } else {
        childCtor[p] = parentCtor[p];
      }
    }
  }
  childCtor.superClass_ = parentCtor.prototype;
};
$jscomp.polyfill('AggregateError', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(errors, message) {
    var $jscomp$tmp$error = Error(message);
    if ('stack' in $jscomp$tmp$error) {
      this.stack = $jscomp$tmp$error.stack;
    }
    this.errors = errors;
    this.message = $jscomp$tmp$error.message;
  };
  $jscomp.inherits(polyfill, Error);
  polyfill.prototype.name = 'AggregateError';
  return polyfill;
}, 'es_2021', 'es3');
$jscomp.polyfill('Promise.any', function(orig) {
  if (orig) {
    return orig;
  }
  var aggregate_error_msg = 'All promises were rejected';
  function resolvingArray(iterable) {
    if (iterable instanceof Array) {
      return iterable;
    } else {
      return Array.from(iterable);
    }
  }
  var polyfill = function(thenablesOrValues) {
    thenablesOrValues = resolvingArray(thenablesOrValues);
    return Promise.all(thenablesOrValues.map(function(p) {
      return Promise.resolve(p).then(function(val) {
        throw val;
      }, function(err) {
        return err;
      });
    })).then(function(errors) {
      throw new AggregateError(errors, aggregate_error_msg);
    }, function(val) {
      return val;
    });
  };
  return polyfill;
}, 'es_2021', 'es3');
$jscomp.polyfill('Reflect.apply', function(orig) {
  if (orig) {
    return orig;
  }
  var apply = Function.prototype.apply;
  var polyfill = function(target, thisArg, argList) {
    return apply.call(target, thisArg, argList);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.getConstructImplementation = function() {
  function reflectConstructWorks() {
    function Base() {
    }
    function Derived() {
    }
    new Base();
    Reflect.construct(Base, [], Derived);
    return new Base() instanceof Base;
  }
  if ($jscomp.TRUST_ES6_POLYFILLS && typeof Reflect != 'undefined' && Reflect.construct) {
    if (reflectConstructWorks()) {
      return Reflect.construct;
    }
    var brokenConstruct = Reflect.construct;
    var patchedConstruct = function(target, argList, opt_newTarget) {
      var out = brokenConstruct(target, argList);
      if (opt_newTarget) {
        Reflect.setPrototypeOf(out, opt_newTarget.prototype);
      }
      return out;
    };
    return patchedConstruct;
  }
  function construct(target, argList, opt_newTarget) {
    if (opt_newTarget === undefined) {
      opt_newTarget = target;
    }
    var proto = opt_newTarget.prototype || Object.prototype;
    var obj = $jscomp.objectCreate(proto);
    var apply = Function.prototype.apply;
    var out = apply.call(target, obj, argList);
    return out || obj;
  }
  return construct;
};
$jscomp.construct = {valueOf:$jscomp.getConstructImplementation}.valueOf();
$jscomp.polyfill('Reflect.construct', function(orig) {
  return $jscomp.construct;
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.defineProperty', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey, attributes) {
    try {
      Object.defineProperty(target, propertyKey, attributes);
      var desc = Object.getOwnPropertyDescriptor(target, propertyKey);
      if (!desc) {
        return false;
      }
      return desc.configurable === (attributes.configurable || false) && desc.enumerable === (attributes.enumerable || false) && ('value' in desc ? desc.value === attributes.value && desc.writable === (attributes.writable || false) : desc.get === attributes.get && desc.set === attributes.set);
    } catch (err) {
      return false;
    }
  };
  return polyfill;
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.deleteProperty', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey) {
    if (!$jscomp.owns(target, propertyKey)) {
      return true;
    }
    try {
      return delete target[propertyKey];
    } catch (err) {
      return false;
    }
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.getOwnPropertyDescriptor', function(orig) {
  return orig || Object.getOwnPropertyDescriptor;
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.getPrototypeOf', function(orig) {
  return orig || Object.getPrototypeOf;
}, 'es6', 'es5');
$jscomp.findDescriptor = function(target, propertyKey) {
  var obj = target;
  while (obj) {
    var property = Reflect.getOwnPropertyDescriptor(obj, propertyKey);
    if (property) {
      return property;
    }
    obj = Reflect.getPrototypeOf(obj);
  }
  return undefined;
};
$jscomp.polyfill('Reflect.get', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey, opt_receiver) {
    if (arguments.length <= 2) {
      return target[propertyKey];
    }
    var property = $jscomp.findDescriptor(target, propertyKey);
    if (property) {
      return property.get ? property.get.call(opt_receiver) : property.value;
    }
    return undefined;
  };
  return polyfill;
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.has', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey) {
    return propertyKey in target;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.isExtensible', function(orig) {
  if (orig) {
    return orig;
  }
  if ($jscomp.ASSUME_ES5 || typeof Object.isExtensible == 'function') {
    return Object.isExtensible;
  }
  return function() {
    return true;
  };
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.preventExtensions', function(orig) {
  if (orig) {
    return orig;
  }
  if (!($jscomp.ASSUME_ES5 || typeof Object.preventExtensions == 'function')) {
    return function() {
      return false;
    };
  }
  var polyfill = function(target) {
    Object.preventExtensions(target);
    return !Object.isExtensible(target);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.set', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey, value, opt_receiver) {
    var property = $jscomp.findDescriptor(target, propertyKey);
    if (!property) {
      if (Reflect.isExtensible(target)) {
        target[propertyKey] = value;
        return true;
      }
      return false;
    }
    if (property.set) {
      property.set.call(arguments.length > 3 ? opt_receiver : target, value);
      return true;
    } else if (property.writable && !Object.isFrozen(target)) {
      target[propertyKey] = value;
      return true;
    }
    return false;
  };
  return polyfill;
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.setPrototypeOf', function(orig) {
  if (orig) {
    return orig;
  } else if ($jscomp.setPrototypeOf) {
    var setPrototypeOf = $jscomp.setPrototypeOf;
    var polyfill = function(target, proto) {
      try {
        setPrototypeOf(target, proto);
        return true;
      } catch (e) {
        return false;
      }
    };
    return polyfill;
  } else {
    return null;
  }
}, 'es6', 'es5');
$jscomp.polyfill('Set', function(NativeSet) {
  function isConformant() {
    if ($jscomp.ASSUME_NO_NATIVE_SET || !NativeSet || typeof NativeSet != 'function' || !NativeSet.prototype.entries || typeof Object.seal != 'function') {
      return false;
    }
    try {
      NativeSet = NativeSet;
      var value = Object.seal({x:4});
      var set = new NativeSet($jscomp.makeIterator([value]));
      if (!set.has(value) || set.size != 1 || set.add(value) != set || set.size != 1 || set.add({x:4}) != set || set.size != 2) {
        return false;
      }
      var iter = set.entries();
      var item = iter.next();
      if (item.done || item.value[0] != value || item.value[1] != value) {
        return false;
      }
      item = iter.next();
      if (item.done || item.value[0] == value || item.value[0].x != 4 || item.value[1] != item.value[0]) {
        return false;
      }
      return iter.next().done;
    } catch (err) {
      return false;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeSet && $jscomp.ES6_CONFORMANCE) {
      return NativeSet;
    }
  } else {
    if (isConformant()) {
      return NativeSet;
    }
  }
  var PolyfillSet = function(opt_iterable) {
    this.map_ = new Map();
    if (opt_iterable) {
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.add(item);
      }
    }
    this.size = this.map_.size;
  };
  PolyfillSet.prototype.add = function(value) {
    value = value === 0 ? 0 : value;
    this.map_.set(value, value);
    this.size = this.map_.size;
    return this;
  };
  PolyfillSet.prototype["delete"] = function(value) {
    var result = this.map_["delete"](value);
    this.size = this.map_.size;
    return result;
  };
  PolyfillSet.prototype.clear = function() {
    this.map_.clear();
    this.size = 0;
  };
  PolyfillSet.prototype.has = function(value) {
    return this.map_.has(value);
  };
  PolyfillSet.prototype.entries = function() {
    return this.map_.entries();
  };
  PolyfillSet.prototype.values = function() {
    return this.map_.values();
  };
  PolyfillSet.prototype.keys = PolyfillSet.prototype.values;
  PolyfillSet.prototype[Symbol.iterator] = PolyfillSet.prototype.values;
  PolyfillSet.prototype.forEach = function(callback, opt_thisArg) {
    var set = this;
    this.map_.forEach(function(value) {
      return callback.call(opt_thisArg, value, value, set);
    });
  };
  return PolyfillSet;
}, 'es6', 'es3');
$jscomp.checkStringArgs = function(thisArg, arg, func) {
  if (thisArg == null) {
    throw new TypeError("The 'this' value for String.prototype." + func + ' must not be null or undefined');
  }
  if (arg instanceof RegExp) {
    throw new TypeError('First argument to String.prototype.' + func + ' must not be a regular expression');
  }
  return thisArg + '';
};
$jscomp.polyfill('String.prototype.codePointAt', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(position) {
    var string = $jscomp.checkStringArgs(this, null, 'codePointAt');
    var size = string.length;
    position = Number(position) || 0;
    if (!(position >= 0 && position < size)) {
      return void 0;
    }
    position = position | 0;
    var first = string.charCodeAt(position);
    if (first < 55296 || first > 56319 || position + 1 === size) {
      return first;
    }
    var second = string.charCodeAt(position + 1);
    if (second < 56320 || second > 57343) {
      return first;
    }
    return (first - 55296) * 1024 + second + 9216;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('String.prototype.endsWith', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(searchString, opt_position) {
    var string = $jscomp.checkStringArgs(this, searchString, 'endsWith');
    searchString = searchString + '';
    if (opt_position === void 0) {
      opt_position = string.length;
    }
    var i = Math.max(0, Math.min(opt_position | 0, string.length));
    var j = searchString.length;
    while (j > 0 && i > 0) {
      if (string[--i] != searchString[--j]) {
        return false;
      }
    }
    return j <= 0;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('String.fromCodePoint', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(var_args) {
    var result = '';
    for (var i = 0; i < arguments.length; i++) {
      var code = Number(arguments[i]);
      if (code < 0 || code > 1114111 || code !== Math.floor(code)) {
        throw new RangeError('invalid_code_point ' + code);
      }
      if (code <= 65535) {
        result += String.fromCharCode(code);
      } else {
        code -= 65536;
        result += String.fromCharCode(code >>> 10 & 1023 | 55296);
        result += String.fromCharCode(code & 1023 | 56320);
      }
    }
    return result;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('String.prototype.includes', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(searchString, opt_position) {
    var string = $jscomp.checkStringArgs(this, searchString, 'includes');
    return string.indexOf(searchString, opt_position || 0) !== -1;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('String.prototype.matchAll', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(regexp) {
    if (regexp instanceof RegExp && !regexp.global) {
      throw new TypeError('RegExp passed into String.prototype.matchAll() must have global tag.');
    }
    var regexCopy = new RegExp(regexp, regexp instanceof RegExp ? undefined : 'g');
    var matchString = this;
    var finished = false;
    var matchAllIterator = {next:function() {
      if (finished) {
        return {value:undefined, done:true};
      }
      var match = regexCopy.exec(matchString);
      if (!match) {
        finished = true;
        return {value:undefined, done:true};
      }
      if (match[0] === '') {
        regexCopy.lastIndex += 1;
      }
      return {value:match, done:false};
    }};
    matchAllIterator[Symbol.iterator] = function() {
      return matchAllIterator;
    };
    return matchAllIterator;
  };
  return polyfill;
}, 'es_2020', 'es3');
$jscomp.polyfill('String.prototype.repeat', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(copies) {
    var string = $jscomp.checkStringArgs(this, null, 'repeat');
    if (copies < 0 || copies > 1342177279) {
      throw new RangeError('Invalid count value');
    }
    copies = copies | 0;
    var result = '';
    while (copies) {
      if (copies & 1) {
        result += string;
      }
      if (copies >>>= 1) {
        string += string;
      }
    }
    return result;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.stringPadding = function(padString, padLength) {
  var padding = padString !== undefined ? String(padString) : ' ';
  if (!(padLength > 0) || !padding) {
    return '';
  }
  var repeats = Math.ceil(padLength / padding.length);
  return padding.repeat(repeats).substring(0, padLength);
};
$jscomp.polyfill('String.prototype.padEnd', function(orig) {
  if (orig) {
    return orig;
  }
  var padEnd = function(targetLength, opt_padString) {
    var string = $jscomp.checkStringArgs(this, null, 'padStart');
    var padLength = targetLength - string.length;
    return string + $jscomp.stringPadding(opt_padString, padLength);
  };
  return padEnd;
}, 'es8', 'es3');
$jscomp.polyfill('String.prototype.padStart', function(orig) {
  if (orig) {
    return orig;
  }
  var padStart = function(targetLength, opt_padString) {
    var string = $jscomp.checkStringArgs(this, null, 'padStart');
    var padLength = targetLength - string.length;
    return $jscomp.stringPadding(opt_padString, padLength) + string;
  };
  return padStart;
}, 'es8', 'es3');
$jscomp.polyfill('String.raw', function(orig) {
  if (orig) {
    return orig;
  }
  var stringRaw = function(strings, var_args) {
    if (strings == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    var raw = strings.raw;
    var rawlen = raw.length;
    var result = '';
    for (var i = 0; i < rawlen; ++i) {
      result += raw[i];
      if (i + 1 < rawlen && i + 1 < arguments.length) {
        result += String(arguments[i + 1]);
      }
    }
    return result;
  };
  return stringRaw;
}, 'es6', 'es3');
$jscomp.polyfill('String.prototype.replaceAll', function(orig) {
  if (orig) {
    return orig;
  }
  function regExpEscape(s) {
    return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08');
  }
  var polyfill = function(searchValue, replacement) {
    if (searchValue instanceof RegExp && !searchValue.global) {
      throw new TypeError('String.prototype.replaceAll called with a non-global RegExp argument.');
    }
    if (searchValue instanceof RegExp) {
      return this.replace(searchValue, replacement);
    }
    return this.replace(new RegExp(regExpEscape(searchValue), 'g'), replacement);
  };
  return polyfill;
}, 'es_2021', 'es3');
$jscomp.polyfill('String.prototype.startsWith', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(searchString, opt_position) {
    var string = $jscomp.checkStringArgs(this, searchString, 'startsWith');
    searchString = searchString + '';
    var strLen = string.length;
    var searchLen = searchString.length;
    var i = Math.max(0, Math.min(opt_position | 0, string.length));
    var j = 0;
    while (j < searchLen && i < strLen) {
      if (string[i++] != searchString[j++]) {
        return false;
      }
    }
    return j >= searchLen;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('String.prototype.trimRight', function(orig) {
  function polyfill() {
    return this.replace(/[\s\xa0]+$/, '');
  }
  return orig || polyfill;
}, 'es_2019', 'es3');
$jscomp.polyfill('String.prototype.trimEnd', function(orig) {
  return orig || String.prototype.trimRight;
}, 'es_2019', 'es3');
$jscomp.polyfill('String.prototype.trimLeft', function(orig) {
  function polyfill() {
    return this.replace(/^[\s\xa0]+/, '');
  }
  return orig || polyfill;
}, 'es_2019', 'es3');
$jscomp.polyfill('String.prototype.trimStart', function(orig) {
  return orig || String.prototype.trimLeft;
}, 'es_2019', 'es3');
$jscomp.typedArrayCopyWithin = function(orig) {
  if (orig) {
    return orig;
  }
  return Array.prototype.copyWithin;
};
$jscomp.polyfill('Int8Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Uint8Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Uint8ClampedArray.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Int16Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Uint16Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Int32Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Uint32Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Float32Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Float64Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.typedArrayFill = function(orig) {
  if (orig) {
    return orig;
  }
  return Array.prototype.fill;
};
$jscomp.polyfill('Int8Array.prototype.fill', $jscomp.typedArrayFill, 'es6', 'es5');
$jscomp.polyfill('Uint8Array.prototype.fill', $jscomp.typedArrayFill, 'es6', 'es5');
$jscomp.polyfill('Uint8ClampedArray.prototype.fill', $jscomp.typedArrayFill, 'es6', 'es5');
$jscomp.polyfill('Int16Array.prototype.fill', $jscomp.typedArrayFill, 'es6', 'es5');
$jscomp.polyfill('Uint16Array.prototype.fill', $jscomp.typedArrayFill, 'es6', 'es5');
$jscomp.polyfill('Int32Array.prototype.fill', $jscomp.typedArrayFill, 'es6', 'es5');
$jscomp.polyfill('Uint32Array.prototype.fill', $jscomp.typedArrayFill, 'es6', 'es5');
$jscomp.polyfill('Float32Array.prototype.fill', $jscomp.typedArrayFill, 'es6', 'es5');
$jscomp.polyfill('Float64Array.prototype.fill', $jscomp.typedArrayFill, 'es6', 'es5');
$jscomp.createTemplateTagFirstArg = function(arrayStrings) {
  arrayStrings.raw = arrayStrings;
  return arrayStrings;
};
$jscomp.createTemplateTagFirstArgWithRaw = function(arrayStrings, rawArrayStrings) {
  arrayStrings.raw = rawArrayStrings;
  return arrayStrings;
};
$jscomp.arrayFromIterator = function(iterator) {
  var i;
  var arr = [];
  while (!(i = iterator.next()).done) {
    arr.push(i.value);
  }
  return arr;
};
$jscomp.arrayFromIterable = function(iterable) {
  if (iterable instanceof Array) {
    return iterable;
  } else {
    return $jscomp.arrayFromIterator($jscomp.makeIterator(iterable));
  }
};
$jscomp.getRestArguments = function() {
  var startIndex = Number(this);
  var restArgs = [];
  for (var i = startIndex; i < arguments.length; i++) {
    restArgs[i - startIndex] = arguments[i];
  }
  return restArgs;
};
$jscomp.polyfill('WeakSet', function(NativeWeakSet) {
  function isConformant() {
    if (!NativeWeakSet || !Object.seal) {
      return false;
    }
    try {
      var x = Object.seal({});
      var y = Object.seal({});
      var set = new NativeWeakSet([x]);
      if (!set.has(x) || set.has(y)) {
        return false;
      }
      set["delete"](x);
      set.add(y);
      return !set.has(x) && set.has(y);
    } catch (err) {
      return false;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeWeakSet && $jscomp.ES6_CONFORMANCE) {
      return NativeWeakSet;
    }
  } else {
    if (isConformant()) {
      return NativeWeakSet;
    }
  }
  var PolyfillWeakSet = function(opt_iterable) {
    this.map_ = new WeakMap();
    if (opt_iterable) {
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.add(item);
      }
    }
  };
  PolyfillWeakSet.prototype.add = function(elem) {
    this.map_.set(elem, true);
    return this;
  };
  PolyfillWeakSet.prototype.has = function(elem) {
    return this.map_.has(elem);
  };
  PolyfillWeakSet.prototype["delete"] = function(elem) {
    return this.map_["delete"](elem);
  };
  return PolyfillWeakSet;
}, 'es6', 'es3');
try {
  if (Array.prototype.values.toString().indexOf('[native code]') == -1) {
    delete Array.prototype.values;
  }
} catch (e) {
}
Ext.define('Ext.theme.neptune.Component', {override:'Ext.Component', initComponent:function() {
  this.callParent();
  if (this.dock && this.border === undefined) {
    this.border = false;
  }
}, privates:{initStyles:function() {
  var me = this, hasOwnBorder = me.hasOwnProperty('border'), border = me.border;
  if (me.dock) {
    me.border = null;
  }
  me.callParent(arguments);
  if (hasOwnBorder) {
    me.border = border;
  } else {
    delete me.border;
  }
}}}, function() {
  Ext.namespace('Ext.theme.is').Neptune = true;
  Ext.theme.name = 'Neptune';
});
Ext.define('Ext.theme.triton.Component', {override:'Ext.Component'}, function() {
  Ext.namespace('Ext.theme.is').Triton = true;
  Ext.theme.name = 'Triton';
});
Ext.define('Ext.theme.material.Component', {override:'Ext.Component', config:{ripple:null, labelAlign:'top'}, initComponent:function() {
  var me = this;
  me.callParent();
  if (me.ripple) {
    me.on('afterrender', function() {
      me.updateRipple(me.getRipple());
    }, me);
  }
}, updateRipple:function(ripple) {
  var me = this, el = me.el;
  if (Ext.isIE9m) {
    Ext.log({level:'warn'}, 'Ripple effect is not supported in IE9 and below!');
    return;
  }
  if (el) {
    el.un('touchstart', 'onRippleStart', me);
    el.un('touchend', 'onRippleStart', me);
    el.destroyAllRipples();
    el.on(ripple.release ? 'touchend' : 'touchstart', 'onRippleStart', me);
  }
}, shouldRipple:function(e) {
  var me = this, disabled = me.getDisabled && me.getDisabled(), el = me.el, ripple = !disabled && me.getRipple(), target;
  if (ripple && e) {
    target = e.getTarget(me.noRippleSelector);
    if (target) {
      if (el.dom === target || el.contains(target)) {
        ripple = null;
      }
    }
  }
  return ripple;
}, onRippleStart:function(e) {
  var me = this, ripple = this.shouldRipple(e);
  if (e.button === 0 && ripple) {
    me.el.ripple(e, ripple);
  }
}, privates:{noRippleSelector:'.' + Ext.baseCSSPrefix + 'no-ripple', whenVisible:function(fn, args) {
  var me = this, listener, pending, visible;
  args = args || Ext.emptyArray;
  listener = me.visibleListener;
  pending = me.pendingVisible;
  visible = me.isVisible(true);
  if (!visible && !listener) {
    me.visibleListener = Ext.on({scope:me, show:'handleGlobalShow', destroyable:true});
  }
  if (visible) {
    if (pending) {
      pending[fn] = args;
      me.runWhenVisible();
    } else {
      me[fn].apply(me, args);
    }
  } else {
    if (!pending) {
      me.pendingVisible = pending = {};
    }
    pending[fn] = args;
  }
  return visible;
}, clearWhenVisible:function(fn) {
  var me = this, pending = me.pendingVisible;
  if (pending) {
    delete pending[fn];
    if (Ext.Object.isEmpty(pending)) {
      me.pendingVisible = null;
      me.visibleListener = Ext.destroy(me.visibleListener);
    }
  }
}, runWhenVisible:function() {
  var me = this, pending = me.pendingVisible, key;
  me.pendingVisible = null;
  me.visibleListener = Ext.destroy(me.visibleListener);
  for (key in pending) {
    me[key].apply(me, pending[key]);
  }
}, handleGlobalShow:function(c) {
  var me = this;
  if (me.isVisible(true) && (c === me || me.isDescendantOf(c))) {
    me.runWhenVisible();
  }
}}}, function() {
  Ext.namespace('Ext.theme.is').Material = true;
  Ext.theme.name = 'Material';
});
Ext.define('Ext.theme.triton.list.TreeItem', {override:'Ext.list.TreeItem', compatibility:Ext.isIE8, setFloated:function(floated, wasFloated) {
  this.callParent([floated, wasFloated]);
  this.toolElement.syncRepaint();
}});
Ext.define('Ext.theme.material.button.Button', {override:'Ext.button.Button', ripple:{color:'default'}});
Ext.define('Ext.theme.material.button.Split', {override:'Ext.button.Split', separateArrowStyling:true, ripple:false});
Ext.define('Ext.theme.neptune.resizer.Splitter', {override:'Ext.resizer.Splitter', size:8});
Ext.define('Ext.theme.triton.resizer.Splitter', {override:'Ext.resizer.Splitter', size:10});
Ext.define('Ext.theme.neptune.toolbar.Toolbar', {override:'Ext.toolbar.Toolbar', usePlainButtons:false, border:false});
Ext.define('Ext.theme.neptune.layout.component.Dock', {override:'Ext.layout.component.Dock', noBorderClassTable:[0, Ext.baseCSSPrefix + 'noborder-l', Ext.baseCSSPrefix + 'noborder-b', Ext.baseCSSPrefix + 'noborder-bl', Ext.baseCSSPrefix + 'noborder-r', Ext.baseCSSPrefix + 'noborder-rl', Ext.baseCSSPrefix + 'noborder-rb', Ext.baseCSSPrefix + 'noborder-rbl', Ext.baseCSSPrefix + 'noborder-t', Ext.baseCSSPrefix + 'noborder-tl', Ext.baseCSSPrefix + 'noborder-tb', Ext.baseCSSPrefix + 'noborder-tbl', Ext.baseCSSPrefix + 
'noborder-tr', Ext.baseCSSPrefix + 'noborder-trl', Ext.baseCSSPrefix + 'noborder-trb', Ext.baseCSSPrefix + 'noborder-trbl'], edgeMasks:{top:8, right:4, bottom:2, left:1}, handleItemBorders:function() {
  var me = this, edges = 0, maskT = 8, maskR = 4, maskB = 2, maskL = 1, owner = me.owner, bodyBorder = owner.bodyBorder, ownerBorder = owner.border, collapsed = me.collapsed, edgeMasks = me.edgeMasks, noBorderCls = me.noBorderClassTable, dockedItemsGen = owner.dockedItems.generation, b, borderCls, docked, edgesTouched, i, ln, item, dock, lastValue, mask, addCls, removeCls;
  if (me.initializedBorders === dockedItemsGen) {
    return;
  }
  addCls = [];
  removeCls = [];
  borderCls = me.getBorderCollapseTable();
  noBorderCls = me.getBorderClassTable ? me.getBorderClassTable() : noBorderCls;
  me.initializedBorders = dockedItemsGen;
  me.collapsed = false;
  docked = me.getDockedItems('visual');
  me.collapsed = collapsed;
  for (i = 0, ln = docked.length; i < ln; i++) {
    item = docked[i];
    if (item.ignoreBorderManagement) {
      continue;
    }
    dock = item.dock;
    mask = edgesTouched = 0;
    addCls.length = 0;
    removeCls.length = 0;
    if (dock !== 'bottom') {
      if (edges & maskT) {
        b = item.border;
      } else {
        b = ownerBorder;
        if (b !== false) {
          edgesTouched += maskT;
        }
      }
      if (b === false) {
        mask += maskT;
      }
    }
    if (dock !== 'left') {
      if (edges & maskR) {
        b = item.border;
      } else {
        b = ownerBorder;
        if (b !== false) {
          edgesTouched += maskR;
        }
      }
      if (b === false) {
        mask += maskR;
      }
    }
    if (dock !== 'top') {
      if (edges & maskB) {
        b = item.border;
      } else {
        b = ownerBorder;
        if (b !== false) {
          edgesTouched += maskB;
        }
      }
      if (b === false) {
        mask += maskB;
      }
    }
    if (dock !== 'right') {
      if (edges & maskL) {
        b = item.border;
      } else {
        b = ownerBorder;
        if (b !== false) {
          edgesTouched += maskL;
        }
      }
      if (b === false) {
        mask += maskL;
      }
    }
    if ((lastValue = item.lastBorderMask) !== mask) {
      item.lastBorderMask = mask;
      if (lastValue) {
        removeCls[0] = noBorderCls[lastValue];
      }
      if (mask) {
        addCls[0] = noBorderCls[mask];
      }
    }
    if ((lastValue = item.lastBorderCollapse) !== edgesTouched) {
      item.lastBorderCollapse = edgesTouched;
      if (lastValue) {
        removeCls[removeCls.length] = borderCls[lastValue];
      }
      if (edgesTouched) {
        addCls[addCls.length] = borderCls[edgesTouched];
      }
    }
    if (removeCls.length) {
      item.removeCls(removeCls);
    }
    if (addCls.length) {
      item.addCls(addCls);
    }
    edges |= edgeMasks[dock];
  }
  mask = edgesTouched = 0;
  addCls.length = 0;
  removeCls.length = 0;
  if (edges & maskT) {
    b = bodyBorder;
  } else {
    b = ownerBorder;
    if (b !== false) {
      edgesTouched += maskT;
    }
  }
  if (b === false) {
    mask += maskT;
  }
  if (edges & maskR) {
    b = bodyBorder;
  } else {
    b = ownerBorder;
    if (b !== false) {
      edgesTouched += maskR;
    }
  }
  if (b === false) {
    mask += maskR;
  }
  if (edges & maskB) {
    b = bodyBorder;
  } else {
    b = ownerBorder;
    if (b !== false) {
      edgesTouched += maskB;
    }
  }
  if (b === false) {
    mask += maskB;
  }
  if (edges & maskL) {
    b = bodyBorder;
  } else {
    b = ownerBorder;
    if (b !== false) {
      edgesTouched += maskL;
    }
  }
  if (b === false) {
    mask += maskL;
  }
  if ((lastValue = me.lastBodyBorderMask) !== mask) {
    me.lastBodyBorderMask = mask;
    if (lastValue) {
      removeCls[0] = noBorderCls[lastValue];
    }
    if (mask) {
      addCls[0] = noBorderCls[mask];
    }
  }
  if ((lastValue = me.lastBodyBorderCollapse) !== edgesTouched) {
    me.lastBodyBorderCollapse = edgesTouched;
    if (lastValue) {
      removeCls[removeCls.length] = borderCls[lastValue];
    }
    if (edgesTouched) {
      addCls[addCls.length] = borderCls[edgesTouched];
    }
  }
  if (removeCls.length) {
    owner.removeBodyCls(removeCls);
  }
  if (addCls.length) {
    owner.addBodyCls(addCls);
  }
}, onRemove:function(item) {
  var me = this, lastBorderMask = item.lastBorderMask, lastBorderCollapse = item.lastBorderCollapse;
  if (!item.destroyed && !item.ignoreBorderManagement) {
    if (lastBorderMask) {
      item.lastBorderMask = 0;
      item.removeCls(me.noBorderClassTable[lastBorderMask]);
    }
    if (lastBorderCollapse) {
      item.lastBorderCollapse = 0;
      item.removeCls(me.getBorderCollapseTable()[lastBorderCollapse]);
    }
  }
  me.callParent([item]);
}});
Ext.define('Ext.theme.neptune.panel.Panel', {override:'Ext.panel.Panel', border:false, bodyBorder:false, initBorderProps:Ext.emptyFn, initBodyBorder:function() {
  if (this.bodyBorder !== true) {
    this.callParent();
  }
}});
Ext.define('Ext.theme.neptune.container.ButtonGroup', {override:'Ext.container.ButtonGroup', usePlainButtons:false});
Ext.define('Ext.theme.material.form.field.Text', {override:'Ext.form.field.Text', labelSeparator:'', initComponent:function() {
  this.callParent();
  this.on({change:function(field, value) {
    if (field.el) {
      field.el.toggleCls('not-empty', !Ext.isEmpty(value) || field.emptyText);
    }
  }, render:function(ths, width, height, eOpts) {
    if ((!Ext.isEmpty(ths.getValue()) || ths.emptyText) && ths.el) {
      ths.el.addCls('not-empty');
    }
  }});
}});
Ext.define('Ext.theme.material.window.MessageBox', {override:'Ext.window.MessageBox', buttonAlign:'right'});
Ext.define('Ext.theme.triton.form.field.Checkbox', {override:'Ext.form.field.Checkbox', compatibility:Ext.isIE8, initComponent:function() {
  this.callParent();
  Ext.on({show:'onGlobalShow', scope:this});
}, onFocus:function(e) {
  var focusClsEl;
  this.callParent([e]);
  focusClsEl = this.getFocusClsEl();
  if (focusClsEl) {
    focusClsEl.syncRepaint();
  }
}, onBlur:function(e) {
  var focusClsEl;
  this.callParent([e]);
  focusClsEl = this.getFocusClsEl();
  if (focusClsEl) {
    focusClsEl.syncRepaint();
  }
}, onGlobalShow:function(cmp) {
  if (cmp.isAncestor(this)) {
    this.getFocusClsEl().syncRepaint();
  }
}});
Ext.define('Ext.theme.material.form.field.Checkbox', {override:'Ext.form.field.Checkbox', ripple:{delegate:'.' + Ext.baseCSSPrefix + 'form-checkbox', bound:false}});
Ext.define('Ext.theme.material.form.field.Radio', {override:'Ext.form.field.Radio', ripple:{delegate:'.' + Ext.baseCSSPrefix + 'form-radio', bound:false}});
Ext.define('Ext.theme.neptune.toolbar.Paging', {override:'Ext.toolbar.Paging', defaultButtonUI:'plain-toolbar', inputItemWidth:40});
Ext.define('Ext.theme.triton.toolbar.Paging', {override:'Ext.toolbar.Paging', inputItemWidth:50});
Ext.define('Ext.theme.neptune.picker.Month', {override:'Ext.picker.Month', measureMaxHeight:36});
Ext.define('Ext.theme.triton.picker.Month', {override:'Ext.picker.Month', footerButtonUI:'default-toolbar', calculateMonthMargin:Ext.emptyFn});
Ext.define('Ext.theme.triton.picker.Date', {override:'Ext.picker.Date', footerButtonUI:'default-toolbar'});
Ext.define('Ext.theme.neptune.form.field.HtmlEditor', {override:'Ext.form.field.HtmlEditor', defaultButtonUI:'plain-toolbar'});
Ext.define('Ext.theme.neptune.panel.Table', {override:'Ext.panel.Table', lockableBodyBorder:true, initComponent:function() {
  var me = this;
  me.callParent();
  if (!me.hasOwnProperty('bodyBorder') && !me.hideHeaders && (me.lockableBodyBorder || !me.lockable)) {
    me.bodyBorder = true;
  }
}});
Ext.define('Ext.theme.material.view.Table', {override:'Ext.view.Table', mixins:['Ext.mixin.ItemRippler'], config:{itemRipple:{color:'default'}}, processItemEvent:function(record, item, rowIndex, e) {
  var me = this, eventPosition, result, rowElement, cellElement, selModel;
  result = me.callParent([record, item, rowIndex, e]);
  if (e.type === 'mousedown') {
    eventPosition = me.eventPosition;
    rowElement = eventPosition && me.eventPosition.rowElement;
    cellElement = eventPosition && me.eventPosition.cellElement;
    selModel = me.getSelectionModel().type;
    if (rowElement && selModel === 'rowmodel') {
      me.rippleItem(Ext.fly(rowElement), e);
    } else if (cellElement && selModel === 'cellmodel') {
      me.rippleItem(Ext.fly(cellElement), e);
    }
  }
  return result;
}});
Ext.define('Ext.theme.neptune.grid.RowEditor', {override:'Ext.grid.RowEditor', buttonUI:'default-toolbar'});
Ext.define('Ext.theme.triton.grid.column.Column', {override:'Ext.grid.column.Column', compatibility:Ext.isIE8, onTitleMouseOver:function() {
  var triggerEl = this.triggerEl;
  this.callParent(arguments);
  if (triggerEl) {
    triggerEl.syncRepaint();
  }
}});
Ext.define('Ext.theme.triton.grid.column.Check', {override:'Ext.grid.column.Check', compatibility:Ext.isIE8, setRecordCheck:function(record, index, checked, cell) {
  this.callParent(arguments);
  Ext.fly(cell).syncRepaint();
}});
Ext.define('Ext.theme.neptune.grid.column.RowNumberer', {override:'Ext.grid.column.RowNumberer', width:25});
Ext.define('Ext.theme.triton.grid.column.RowNumberer', {override:'Ext.grid.column.RowNumberer', width:32});
Ext.define('Ext.theme.triton.menu.Item', {override:'Ext.menu.Item', compatibility:Ext.isIE8, onFocus:function(e) {
  this.callParent([e]);
  this.repaintIcons();
}, onFocusLeave:function(e) {
  this.callParent([e]);
  this.repaintIcons();
}, privates:{repaintIcons:function() {
  var iconEl = this.iconEl, arrowEl = this.arrowEl, checkEl = this.checkEl;
  if (iconEl) {
    iconEl.syncRepaint();
  }
  if (arrowEl) {
    arrowEl.syncRepaint();
  }
  if (checkEl) {
    checkEl.syncRepaint();
  }
}}});
Ext.define('Ext.theme.neptune.menu.Separator', {override:'Ext.menu.Separator', border:true});
Ext.define('Ext.theme.neptune.menu.Menu', {override:'Ext.menu.Menu', showSeparator:false});
Ext.define('Ext.theme.triton.menu.Menu', {override:'Ext.menu.Menu', compatibility:Ext.isIE8, afterShow:function() {
  var me = this, items, item, i, len;
  me.callParent(arguments);
  items = me.items.getRange();
  for (i = 0, len = items.length; i < len; i++) {
    item = items[i];
    if (item && item.repaintIcons) {
      item.repaintIcons();
    }
  }
}});
Ext.define('Ext.theme.material.menu.Menu', {override:'Ext.menu.Menu', ripple:{color:'default'}});
Ext.define('Ext.theme.triton.grid.plugin.RowExpander', {override:'Ext.grid.plugin.RowExpander', headerWidth:32});
Ext.define('Ext.theme.triton.grid.selection.SpreadsheetModel', {override:'Ext.grid.selection.SpreadsheetModel', checkboxHeaderWidth:32});
Ext.define('Ext.theme.triton.selection.CheckboxModel', {override:'Ext.selection.CheckboxModel', headerWidth:32, onHeaderClick:function(headerCt, header, e) {
  this.callParent([headerCt, header, e]);
  if (Ext.isIE8) {
    header.getView().ownerGrid.el.syncRepaint();
  }
}});
Ext.define('Ext.theme.material.tab.Tab', {override:'Ext.tab.Tab', ripple:{color:'default'}});
Ext.define('Ext.theme.material.tree.View', {override:'Ext.tree.View', config:{color:'default'}});
Ext.define('Ext.theme.Material', {singleton:true, _autoUpdateMeta:true, _defaultWeight:'500', _colors:{'red':{50:'#ffebee', 100:'#ffcdd2', 200:'#ef9a9a', 300:'#e57373', 400:'#ef5350', 500:'#f44336', 600:'#e53935', 700:'#d32f2f', 800:'#c62828', 900:'#b71c1c', 'a100':'#ff8a80', 'a200':'#ff5252', 'a400':'#ff1744', 'a700':'#d50000'}, 'pink':{50:'#fce4ec', 100:'#f8bbd0', 200:'#f48fb1', 300:'#f06292', 400:'#ec407a', 500:'#e91e63', 600:'#d81b60', 700:'#c2185b', 800:'#ad1457', 900:'#880e4f', 'a100':'#ff80ab', 
'a200':'#ff4081', 'a400':'#f50057', 'a700':'#c51162'}, 'purple':{50:'#f3e5f5', 100:'#e1bee7', 200:'#ce93d8', 300:'#ba68c8', 400:'#ab47bc', 500:'#9c27b0', 600:'#8e24aa', 700:'#7b1fa2', 800:'#6a1b9a', 900:'#4a148c', 'a100':'#ea80fc', 'a200':'#e040fb', 'a400':'#d500f9', 'a700':'#aa00ff'}, 'deep-purple':{50:'#ede7f6', 100:'#d1c4e9', 200:'#b39ddb', 300:'#9575cd', 400:'#7e57c2', 500:'#673ab7', 600:'#5e35b1', 700:'#512da8', 800:'#4527a0', 900:'#311b92', 'a100':'#b388ff', 'a200':'#7c4dff', 'a400':'#651fff', 
'a700':'#6200ea'}, 'indigo':{50:'#e8eaf6', 100:'#c5cae9', 200:'#9fa8da', 300:'#7986cb', 400:'#5c6bc0', 500:'#3f51b5', 600:'#3949ab', 700:'#303f9f', 800:'#283593', 900:'#1a237e', 'a100':'#8c9eff', 'a200':'#536dfe', 'a400':'#3d5afe', 'a700':'#304ffe'}, 'blue':{50:'#e3f2fd', 100:'#bbdefb', 200:'#90caf9', 300:'#64b5f6', 400:'#42a5f5', 500:'#2196f3', 600:'#1e88e5', 700:'#1976d2', 800:'#1565c0', 900:'#0d47a1', 'a100':'#82b1ff', 'a200':'#448aff', 'a400':'#2979ff', 'a700':'#2962ff'}, 'light-blue':{50:'#e1f5fe', 
100:'#b3e5fc', 200:'#81d4fa', 300:'#4fc3f7', 400:'#29b6f6', 500:'#03a9f4', 600:'#039be5', 700:'#0288d1', 800:'#0277bd', 900:'#01579b', 'a100':'#80d8ff', 'a200':'#40c4ff', 'a400':'#00b0ff', 'a700':'#0091ea'}, 'cyan':{50:'#e0f7fa', 100:'#b2ebf2', 200:'#80deea', 300:'#4dd0e1', 400:'#26c6da', 500:'#00bcd4', 600:'#00acc1', 700:'#0097a7', 800:'#00838f', 900:'#006064', 'a100':'#84ffff', 'a200':'#18ffff', 'a400':'#00e5ff', 'a700':'#00b8d4'}, 'teal':{50:'#e0f2f1', 100:'#b2dfdb', 200:'#80cbc4', 300:'#4db6ac', 
400:'#26a69a', 500:'#009688', 600:'#00897b', 700:'#00796b', 800:'#00695c', 900:'#004d40', 'a100':'#a7ffeb', 'a200':'#64ffda', 'a400':'#1de9b6', 'a700':'#00bfa5'}, 'green':{50:'#e8f5e9', 100:'#c8e6c9', 200:'#a5d6a7', 300:'#81c784', 400:'#66bb6a', 500:'#4caf50', 600:'#43a047', 700:'#388e3c', 800:'#2e7d32', 900:'#1b5e20', 'a100':'#b9f6ca', 'a200':'#69f0ae', 'a400':'#00e676', 'a700':'#00c853'}, 'light-green':{50:'#f1f8e9', 100:'#dcedc8', 200:'#c5e1a5', 300:'#aed581', 400:'#9ccc65', 500:'#8bc34a', 600:'#7cb342', 
700:'#689f38', 800:'#558b2f', 900:'#33691e', 'a100':'#ccff90', 'a200':'#b2ff59', 'a400':'#76ff03', 'a700':'#64dd17'}, 'lime':{50:'#f9fbe7', 100:'#f0f4c3', 200:'#e6ee9c', 300:'#dce775', 400:'#d4e157', 500:'#cddc39', 600:'#c0ca33', 700:'#afb42b', 800:'#9e9d24', 900:'#827717', 'a100':'#f4ff81', 'a200':'#eeff41', 'a400':'#c6ff00', 'a700':'#aeea00'}, 'yellow':{50:'#fffde7', 100:'#fff9c4', 200:'#fff59d', 300:'#fff176', 400:'#ffee58', 500:'#ffeb3b', 600:'#fdd835', 700:'#fbc02d', 800:'#f9a825', 900:'#f57f17', 
'a100':'#ffff8d', 'a200':'#ffff00', 'a400':'#ffea00', 'a700':'#ffd600'}, 'amber':{50:'#fff8e1', 100:'#ffecb3', 200:'#ffe082', 300:'#ffd54f', 400:'#ffca28', 500:'#ffc107', 600:'#ffb300', 700:'#ffa000', 800:'#ff8f00', 900:'#ff6f00', 'a100':'#ffe57f', 'a200':'#ffd740', 'a400':'#ffc400', 'a700':'#ffab00'}, 'orange':{50:'#fff3e0', 100:'#ffe0b2', 200:'#ffcc80', 300:'#ffb74d', 400:'#ffa726', 500:'#ff9800', 600:'#fb8c00', 700:'#f57c00', 800:'#ef6c00', 900:'#e65100', 'a100':'#ffd180', 'a200':'#ffab40', 'a400':'#ff9100', 
'a700':'#ff6d00'}, 'deep-orange':{50:'#fbe9e7', 100:'#ffccbc', 200:'#ffab91', 300:'#ff8a65', 400:'#ff7043', 500:'#ff5722', 600:'#f4511e', 700:'#e64a19', 800:'#d84315', 900:'#bf360c', 'a100':'#ff9e80', 'a200':'#ff6e40', 'a400':'#ff3d00', 'a700':'#dd2c00'}, 'brown':{50:'#efebe9', 100:'#d7ccc8', 200:'#bcaaa4', 300:'#a1887f', 400:'#8d6e63', 500:'#795548', 600:'#6d4c41', 700:'#5d4037', 800:'#4e342e', 900:'#3e2723'}, 'grey':{50:'#fafafa', 100:'#f5f5f5', 200:'#eeeeee', 300:'#e0e0e0', 400:'#bdbdbd', 500:'#9e9e9e', 
600:'#757575', 700:'#616161', 800:'#424242', 900:'#212121'}, 'blue-grey':{50:'#eceff1', 100:'#cfd8dc', 200:'#b0bec5', 300:'#90a4ae', 400:'#78909c', 500:'#607d8b', 600:'#546e7a', 700:'#455a64', 800:'#37474f', 900:'#263238', 1E3:'#11171a'}}, hasFashion:function() {
  return !!window.Fashion && !!Fashion.css && Fashion.css.setVariables;
}, setAutoUpdateMeta:function(value) {
  this._autoUpdateMeta = value;
}, getAutoUpdateMeta:function() {
  return this._autoUpdateMeta;
}, getDefaultWeight:function() {
  return this._defaultWeight;
}, setDarkMode:function(value) {
  if (!this.hasFashion()) {
    Ext.Logger.warn('Fashion was not found and is required to set CSS Variables for Material Theme');
    return;
  }
  Fashion.css.setVariables({'dark-mode':value ? 'true' : 'false'});
}, setColors:function(colorsConfig) {
  var obj = {}, baseColor, accentColor;
  if (!this.hasFashion()) {
    Ext.Logger.warn('Fashion was not found and is required to set CSS Variables for Material Theme');
    return;
  }
  colorsConfig = Ext.merge({baseWeight:this.getDefaultWeight(), accentWeight:this.getDefaultWeight()}, colorsConfig);
  baseColor = this._colors[colorsConfig.base];
  accentColor = this._colors[colorsConfig.accent];
  if (baseColor) {
    if (baseColor[colorsConfig.baseWeight]) {
      obj['base-color-name'] = colorsConfig.base;
      if (this.getAutoUpdateMeta()) {
        this.updateMetaThemeColor(colorsConfig.base, colorsConfig.baseWeight);
      }
    } else {
      Ext.Logger.warn('Base color weight: ' + colorsConfig.baseWeight + ' is not a valid weight', this);
    }
  } else if (colorsConfig.base) {
    Ext.Logger.warn('Base color: ' + colorsConfig.base + ' is not a valid material color', this);
  }
  if (accentColor) {
    if (accentColor[colorsConfig.accentWeight]) {
      obj['accent-color-name'] = colorsConfig.accent;
    } else {
      Ext.Logger.warn('Accent color weight: ' + colorsConfig.accentWeight + ' is not a valid weight', this);
    }
  } else if (colorsConfig.accent) {
    Ext.Logger.warn('Accent color: ' + colorsConfig.accent + ' is not a valid material color', this);
  }
  if (colorsConfig.darkMode !== null) {
    obj['dark-mode'] = colorsConfig.darkMode ? 'true' : 'false';
  }
  Fashion.css.setVariables(obj);
}, updateMetaThemeColor:function(colorName, weight) {
  var color = this._colors[colorName], toolbarIsDynamic = Ext.manifest.material.toolbar.dynamic, meta;
  if (!weight) {
    weight = this.getDefaultWeight();
  }
  if (Ext.platformTags.android && Ext.platformTags.chrome && toolbarIsDynamic && color) {
    color = color[weight];
    meta = Ext.query('meta[name\x3d"theme-color"]')[0];
    if (meta) {
      meta.setAttribute('content', color);
    }
  }
}, getColors:function() {
  return this._colors;
}});
var color, toolbarIsDynamic, head, meta;
Ext.require('Ext.theme.Material');
if (Ext.platformTags.android && Ext.platformTags.chrome && Ext.manifest.material && Ext.manifest.material.toolbar) {
  color = Ext.manifest.material.toolbar.color;
  toolbarIsDynamic = Ext.manifest.material.toolbar.dynamic;
  head = document.head;
  if (toolbarIsDynamic && Ext.supports.CSSVariables) {
    color = getComputedStyle(document.body).getPropertyValue('--primary-color-md');
    color = color.replace(/ /g, '').replace(/^#(?:\\3)?/, '#');
  }
  if (color) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', color);
    head.appendChild(meta);
  }
}
Ext.namespace('Ext.theme.is').Material = true;
Ext.theme.name = 'Material';
Ext.namespace('Ext.theme.is')['darktheme'] = true;
Ext.theme.name = 'darktheme';
