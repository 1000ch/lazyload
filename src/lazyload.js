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
  var resolvedAttribute = 'data-resolved';
  var rxReady = /complete|loaded|interactive/;

  /**
   * throttle
   * @param fn
   * @param delay
   * @returns {Function}
   * @private
   */
  function _throttle(fn, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
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
   * Lazyload Class
   * @constructor Lazyload
   */
  function Lazyload() {
    
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
    var that = this;

    if (rxReady.test(document.readyState)) {
      this.getImages();
      this.showImages();
    } else {
      document.addEventListener('DOMContentLoaded', function onDOMContentLoaded(e) {
        that.getImages();
        that.showImages();
      });
    }
    
    var onScrollThrottled = _throttle(function onScroll(e) {
      if (that.showImages()) {
        // if all images are loaded, release memory
        that.imgArray = null;
        // unbind scroll event
        window.removeEventListener('scroll', onScrollThrottled);
      }
    }, 300);
    
    window.addEventListener('scroll', onScrollThrottled);
  };
  
  Lazyload.prototype.getImages = function () {
    // get image elements
    var imgs = document.getElementsByTagName('img');
    var img;
    for(var i = 0, len = imgs.length;i < len;i++) {
      img = imgs[i];
      if(img.hasAttribute(targetAttribute) && (documentElement.compareDocumentPosition(img) & 16)) {
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
        img.src = img.getAttribute(targetAttribute);
        img.setAttribute(resolvedAttribute, true);
      }
    }
    // :(
    return this.imgArray.every(function (img) {
      return img.hasAttribute(resolvedAttribute);
    });
  };

  // export
  window.Lazyload = Lazyload;

})(window, document);