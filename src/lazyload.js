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
  var rxReady = /complete|loaded|interactive/;

  /**
   * throttle
   * @param fn
   * @param delay
   * @returns {Function}
   */
  function _throttle(fn, delay) {
    var timer = null;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  /**
   * Lazyload Class
   * @constructor Lazyload
   */
  function Lazyload() {
    
    // img elements
    this.imgArray = [];
    
    // detect display size
    this.windowHeight = 0;
    if (documentElement.clientHeight >= 0) {
      this.windowHeight = documentElement.clientHeight;
    } else if (document.body && document.body.clientHeight >= 0) {
      this.windowHeight = document.body.clientHeight;
    } else if (window.innerHeight >= 0) {
      this.windowHeight = window.innerHeight;
    }
    
    // images which got in half of display forward will be loaded
    this.loadOffset = this.windowHeight * 1.5;
    
    // listen DOMContentLoaded and scroll
    this.startListening();
  }

  /**
   * start event listening
   */
  Lazyload.prototype.startListening = function() {

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
  
  Lazyload.prototype.getImages = function() {
    // get image elements
    var img, imgs = document.getElementsByTagName('img');
    for(var i = 0, len = imgs.length;i < len;i++) {
      img = imgs[i];
      if(img.hasAttribute(targetAttribute) && this.imgArray.indexOf(img) === -1) {
        this.imgArray.push(img);
      }
    }
  };

  /**
   * return whether img is visible or not
   * @param img
   * @returns {Boolean}
   */
  Lazyload.prototype.isShown = function(img) {
    return !!(documentElement.compareDocumentPosition(img) & 16) && (img.getBoundingClientRect().top < this.loadOffset);
  };

  /**
   * show images
   * @returns {Boolean}
   */
  Lazyload.prototype.showImages = function() {
    var array = [];
    var img;
    while ((img = this.imgArray.shift())) {
      if (this.isShown(img)) {
        img.src = img.getAttribute(targetAttribute);
        img.removeAttribute(targetAttribute);
      } else {
        array.push(img);
      }
    }
    this.imgArray = array;
    return this.imgArray.length === 0;
  };

  // export
  window.Lazyload = Lazyload;

})(window, document);