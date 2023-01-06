/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
const fetch = require("node-fetch").default;

class CWB_Forcast {
  constructor(apikey) {
    this.apikey = apikey;
  }

  static #baseurl = "https://opendata.cwb.gov.tw/api/v1/rest/datastore/";

  /**
	 * @type {{ "宜蘭縣" : "F-D0047-003", "桃園市" : "F-D0047-007", "新竹縣" : "F-D0047-011", "苗栗縣" : "F-D0047-015", "彰化縣" : "F-D0047-019", "南投縣" : "F-D0047-023", "雲林縣" : "F-D0047-027", "嘉義縣" : "F-D0047-031", "屏東縣" : "F-D0047-035", "臺東縣" : "F-D0047-039", "花蓮縣" : "F-D0047-043", "澎湖縣" : "F-D0047-047", "基隆市" : "F-D0047-051", "新竹市" : "F-D0047-055", "嘉義市" : "F-D0047-059", "臺北市" : "F-D0047-063", "高雄市" : "F-D0047-067", "新北市" : "F-D0047-071", "臺中市" : "F-D0047-075", "臺南市" : "F-D0047-079", "連江縣" : "F-D0047-083", "金門縣" : "F-D0047-087",	}}
	 */
  county_code2 = {
    宜蘭縣 : "F-D0047-001",
    桃園市 : "F-D0047-005",
    新竹縣 : "F-D0047-009",
    苗栗縣 : "F-D0047-013",
    彰化縣 : "F-D0047-016",
    南投縣 : "F-D0047-018",
    雲林縣 : "F-D0047-025",
    嘉義縣 : "F-D0047-028",
    屏東縣 : "F-D0047-032",
    臺東縣 : "F-D0047-036",
    花蓮縣 : "F-D0047-040",
    澎湖縣 : "F-D0047-044",
    基隆市 : "F-D0047-048",
    新竹市 : "F-D0047-052",
    嘉義市 : "F-D0047-056",
    臺北市 : "F-D0047-060",
    高雄市 : "F-D0047-064",
    新北市 : "F-D0047-068",
    臺中市 : "F-D0047-072",
    臺南市 : "F-D0047-076",
    連江縣 : "F-D0047-080",
    金門縣 : "F-D0047-084",
  };

  /**
	 * @type {{ "宜蘭縣" : "F-D0047-003", "桃園市" : "F-D0047-007", "新竹縣" : "F-D0047-011", "苗栗縣" : "F-D0047-015", "彰化縣" : "F-D0047-019", "南投縣" : "F-D0047-023", "雲林縣" : "F-D0047-027", "嘉義縣" : "F-D0047-031", "屏東縣" : "F-D0047-035", "臺東縣" : "F-D0047-039", "花蓮縣" : "F-D0047-043", "澎湖縣" : "F-D0047-047", "基隆市" : "F-D0047-051", "新竹市" : "F-D0047-055", "嘉義市" : "F-D0047-059", "臺北市" : "F-D0047-063", "高雄市" : "F-D0047-067", "新北市" : "F-D0047-071", "臺中市" : "F-D0047-075", "臺南市" : "F-D0047-079", "連江縣" : "F-D0047-083", "金門縣" : "F-D0047-087",	}}
	 */
  county_code7 = {
    宜蘭縣 : "F-D0047-003",
    桃園市 : "F-D0047-007",
    新竹縣 : "F-D0047-011",
    苗栗縣 : "F-D0047-015",
    彰化縣 : "F-D0047-019",
    南投縣 : "F-D0047-023",
    雲林縣 : "F-D0047-027",
    嘉義縣 : "F-D0047-031",
    屏東縣 : "F-D0047-035",
    臺東縣 : "F-D0047-039",
    花蓮縣 : "F-D0047-043",
    澎湖縣 : "F-D0047-047",
    基隆市 : "F-D0047-051",
    新竹市 : "F-D0047-055",
    嘉義市 : "F-D0047-059",
    臺北市 : "F-D0047-063",
    高雄市 : "F-D0047-067",
    新北市 : "F-D0047-071",
    臺中市 : "F-D0047-075",
    臺南市 : "F-D0047-079",
    連江縣 : "F-D0047-083",
    金門縣 : "F-D0047-087",
  };

  /**
	 * @type {{ "宜蘭縣" : "10002", "桃園市" : "68", "新竹縣" : "10004", "苗栗縣" : "10005", "彰化縣" : "10007", "南投縣" : "10008", "雲林縣" : "10009", "嘉義縣" : "10010", "屏東縣" : "10013", "臺東縣" : "10014", "花蓮縣" : "10015", "澎湖縣" : "10016", "基隆市" : "10017", "新竹市" : "10018", "嘉義市" : "10020", "臺北市" : "63", "高雄市" : "64", "新北市" : "65", "臺中市" : "66", "臺南市" : "67", "連江縣" : "09007", "金門縣" : "09020" }}
	 */
  cid = {
    宜蘭縣 : "10002",
    桃園市 : "68",
    新竹縣 : "10004",
    苗栗縣 : "10005",
    彰化縣 : "10007",
    南投縣 : "10008",
    雲林縣 : "10009",
    嘉義縣 : "10010",
    屏東縣 : "10013",
    臺東縣 : "10014",
    花蓮縣 : "10015",
    澎湖縣 : "10016",
    基隆市 : "10017",
    新竹市 : "10018",
    嘉義市 : "10020",
    臺北市 : "63",
    高雄市 : "64",
    新北市 : "65",
    臺中市 : "66",
    臺南市 : "67",
    連江縣 : "09007",
    金門縣 : "09020",
  };

