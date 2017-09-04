const fs = require("fs");
const child_process = require("child_process");

const COLORS = {
  ERR:  "\u001b[31m",
  WARN: "\u001b[33m",
  INFO: "\u001b[32m",
  CLR:  "\u001b[0m",
};

const ColorConsole = {
  info: (msg) => { console.info(`${COLORS.INFO}${msg}${COLORS.CLR}`); },
  warn: (msg) => { console.warn(`${COLORS.WARN}${msg}${COLORS.CLR}`); },
  err:  (msg) => { console.error(`${COLORS.ERR}${msg}${COLORS.CLR}`); },
};

class Env {
  static get mod_path() { return process.cwd(); } // "~/workspace/wm2_example"
  static get wm2_path() { return `${Env.mod_path}/node_modules/wm2`; } // "~/workspace/wm2_example/node_modules/wm2"
  static get windows()  { return process.platform === "win32"; }
  static get linux()    { return process.platform === "linux"; }
  static get mac()      { return process.platform === "darwin"; }
  static get bsd()      { return process.platform === "freebsd"; }
}

const Cmd = {
  exec: (command,            // @arg String - command string
         readyCallback,      // @arg Function = null - readyCallback(stdout:String):void
         errorCallback) => { // @arg Function = null - errorCallback(err:Error):void
    child_process.exec(command, (err, stdout, stderr) => {
      if (err) {
        if (errorCallback) {
          errorCallback(err);
        } else {
          ColorConsole.err(err.message);
        }
      } else {
        if (readyCallback) {
          readyCallback(stdout);
        }
      }
    });
  },
  mkdir: (path) => { // @arg String
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  },
  cp: (source_path,                         // @arg String
       target_path,                         // @arg String
       options = { overwrite: false }) => { // @arg Object - { overwrite: Boolean }
    if (fs.existsSync(source_path)) {
      if (options.overwrite || !fs.existsSync(target_path)) {
        let txt = fs.readFileSync(source_path, "UTF-8");
        fs.writeFileSync(target_path, txt);
      }
    }
  },
  put: (source_text,                         // @arg String
        target_path,                         // @arg String
        options = { overwrite: false }) => { // @arg Object - { overwrite: Boolean }
    if (options.overwrite || !fs.existsSync(target_path)) {
      let txt = source_text;
      fs.writeFileSync(target_path, txt);
    }
  },
  json_merge: (source_json,                   // @arg JSON
               target_json,                   // @arg JSON
               options = { ignore: [] }) => { // @arg Object - { ignore: KeywordStringArray }
    let ignore = options.ignore || [];

    Object.keys(source_json).forEach(key => {
      if (ignore.includes(key) || key in target_json) {
        // skip
      } else {
        // inject
        target_json[key] = source_json[key];
      }
    });
  },
  open: (arg) => {
    let command = Env.windows ? `start ${arg}`
                : Env.mac     ? `open ${arg}`
                : Env.linux   ? `xdg-open ${arg}` : "";
    if (!command) {
      throw new Error(`open ${arg} not impl`);
    }
    child_process.exec(command, (err) => {
      if (err) {
        throw new Error(`${err.message}: ${command}`);
      }
    });
  },
};

class PackageJSON {
  constructor() {
    this._path = "";
    this._json = null;
  }
  get json() { return this._json; }
  get path() { return this._path; }
  get moduleName() { return this._json.name; }
  get repository() {
    if (this._json.repository) {
      let url = this._json.repository.url;
      let owner = url.replace(/(\:|@)/, "/").split("/").slice(-2)[0];
      return { url, owner };
    } else {
      return { url: "", owner: "" };
    }
  }
  load(path) {
    this._path = path;
    this._json = JSON.parse(fs.readFileSync(path, "UTF-8"));
    return this;
  }
  save(path, prettyPrint = false) {
    let txt = JSON.stringify(this._json, null, 2);

    if (prettyPrint) {
      txt = txt.replace(/"(keywords|label|contributors)": \[([^\]]*)\],/g, (_, key, value) => {
                          let v = value.trim().replace(/\s*\n+\s*/g, " ");

                          return `"${key}": [${v}],`;
                        });
    }
    fs.writeFileSync(path, txt);
    return this;
  }
}

class GitHub {
  constructor() {
    this._owner = "";
    this._repository = { fullName: "", shortName: "" };
  }
  get owner() { // @ret OwnerNameString
    return this._owner;
  }
  get repository() { // @ret Object - { fullName: "repo.js", shortName: "repo" }
    return this._repository;
  }
  detect(mod_pjson,              // @arg JSONObject - module package json
         readyCallback = null,   // @arg Function - readyCallback():void
         errorCallback = null) { // @arg Function - errorCallback(error:Error):void

    let _detect = (url) => {
      if (/github/.test(url)) {
        this._owner = GitHub.getOwner(url);
        this._repository = GitHub.getRepository(url);
        if (readyCallback) {
          readyCallback();
          return;
        }
      }
      if (errorCallback) {
        errorCallback(new Error(`UNSUPPORTED URL: ${url}`));
      }
    };

    if (mod_pjson && mod_pjson.repository) {
      _detect(mod_pjson.repository.url || "");
    } else {
      Cmd.exec("git config --get remote.origin.url", (stdout) => {
        _detect( stdout.trim() );
      }, (err) => {
        if (errorCallback) {
          errorCallback(err);
        }
      });
    }
  }

