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

    var match;
    while ((match = /(.+?)\s([0-9]+)([wx])(\s([0-9]+)([wx]))?/g.exec(srcset))) {
      var url = match[1];
      var number1 = match[2] | 0;
      var unit1 = match[3];
      var number2 = match[4] | 0;
      var unit2 = match[5];

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
            if (dpr <= number2 && number2 <= resolution.x) {
              resolution.x = number2;
              candidate.x = resolution.x;
            }
          }

          candidates.push(candidate);
        }
      } else if (unit1 === 'x' && number1) {
        if (dpr <= number1 && number1 <= resolution.x) {
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
    this.imgArray = [];

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
        self.imgArray.length = 0;

        // unbind scroll event
        window.removeEventListener('scroll', onScrollThrottled);
      }
    }, 300);
    
    window.addEventListener('scroll', onScrollThrottled);
  };
  
  Lazyload.prototype.getImages = function () {

    // clear img array
    this.imgArray.length = 0;
    
    // get image elements
    var img;
    var imgs = document.querySelectorAll(this.selector);
    for (var i = 0, l = imgs.length; i < l;i++) {
      img = imgs[i];
      if (documentElement.compareDocumentPosition(img) & 16) {
        this.imgArray.push(img);
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
    var img;
    for (var i = 0, l = this.imgArray.length;i < l;i++) {
      img = this.imgArray[i];
      if (this.isShown(img)) {
        var src = img.getAttribute(targetAttribute);
        var srcset = img.getAttribute(targetSrcsetAttribute);
        if (srcset) {
          img.src = _resolveSrcset(src, srcset);
        } else {
          img.src = src;
        }
        img.removeAttribute(targetAttribute);
      }
    }

    // clear array
    this.getImages();

    // if img length is 0
    var isCompleted = (this.imgArray.length === 0);

    // return completed or not
    return isCompleted;
  };

  // export
  window.Lazyload = Lazyload;

})(window, document);