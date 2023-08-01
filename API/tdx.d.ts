type LocalizedString = {
  /**
   * 中文繁體名稱
   */
  Zh_tw: string,

  /**
   * 英文名稱
   */
  En: string,
}

/** 行駛方向  */
const enum TrainDirection {
  /** 順行 */
  NorthBound = "0",
  
  /** 逆行 */
  SouthBound = "1",
}

const enum TrainDirectionName {
  [TrainDirection.NorthBound] = "順行",
  [TrainDirection.NorthBound] = "逆行",
}

/** 車種簡碼 */
const enum TrainType {
  /** 太魯閣自強號列車 */
  TarokoExpress = "1",

  /** 普悠瑪自強號列車 */
  PuyumaExpress = "2",

  /** 自強號列車 */
  TzeChiangLimitedExpress = "3",
  
  /** 莒光號列車 */
  ChuKuangExpress = "4",

  /** 復興號列車 */
  FuHsingSemiExpress = "5",
  
  /** 區間車 */
  LocalTrain = "6",
  
  /** 普快車 */
  OrdinaryTrain = "7",
  
  /** 區間快車 */
  FastLocalTrain = "10",

  /** 自強號 EMU3000 型列車 */
  TzeChiangLimitedExpress3000 = "11"
}

/** 車種名稱 */
const enum TrainTypeName {
  [TrainType.TarokoExpress]               = "太魯閣自強號列車",
  [TrainType.PuyumaExpress]               = "普悠瑪自強號列車",
  [TrainType.TzeChiangLimitedExpress]     = "自強號列車",
  [TrainType.ChuKuangExpress]             = "莒光號列車",
  [TrainType.FuHsingSemiExpress]          = "復興號列車",
  [TrainType.LocalTrain]                  = "區間車",
  [TrainType.OrdinaryTrain]               = "普快車",
  [TrainType.FastLocalTrain]              = "區間快車",
  [TrainType.TzeChiangLimitedExpress3000] = "自強號 EMU3000 型列車",
}

/** 山海線類型 */
const enum TripLine {
  /** 不經山海線 */
  None = "0",
  
  /** 山線 */
  MountainLine = "1",
  
  /** 海線 */
  CoastLine = "2",
  
  /** 成追線 */
  ChengZhuiLine = "3",
}

const enum TripLineName {
  [TripLine.None]          = "不經山海線",
  [TripLine.MountainLine]  = "山線",
  [TripLine.CoastLine]     = "海線",
  [TripLine.ChengzhuiLine] = "成追線",
}

declare interface BaseRequestOptions {
  /** 挑選 */
  $select?: number;

  /** 過濾 */
  $filter?: string;

  /** 排序 */
  $orderby?: string;

  /** 取前幾筆 */
  $top?: number;

  /** 跳過前幾筆 */
  $skip?: number;

  /** 查詢數量 */
  $count?: number;

  /** 加入參數`?health=true`即可查詢此API服務的健康狀態 */
  health?: boolean;

  /** 指定來源格式 */
  $format?: "JSON" | "XML";
}

declare interface BaseResponse {
  /** 本平台資料更新時間（ISO8601格式：`yyyy-MM-ddTHH:mm:sszzz`） */
  UpdateTime: string;

  /** 本平台資料更新週期（秒） */
  UpdateInterval: number;

  /** 來源端平台資料更新時間（ISO8601格式：`yyyy-MM-ddTHH:mm:sszzz`） */
  SrcUpdateTime: string;

  /** 來源端平台資料更新週期（秒） `-1`：不定期更新 */
  SrcUpdateInterval: number;

  /** 有效起始日期 */
  EffectiveDate: string;

  /** 來源版號 */
  SrcVersion: string;
}

/** 定期車次資料 */
declare interface TrainInfo {
  /**
   * 車次代碼
   * @example
   * // 3005 車次
   * TrainNo: "3005"
   */
  TrainNo: string;

  /**
   * 營運路線代碼
   * @example
   * // 3005 車次
   * RouteID: ""
   */
  RouteID: string;

  /**
   * 行駛方向
   * | 代碼 | 方向 |
   * | :-: | --- |
   * | `0` | 順行 |
   * | `1` | 逆行 |
   * @example
   * // 3005 車次
   * Direction: 1
   */
  Direction: TrainDirection;

  /**
   * 車種代嗎
   * @example
   * // 3005 車次
   * TrainTypeID: "1132"
   */
  TrainTypeID: string;

  /**
   * 車種簡碼
   * | 簡碼 |      名稱      |
   * | :--: | ------------- |
   * | `1`  | 太魯閣自強號列車 |
   * | `2`  | 普悠瑪自強號列車 |
   * | `3`  | 自強號列車      |
   * | `4`  | 莒光號列車      |
   * | `5`  | 復興號列車      |
   * | `6`  | 區間車         |
   * | `7`  | 普快車         |
   * | `10` | 區間快車       |
   * @example
   * // 3005 車次
   * TrainTypeCode: "10"
   */
  TrainTypeCode: TrainType;

