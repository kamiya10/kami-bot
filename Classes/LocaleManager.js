const fs = require("fs");

module.exports = new class LocaleManager {
	constructor(path, fallback) {
		this.path = path;
		this.cache = new Map();
		fs.readdir(`${path}`, (err, files) => {
			if (err) throw err;
			const json = files.filter(f => f.split(".").pop() == "json");
			if (json.length < 1) throw new ReferenceError("找不到語言檔");

			json.forEach(file => {
				const fileget = require(`${path}/${file}`);

				try {
					this.cache.set(file.split(".").shift(), fileget);
				} catch (err) {
					return console.error(err);
				}
			});
		});
		if (!this.cache.has(fallback)) throw new RangeError("無此語言");
		this.fallback = fallback;
	}

	reload() {
		new Promise((resolve, reject) => {
			fs.readdir(`${this.path}`, (err, files) => {
				if (err) reject(err);
				const json = files.filter(f => f.split(".").pop() == "json");
				if (json.length < 1) reject(new ReferenceError("找不到語言檔"));

				json.forEach(file => {
					delete require.cache[require.resolve(`${this.path}/${file}`)];
					const fileget = require(`${this.path}/${file}`);

					this.cache.set(file.split(".").shift(), fileget);
				});
				resolve();
			});
		});
	}

	getString(locale, key) {
		return this.cache.get(locale)[key];
	}
};