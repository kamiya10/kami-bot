/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
class CWA_Forcast {
  constructor(apikey) {
    this.apikey = apikey;
  }

  static #baseurl = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/";

  /**
   * @type {{ "宜蘭縣" : "F-D0047-003", "桃園市" : "F-D0047-007", "新竹縣" : "F-D0047-011", "苗栗縣" : "F-D0047-015", "彰化縣" : "F-D0047-019", "南投縣" : "F-D0047-023", "雲林縣" : "F-D0047-027", "嘉義縣" : "F-D0047-031", "屏東縣" : "F-D0047-035", "臺東縣" : "F-D0047-039", "花蓮縣" : "F-D0047-043", "澎湖縣" : "F-D0047-047", "基隆市" : "F-D0047-051", "新竹市" : "F-D0047-055", "嘉義市" : "F-D0047-059", "臺北市" : "F-D0047-063", "高雄市" : "F-D0047-067", "新北市" : "F-D0047-071", "臺中市" : "F-D0047-075", "臺南市" : "F-D0047-079", "連江縣" : "F-D0047-083", "金門縣" : "F-D0047-087",	}}
   */
  static county_code2 = {
    宜蘭縣: "F-D0047-001",
    桃園市: "F-D0047-005",
    新竹縣: "F-D0047-009",
    苗栗縣: "F-D0047-013",
    彰化縣: "F-D0047-017",
    南投縣: "F-D0047-021",
    雲林縣: "F-D0047-025",
    嘉義縣: "F-D0047-029",
    屏東縣: "F-D0047-033",
    臺東縣: "F-D0047-037",
    花蓮縣: "F-D0047-041",
    澎湖縣: "F-D0047-045",
    基隆市: "F-D0047-049",
    新竹市: "F-D0047-053",
    嘉義市: "F-D0047-057",
    臺北市: "F-D0047-061",
    高雄市: "F-D0047-065",
    新北市: "F-D0047-069",
    臺中市: "F-D0047-073",
    臺南市: "F-D0047-077",
    連江縣: "F-D0047-081",
    金門縣: "F-D0047-085",
  };

  /**
   * @type {{ "宜蘭縣" : "F-D0047-003", "桃園市" : "F-D0047-007", "新竹縣" : "F-D0047-011", "苗栗縣" : "F-D0047-015", "彰化縣" : "F-D0047-019", "南投縣" : "F-D0047-023", "雲林縣" : "F-D0047-027", "嘉義縣" : "F-D0047-031", "屏東縣" : "F-D0047-035", "臺東縣" : "F-D0047-039", "花蓮縣" : "F-D0047-043", "澎湖縣" : "F-D0047-047", "基隆市" : "F-D0047-051", "新竹市" : "F-D0047-055", "嘉義市" : "F-D0047-059", "臺北市" : "F-D0047-063", "高雄市" : "F-D0047-067", "新北市" : "F-D0047-071", "臺中市" : "F-D0047-075", "臺南市" : "F-D0047-079", "連江縣" : "F-D0047-083", "金門縣" : "F-D0047-087",	}}
   */
  static county_code7 = {
    宜蘭縣: "F-D0047-003",
    桃園市: "F-D0047-007",
    新竹縣: "F-D0047-011",
    苗栗縣: "F-D0047-015",
    彰化縣: "F-D0047-019",
    南投縣: "F-D0047-023",
    雲林縣: "F-D0047-027",
    嘉義縣: "F-D0047-031",
    屏東縣: "F-D0047-035",
    臺東縣: "F-D0047-039",
    花蓮縣: "F-D0047-043",
    澎湖縣: "F-D0047-047",
    基隆市: "F-D0047-051",
    新竹市: "F-D0047-055",
    嘉義市: "F-D0047-059",
    臺北市: "F-D0047-063",
    高雄市: "F-D0047-067",
    新北市: "F-D0047-071",
    臺中市: "F-D0047-075",
    臺南市: "F-D0047-079",
    連江縣: "F-D0047-083",
    金門縣: "F-D0047-087",
  };