  /**
   * 車種名稱
   * @example
   * // 3005 車次
   * TrainTypeName: {
   *   Zh_tw: "區間快",
   *   En: "Fast Local Train"
   * }
   */
  TrainTypeName: LocalizedString;

  /**
   * 車次之目的地方向描述
   * @example
   * // 3005 車次
   * TripHeadSign: "往臺東"
   */
  TripHeadSign: string;

  /**
   * 列車起點車站代號
   * @example
   * // 3005 車次
   * StartingStationID: "3300"
   */
  StartingStationID: string;

  /**
   * 列車起點車站名稱
   * @example
   * // 3005 車次
   * StartingStationName: {
   *   Zh_tw: "臺中",
   *   En: "Taichung"
   * }
   */
  StartingStationName: LocalizedString;

  /**
   * 列車起點車站名稱
   * @example
   * // 3005 車次
   * EndingStationID: "6000"
   */
  EndingStationID: string;

  /**
   * 列車終點車站名稱
   * @example
   * // 3005 車次
   * EndingStationName: {
   *   Zh_tw: "臺東",
   *   En: "Taitung"
   * }
   */
  EndingStationName: LocalizedString;

  /**
   * 跨夜車站代碼
   * @example
   * // 3005 車次
   * OverNightStationID: ""
   */
  OverNightStationID: string;

  /**
   * 山海線類型
   * | 代碼 |   類型   |
   * | :-: | -------- |
   * | `0` | 不經山海線 |
   * | `1` | 山線      |
   * | `2` | 海線      |
   * | `3` | 成追線    |
   * @example
   * // 3005 車次
   * TripLine: 1
   */
  TripLine: TripLine;

  /**
   * 是否設身障旅客專用座位車
   * | 代碼 |        類型       |
   * | :-: | ----------------- |
   * | `0` | 無身障旅客專用座位車 |
   * | `1` | 有身障旅客專用座位車 |
   * @example
   * // 3005 車次
   * WheelChairFlag: 0
   */
  WheelChairFlag: number;

  /**
   * 是否提供行李服務
   * | 代碼 |     類型     |
   * | :-: | ------------ |
   * | `0` | 不提供行李服務 |
   * | `1` | 提供行李服務   |
   * @example
   * // 3005 車次
   * PackageServiceFlag: 0
   */
  PackageServiceFlag: number;

  /**
   * 是否提供訂便當服務
   * | 代碼 |      類型     |
   * | :-: | ------------- |
   * | `0` | 不提供訂便當服務 |
   * | `1` | 提供訂便當服務  |
   * @example
   * // 3005 車次
   * DiningFlag: 0
   */
  DiningFlag: number;

  /**
   * 是否設有哺(集)乳室車廂
   * | 代碼 |      類型      |
   * | :-: | -------------- |
   * | `0` | 無哺(集)乳室車廂 |
   * | `1` | 有哺(集)乳室車廂 |
   * @example
   * // 3005 車次
   * BreastFeedFlag: 0
   */
  BreastFeedFlag: number;

  /**
   * 是否人車同行班次(置於攜車袋之自行車各級列車均可乘車)
   * | 代碼 |     類型     |
   * | :-: | ------------ |
   * | `0` | 非人車同行班次 |
   * | `1` | 人車同行班次   |
   * @example
   * // 3005 車次
   * BikeFlag: 1
   */
  BikeFlag: number;

  /**
   * 是否提供小客車
   * | 代碼 |     類型   |
   * | :-: | ---------- |
   * | `0` | 不提供小客車 |
   * | `1` | 提供小客車  |
   * @example
   * // 3005 車次
   * CarFlag: 0
   */
  CarFlag: number;

  /**
   * 是否為每日行駛
   * | 代碼 |   類型   |
   * | :-: | -------- |
   * | `0` | 非每日行駛 |
   * | `1` | 每日行駛  |
   * @example
   * // 3005 車次
   * DailyFlag: 0
   */
  DailyFlag: number;

  /**
   * 是否為加班車
   * | 代碼 |   類型  |
   * | :-: | ------- |
   * | `0` | 非加班車 |
   * | `1` | 加班車   |
   * @example
   * // 3005 車次
   * ExtraTrainFlag: 0
   */
  ExtraTrainFlag: number;

  /**
   * 附註說明
   * @example
   * // 3005 車次
   * Note: "每日行駛。"
   */
  Note: string;
}

/** 停靠時間資料 */
declare interface TimetableStop {
  /** 停靠站序（由`1`開始） */
  StopSequence: number;

