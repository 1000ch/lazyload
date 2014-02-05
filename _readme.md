# lazyload

## About

This is minimal library to load image lazy.
Images will be loaded when they are shown.

## Try it

Clone repository and open `index.html`.

```sh
$ git clone git@github.com:1000ch/lazyload.git
$ cd lazyload
$ open index.html
```

## Usage

```html
<img src='before.png' data-src='after.png' width='100' height='100'>
<script src='lazyload.js'></script>
<script>new Lazyload();</script>
```

I recommend you to set blank DataURI to `src` attribute,
and include this script into project's concatenated file.

```html
<img
  src='data:image/gif;base64,R0lGODlhAQABAIAAAP//////zCH5BAEHAAAALAAAAAABAAEAAAICRAEAOw=='
  data-src='after.png' width='100' height='100'>
```

+ [hiloki/spacer](https://github.com/hiloki/spacer)

## License

MIT.