  /**
   * @type {{ "宜蘭縣" : "10002", "桃園市" : "68", "新竹縣" : "10004", "苗栗縣" : "10005", "彰化縣" : "10007", "南投縣" : "10008", "雲林縣" : "10009", "嘉義縣" : "10010", "屏東縣" : "10013", "臺東縣" : "10014", "花蓮縣" : "10015", "澎湖縣" : "10016", "基隆市" : "10017", "新竹市" : "10018", "嘉義市" : "10020", "臺北市" : "63", "高雄市" : "64", "新北市" : "65", "臺中市" : "66", "臺南市" : "67", "連江縣" : "09007", "金門縣" : "09020" }}
   */
  static cid = {
    基隆市: "10017",
    臺北市: "63",
    新北市: "65",
    桃園市: "68",
    新竹市: "10018",
    新竹縣: "10004",
    苗栗縣: "10005",
    臺中市: "66",
    彰化縣: "10007",
    南投縣: "10008",
    雲林縣: "10009",
    嘉義市: "10020",
    嘉義縣: "10010",
    臺南市: "67",
    高雄市: "64",
    屏東縣: "10013",
    宜蘭縣: "10002",
    花蓮縣: "10015",
    臺東縣: "10014",
    澎湖縣: "10016",
    金門縣: "09020",
    連江縣: "09007",
  };

