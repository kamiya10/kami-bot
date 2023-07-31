const Constants = {
  BaseUrl      : "https://tdx.transportdata.tw/api/basic/v3",
  AuthTokenUrl : "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token",
  TRA          : {
    DailyTrainTimetable   : "/Rail/TRA/DailyTrainTimetable",
    GeneralTrainTimetable : "/Rail/TRA/GeneralTrainTimetable",
    StationLiveBoard      : "/Rail/TRA/StationLiveBoard",
  },
};

const TrainDirection = Object.freeze({
  NorthBound : "0",
  SouthBound : "1",
});

const TrainType = Object.freeze({
  TarokoExpress           : "1",
  PuyumaExpress           : "2",
  TzeChiangLimitedExpress : "3",
  ChuKuangExpress         : "4",
  FuHsingSemiExpress      : "5",
  LocalTrain              : "6",
  FastTrain               : "7",
  FastLocalTrain          : "10",
});

const TripLine = Object.freeze({
  None          : "0",
  MountainLine  : "1",
  CoastLine     : "2",
  ChengzhuiLine : "3",
});

class TRA {
  constructor(header) {
    this.requestHeader = header;
  }

  getDailyTimetable(date = "Today", options = { $format: "JSON" }) {
    return new Promise((resolve, reject) => {
      const query = new URLSearchParams(options);
      const url = Constants.BaseUrl + Constants.TRA.DailyTrainTimetable + `/${date != "Today" ? `TrainDate/${date}` : date}` + `?${query}`;

      fetch(url, { headers: this.requestHeader })
        .then(response => {
          if (response.ok)
            response.json().then(resolve);
          else
            reject(`Server responeded with status code ${response.status}: ${response.statusText}`);
        });
    });
  }

  getGeneralTimetable(options = { $format: "JSON" }) {
    return new Promise((resolve, reject) => {
      const query = new URLSearchParams(options);
      const url = Constants.BaseUrl + Constants.TRA.GeneralTrainTimetable + `?${query}`;
      fetch(url, { headers: this.requestHeader })
        .then(response => {
          if (response.ok)
            response.json().then(resolve);
          else
            reject(`Server responeded with status code ${response.status}: ${response.statusText}`);
        });
    });
  }

  getStationLiveboard(stationId, options = { $format: "JSON" }) {
    return new Promise((resolve, reject) => {
      const query = new URLSearchParams(options);
      const url = Constants.BaseUrl + Constants.TRA.StationLiveBoard + `/${stationId ? `Station/${stationId}` : ""}` + `?${query}`;

      fetch(url, { headers: this.requestHeader })
        .then(response => {
          if (response.ok)
            response.json().then(resolve);
          else
            reject(`Server responeded with status code ${response.status}: ${response.statusText}`);
        });
    });
  }
}

class TDX {
  constructor(data, defaultRequestHeaders) {
    this.accessToken = data.access_token;
    this.accessTokenType = data.token_type;
    this.accessTokenExpireTime = new Date(Date.now() + data.expires_in);
    this.requestHeader = {
      Authorization : `${this.accessTokenType} ${this.accessToken}`,
      Accepts       : "application/json",
      ...defaultRequestHeaders,
    };

    this.TRA = new TRA(this.requestHeader);
  }

  static async init(clientId, clientSecret, defaultRequestHeaders = {}) {
    const response = await fetch(Constants.AuthTokenUrl, {
      method  : "POST",
      headers : {
        Authorization  : `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type" : "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (response.ok) {
      const data = await response.json();
      return new TDX(data, defaultRequestHeaders);
    } else {
      throw new Error(`Server responeded with status code ${response.status}: ${response.statusText}`);
    }
  }
}

module.exports = { TDX, TrainDirection, TrainType, TripLine };