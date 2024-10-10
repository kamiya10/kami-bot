export interface APIAdvisory {
  /**
   * @example '大雨特報'
   */
  title: string;
  /**
   * @example '2024/10/09 17:30'
   */
  issued: string;
  /**
   * @example '2024/10/09 23:00'
   */
  validto: string;
  /**
   * @example '發布時間：10/09 17:30\n\n對流雲系發展旺盛，易有短延時強降雨，今(9)日南部地區...'
   */
  content: string;
  content_web: string;
};

interface APIAdvisoryRecordEntry {
  C: APIAdvisory;
  E: APIAdvisory;
};

export interface APIAdvisoryRecord {
  /** 災防告警訊息 */
  PWS: APIAdvisoryRecordEntry;
  /** 地震報告 */
  EQ: APIAdvisoryRecordEntry;
  /** 颱風強風告警 */
  TY_WIND: APIAdvisoryRecordEntry;
  /** 颱風警報 */
  TY_WARN: APIAdvisoryRecordEntry;
  /** 颱風消息 */
  TY_NEWS: APIAdvisoryRecordEntry;
  /** 天氣警特報 */
  FIFOWS: APIAdvisoryRecordEntry;
  /** 熱帶性低氣壓特報 */
  W23: APIAdvisoryRecordEntry;
  /** 大規模或劇烈豪雨 */
  W24: APIAdvisoryRecordEntry;
  /** 降雨資訊 */
  W26: APIAdvisoryRecordEntry;
  /** 低溫資訊 */
  W28: APIAdvisoryRecordEntry;
  /** 高溫資訊 */
  W29: APIAdvisoryRecordEntry;
  /** 大雷雨即時訊息 */
  W33: APIAdvisoryRecordEntry;
  /** 即時天氣訊息 */
  W34: APIAdvisoryRecordEntry;
  /** 長浪即時訊息 */
  W37: APIAdvisoryRecordEntry;
};

export interface AdvisoryRecord {
  /** 災防告警訊息 */
  PWS: Advisory;
  /** 地震報告 */
  EQ: Advisory;
  /** 颱風強風告警 */
  TY_WIND: Advisory;
  /** 颱風警報 */
  TY_WARN: Advisory;
  /** 颱風消息 */
  TY_NEWS: Advisory;
  /** 天氣警特報 */
  FIFOWS: Advisory;
  /** 熱帶性低氣壓特報 */
  W23: Advisory;
  /** 大規模或劇烈豪雨 */
  W24: Advisory;
  /** 降雨資訊 */
  W26: Advisory;
  /** 低溫資訊 */
  W28: Advisory;
  /** 高溫資訊 */
  W29: Advisory;
  /** 大雷雨即時訊息 */
  W33: Advisory;
  /** 即時天氣訊息 */
  W34: Advisory;
  /** 長浪即時訊息 */
  W37: Advisory;
};

export const AdvisoryName = {
  PWS: '災防告警訊息',
  EQ: '地震報告',
  TY_WIND: '颱風強風告警',
  TY_WARN: '颱風警報',
  TY_NEWS: '颱風消息',
  FIFOWS: '天氣警特報',
  W23: '熱帶性低氣壓特報',
  W24: '大規模或劇烈豪雨',
  W26: '降雨資訊',
  W28: '低溫資訊',
  W29: '高溫資訊',
  W33: '大雷雨即時訊息',
  W34: '即時天氣訊息',
  W37: '長浪即時訊息',
} as const;

export const AdvisoryColor = {
  PWS: 0xFF0000,
  EQ: 0xFF8C00,
  TY_WIND: 0x800080,
  TY_WARN: 0x9370DB,
  TY_NEWS: 0xD8BFD8,
  FIFOWS: 0xFFD700,
  W23: 0x00008B,
  W24: 0x0000FF,
  W26: 0xADD8E6,
  W28: 0x87CEEB,
  W29: 0xFF4500,
  W33: 0x008080,
  W34: 0x32CD32,
  W37: 0x20B2AA,
} as const;

export class Advisory {
  type: keyof AdvisoryRecord;
  name: string;
  color: number;
  title: string;
  from: Date;
  to: Date;
  content: string;
  contentWeb: string;
  hash: string;
  constructor(data: APIAdvisory, type: keyof AdvisoryRecord) {
    this.type = type;
    this.name = AdvisoryName[type];
    this.color = AdvisoryColor[type];
    this.title = data.title;
    this.from = new Date(data.issued);
    this.to = new Date(data.validto);
    this.content = data.content;
    this.contentWeb = data.content_web;
    this.hash = new Bun.CryptoHasher('md5')
      .update(JSON.stringify(data))
      .digest('hex');
  }
}
