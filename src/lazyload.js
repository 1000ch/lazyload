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
   * debounce
   * @description borrowed from underscore.js#debounce
   * @param fn
   * @param wait
   * @param immediate
   * @returns {Function}
   */
  function debounce(fn, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function() {
      context = this;
      args = arguments;
      timestamp = Date.now();
      var later = function() {
        var last = Date.now() - timestamp;
        if(last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = fn.apply(context, args);
          }
        }
      };
      var callNow = immediate && !timeout;
      if(!timeout) {
        timeout = setTimeout(later, wait);
      }
      if(callNow) {
        result = fn.apply(context, args);
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

  //scroll event handler which is debounced
  var debouncedScrollEventHandler = debounce(function(e) {
    if(showImages()) {
      //if all images are loaded.
      //release memory
      imgArray = [];
      //unbind scroll event
      win.removeEventListener('scroll', debouncedScrollEventHandler);
    }
  }, 300);

  win.addEventListener('load', function(e) {
    showImages();
  });

  win.addEventListener('scroll', debouncedScrollEventHandler);

})(window);