  static town_pages = {
    宜蘭縣: [
      [
        "蘇澳鎮",
        "頭城鎮",
        "宜蘭市",
        "南澳鄉",
        "羅東鎮",
        "三星鄉",
        "大同鄉",
        "五結鄉",
        "員山鄉",
        "冬山鄉",
        "礁溪鄉",
        "壯圍鄉",
      ],
    ],
    桃園市: [
      [
        "龍潭區",
        "八德區",
        "龜山區",
        "大園區",
        "蘆竹區",
        "楊梅區",
        "大溪區",
        "中壢區",
        "復興區",
        "桃園區",
        "觀音區",
        "新屋區",
        "平鎮區",
      ],
    ],
    新竹縣: [
      [
        "峨眉鄉",
        "寶山鄉",
        "竹東鎮",
        "五峰鄉",
        "竹北市",
        "尖石鄉",
        "橫山鄉",
        "芎林鄉",
        "北埔鄉",
        "關西鎮",
        "新埔鎮",
        "新豐鄉",
        "湖口鄉",
      ],
    ],
    苗栗縣: [
      [
        "銅鑼鄉",
        "苗栗市",
        "頭屋鄉",
        "南庄鄉",
        "卓蘭鎮",
        "泰安鄉",
        "後龍鎮",
        "獅潭鄉",
        "公館鄉",
        "大湖鄉",
        "通霄鎮",
        "西湖鄉",
        "苑裡鎮",
        "三義鄉",
        "頭份市",
        "三灣鄉",
        "竹南鎮",
        "造橋鄉",
      ],
    ],
    彰化縣: [
      [
        "田尾鄉",
        "埔心鄉",
        "伸港鄉",
        "社頭鄉",
        "秀水鄉",
        "溪湖鎮",
        "彰化市",
        "芳苑鄉",
        "大村鄉",
        "和美鎮",
        "竹塘鄉",
        "花壇鄉",
        "二林鎮",
        "員林市",
        "線西鄉",
        "溪州鄉",
        "永靖鄉",
        "福興鄉",
        "二水鄉",
        "埤頭鄉",
        "田中鎮",
        "鹿港鎮",
        "大城鄉",
        "埔鹽鄉",
        "...",
      ],
      ["...", "北斗鎮", "芬園鄉"],
    ],
    南投縣: [
      [
        "草屯鎮",
        "竹山鎮",
        "集集鎮",
        "名間鄉",
        "國姓鄉",
        "水里鄉",
        "南投市",
        "信義鄉",
        "埔里鎮",
        "仁愛鄉",
        "鹿谷鄉",
        "中寮鄉",
        "魚池鄉",
      ],
    ],
    雲林縣: [
      [
        "斗六市",
        "崙背鄉",
        "二崙鄉",
        "林內鄉",
        "水林鄉",
        "土庫鎮",
        "臺西鄉",
        "西螺鎮",
        "褒忠鄉",
        "虎尾鎮",
        "東勢鄉",
        "斗南鎮",
        "麥寮鄉",
        "莿桐鄉",
        "大埤鄉",
        "口湖鄉",
        "古坑鄉",
        "四湖鄉",
        "北港鎮",
        "元長鄉",
      ],
    ],
    嘉義縣: [
      [
        "義竹鄉",
        "東石鄉",
        "六腳鄉",
        "太保市",
        "水上鄉",
        "鹿草鄉",
        "布袋鎮",
        "竹崎鄉",
        "朴子市",
        "中埔鄉",
        "民雄鄉",
        "番路鄉",
        "大林鎮",
        "梅山鄉",
        "新港鄉",
        "阿里山鄉",
        "溪口鄉",
        "大埔鄉",
      ],
    ],
    屏東縣: [
      [
        "萬丹鄉",
        "霧臺鄉",
        "新園鄉",
        "麟洛鄉",
        "泰武鄉",
        "林邊鄉",
        "里港鄉",
        "春日鄉",
        "佳冬鄉",
        "高樹鄉",
        "牡丹鄉",
        "屏東市",
        "車城鄉",
        "內埔鄉",
        "東港鎮",
        "枋山鄉",
        "新埤鄉",
        "枋寮鄉",
        "長治鄉",
        "瑪家鄉",
        "崁頂鄉",
        "九如鄉",
        "來義鄉",
        "南州鄉",
        "...",
      ],
      [
        "...",
        "鹽埔鄉",
        "獅子鄉",
        "琉球鄉",
        "萬巒鄉",
        "潮州鎮",
        "滿州鄉",
        "竹田鄉",
        "恆春鎮",
        "三地門鄉",
      ],
    ],
    臺東縣: [
      [
        "關山鎮",
        "金峰鄉",
        "成功鎮",
        "延平鄉",
        "臺東市",
        "海端鄉",
        "綠島鄉",
        "大武鄉",
        "太麻里鄉",
        "長濱鄉",
        "東河鄉",
        "池上鄉",
        "鹿野鄉",
        "蘭嶼鄉",
        "卑南鄉",
        "達仁鄉",
      ],
    ],
    花蓮縣: [
      [
        "鳳林鎮",
        "卓溪鄉",
        "花蓮市",
        "萬榮鄉",
        "秀林鄉",
        "富里鄉",
        "瑞穗鄉",
        "豐濱鄉",
        "光復鄉",
        "壽豐鄉",
        "吉安鄉",
        "新城鄉",
        "玉里鎮",
      ],
    ],
    澎湖縣: [["馬公市", "七美鄉", "西嶼鄉", "望安鄉", "湖西鄉", "白沙鄉"]],
    基隆市: [
      ["信義區", "中山區", "安樂區", "暖暖區", "仁愛區", "中正區", "七堵區"],
    ],
    新竹市: [["東區", "香山區", "北區"]],
    嘉義市: [["西區", "東區"]],
    臺北市: [
      [
        "南港區",
        "文山區",
        "萬華區",
        "大同區",
        "中正區",
        "中山區",
        "大安區",
        "信義區",
        "松山區",
        "北投區",
        "士林區",
        "內湖區",
      ],
    ],
    高雄市: [
      [
        "仁武區",
        "前金區",
        "梓官區",
        "岡山區",
        "前鎮區",
        "美濃區",
        "燕巢區",
        "小港區",
        "甲仙區",
        "鹽埕區",
        "阿蓮區",
        "林園區",
        "內門區",
        "左營區",
        "湖內區",
        "大樹區",
        "桃源區",
        "三民區",
        "永安區",
        "新興區",
        "彌陀區",
        "鳥松區",
        "苓雅區",
        "橋頭區",
        "...",
      ],
      [
        "...",
        "旗津區",
        "六龜區",
        "田寮區",
        "鳳山區",
        "杉林區",
        "鼓山區",
        "路竹區",
        "大寮區",
        "茂林區",
        "楠梓區",
        "茄萣區",
        "大社區",
        "那瑪夏區",
        "旗山區",
      ],
    ],
    新北市: [
      [
        "瑞芳區",
        "三重區",
        "平溪區",
        "淡水區",
        "石門區",
        "泰山區",
        "新店區",
        "萬里區",
        "蘆洲區",
        "永和區",
        "貢寮區",
        "深坑區",
        "鶯歌區",
        "坪林區",
        "板橋區",
        "八里區",
        "土城區",
        "三芝區",
        "汐止區",
        "新莊區",
        "金山區",
        "林口區",
        "中和區",
        "雙溪區",
        "...",
      ],
      ["...", "五股區", "三峽區", "樹林區", "烏來區", "石碇區"],
    ],
    臺中市: [
      [
        "外埔區",
        "新社區",
        "豐原區",
        "后里區",
        "北區",
        "太平區",
        "潭子區",
        "南屯區",
        "和平區",
        "大甲區",
        "中區",
        "烏日區",
        "沙鹿區",
        "南區",
        "龍井區",
        "石岡區",
        "東勢區",
        "北屯區",
        "西區",
        "霧峰區",
        "神岡區",
        "西屯區",
        "大里區",
        "大雅區",
        "...",
      ],
      ["...", "大安區", "清水區", "東區", "大肚區", "梧棲區"],
    ],
    臺南市: [
      [
        "官田區",
        "東區",
        "山上區",
        "龍崎區",
        "新市區",
        "新化區",
        "下營區",
        "將軍區",
        "東山區",
        "歸仁區",
        "西港區",
        "安平區",
        "柳營區",
        "左鎮區",
        "佳里區",
        "北區",
        "鹽水區",
        "楠西區",
        "安定區",
        "大內區",
        "南區",
        "永康區",
        "麻豆區",
        "關廟區",
        "...",
      ],
      [
        "...",
        "善化區",
        "後壁區",
        "仁德區",
        "北門區",
        "白河區",
        "南化區",
        "七股區",
        "中西區",
        "新營區",
        "玉井區",
        "學甲區",
        "安南區",
        "六甲區",
      ],
    ],
    連江縣: [["南竿鄉", "莒光鄉", "北竿鄉", "東引鄉"]],
    金門縣: [["金城鎮", "金沙鎮", "金湖鎮", "金寧鄉", "烈嶼鄉", "烏坵鄉"]],
  };

