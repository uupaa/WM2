# WM2 (WebModule version 2)

WM2は WebApp/2用のJavaScriptモジュールをビルドします。WM2 は HTTP/2 と ES Modules で動作します。

# 概要

WM2 は WebApp/2 用のモジュール開発環境です。ES Modules の使用を前提としたモジュールの開発を行う事ができます。
WM2 では、ES6/ES7 でソースコードを記述し、`npm run bundle` で `bundle.es6.js` をビルドします。
ビルドが終わったらソースコードと bundle.es6.js を npm に登録します。
作成したモジュールは import 文で呼び出して使用します。
WM2 をベースに作成したモジュールを `WM2モジュール` と呼びます。

# 準備

インストールを行う前に `$PATH` を良い感じにしておきましょう。

```sh
export PATH="./node_modules/.bin:$PATH"
```

# Install

WM2 で開発を行うモジュールのディレクトリに移動し、WM2をインストールします。

```sh
npm i -D wm2
```

# Commands

WM2 は以下の開発コマンドを用意しています。

- `npm run lint` - run eslint
- `npm run start` - start test server
- `npm run stop` - stop test server
- `npm run bundle` - build `bundle.es6.js` and `bundle.es6.mjs`
- `npm run test` - test
- `npm run test:browser`
- `npm run test:node`
- `npm run test:ios`
- `npm run test:el`
- `npm run watch` - Watch changes in "index.js" and "es6/*.js"
- `npm run unwatch`

# Module file tree

WM2 Module の標準的なファイル構成は以下のようになります。

- index.js がコードのエントリポイントです。index.js に収まりきれないコードは es6 ディレクトリ以下に記述して行ってください
- assets ディレクトリは必須ではありません

```
▾ wm2-example.js/
  ▾ assets/
  ▾ es6/
  ▾ test/
      test.js         # test code entry point.
      browser.html    # Browser and iOS Simulator
      node.js         # Node.js
      worker.js       # WebWorkers
  ▾ .conf/
    .eslintignore
    .eslintrc
    .eslintrc.es5.json
    .gitignore
    .npmignore
    .rollup.es5.js
    .rollup.es6.js
    Dockerfile
    index.js          # code entry point.
    package.json
```

