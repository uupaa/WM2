# WM2 (WebModule version 2)

Build a JavaScript module for WebApp/2. WM2 implicitly uses HTTP/2 and ES Modules.

# Overview

WM 2 is a module development environment for WebApp/2. It is possible to develop modules based on the use of ES Modules.
In WM 2, write the source code with ES6/ES7 and build `bundle.es6.js` with` npm run bundle` command.
And register the source code and bundle.es6.js in npm. Created module is called by an import statement.
The module based on WM 2 is called `WM2 module`.

# Prepare

Let's make `$PATH` feel good before installing.

```sh
export PATH="./node_modules/.bin:$PATH"
```

# Install

Go to the directory of the module to be developed on WM2 and install WM2 package.

```sh
npm i -D wm2
```

# Commands

These are the WM2 Development commands.

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

The standard file structure of the WM2 Module is as follows.

- index.js is the code entry point. Write code that cannot fit in index.js in the es6 directory.
- The assets directory is optional.

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