  /** 車站代碼 */
  StationID: string;

  /** 車站名稱 */
  StationName: LocalizedString,

  /** 到站時間（格式：`HH:mm`） */
  ArrivalTime: string,

  /** 離站時間（格式：`HH:mm`） */
  DepartureTime: string
}

/** 營運日型態 */
declare interface ServiceDay {  
  /** 服務日標籤 */
  ServiceTag: string;

  /**
   * 星期一是否營運
   * | 代碼 | 營運 |
   * | :-: | ---- |
   * | `0` | 否   |
   * | `1` | 是   |
   */
  Monday: number;
  
  /**
   * 星期二是否營運
   * | 代碼 | 營運 |
   * | :-: | ---- |
   * | `0` | 否   |
   * | `1` | 是   |
   */
  Tuesday: number;
  
  /**
   * 星期三是否營運
   * | 代碼 | 營運 |
   * | :-: | ---- |
   * | `0` | 否   |
   * | `1` | 是   |
   */
  Wednesday: number;
  
  /**
   * 星期四是否營運
   * | 代碼 | 營運 |
   * | :-: | ---- |
   * | `0` | 否   |
   * | `1` | 是   |
   */
  Thursday: number;
  
  /**
   * 星期五是否營運
   * | 代碼 | 營運 |
   * | :-: | ---- |
   * | `0` | 否   |
   * | `1` | 是   |
   */
  Friday: number;
  
  /**
   * 星期六是否營運
   * | 代碼 | 營運 |
   * | :-: | ---- |
   * | `0` | 否   |
   * | `1` | 是   |
   */
  Saturday: number;
  
  /**
   * 星期日是否營運
   * | 代碼 | 營運 |
   * | :-: | ---- |
   * | `0` | 否   |
   * | `1` | 是   |
   */
  Sunday: number;
  
  /**
   * 國定假日是否營運
   * | 代碼 | 營運 |
   * | :-: | ---- |
   * | `0` | 否   |
   * | `1` | 是   |
   */
  NationalHolidays: number;
  
  /**
   * 假日前一日是否營運
   * | 代碼 | 營運 |
   * | :-: | ---- |
   * | `0` | 否   |
   * | `1` | 是   |
   */
  DayBeforeHoliday: number;
  
  /**
   * 假日後一日是否營運
   * | 代碼 | 營運 |
   * | :-: | ---- |
   * | `0` | 否   |
   * | `1` | 是   |
   */
  DayAfterHoliday: number;
  
  /**
   * 颱風停止上班上課期間營運營運
   * | 代碼 | 營運 |
   * | :-: | ---- |
   * | `0` | 否   |
   * | `1` | 是   |
   */
  TyphoonDay: number;
}

/** 火車時刻表 */
declare interface TrainTimetable {
  /** 定期車次資料 */
  TrainInfo: TrainInfo;

  /** 停靠時間資料 */
  StopTimes: TimetableStop[];

  /** 營運日型態 */
  ServiceDay: ServiceDay;
}

/** 時刻表 */
declare interface Timetable extends BaseResponse {
  /** 定期性站別時刻表名稱 */
  TimetableName?: string;

  /** 時刻表適用情形說明 */
  ValidityDesciption?: string;

  /** 資料（陣列） */
  TrainTimetables: TrainTimetable[]
}

/** 公共運輸-軌道 API 節點 */
declare class TRA {
  constructor(header)
  requestHeader: header;

  /**
   * 取得當天或指定日期所有車次的時刻表資料(台鐵提供近60天每日時刻表)
   * @param date 欲查詢車次的日期
   * @param options 資料請求選項
   * @returns 時刻表資料
   */
  getDailyTimetable(date?: string, options?: BaseRequestOptions): Promise<Timetable>;

  /**
   * 取得所有車次的定期時刻表資料
   * @param options 資料請求選項
   * @returns 時刻表資料
   */
  getGeneralTimetable(options?: BaseRequestOptions): Promise<Timetable>;
  getStationLiveboard(stationId?: string, options?: BaseRequestOptions): Promise<Timetable>;
}

declare class TDX {
  constructor(data, defaultRequestHeaders)
  
  /** 公共運輸-軌道 v3 API 節點 */
  TRA: TRA;

  /**
   * 初始化 TDX 實例
   * @param clientId Client ID
   * @param clientSecret Client Secret
   * @param defaultRequestHeaders 預設 API 請求 Headers
   * @returns TDX 實例
   */
  static init(clientId: string, clientSecret: string, defaultRequestHeaders?: Record<string, string>): Promise<TDX>
}

export { TDX, TrainDirection, TrainDirectionName, TrainType, TrainTypeName, TripLine, TripLineName, Timetable, TrainTimetable, TrainInfo, TimetableStop };