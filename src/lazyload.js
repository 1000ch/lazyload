(function(window, document) {

  var win = window;
  var doc = document;
  var docElem = document.documentElement;

  /**
   * Lazyload Class
   * @constructor Lazyload
   */
  function Lazyload() {
    this.imgArray = [];
    this.windowHeight = 0;
    if (docElem.clientHeight >= 0) {
      this.windowHeight = docElem.clientHeight;
    } else if (doc.body && doc.body.clientHeight >= 0) {
      this.windowHeight = doc.body.clientHeight;
    } else if (win.innerHeight >= 0) {
      this.windowHeight = win.innerHeight;
    }

    //listen DOMContentLoaded
    doc.addEventListener('DOMContentLoaded', (function() {
      //get image elements
      var img, imgs = doc.getElementsByTagName('img');
      for(var i = 0, len = imgs.length;i < len;i++) {
        img = imgs[i];
        if(img.hasAttribute(Lazyload.targetAttribute) && this.imgArray.indexOf(img) === -1) {
          this.imgArray.push(img);
        }
      }
      this.showImages();
    }).bind(this));

    //scroll event handler which is throttled
    var scrollEventHandler = Lazyload.throttle((function(e) {
      if(this.showImages()) {
        //if all images are loaded, release memory
        this.imgArray = [];
        //unbind scroll event
        win.removeEventListener('scroll', scrollEventHandler);
      }
    }).bind(this), 300);

    //listen scroll event
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
   * return that img is visible or not
   * @param img
   * @returns {boolean}
   */
  Lazyload.prototype.isShown = function(img) {
    return !!(docElem.compareDocumentPosition(img) & 16) && (img.getBoundingClientRect().top < this.windowHeight + Lazyload.loadOffset);
  };

  /**
   * show images
   * @returns {boolean}
   */
  Lazyload.prototype.showImages = function() {
    var completed = true;
    var img;
    for(var i = 0, len = this.imgArray.length;i < len;i++) {
      img = this.imgArray[i];
      if(img) {
        completed = false;
        if(this.isShown(img)) {
          img.src = img.getAttribute(Lazyload.targetAttribute);
          img.removeAttribute(Lazyload.targetAttribute);
          this.imgArray[i] = null;
        }
      }
    }
    return completed;
  };

  //create instance
  Lazyload.instance = new Lazyload;

  //export
  win.Lazyload = Lazyload;

})(window, document);