  county_town = {
    宜蘭縣: [
      [
        "頭城鎮", "礁溪鄉", "壯圍鄉", "員山鄉", "宜蘭市", "大同鄉", "五結鄉", "三星鄉", "羅東鎮", "冬山鄉",
        "南澳鄉", "蘇澳鎮"]],
    桃園市: [
      [
        "大園區", "蘆竹區", "觀音區", "龜山區", "桃園區", "中壢區", "新屋區", "八德區", "平鎮區", "楊梅區",
        "大溪區", "龍潭區", "復興區",
      ]],
    新竹縣: [
      [
        "新豐鄉", "湖口鄉", "新埔鎮", "竹北市", "關西鎮", "芎林鄉", "竹東鎮", "寶山鄉", "尖石鄉", "橫山鄉",
        "北埔鄉", "峨眉鄉", "五峰鄉",
      ]],
    苗栗縣: [
      [
        "竹南鎮", "頭份市", "三灣鄉", "造橋鄉", "後龍鎮", "南庄鄉", "頭屋鄉", "獅潭鄉", "苗栗市", "西湖鄉",
        "通霄鎮", "公館鄉", "銅鑼鄉", "泰安鄉", "苑裡鎮", "大湖鄉", "三義鄉", "卓蘭鎮",
      ]],
    彰化縣: [
      [
        "伸港鄉", "和美鎮", "線西鄉", "鹿港鎮", "彰化市", "秀水鄉", "福興鄉", "花壇鄉", "芬園鄉", "芳苑鄉",
        "埔鹽鄉", "大村鄉", "二林鎮", "員林市", "溪湖鎮", "埔心鄉", "永靖鄉", "社頭鄉", "埤頭鄉", "...",
      ],
      [
        "...", "田尾鄉", "大城鄉", "田中鎮", "北斗鎮", "竹塘鄉", "溪州鄉", "二水鄉",
      ]],
    南投縣: [
      [
        "仁愛鄉", "國姓鄉", "埔里鎮", "草屯鎮", "中寮鄉", "南投市", "魚池鄉", "水里鄉", "名間鄉", "信義鄉",
        "集集鎮", "竹山鎮", "鹿谷鄉",
      ]],
    雲林縣: [
      [
        "麥寮鄉", "二崙鄉", "崙背鄉", "西螺鎮", "莿桐鄉", "林內鄉", "臺西鄉", "土庫鎮", "虎尾鎮", "褒忠鄉",
        "東勢鄉", "斗南鎮", "四湖鄉", "古坑鄉", "元長鄉", "大埤鄉", "口湖鄉", "北港鎮", "水林鄉", "斗六市",
      ]],
    嘉義縣: [
      [
        "大林鎮", "溪口鄉", "阿里山鄉", "梅山鄉", "新港鄉", "民雄鄉", "六腳鄉", "竹崎鄉", "東石鄉", "太保市",
        "番路鄉", "朴子市", "水上鄉", "中埔鄉", "布袋鎮", "鹿草鄉", "義竹鄉", "大埔鄉",
      ]],
    屏東縣: [
      [
        "高樹鄉", "三地門鄉", "霧臺鄉", "里港鄉", "鹽埔鄉", "九如鄉", "長治鄉", "瑪家鄉", "屏東市", "內埔鄉",
        "麟洛鄉", "泰武鄉", "萬巒鄉", "竹田鄉", "萬丹鄉", "來義鄉", "潮州鎮", "新園鄉", "崁頂鄉", "...",
      ],
      [
        "...", "新埤鄉", "南州鄉", "東港鎮", "林邊鄉", "佳冬鄉", "春日鄉", "獅子鄉", "琉球鄉", "枋山鄉", "牡丹鄉",
        "滿州鄉", "車城鄉", "恆春鎮", "枋寮鄉",
      ]],

  };