  static warn_id = {
    PWS: "災防告警訊息",
    EQ: "地震報告",
    TY_WIND: "颱風強風告警",
    TY_WARN: "颱風警報",
    TY_NEWS: "颱風消息",
    FIFOWS: "天氣警特報",
    W23: "熱帶性低氣壓特報",
    W24: "大規模或劇烈豪雨",
    W25: "陸上強風特報",
    W26: "豪(大)雨特報",
    "W26-1": "大雨",
    "W26-2": "豪雨",
    "W26-3": "大豪雨",
    "W26-4": "超大豪雨",
    W27: "濃霧特報",
    W28: "低溫特報",
    "W28-1": "低溫黃色燈號",
    "W28-2": "低溫橙色燈號",
    "W28-3": "低溫紅色燈號",
    "W29-1": "高溫黃色燈號",
    "W29-2": "高溫橙色燈號",
    "W29-3": "高溫紅色燈號",
    W29: "高溫資訊",
    W33: "大雷雨即時訊息",
    W34: "即時天氣訊息",
    W37: "長浪即時訊息",
  };

  /**
   * @param {"宜蘭縣" | "桃園市" | "新竹縣" | "苗栗縣" | "彰化縣" | "南投縣" | "雲林縣" | "嘉義縣" | "屏東縣" | "臺東縣" | "花蓮縣" | "澎湖縣" | "基隆市" | "新竹市" | "嘉義市" | "臺北市" | "高雄市" | "新北市" | "臺中市" | "臺南市" | "連江縣" | "金門縣"} county
   * @param {{limit: number,offset: number,format?: "JSON" | "XMAL",locationName: ["宜蘭縣" | "桃園市" | "新竹縣" | "苗栗縣" | "彰化縣" | "南投縣" | "雲林縣" | "嘉義縣" | "屏東縣" | "臺東縣" | "花蓮縣" | "澎湖縣" | "基隆市" | "新竹市" | "嘉義市" | "臺北市" | "高雄市" | "新北市" | "臺中市" | "臺南市" | "連江縣" | "金門縣"],elementName: ["Wx" | "PoP" | "Cl" | "MinT" | "MaxT"],sort?: "time",startTime: date,timeFrom: date,timeTo: date}} options
   * @returns
   */
  async forecast(options) {
    let url =
      CWA_Forcast.#baseurl + "F-C0032-001" + `?Authorization=${this.apikey}`;

    if (options)
      {url += Object.keys(options)
        .map((k) => {
          if (Array.isArray(options[k])) {return `&${k}=${options[k].join(",")}`;}
          else {return `&${k}=${options[k]}`;}
        })
        .join("");}

    const r = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = r.json();
    return data;
  }

