#!/usr/bin/env node

const fs = require("fs");
const { ColorConsole, Cmd, PackageJSON, GitHub, Env, iOSSimulator } = require("./lib/Util.js");
const { CONST_ASSETS } = require("./assets/cli.js");

const mod_path = Env.mod_path;       // ~/workspace/wm2_example
const wm2_path = Env.wm2_path;       // ~/workspace/wm2_example/node_modules/wm2
const mod_pjson = new PackageJSON().load(`${mod_path}/package.json`); // ~/workspace/wm2_example/package.json
const wm2_pjson = new PackageJSON().load(`${wm2_path}/package.json`); // ~/workspace/wm2_example/node_modules/wm2/package.json
const moduleName = mod_pjson.moduleName;
const options = _parseCommandLineOptions({
  help:       false,      // Boolean: show help.
  verbose:    false,      // Boolean: verbose mode.
  init:       false,      // Boolean:
  // --- test ---
  test:       false,      // Boolean:
  browser:    { test: false, url: "" },
  ios:        { test: false, url: "" },
});
let { USAGE, INDEX_JS, TEST_JS, NODE_JS, WORKER_JS, TEST_HTML } = CONST_ASSETS({ moduleName });

if (options.help) {
  ColorConsole.warn(USAGE);
} else {
  let gh = new GitHub();

  gh.detect(mod_pjson, () => {
    ColorConsole.info("mod_path: "       + mod_path);
    ColorConsole.info("wm2_path: "       + wm2_path);
    ColorConsole.info("mod_pjson_path: " + mod_pjson.path);
    ColorConsole.info("wm2_pjson_path: " + wm2_pjson.path);
    ColorConsole.info("owner: " + gh.owner);
    console.log(gh.repository);

    if (options.init) {
      const cat_options = { overwrite: true };
      Cmd.mkdir(`${mod_path}/es6`);
      Cmd.mkdir(`${mod_path}/test`);
      Cmd.mkdir(`${mod_path}/test/conf`);
      Cmd.put(INDEX_JS,  `${mod_path}/index.js`, cat_options);
      Cmd.put(TEST_JS,   `${mod_path}/test/test.js`, cat_options);
      Cmd.put(NODE_JS,   `${mod_path}/test/node.js`, cat_options);
      Cmd.put(WORKER_JS, `${mod_path}/test/worker.js`, cat_options);
      Cmd.put(TEST_HTML, `${mod_path}/test/browser.html`, cat_options);
      Cmd.cp(`${wm2_path}/Dockerfile`,         `${mod_path}/Dockerfile`);
      Cmd.cp(`${wm2_path}/.eslintignore`,      `${mod_path}/.eslintignore`);
      Cmd.cp(`${wm2_path}/.eslintrc`,          `${mod_path}/.eslintrc`);
      Cmd.cp(`${wm2_path}/.eslintrc.es5.json`, `${mod_path}/.eslintrc.es5.json`);
      Cmd.cp(`${wm2_path}/.gitignore`,         `${mod_path}/.gitignore`);
      Cmd.cp(`${wm2_path}/.npmignore`,         `${mod_path}/.npmignore`);
      Cmd.cp(`${wm2_path}/.rollup.es5.js`,     `${mod_path}/.rollup.es5.js`);
      Cmd.cp(`${wm2_path}/.rollup.es6.js`,     `${mod_path}/.rollup.es6.js`);
  //  Cmd.cp(`${wm2_path}/.travis.yml`,        `${mod_path}/.travis.yml`);
      Cmd.json_merge(wm2_pjson.json.scripts, mod_pjson.json.scripts, { ignore: ["install", "postinstall"] });
      Cmd.json_merge(wm2_pjson.json.devDependencies, mod_pjson.json.devDependencies);
      mod_pjson.save(mod_pjson.path, true);
      ColorConsole.info("done");
    } else if (options.test) {
      if (options.browser.test) { Cmd.open(options.browser.url); }
      if (options.ios.test) { new iOSSimulator().open(options.ios.url); }
    } else {
      ColorConsole.info("yahoooooo");
    }
  }, (err) => {
    throw err;
  });
}

function _parseCommandLineOptions(options) {
  const argv = process.argv.slice(2);
  for (let i = 0, iz = argv.length; i < iz; ++i) {
    switch (argv[i]) {
    case "-h":
    case "--help":    options.help    = true; break;
    case "-v":
    case "--version": options.version = true; break;
    case "--init":    options.init    = true; break;
    case "--test=b":  options.browser = { test: true, url: argv[++i] }; options.test = true; break;
    case "--test=i":  options.ios     = { test: true, url: argv[++i] }; options.test = true; break;
    default:
    }
  }
  return options;
}

