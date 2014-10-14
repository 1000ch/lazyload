/**
 * lazyload.js
 * 
 * Copyright 1000ch<http://1000ch.net/>
 * licensed under the MIT license.
 */
(function(window, document) {

  // cache to local
  var TARGET_SRC = 'data-src';
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
    if (document.documentElement.clientHeight >= 0) {
      windowHeight = document.documentElement.clientHeight;
    } else if (document.body && document.body.clientHeight >= 0) {
      windowHeight = document.body.clientHeight;
    } else if (window.innerHeight >= 0) {
      windowHeight = window.innerHeight;
    }

    // images which got in half of display forward will be loaded
    return windowHeight * 1.5;
  }

  /**
   * Lazyload Class
   * @constructor Lazyload
   */
  function Lazyload(options) {

    options = options || {};

    // selector
    this.selector = options.selector || 'img[' + TARGET_SRC + ']';

    // if the page is static html, set false
    this.async = options.async !== undefined ? !!options.async : true;

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

    if (/complete|loaded|interactive/.test(document.readyState)) {
      self.getImages();
      self.showImages();
    } else {
      document.addEventListener('DOMContentLoaded', function DOMContentLoaded(e) {
        self.getImages();
        self.showImages();
      });
    }

    var onDOMNodeInsertedThrottled = _throttle(function (e) {
      self.getImages();
      self.showImages();
    }, 300);

    document.addEventListener('DOMNodeInserted', onDOMNodeInsertedThrottled);

    var onScrollThrottled = _throttle(function onScroll(e) {
      if (self.showImages()) {
        if (!self.async) {
          // unbind scroll event
          window.removeEventListener('scroll', onScrollThrottled);
        }
      }
    }, 300);
    
    window.addEventListener('scroll', onScrollThrottled);
  };
  
  Lazyload.prototype.resolveImages = function () {
    this.array.forEach(function (img) {
      if (self.isShown(img)) {

        img.onload = img.onload || function loadCallback(e) {
          img.removeAttribute(TARGET_SRC);
          img.onerror = img.onload = null;
          self.array.splice(self.array.indexOf(img), 1);
        };

        img.onerror = img.onerror || function errorCallback(e) {
          img.src = FALLBACK_IMAGE;
        };

        img.src = img.getAttribute(TARGET_SRC);
      }
    });
  };
  
  Lazyload.prototype.getImages = function () {
    
    var documentElement = document.documentElement;
    
    // get image elements
    var img;
    var imgs = document.querySelectorAll(this.selector);
    for (var i = 0, l = imgs.length; i < l;i++) {
      img = imgs[i];
      if (documentElement.compareDocumentPosition(img) & 16) {
        if (this.array.indexOf(img) === -1) {
          this.array.push(img);
        }
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

    // for callback
    var self = this;

    this.array.forEach(function (img) {
      if (self.isShown(img)) {

        img.onload = img.onload || function loadCallback(e) {
          img.removeAttribute(TARGET_SRC);
          img.onerror = img.onload = null;
          self.array.splice(self.array.indexOf(img), 1);
        };

        img.onerror = img.onerror || function errorCallback(e) {
          img.src = FALLBACK_IMAGE;
        };

        img.src = img.getAttribute(TARGET_SRC);
      }
    });

    // if img length is 0
    // return completed or not
    return (this.array.length === 0);
  };

  // export
  window.Lazyload = window.Lazyload || Lazyload;

})(window, document);