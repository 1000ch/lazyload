# lazyload

## About

This is minimal library to load image lazy.
Images will be loaded when they are shown.

画像が表示領域に入ったらロードするライブラリ。
良いライブラリいくつかあるけど、クロスブラウザーだったり、
色々省けそうだったので、書きなおした。

## Try it

Clone repository and open `sample/index.html`.

リポジトリをクローンして`sample/index.html`を開いてください。

```sh
$ git clone git@github.com:1000ch/lazyload.git
$ open sample/index.html
```

## Usage

Set image original url to `data-src` attribute.
And load this library on your html.

遅延ロードしたい`<img>`を以下のように書いて、あとはjsをロードするだけです。

```html
<img src='before.png' data-src='after.png' width='100' height='100'>
<script src='lazyload.js'></script>
```

I recommend you to set blank DataURI to `src` attribute.

READMEなので`<script></script>`で書いてありますが、  
もちろん他のjsに含めてもらって問題ないです。むしろそのほうがいいです。  
これだと`before.png`をロードすべくリクエストが発生してしまうので、  
空画像のDataURIを埋めておくほうが良いでしょう。  

```html
<img
  src='data:image/gif;base64,R0lGODlhAQABAIAAAP//////zCH5BAEHAAAALAAAAAABAAEAAAICRAEAOw=='
  data-src='after.png' width='100' height='100'>
```

+ [hiloki/spacer](https://github.com/hiloki/spacer)

## License

MIT.
