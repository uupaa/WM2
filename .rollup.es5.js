import path from "path";
import resolve from "rollup-plugin-node-resolve"; // resolve node_modules/index.js to ES6
import commonjs from "rollup-plugin-commonjs";    // convert CommonJS -> ES6
import buble from "rollup-plugin-buble";          // convert ES6 -> ES5
import eslint from "rollup-plugin-eslint";        // ESLint
import cleanup from "rollup-plugin-cleanup";      // clear comments and empty lines
import license from "rollup-plugin-license";      // add License header

// --- ES5/ES6/CommonJS/ESModules -> ES5 bundle ---
export default {
  format: "iife", // wrap (function(){ code })();
  entry: "index.js",
  dest: "bundle.es5.js",
  plugins: [
    resolve({ jsnext: true }),
    commonjs(),
    buble(), // ES6 -> ES5
    eslint({ configFile: path.resolve("./.eslintrc.es5.json") }),
    cleanup(),
    license({
      banner: "Copyright 2017 @uupaa",
      //thirdParty: {
      //  output: path.join(__dirname, "dependencies.txt"),
      //  includePrivate: true, // Default is false.
      //},
    }),
  ],
  moduleName: `WebModule2_${Math.random().toString(32).substring(2)}`,
  intro: "",
  outro: "",
  banner: "if (typeof WebModule2 === \"undefined\") { // avoid duplicate running",
  footer: "}",
}

