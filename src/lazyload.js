/**
 * lazyload.js
 * 
 * Copyright 1000ch<http://1000ch.net/>
 * licensed under the MIT license.
 */
(function(window, document) {

  // cache to local
  var documentElement = document.documentElement;
  var targetAttribute = 'data-src';
  var targetSrcsetAttribute = 'data-srcset';
  var rxReady = /complete|loaded|interactive/;
  var FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEElEQVR42gEFAPr/AP///wAI/AL+Sr4t6gAAAABJRU5ErkJggg==';

  /**
   * throttle
   * @param fn
   * @param delay
   * @returns {Function}
   * @private
   * @description forked from underscore.js
   */
  function _throttle(fn, delay) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    return function() {
      var now = Date.now();
      if (!previous) {
        previous = now;
      }
      var remaining = delay - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = fn.apply(context, args);
        context = args = null;
      }
      return result;
    };
  }

  /**
   * get load offset
   * @returns {Number}
   * @private
   */
  function _getLoadOffset () {
    
    // detect window height
    var windowHeight = 0;
    if (documentElement.clientHeight >= 0) {
      windowHeight = documentElement.clientHeight;
    } else if (document.body && document.body.clientHeight >= 0) {
      windowHeight = document.body.clientHeight;
    } else if (window.innerHeight >= 0) {
      windowHeight = window.innerHeight;
    }

    // images which got in half of display forward will be loaded
    return windowHeight * 1.5;
  }

  /**
   * Emulate srcset
   * @see http://www.w3.org/html/wg/drafts/srcset/w3c-srcset/
   * @see http://dev.w3.org/csswg/css-values-3/#resolution-value
   * @param {String} srcset
   * pear-mobile.jpeg 720w, pear-tablet.jpeg 1280w, pear-desktop.jpeg 1x
   */
  function _resolveSrcset (src, srcset) {

    // for detection
    var dpr = window.devicePixelRatio;
    var width = window.innerWidth;

    // include 5.14 default candidate
    var candidate;
    var candidates = [{
      url: src,
      w: Infinity,
      x: 1
    }];

    // found resolution
    var resolution = {
      w: Infinity,
      x: 1
    };

    var re = /[^\,\s](.+?)\s([0-9]+)([wx])(\s([0-9]+)([wx]))?/g;
    var match;
    while ((match = re.exec(srcset)) !== null) {

      var url = match[1];
      var number1 = match[2] | 0;
      var unit1 = match[3];
      var number2 = match[5] | 0;
      var unit2 = match[6];

      // find optimal width and dpr
      if (unit1 === 'w' && number1) {
        if (width < number1 && number1 <= resolution.w) {
          resolution.w = number1;

          // define as candidate
          candidate = {
            url: url,
            w: number1
          };

          if (unit2 === 'x' && number2) {
            if (dpr <= number2 && (dpr > resolution.x && number2 < resolution.x)) {
              resolution.x = number2;
              candidate.x = resolution.x;
            }
          }

          candidates.push(candidate);
        }
      } else if (unit1 === 'x' && number1) {
        if (dpr <= number1 && (dpr > resolution.x && number1 < resolution.x)) {
          resolution.x = number1;

          // define as candidate
          candidate = {
            url: url,
            x: number1
          };

          if (unit2 === 'w' && number2) {
            if (width < number2 && number2 <= resolution.w) {
              resolution.w = number2;
              candidate.w = resolution.w;
            }
          }

          candidates.push(candidate);
        }
      }
    }

    // return matched url with resolution
    var c, i, l;
    for (i = 0, l = candidates.length;i < l;i++) {
      c = candidates[i];
      if (resolution.w === c.w && resolution.x === c.x) {
        return c.url;
      }
    }
    for (i = 0, l = candidates.length;i < l;i++) {
      c = candidates[i];
      if (resolution.x === c.x) {
        return c.url;
      } else if (resolution.w === c.w) {
        return c.url;
      }
    }

    return src;
  }

  /**
   * Lazyload Class
   * @constructor Lazyload
   */
  function Lazyload(selector) {

    // selector
    this.selector = selector || 'img[' + targetAttribute + ']';

    // img elements
    this.array = [];

    // configure load offset
    this.loadOffset = _getLoadOffset();

    // listen DOMContentLoaded and scroll
    this.startListening();
  }

  /**
   * start event listening
   */
  Lazyload.prototype.startListening = function () {

    // for callback
    var self = this;

    if (rxReady.test(document.readyState)) {
      self.getImages();
      self.showImages();
    } else {
      document.addEventListener('DOMContentLoaded', function onDOMContentLoaded(e) {
        self.getImages();
        self.showImages();
      });
    }
    
    var onScrollThrottled = _throttle(function onScroll(e) {
      if (self.showImages()) {

        // if all images are loaded, release memory
        self.array.length = 0;

        // unbind scroll event
        window.removeEventListener('scroll', onScrollThrottled);
      }
    }, 300);
    
    window.addEventListener('scroll', onScrollThrottled);
  };
  
  Lazyload.prototype.getImages = function () {

    // clear array
    this.array.length = 0;
    
    // get image elements
    var img;
    var imgs = document.querySelectorAll(this.selector);
    for (var i = 0, l = imgs.length; i < l;i++) {
      img = imgs[i];
      if (documentElement.compareDocumentPosition(img) & 16) {
        this.array.push(img);
      }
    }
  };

  /**
   * return whether img is visible or not
   * @param img
   * @returns {Boolean}
   */
  Lazyload.prototype.isShown = function (img) {
    return (img.getBoundingClientRect().top < this.loadOffset);
  };

  /**
   * show images
   * @returns {Boolean}
   */
  Lazyload.prototype.showImages = function () {

    var that = this;
    this.array.forEach(function (img) {
      if (that.isShown(img)) {

        img.onload = function loadCallback(e) {
          img.removeAttribute(targetAttribute);
          img.onerror = img.onload = null;
          that.array.splice(that.array.indexOf(img), 1);
        };

        img.onerror = function errorCallback(e) {
          img.src = FALLBACK_IMAGE;
          that.array.splice(that.array.indexOf(img), 1);
        };

        var src = img.getAttribute(targetAttribute);
        var srcset = img.getAttribute(targetSrcsetAttribute);
        if (srcset) {
          img.src = _resolveSrcset(src, srcset);
        } else {
          img.src = src;
        }
      }
    });

    // if img length is 0
    var isCompleted = (this.array.length === 0);

    // return completed or not
    return isCompleted;
  };

  // export
  window.Lazyload = window.Lazyload || Lazyload;

})(window, document);