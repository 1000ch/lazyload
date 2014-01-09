/**
 * lazyload.js
 * 
 * Copyright 1000ch<http://1000ch.net/>
 * licensed under the MIT license.
 */
(function(window, document) {

  // cache to local
  var win = window;
  var doc = document;
  var docElem = document.documentElement;

  /**
   * Lazyload Class
   * @constructor Lazyload
   */
  function Lazyload() {
    
    // img elements
    this.imgArray = [];
    
    // detect display size
    this.windowHeight = 0;
    if (docElem.clientHeight >= 0) {
      this.windowHeight = docElem.clientHeight;
    } else if (doc.body && doc.body.clientHeight >= 0) {
      this.windowHeight = doc.body.clientHeight;
    } else if (win.innerHeight >= 0) {
      this.windowHeight = win.innerHeight;
    }

    // for callback
    var that = this;

    // listen DOMContentLoaded
    doc.addEventListener('DOMContentLoaded', function() {
      // get image elements
      var img, imgs = doc.getElementsByTagName('img');
      for(var i = 0, len = imgs.length;i < len;i++) {
        img = imgs[i];
        if(img.hasAttribute(Lazyload.targetAttribute) && that.imgArray.indexOf(img) === -1) {
          that.imgArray.push(img);
        }
      }
      that.showImages();
    });

    // scroll event handler which is throttled
    var scrollEventHandler = Lazyload.throttle(function(e) {
      if(that.showImages()) {
        // if all images are loaded, release memory
        that.imgArray = null;
        // unbind scroll event
        win.removeEventListener('scroll', scrollEventHandler);
      }
    }, 300);

    // listen scroll event
    win.addEventListener('scroll', scrollEventHandler);
  }

  Lazyload.loadOffset = 100;
  Lazyload.targetAttribute = 'data-src';

  /**
   * throttle
   * @param fn
   * @param delay
   * @returns {Function}
   */
  Lazyload.throttle = function(fn, delay) {
    var timer = null;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  };

  /**
   * return whether img is visible or not
   * @param img
   * @returns {Boolean}
   */
  Lazyload.prototype.isShown = function(img) {
    return !!(docElem.compareDocumentPosition(img) & 16) && (img.getBoundingClientRect().top < this.windowHeight + Lazyload.loadOffset);
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
        img.src = img.getAttribute(Lazyload.targetAttribute);
        img.removeAttribute(Lazyload.targetAttribute);
      } else {
        array.push(img);
      }
    }
    this.imgArray = array;
    return Boolean(imgArray.length);
  };

  // create instance
  Lazyload.instance = new Lazyload();

  // export
  win.Lazyload = Lazyload;

})(window, document);