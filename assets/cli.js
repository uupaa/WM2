
function CONST_ASSETS({ moduleName }) {

const USAGE = `
Usage:
    wm2 [-h][--help]    # show help
        [-v][--version] # show version
        [--init]        # init
        [--test=b]      # Browser test
        [--test=i]      # iOS Safari test

More:
    https://github.com/uupaa/WebModule2/wiki/
`;

const INDEX_JS = `
// import { some_module } from "./es6/some_module.js";

class __moduleName__ {
  constructor() {
    console.log("Hello World");
  }
}`.trim().replace(/__moduleName__/, moduleName);

const TEST_JS = `
console.warn("test not impl!");
`.trim();

const NODE_JS = `
console.warn("Node test not impl!");
`.trim();

const WORKER_JS = `
console.warn("Worker test not impl!");
`.trim();

const TEST_HTML = `
<!DOCTYPE html><html><head><title>__moduleName__</title>
<meta name="viewport" content="width=device-width">
<meta charset="utf-8"></head><body>
<script type="module" src="../index.js"></script>
<script type="module" src="./test.js"></script>
</body></html>
`.trim().replace(/__moduleName__/, moduleName);

  return { USAGE, INDEX_JS, TEST_JS, NODE_JS, WORKER_JS, TEST_HTML };
}

module.exports = { CONST_ASSETS };

