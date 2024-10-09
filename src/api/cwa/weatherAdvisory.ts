import type { APIBaseResponse } from '.';

/**
 * 警特報種類
 * @link https://www.cwa.gov.tw/Data/prevent/Warning_signal_colors_E.pdf
 */
export enum HazardPhenomena {
  DenseFog = '濃霧',
  HeavyRain = '大雨',
  ExtremelyHeavyRain = '豪雨',
  TorrentialRain = '大豪雨',
  ExtremelyTorrentialRain = '超大豪雨',
  LandStrongWind = '陸上強風',
  SeaStrongWind = '海上強風',
  Swell = '長浪',
  Typhoon = '颱風',
  Tsunami = '海嘯',
}

export enum HazardSignificance {
  Info = '資訊',
  Warning = '警報',
  Advisory = '特報',
}

interface APIWeatherAdvisoryRecordDatasetInfo {
  /**
   * @example '豪雨特報'
   */
  datasetDescription: string;
  /**
   * @example 'zh-TW'
   */
  datasetLanguage: 'zh-TW';
  /**
   * 生效時間起訖
   */
  validTime: {
    /**
     * 生效時間起
     * @example '2024-10-08 06:32:00'
     */
    startTime: string;
    /**
     * 生效時間訖
     * @example '2024-10-08 11:00:00'
     */
    endTime: string;
  };
  /**
   * 發布時間
   * @example '2024-10-08 06:30:00'
   */
  issueTime: string;
  /**
   * 更新時間
   * @example '2024-10-08 06:37:14'
   */
  update: string;
}

interface APIWeatherAdvisoryHazardRecord {
  info: {
    language: 'zh-TW';
    /**
     * 警特報類型
     * @example '豪雨'
     */
    phenomena: HazardPhenomena;
    /**
     * 警特報級別
     * @example '特報'
     */
    significance: HazardSignificance;
    affectedAreas: {
      location: {
        /**
         * @example '基隆北海岸'
         */
        locationName: string;
      }[];
    };
  };
}

interface APIWeatherAdvisoryRecord {
  datasetInfo: APIWeatherAdvisoryRecordDatasetInfo;
  contents: {
    content: {
      contentLanguage: 'zh-TW';
      /**
       * 報文內容
       * @example
       * '\n                東北季風影響及水氣偏多，易有短延時強降雨，今（８）日基隆北海岸、臺北市、新北市地區及宜蘭縣山區有局部大雨或豪雨，宜蘭地區有局部大雨發生的機率，山區請嚴防坍方、落石、土石流及溪水暴漲，低窪地區請慎防淹水。\n                '
       */
      contentText: string;
    };
  };
  hazardConditions: {
    hazards: {
      hazard: APIWeatherAdvisoryHazardRecord[];
    };
  };
}

export interface APIWeatherAdvisoryRecordResponse extends APIBaseResponse {
  records: {
    record: APIWeatherAdvisoryRecord[];
  };
}

export class WeatherAdvisory {
  description: string;
  phenomena: HazardPhenomena;
  startTime: Date;
  endTime: Date;
  issueTime: Date;
  updateTime: Date;
  content: string;
  hazards: {
    phenomena: HazardPhenomena;
    significance: HazardSignificance;
    affectedAreas: string[];
  }[];

  hash: string;

  constructor(data: APIWeatherAdvisoryRecord) {
    this.description = data.datasetInfo.datasetDescription;
    this.phenomena = data.datasetInfo.datasetDescription.slice(
      0,
      -2,
    ) as HazardPhenomena;
    this.startTime = new Date(data.datasetInfo.validTime.startTime);
    this.endTime = new Date(data.datasetInfo.validTime.endTime);
    this.issueTime = new Date(data.datasetInfo.issueTime);
    this.updateTime = new Date(data.datasetInfo.update);
    this.content = data.contents.content.contentText.trim();
    this.hazards = data.hazardConditions.hazards.hazard.map((v) => ({
      phenomena: v.info.phenomena,
      significance: v.info.significance,
      affectedAreas: v.info.affectedAreas.location.flatMap(
        (l) => l.locationName,
      ),
    }));
    this.hash = new Bun.CryptoHasher('md5')
      .update(JSON.stringify(data))
      .digest('hex');
  }
}
