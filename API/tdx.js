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

const TrainDirectionName = Object.freeze({
  [TrainDirection.NorthBound] : "順行",
  [TrainDirection.SouthBound] : "逆行",
});

const TrainType = Object.freeze({
  TarokoExpress               : "1",
  PuyumaExpress               : "2",
  TzeChiangLimitedExpress     : "3",
  ChuKuangExpress             : "4",
  FuHsingSemiExpress          : "5",
  LocalTrain                  : "6",
  OrdinaryTrain               : "7",
  FastLocalTrain              : "10",
  TzeChiangLimitedExpress3000 : "11",
});

const TrainTypeName = Object.freeze({
  [TrainType.TarokoExpress]               : "太魯閣自強號列車",
  [TrainType.PuyumaExpress]               : "普悠瑪自強號列車",
  [TrainType.TzeChiangLimitedExpress]     : "自強號列車",
  [TrainType.ChuKuangExpress]             : "莒光號列車",
  [TrainType.FuHsingSemiExpress]          : "復興號列車",
  [TrainType.LocalTrain]                  : "區間車",
  [TrainType.OrdinaryTrain]               : "普快車",
  [TrainType.FastLocalTrain]              : "區間快車",
  [TrainType.TzeChiangLimitedExpress3000] : "自強號 EMU3000 型列車",
});

const TripLine = Object.freeze({
  None          : "0",
  MountainLine  : "1",
  CoastLine     : "2",
  ChengzhuiLine : "3",
});

const TripLineName = Object.freeze({
  [TripLine.None]          : "不經山海線",
  [TripLine.MountainLine]  : "山線",
  [TripLine.CoastLine]     : "海線",
  [TripLine.ChengzhuiLine] : "成追線",
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
  constructor(data, auth, defaultRequestHeaders) {
    this.accessToken = data.access_token;
    this.accessTokenType = data.token_type;
    this.accessTokenExpireIn = data.expires_in * 1000;
    this.accessTokenExpireAt = new Date(Date.now() + this.accessTokenExpireIn);
    this.requestHeader = {
      Authorization : `${this.accessTokenType} ${this.accessToken}`,
      Accepts       : "application/json",
      ...defaultRequestHeaders,
    };

    this.TRA = new TRA(this.requestHeader);
    this._auth = auth;
    this._expireTimer = setTimeout(this.refreshToken, this.accessTokenExpireIn);
  }

  async refreshToken() {
    const data = await TDX.getToken(this._auth);
    this.accessToken = data.accessToken;
    this.accessTokenType = data.token_type;
    this.accessTokenExpireIn = data.expires_in * 1000;
    this.accessTokenExpireAt = new Date(Date.now() + this.accessTokenExpireIn);
    this._expireTimer.refresh();
    this.requestHeader.Authorization = `${this.accessTokenType} ${this.accessToken}`;
    this.TRA.requestHeader = this.requestHeader;
  }

  static async init(clientId, clientSecret, defaultRequestHeaders = {}) {
    const auth = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
    return new TDX(await TDX.getToken(auth), auth, defaultRequestHeaders);
  }

  static async getToken(auth) {
    const response = await fetch(Constants.AuthTokenUrl, {
      method  : "POST",
      headers : {
        Authorization  : auth,
        "Content-Type" : "application/x-www-form-urlencoded",
        "User-Agent"   : `KamiBot/v${process.env.BOT_VERSION}`,
      },
      body: "grant_type=client_credentials",
    });

    if (response.ok)
      return await response.json();
    else
      throw new Error(`Server responeded with status code ${response.status}: ${response.statusText}`);
  }
}

module.exports = { TDX, TrainDirection, TrainDirectionName, TrainType, TrainTypeName, TripLine, TripLineName };