  /**
   * @param {"宜蘭縣" | "桃園市" | "新竹縣" | "苗栗縣" | "彰化縣" | "南投縣" | "雲林縣" | "嘉義縣" | "屏東縣" | "臺東縣" | "花蓮縣" | "澎湖縣" | "基隆市" | "新竹市" | "嘉義市" | "臺北市" | "高雄市" | "新北市" | "臺中市" | "臺南市" | "連江縣" | "金門縣"} county
   * @param {{limit: number,offset: number,format?: "JSON" | "XMAL",locationName: ["宜蘭縣" | "桃園市" | "新竹縣" | "苗栗縣" | "彰化縣" | "南投縣" | "雲林縣" | "嘉義縣" | "屏東縣" | "臺東縣" | "花蓮縣" | "澎湖縣" | "基隆市" | "新竹市" | "嘉義市" | "臺北市" | "高雄市" | "新北市" | "臺中市" | "臺南市" | "連江縣" | "金門縣"],elementName: ["Wx" | "PoP" | "Cl" | "MinT" | "MaxT"],sort?: "time",startTime: date,timeFrom: date,timeTo: date}} options
   * @returns
   */
  async forecast_county(county, options) {
    let url =
      CWA_Forcast.#baseurl +
      CWA_Forcast.county_code2[county] +
      `?Authorization=${this.apikey}`;

    if (options)
      {url += Object.keys(options)
        .map((k) => {
          if (Array.isArray(options[k])) {return `&${k}=${options[k].join(",")}`;}
          else {return `&${k}=${options[k]}`;}
        })
        .join("");}

    const r = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = r.json();
    return data;
  }

  async hazards() {
    const url =
      CWA_Forcast.#baseurl + "W-C0033-002" + `?Authorization=${this.apikey}`;
    const r = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = r.json();

    return data;
  }

