const fetch = require("node-fetch").default;

class AQI {
  constructor(apikey) {
    this.apikey = apikey;
    this.countyNames = {};
    this.sites = {};
    this.getCountyNames();
  }

  static #baseurl = {
    json : "https://airtw.moenv.gov.tw/json/",
    api  : "https://data.moenv.gov.tw/api/v2/",
  };

  async getSystemTime() {
    return (await (await fetch("https://airtw.moenv.gov.tw/ajax.aspx", {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body   : "Target=system_time",
      method : "POST",
    })).json()).tw_time;
  }

  async getCountyNames(time) {
    const timeStr = time != undefined
      ? `${time.getFullYear()}${`${time.getMonth() + 1}`.padStart(2, "0")}${`${time.getDate()}`.padStart(2, "0")}${`${time.getHours() - 1 < 0 ? 0 : time.getHours() - 1}`.padStart(2, "0")}`
      : await this.getSystemTime();
    const url = AQI.#baseurl.json + `GetCounty/GetCounty_${timeStr}.json`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      this.countyNames = data.reduce((acc, v) => ((acc[v.Name] = v.Value), acc), {});
      return this.countyNames;
    } else {
      throw new Error(res.status);
    }
  }

  async getSiteIds(county, time = new Date(Date.now())) {
    const timeStr = time != undefined
      ? `${time.getFullYear()}${`${time.getMonth() + 1}`.padStart(2, "0")}${`${time.getDate()}`.padStart(2, "0")}${`${time.getHours() - 1 < 0 ? 0 : time.getHours() - 1}`.padStart(2, "0")}`
      : await this.getSystemTime();
    const url = AQI.#baseurl.json + `GetSite/GetSite_${county}_${timeStr}.json`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      this.sites[county] = data.reduce((acc, v) => ((acc[v.Name] = v.Value), acc), {});
      return this.sites[county];
    } else {
      throw new Error(res.status);
    }
  }

  async getSiteData(siteId, time = new Date(Date.now())) {
    const timeStr = time != undefined
      ? `${time.getFullYear()}${`${time.getMonth() + 1}`.padStart(2, "0")}${`${time.getDate()}`.padStart(2, "0")}${`${time.getHours() - 1 < 0 ? 0 : time.getHours() - 1}`.padStart(2, "0")}`
      : await this.getSystemTime();
    const url = AQI.#baseurl.json + `airlist/airlist_${siteId}_${timeStr}.json`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      return data.reduce((acc, v) => ((acc[Object.keys(v)[0]] = v[Object.keys(v)[0]]), acc), {});
    } else {
      throw new Error(res.status);
    }
  }

  getAQIMapImageURL(time = new Date(Date.now())) {
    return `https://airtw.moenv.gov.tw/ModelSimulate/${time.getFullYear()}${((time.getMonth() + 1) < 10) ? `0${time.getMonth() + 1}` : time.getMonth() + 1}${time.getDate()}/output_AQI_${time.getFullYear()}${((time.getMonth() + 1) < 10) ? `0${time.getMonth() + 1}` : time.getMonth() + 1}${time.getDate()}${(time.getHours() - 1 < 0 ? 0 : time.getHours() - 1).toString().padStart(2, "0")}0000.png`;
  }

  static getAQILevel(aqi) {
    return aqi < 50 ? 0
      : aqi < 100 ? 1
        : aqi < 150 ? 2
          : aqi < 200 ? 3
            : aqi < 300 ? 4
              : aqi < 400 ? 5
                : 6;
  }
}

module.exports = AQI;