(function(win) {

  var loadOffset = 100;
  var targetAttribute = 'data-src';
  var imgArray = [];
  var doc = win.document;
  var docElem = doc.documentElement;
  var windowHeight = 0;

  if (docElem.clientHeight >= 0) {
    windowHeight = docElem.clientHeight;
  } else if (doc.body && doc.body.clientHeight >= 0) {
    windowHeight = doc.body.clientHeight;
  } else if (win.innerHeight >= 0) {
    windowHeight = win.innerHeight;
  }

  /**
   * return img is visible or not
   * @param img
   * @returns {boolean}
   */
  function isShown(img) {
    return (!!(docElem.compareDocumentPosition(img) & 16) &&
      img.getBoundingClientRect().top < windowHeight + loadOffset);
  }

  /**
   * show images
   * @returns {boolean}
   */
  function showImages() {
    var completed = true;
    var img;
    for(var i = 0, len = imgArray.length;i < len;i++) {
      img = imgArray[i];
      if(img) {
        completed = false;
        if(isShown(img)) {
          img.src = img.getAttribute(targetAttribute);
          img.removeAttribute(targetAttribute);
          imgArray[i] = null;
        }
      }
    }
    return completed;
  }

  /**
   * throttle
   * @description borrowed from underscore.js
   * @param fn
   * @param wait
   * @param options
   * @returns {Function}
   */
  function throttle(fn, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if(!options){
      options = {};
    }
    var later = function() {
      previous = options.leading === false ? 0 : Date.now();
      timeout = null;
      result = fn.apply(context, args);
    };
    return function() {
      var now = Date.now();
      if (!previous && options.leading === false) {
        previous = now;
      }
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = fn.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  }

  doc.addEventListener('DOMContentLoaded', function() {
    //get image elements
    var img, imgs = doc.getElementsByTagName('img');
    for(var i = 0, len = imgs.length;i < len;i++) {
      img = imgs[i];
      if(img.hasAttribute(targetAttribute) && imgArray.indexOf(img) === -1) {
        imgArray.push(img);
      }
    }
  });

  //scroll event handler which is throttled
  var throttledScrollEventHandler = throttle(function(e) {
    if(showImages()) {
      //if all images are loaded.
      //release memory
      imgArray = [];
      //unbind scroll event
      win.removeEventListener('scroll', throttledScrollEventHandler);
    }
  }, 500);

  win.addEventListener('load', function(e) {
    showImages();
  });

  win.addEventListener('scroll', throttledScrollEventHandler);

})(window);