  async _warns() {
    const warnings = requireFromString(
      (await (
        await fetch("https://www.cwa.gov.tw/Data/js/warn/Warning_Content.js")
      ).text()) +
        "\nmodule.exports={WarnAll,WarnContent,WarnContent_W32,WarnContent_W33}",
      "warnings",
    );
    const areas = requireFromString(
      (await (
        await fetch("https://www.cwa.gov.tw/Data/js/warn/Warning_Taiwan.js")
      ).text()) + "\nmodule.exports={WarnTown}",
      "warning_areas",
    );

    const value = {
      list: warnings.WarnAll,
      PWS: warnings.WarnContent.PWS?.C,
      TY_WARN: warnings.WarnContent.TY_WARN?.C,
      W25: warnings.WarnContent.W25?.C,
      W26: warnings.WarnContent.W26?.C,
      W29: warnings.WarnContent.W29?.C,
      W32: warnings.WarnContent_W32,
      W33: warnings.WarnContent_W33,
      W37: warnings.WarnContent.W37?.C,
    };

    Object.keys(value).map((id) => {
      if (id == "list") {return;}

      if (value[id] != undefined && !Array.isArray(value[id])) {
        value[id].affectedAreas = [];

        for (const cid in areas.WarnTown)
          {for (const type in areas.WarnTown[cid])
            {if (areas.WarnTown[cid][type].find((v) => v.startsWith(id))) {
              const c = Object.keys(CWA_Forcast.cid).find(
                (key) => CWA_Forcast.cid[key] === cid,
              );

              if (!value[id].affectedAreas.includes(c))
                {value[id].affectedAreas.push(c);}
            }}}
      }
    });

    if (value.list.includes("TY_WARN")) {
      const warn_data = requireFromString(
        (await (
          await fetch("https://www.cwa.gov.tw/Data/js/typhoon/TY_WARN-Data.js")
        ).text()) +
          "\nmodule.exports={PTA_TYPHOON,TY_WARN_LIST,Movement,LandWarn,SeaWarn,HeavyRain,NoticeText,NoteText}",
        "warning_areas",
      );

      Object.assign(value.TY_WARN, warn_data);
    }

    return value;
  }

  async ecard(county) {
    const now = new Date(Date.now());
    const url = `https://www.cwa.gov.tw/V8/C/W/County/MOD/Ecard/${CWA_Forcast.cid[county]}_Ecard.html?T=${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}`;
    const r = await fetch(url);
    const data = await r.text();
    const imgurl =
      "https://www.cwa.gov.tw" + data.match(/src\s*=\s*'(.+?)'/im)[1];
    return imgurl;
  }

  async earthquake_report(options) {
    let url =
      CWA_Forcast.#baseurl + "E-A0015-001" + `?Authorization=${this.apikey}`;

    if (options)
      {url += Object.keys(options)
        .map((k) => {
          if (Array.isArray(options[k])) {return `&${k}=${options[k].join(",")}`;}
          else {return `&${k}=${options[k]}`;}
        })
        .join("");}

    const r = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).catch((e) => {
      throw e;
    });
    const data = r.json();
    return data;
  }

  async earthquake_report_s(options) {
    let url =
      CWA_Forcast.#baseurl + "E-A0016-001" + `?Authorization=${this.apikey}`;

    if (options)
      {url += Object.keys(options)
        .map((k) => {
          if (Array.isArray(options[k])) {return `&${k}=${options[k].join(",")}`;}
          else {return `&${k}=${options[k]}`;}
        })
        .join("");}

    const r = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).catch((e) => {
      throw e;
    });
    const data = r.json();
    return data;
  }

  async typhoon(options) {
    let url =
      CWA_Forcast.#baseurl + "W-C0034-005" + `?Authorization=${this.apikey}`;

    if (options) {url += `&${new URLSearchParams(options)}`;}

    const r = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).catch((e) => {
      throw e;
    });

    const data = r.json();
    return data;
  }
}

module.exports = CWA_Forcast;

function requireFromString(src, filename) {
  const m = new module.constructor();
  m.paths = module.paths;
  m._compile(src, filename);
  return m.exports;
}
