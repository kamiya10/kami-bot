class KamiListener {
  constructor(name) {
    this.name = name;
  }

  on(eventName, callback) {
    this.event = eventName;
    this.callback = callback;
    return this;
  }

  once(eventName, callback) {
    this.event = eventName;
    this.callOnce = true;
    this.callback = callback;
    return this;
  }
}

module.exports = { KamiListener };