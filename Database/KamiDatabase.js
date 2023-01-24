const fs = require("node:fs");
const path = require("node:path");

class KamiDatabase {
  constructor(filename) {
    try {
      this._folder = path.join(__dirname);
      this._path = path.join(this._folder, filename);
      this.name = filename.split(".")[0];

      if (!fs.existsSync(this._path))
        fs.writeFileSync(this._path, "{}", { encoding: "utf-8" });

      this._data = JSON.parse(fs.readFileSync(this._path, { encoding: "utf-8" }));

      this.backup();

      const thisClass = this;
      this._proxy = new Proxy(this._data, {
        set(target, key, value) {
          target[key] = value;
          thisClass.save();
          return true;
        },
        get(target, key) {
          return target[key];
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  get data() {
    return this._proxy;
  }

  get path() {
    return this._path;
  }

  backup() {
    const files = fs.readdirSync(this._folder).filter(filename => filename.startsWith("backup~") && filename.endsWith(`${this.name}.json`));

    if (files.length)
      for (const file of files)
        fs.rmSync(path.join(this._folder, file));

    fs.writeFileSync(path.join(this._folder, `backup~${Date.now()}_${this.name}.json`), JSON.stringify(this._data, null, 2), { encoding: "utf-8" });
  }

  save() {
    fs.writeFileSync(this._path, JSON.stringify(this._data, null, 2), { encoding: "utf-8" });
  }

  get(id) {
    return this.data[id];
  }

  getAll(keys) {
    return Object.keys(this._data).reduce((acc, v) => {
      for (const k of keys)
        if (Object.hasOwnProperty.call(this._data[v], k)) {
          acc[v] ??= {};
          acc[v][k] = this._data[v][k];
        }

      return acc;
    }, {});
  }

  set(id, value) {
    this.data[id] = value;
  }

  has(id) {
    return Object.prototype.hasOwnProperty.call(this.data, id);
  }

  remove(id) {
    delete this.data[id];
  }
}

module.exports = KamiDatabase;