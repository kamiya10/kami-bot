import { version } from '~/package.json';

interface BaseResponse {
  success: 'true' | 'false';
  result: object;
  records: object;
}

interface EarthquakeReportResponse extends BaseResponse {
  records: {
    datasetDescription: '地震報告';
    Earthquake: Record<string, never>[];
  };
}

export type IntensityText =
  | '1級'
  | '2級'
  | '3級'
  | '4級'
  | '5弱'
  | '5強'
  | '6弱'
  | '6強'
  | '7級';

export enum EarthquakeReportColor {
  Green = '綠色',
  Yellow = '黃色',
  Orange = '橘色',
  Red = '紅色',
}

class EqStation {
  'pga': {
    unit: 'gal';
    EWComponent: number;
    NSComponent: number;
    VComponent: number;
    IntScaleValue: number;
  };

  'pgv': {
    unit: 'kine';
    EWComponent: number;
    NSComponent: number;
    VComponent: number;
    IntScaleValue: number;
  };

  'StationName': string;
  'StationID': string;
  'InfoStatus': 'observe';
  'BackAzimuth': number;
  'EpicenterDistance': number;
  'SeismicIntensity': IntensityText;
  'StationLatitude': number;
  'StationLongitude': number;
  'WaveImageURI': string;
}

class ShakingArea {
  'AreaDesc': `${string}地區`;
  'CountyName': string;
  'InfoStatus': 'observe';
  'AreaIntensity': IntensityText;
  'EqStation': EqStation[];
}

export class EarthquakeReport {
  EarthquakeNo: number;
  ReportType: '地震報告';
  ReportColor: EarthquakeReportColor;
  ReportContent: string;
  ReportImageURI: string;
  ReportRemark: '本報告係中央氣象署地震觀測網即時地震資料地震速報之結果。';
  Web: string;
  ShakemapImageURI: string;
  EarthquakeInfo: {
    OriginTime: string;
    Source: '中央氣象署';
    FocalDepth: number;
    Epicenter: {
      Location: string;
      EpicenterLatitude: number;
      EpicenterLongitude: number;
    };
    EarthquakeMagnitude: {
      MagnitudeType: '芮氏規模';
      MagnitudeValue: number;
    };
  };

  Intensity: {
    ShakingArea: ShakingArea[];
  };

  time: Date;

  constructor(data: Record<string, never>) {
    this.EarthquakeNo = data['EarthquakeNo'];
    this.ReportType = data['ReportType'];
    this.ReportColor = data['ReportColor'];
    this.ReportContent = data['ReportContent'];
    this.ReportImageURI = data['ReportImageURI'];
    this.ReportRemark = data['ReportRemark'];
    this.Web = data['Web'];
    this.ShakemapImageURI = data['ShakemapImageURI'];
    this.EarthquakeInfo = data['EarthquakeInfo'];
    this.Intensity = data['Intensity'];

    this.time = new Date(this.EarthquakeInfo.OriginTime);
  }

  get timecode() {
    return [
      this.time.getFullYear(),
      `${this.time.getMonth() + 1}`.padStart(2, '0'),
      `${this.time.getDate()}`.padStart(2, '0'),
      `${this.time.getHours()}`.padStart(2, '0'),
      `${this.time.getMinutes()}`.padStart(2, '0'),
      `${this.time.getSeconds()}`.padStart(2, '0'),
    ].join('');
  }

  get cwaCode() {
    return [
      'EQ',
      this.EarthquakeNo,
      '-',
      `${this.time.getMonth() + 1}`.padStart(2, '0'),
      `${this.time.getDate()}`.padStart(2, '0'),
      '-',
      `${this.time.getHours()}`.padStart(2, '0'),
      `${this.time.getMinutes()}`.padStart(2, '0'),
      `${this.time.getSeconds()}`.padStart(2, '0'),
    ].join('');
  }

  get cwaCodeWithYear() {
    return [
      'EQ',
      this.EarthquakeNo,
      '-',
      this.time.getFullYear(),
      '-',
      `${this.time.getMonth() + 1}`.padStart(2, '0'),
      `${this.time.getDate()}`.padStart(2, '0'),
      '-',
      `${this.time.getHours()}`.padStart(2, '0'),
      `${this.time.getMinutes()}`.padStart(2, '0'),
      `${this.time.getSeconds()}`.padStart(2, '0'),
    ].join('');
  }

  get cwaUrl() {
    return 'https://www.cwa.gov.tw/V8/C/E/EQ/' + this.cwaCode + '.html';
  }

  get cwaImage() {
    return (
      'https://www.cwa.gov.tw/Data/earthquake/img/EC'
      + (this.EarthquakeNo % 1000 == 0 ? 'L' : '')
      + (this.EarthquakeNo % 1000 == 0
        ? this.timecode
        : this.timecode.slice(4, this.timecode.length - 2))
        + this.EarthquakeInfo.EarthquakeMagnitude.MagnitudeValue * 10
        + (this.EarthquakeNo % 1000 == 0
          ? ''
          : this.EarthquakeNo.toString().substring(3))
          + '_H.png'
    );
  }

  get intensity() {
    return [
      null,
      '1級',
      '2級',
      '3級',
      '4級',
      '5弱',
      '5強',
      '6弱',
      '6強',
      '7級',
    ].indexOf(this.Intensity.ShakingArea[0].AreaIntensity);
  }
}

export class CwaFetchError extends Error {
  response: Response;

  constructor(message: string, response: Response) {
    super(message);
    this.response = response;
  }
}

export class CwaApi {
  apikey: string;

  static baseUrl = 'https://opendata.cwa.gov.tw/api' as const;

  constructor(apikey = '') {
    this.apikey = apikey;
  }

  private async get<T = BaseResponse>(url: string): Promise<T> {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': `KamiBot/${version}`,
      },
    });

    if (!res.ok)
      throw new CwaFetchError(
        `Failed to get resource ${url}: The server responded with a status code of ${res.status}`,
        res,
      );

    return (await res.json()) as T;
  }

  async getEarthquakeReport(limit?: number, offset?: number) {
    const query = new URLSearchParams({
      Authorization: this.apikey,
      limit: `${limit ?? ''}`,
      offset: `${offset ?? ''}`,
    });

    const url = `${CwaApi.baseUrl}/v1/rest/datastore/E-A0016-001?${query.toString()}`;
    const data = await this.get<EarthquakeReportResponse>(url);

    return data.records.Earthquake.map((v) => new EarthquakeReport(v));
  }

  async getNumberedEarthquakeReport(
    limit?: number,
    offset?: number,
  ): Promise<EarthquakeReport[]> {
    const query = new URLSearchParams({
      Authorization: this.apikey,
      limit: `${limit ?? ''}`,
      offset: `${offset ?? ''}`,
    });

    const url = `${CwaApi.baseUrl}/v1/rest/datastore/E-A0015-001?${query.toString()}`;
    const data = await this.get<EarthquakeReportResponse>(url);

    return data.records.Earthquake.map((v) => new EarthquakeReport(v));
  }
}
