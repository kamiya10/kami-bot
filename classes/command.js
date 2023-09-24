class KamiCommand {
  constructor(options) {
    this.defer = options.defer ?? true;
    this.global = options.global ?? false;
    this.dev = options.dev ?? false;
    this.filePath = options.filePath;
    this.builder = options.builder;

    this.execute = options.execute;
    this.autocomplete = options.autocomplete;
  }
}

module.exports = { KamiCommand };