  /**
     * @param {"宜蘭縣" | "桃園市" | "新竹縣" | "苗栗縣" | "彰化縣" | "南投縣" | "雲林縣" | "嘉義縣" | "屏東縣" | "臺東縣" | "花蓮縣" | "澎湖縣" | "基隆市" | "新竹市" | "嘉義市" | "臺北市" | "高雄市" | "新北市" | "臺中市" | "臺南市" | "連江縣" | "金門縣"} county
     * @param {{limit: number,offset: number,format?: "JSON" | "XMAL",locationName: ["宜蘭縣" | "桃園市" | "新竹縣" | "苗栗縣" | "彰化縣" | "南投縣" | "雲林縣" | "嘉義縣" | "屏東縣" | "臺東縣" | "花蓮縣" | "澎湖縣" | "基隆市" | "新竹市" | "嘉義市" | "臺北市" | "高雄市" | "新北市" | "臺中市" | "臺南市" | "連江縣" | "金門縣"],elementName: ["Wx" | "PoP" | "Cl" | "MinT" | "MaxT"],sort?: "time",startTime: date,timeFrom: date,timeTo: date}} options
     * @returns
     */
  async forecast(options) {
    let url = CWB_Forcast.#baseurl
                + "F-C0032-001"
                + `?Authorization=${this.apikey}`;

    if (options)
      url += Object.keys(options).map(k => {
        if (Array.isArray(options[k]))
          return `&${k}=${options[k].join(",")}`;
        else return `&${k}=${options[k]}`;
      }).join("");

    const r = await fetch(url,
      {
        method  : "GET",
        headers : { "Content-Type": "application/json" },
      },
    );
    const data = r.json();
    return data;
  }

  /**
     * @param {"宜蘭縣" | "桃園市" | "新竹縣" | "苗栗縣" | "彰化縣" | "南投縣" | "雲林縣" | "嘉義縣" | "屏東縣" | "臺東縣" | "花蓮縣" | "澎湖縣" | "基隆市" | "新竹市" | "嘉義市" | "臺北市" | "高雄市" | "新北市" | "臺中市" | "臺南市" | "連江縣" | "金門縣"} county
     * @param {{limit: number,offset: number,format?: "JSON" | "XMAL",locationName: ["宜蘭縣" | "桃園市" | "新竹縣" | "苗栗縣" | "彰化縣" | "南投縣" | "雲林縣" | "嘉義縣" | "屏東縣" | "臺東縣" | "花蓮縣" | "澎湖縣" | "基隆市" | "新竹市" | "嘉義市" | "臺北市" | "高雄市" | "新北市" | "臺中市" | "臺南市" | "連江縣" | "金門縣"],elementName: ["Wx" | "PoP" | "Cl" | "MinT" | "MaxT"],sort?: "time",startTime: date,timeFrom: date,timeTo: date}} options
     * @returns
     */
  async forecast_county(county, options) {
    let url = CWB_Forcast.#baseurl
              + this.county_code2[county]
              + `?Authorization=${this.apikey}`;

    if (options)
      url += Object.keys(options).map(k => {
        if (Array.isArray(options[k]))
          return `&${k}=${options[k].join(",")}`;
        else return `&${k}=${options[k]}`;
      }).join("");

    const r = await fetch(url,
      {
        method  : "GET",
        headers : { "Content-Type": "application/json" },
      },
    );
    const data = r.json();
    return data;
  }

  async hazards() {
    const url = CWB_Forcast.#baseurl
                + "W-C0033-002"
                + `?Authorization=${this.apikey}`;
    const r = await fetch(url,
      {
        method  : "GET",
        headers : { "Content-Type": "application/json" },
      },
    );
    const data = r.json();
    return data;
  }

  async _hazards_W33() {
    const warnings = requireFromString((await (await fetch("https://www.cwb.gov.tw/Data/js/warn/Warning_Content.js")).text())
		+ "\nmodule.exports={WarnAll,WarnContent,WarnContent_W32,WarnContent_W33}", "warnings");
    return warnings.WarnContent_W33;
  }

  async ecard(county) {
    const now = new Date(Date.now());
    const url = `https://www.cwb.gov.tw/V8/C/W/County/MOD/Ecard/${this.cid[county]}_Ecard.html?T=${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}`;
    const r = await fetch(url);
    const data = await r.text();
    const imgurl = "https://www.cwb.gov.tw" + data.match(/src\s*=\s*'(.+?)'/mi)[1];
    return imgurl;
  }

  async earthquake_report(options) {
    let url = CWB_Forcast.#baseurl
                  + "E-A0015-001"
                  + `?Authorization=${this.apikey}`;

    if (options)
      url += Object.keys(options).map(k => {
        if (Array.isArray(options[k]))
          return `&${k}=${options[k].join(",")}`;
        else return `&${k}=${options[k]}`;
      }).join("");

    const r = await fetch(url,
      {
        method  : "GET",
        headers : { "Content-Type": "application/json" },
      },
    ).catch(e => {
      throw e;
    });
    const data = r.json();
    return data;
  }

  async earthquake_report_s(options) {
    let url = CWB_Forcast.#baseurl
                  + "E-A0016-001"
                  + `?Authorization=${this.apikey}`;

    if (options)
      url += Object.keys(options).map(k => {
        if (Array.isArray(options[k]))
          return `&${k}=${options[k].join(",")}`;
        else return `&${k}=${options[k]}`;
      }).join("");

    const r = await fetch(url,
      {
        method  : "GET",
        headers : { "Content-Type": "application/json" },
      },
    ).catch(e => {
      throw e;
    });
    const data = r.json();
    return data;
  }
}

module.exports = CWB_Forcast;

function requireFromString(src, filename) {
  const m = new module.constructor();
  m.paths = module.paths;
  m._compile(src, filename);
  return m.exports;
}