(function(window, document) {

  var loadOffset = 100;
  var targetAttribute = 'data-src';
  var imgArray = [];
  var win = window;
  var doc = document;
  var docElem = document.documentElement;
  var windowHeight = 0;

  if (docElem.clientHeight >= 0) {
    windowHeight = docElem.clientHeight;
  } else if (doc.body && doc.body.clientHeight >= 0) {
    windowHeight = doc.body.clientHeight;
  } else if (win.innerHeight >= 0) {
    windowHeight = win.innerHeight;
  }

  /**
   * return that img is visible or not
   * @param img
   * @returns {boolean}
   */
  function isShown(img) {
    return !!(docElem.compareDocumentPosition(img) & 16) && (img.getBoundingClientRect().top < windowHeight + loadOffset);
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
   * @param fn
   * @param delay
   * @returns {Function}
   */
  function throttle(fn, delay) {
    var timer = null;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
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
  var scrollEventHandler = throttle(function(e) {
    if(showImages()) {
      //if all images are loaded.
      //release memory
      imgArray = [];
      //unbind scroll event
      win.removeEventListener('scroll', scrollEventHandler);
    }
  }, 300);

  win.addEventListener('load', function(e) {
    showImages();
  });

  win.addEventListener('scroll', scrollEventHandler);

})(window, document);