  static getOwner(url) { // @arg GitHubHTTPSRepositoryURLString|GitHubSSHRepositoryString
                         // @ret OwnerNameString
    // | Sheme          | url                                       | path                                      | result |
    // |----------------|-------------------------------------------|-------------------------------------------|--------|
    // | GitHub HTTPS   |      https://github.com/owner/repo.js.git |      https///github.com/owner/repo.js.git | owner  |
    // | GitHub SSH     |          git@github.com:owner/repo.js.git |          git/github.com/owner/repo.js.git | owner  |
    // | GitHub:E HTTPS | https://github.corp.com/owner/repo.js.git | https///github.corp.com/owner/repo.js.git | owner  |
    // | GitHub:E SSH   |     git@github.corp.com:owner/repo.js.git |     git/github.corp.com/owner/repo.js.git | owner  |
    let path = url.replace(/(\:|@)/g, "/");
    return path ? path.split("/").slice(-2)[0] : "";
  }

  static getRepository(url) { // @arg GitHubHTTPSRepositoryURLString|GitHubSSHRepositoryString
                              // @ret Object - { fullName: RepositoryNameString, shortName: ShortRepositoryNameString }
    // | Sheme          | url                                       | path                                      | result |
    // |----------------|-------------------------------------------|-------------------------------------------|--------|
    // | GitHub HTTPS   |      https://github.com/owner/repo.js.git |      https///github.com/owner/repo.js.git | { fullName: "repo.js", shortName: "repo" } |
    // | GitHub SSH     |          git@github.com:owner/repo.js.git |          git/github.com/owner/repo.js.git | { fullName: "repo.js", shortName: "repo" } |
    // | GitHub:E HTTPS | https://github.corp.com/owner/repo.js.git | https///github.corp.com/owner/repo.js.git | { fullName: "repo.js", shortName: "repo" } |
    // | GitHub:E SSH   |     git@github.corp.com:owner/repo.js.git |     git/github.corp.com/owner/repo.js.git | { fullName: "repo.js", shortName: "repo" } |
    let path = url.replace(/(\:|@)/, "/");
    let repo = path ? path.split("/").slice(-1)[0].replace(/.git$/, "") : "";

    return {
      fullName: repo,
      shortName: repo.indexOf(".") >= 0 ? repo.split(".").slice(0, -1).join(".") : repo,
    };
  }
}

const IOS_SIM = {
  DEFAULT_DEVICE: "iPhone 5s",
  KILL:       "kill `ps -e | grep 'iOS Simulator' | grep -v 'grep' | awk '{print $1}'`",
  LISTUP:     "xcrun simctl list | grep -v com",
  COLD_BOOT:  "xcrun instruments -w __UUID__",
  OPEN_URL:   "xcrun simctl openurl __UUID__ __URL__",
};

class iOSSimulator {
  constructor() {
  }
  close() {
    child_process.exec(IOS_SIM.KILL);
  }
  open(url) {
    if (!Env.mac) { return; }
    this._listup((deviceList, bootedDeviceUUID) => {
      if (!bootedDeviceUUID) {
        const uuid = deviceList[IOS_SIM.DEFAULT_DEVICE].uuid;

        child_process.exec(IOS_SIM.COLD_BOOT.replace("__UUID__", uuid), (err, stdout/*, stderr */) => {
          ColorConsole.info(stdout);
          setTimeout(() => this._open(url), 3000); // lazy
        });
      } else { // booted -> open
        this._open(url);
      }
    });
  }

  _open(url) {
    this._listup((deviceList, bootedDeviceUUID) => {
      if (bootedDeviceUUID) {
        const command = IOS_SIM.OPEN_URL.replace("__UUID__", bootedDeviceUUID).replace("__URL__", url);
        child_process.exec(command, (err, stdout) => ColorConsole.info(stdout));
      } else {
        ColorConsole.warn("Page open fail. because iOS Simulator shutdown. \n" +
                          "Please try again after waiting for a while.");
      }
    });
  }

  // enum iOS Simulator devices
  _listup(readyCallback) {
    child_process.exec(IOS_SIM.LISTUP, (err, stdout/*, stderr*/) => {
      // iPhone 5 (E6AA0287-6C06-4F03-A61E-C96B75B587CD) (Booted)
      // ~~~~~~~~  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   ~~~~~~
      //   name                  uuid                      state

      let lines = (stdout || "").trim();
      let deviceList = {};
      let bootedDeviceUUID = "";

      lines.split("\n").forEach(line => {
        if (/(iPhone|iPad|iPod)/.test(line)) {
          if (/unavailable/.test(line)) { return; }

          let name = line.split("(")[0].trim();
          let uuid = line.split("(")[1].split(")")[0].trim();
          let state = line.split("(")[2].split(")")[0].trim();

          deviceList[name] = { uuid, state };

          if (state === "Booted") {
            bootedDeviceUUID = uuid;
          }
        }
      });
      readyCallback(deviceList, bootedDeviceUUID);
    });
  }
}

module.exports = { ColorConsole, Cmd, PackageJSON, GitHub, Env, iOSSimulator };

