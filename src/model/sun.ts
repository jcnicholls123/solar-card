import * as SunCalc from '@noim/suncalc3';
import { DateTime, WeekdayNumbers } from 'luxon';

import { CHART_DATA } from '../const';
import { FrontendLocaleData, LocalizeFunc } from '../ha';
import { formatNumber } from '../ha/common/number/format_number';
import setupTranslation from '../localize/translate';
import { DynamicChartData, MoonData, MoonDataItem, MoonImage } from '../types/config/chart-config';
import { SolarCardConfig } from '../types/config/solar-card-config';
import { convertKmToMiles, useAmPm } from '../utils/helpers';

type Location = {
  latitude: number;
  longitude: number;
};

type SolarTimeKey = 'rise' | 'set';

export class Sun {
  readonly _date: Date;
  readonly location: Location;
  readonly config: SolarCardConfig;
  readonly locale: FrontendLocaleData;
  readonly useMiles: boolean;
  readonly lang: string;
  readonly daylightHours?: number;
  private localize: LocalizeFunc;
  public _sunCalc = SunCalc;

  constructor(data: { date: Date; config: SolarCardConfig; locale: FrontendLocaleData; daylightHours?: number }) {
    this._date = data.date;
    this.lang = data.locale.language;
    this.config = data.config;
    this.location = {
      latitude: data.config.latitude ?? (data.locale as any).location?.latitude ?? 0,
      longitude: data.config.longitude ?? (data.locale as any).location?.longitude ?? 0,
    };
    this.locale = data.locale;
    this.useMiles = this.config.mile_unit || false;
    this.daylightHours = data.daylightHours;
    this.localize = setupTranslation(this.lang);
  }

  formatTime = (time: number | Date): string => {
    const dateObj = this.computeDateTime(new Date(time));
    const timeFormat = useAmPm(this.locale) ? 't' : 'T';
    return dateObj.toFormat(timeFormat);
  };

  private convertKmToMiles = (km: number): number => convertKmToMiles(km, this.useMiles);

  private formatNumber = (num: number): string => {
    const decimal = this.config.number_decimals;
    const numberValue = num.toFixed(decimal);
    return formatNumber(numberValue, this.locale);
  };

  private computeDateTime = (date: Date): DateTime => DateTime.fromJSDate(date).setLocale(this.lang);

  public get _dynamicDate(): Date {
    return DateTime.now().toJSDate();
  }

  get _moonTime(): any {
    return this._getSunTimes(this._date);
  }

  get _moonData(): any {
    return this._getSunData(this._date);
  }

  get _moonIllimination(): any {
    return this._getSunIllumination();
  }

  get moonTransit() {
    return { main: this._moonTime.solarNoon, invert: this._moonTime.nadir };
  }

  get _moonPosition(): any {
    return this._getSunPosition(this._date);
  }

  get phaseName(): string {
    return this.localize('card.sunTitle');
  }

  get nextPhase(): MoonDataItem {
    const event = this._nextSolarEvent();
    const relativeTime = this.computeDateTime(new Date(event.time)).toRelative();
    return {
      label: this.localize('card.nextSolarEvent'),
      value: `${event.name} (${relativeTime})`,
    };
  }

  get _moonTimeFromNow(): any {
    return this._getSunTimes(this._dynamicDate);
  }

  get moonImage(): MoonImage {
    const sunUrl =
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff8c7"/><stop offset="55%" stop-color="#ffd15c"/><stop offset="100%" stop-color="#f7941d"/></radialGradient><filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="13" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="128" cy="128" r="78" fill="url(#g)" filter="url(#glow)"/></svg>'
      );
    return {
      moonPic: sunUrl,
      rotateDeg: 0,
      southernHemisphere: false,
      fraction: this._getSunPosition(this._date).altitudeDegrees > 0 ? 100 : 35,
    };
  }

  blankBeforeUnit = (unit: string): string => {
    if (unit === '°') return '';
    if (unit === '%') return ['cs', 'de', 'fi', 'fr', 'sk', 'sv'].includes(this.lang) ? ' ' : '';
    return ' ';
  };

  createItem = (label: string, value: string, unit?: string, secondValue?: string): MoonDataItem => ({
    label: this.localize(`card.${label}`),
    value: `${value}${unit ? this.blankBeforeUnit(unit) + unit : ''}`,
    secondValue: secondValue ? `${secondValue}` : '',
  });

  createMoonTime = (key: string, time: number | Date): MoonDataItem => {
    const timeString = this.formatTime(time);
    return this.createItem(key, timeString);
  };

  shortTime = (date: number | Date) =>
    new Date(date).toLocaleDateString(this.lang, { weekday: 'short', month: 'short', day: 'numeric' });

  _getMoonRotation() {
    return 0;
  }

  get moonData(): MoonData {
    const { azimuthDegrees, altitudeDegrees, distance } = this._getSunData(this._date);
    const { rise, set, highest, solarNoon, goldenHour, goldenHourEnd } = this._getSunTimes(this._date);
    const daylightMs = Math.max(0, new Date(set).getTime() - new Date(rise).getTime());
    const daylightHours = this.daylightHours ?? daylightMs / (1000 * 60 * 60);
    const cardinal = this.convertCardinal(azimuthDegrees);
    const nextEvent = this._nextSolarEvent();

    return {
      moonAge: this.createItem('daylight', this.formatNumber(daylightHours), this.localize('card.relativeTime.hours')),
      moonFraction: this.createItem('solarElevation', this.formatNumber(Math.max(0, altitudeDegrees)), '°'),
      azimuthDegress: this.createItem('azimuth', this.formatNumber(azimuthDegrees), '°', cardinal),
      altitudeDegrees: this.createItem('altitude', this.formatNumber(altitudeDegrees), '°'),
      distance: this.createItem('distance', this.formatNumber(this.convertKmToMiles(distance)), this.useMiles ? 'mi' : 'km'),
      position: this.createItem('position', this.localize(`card.${altitudeDegrees > 0 ? 'sunOverHorizon' : 'sunUnderHorizon'}`)),
      moonRise: this.createMoonTime('sunRise', rise),
      moonSet: this.createMoonTime('sunSet', set),
      moonHighest: this.createMoonTime('sunHigh', new Date((solarNoon || highest) as Date)),
      nextFullMoon: this.createMoonTime('goldenHourEnd', goldenHourEnd || rise),
      nextNewMoon: this.createMoonTime('goldenHour', goldenHour || set),
      nextPhase: this.createItem('nextSolarEvent', `${nextEvent.name} (${this.shortTime(nextEvent.time)})`),
      direction: this.createItem('azimuth', this.formatNumber(azimuthDegrees), '°', cardinal),
    };
  }

  get todayDataItem() {
    const { position, direction, altitudeDegrees, moonFraction, distance } = this.moonData;
    return { position, direction, altitudeDegrees, moonFraction, distance };
  }

  get todayData() {
    const today = new Date();
    const startTime = new Date(today.setHours(0, 30, 0, 0));
    const timeToday = this._getSunTimes(today);
    const moonHighest = this._getMoonHighest(timeToday.highest as Date);
    let dataWithXY = this._getDataAltitude(startTime);

    if (moonHighest.rawData.y >= 0) {
      const changedIndexWithHighest = this._getClosestIndex(moonHighest.rawData.x, dataWithXY);
      dataWithXY[changedIndexWithHighest] = moonHighest.rawData;
    }

    dataWithXY = dataWithXY.sort((a, b) => a.x - b.x);
    const timeLabels = Object.values(dataWithXY).map((item) => item.x);
    const altitudeValues = Object.values(dataWithXY).map((item) => item.y);

    return {
      time: timeToday,
      moonHighest,
      altitude: dataWithXY,
      timeLabels,
      altitudeValues,
      minMaxY: {
        sugestedYMax: Math.round(Math.max(...altitudeValues)),
        sugestedYMin: Math.round(Math.min(...altitudeValues)),
      },
      moonPhase: this._getSunIllumination(),
      lang: {
        rise: this.localize('card.sunRise'),
        set: this.localize('card.sunSet'),
      },
    };
  }

  get currentMoonData() {
    return this._fetchtCurrentMoon();
  }

  get timeMarkers() {
    return ['rise', 'set'].map((key) => this.timeDataSet(key));
  }

  get calendarEvents() {
    const events: { title: string; start: string; allDay: boolean }[] = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      const times = this._getSunTimes(day);
      const daylightHours = Math.max(0, (new Date(times.set).getTime() - new Date(times.rise).getTime()) / 3600000);
      events.push({
        title: `☀️ ${this.formatNumber(daylightHours)}h`,
        start: day.toISOString().split('T')[0],
        allDay: true,
      });
    }
    return events;
  }

  get _dynamicChartData(): DynamicChartData {
    const now = this._dynamicDate;
    const offsetTime = new Date(now);
    offsetTime.setHours(now.getHours() - CHART_DATA.OFFSET_TIME, now.getMinutes());

    return {
      chartData: this._getDynamicDataAltitude(offsetTime),
      times: {
        moon: this._getDynamicMoonTime(offsetTime),
      },
      moonIllumination: this._getSunIllumination(),
      moonData: this._getSunData(now),
    } as DynamicChartData;
  }

  get timeData() {
    return {
      moon: this._getTimeData('moon'),
    };
  }

  private _getDynamicDataAltitude = (startTime: Date) => {
    const stepSize = 5 * 60 * 1000;
    const steps = (24 * 60 * 60 * 1000) / stepSize;
    const result: { timeLabel: number; moon: { altitude: number; azimuth: string } }[] = [];

    for (let i = 0; i < steps; i++) {
      const time = new Date(startTime.getTime() + i * stepSize);
      const { altitudeDegrees, azimuthDegrees } = this._getSunPosition(time);
      const azimuth = this.formatNumber(azimuthDegrees);
      const cardinal = this.convertCardinal(azimuthDegrees);
      result.push({
        timeLabel: time.getTime(),
        moon: {
          altitude: Number(altitudeDegrees.toFixed(2)),
          azimuth: `${azimuth}° ${cardinal}`,
        },
      });
    }
    return result;
  };

  private _getDynamicMoonTime(startTime: Date): number[] {
    const nextDay = new Date(startTime);
    nextDay.setDate(nextDay.getDate() + 1);
    const todayTimes = this._getSunTimes(startTime);
    const tomorrowTimes = this._getSunTimes(nextDay);
    return [todayTimes.rise, todayTimes.set, tomorrowTimes.rise, tomorrowTimes.set].map((time) => new Date(time).getTime());
  }

  private _getMoonTimeRangeItem(): {
    start: { key: 'moonRise' | 'moonSet'; value: number };
    end: { key: 'moonRise' | 'moonSet'; value: number };
  } {
    const now = this._dynamicDate;
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);
    const todayTimes = this._getSunTimes(now);
    const tomorrowTimes = this._getSunTimes(nextDay);
    const timeline: { key: 'moonRise' | 'moonSet'; value: number }[] = [
      { key: 'moonRise', value: new Date(todayTimes.rise).getTime() },
      { key: 'moonSet', value: new Date(todayTimes.set).getTime() },
      { key: 'moonRise', value: new Date(tomorrowTimes.rise).getTime() },
      { key: 'moonSet', value: new Date(tomorrowTimes.set).getTime() },
    ] as { key: 'moonRise' | 'moonSet'; value: number }[];
    timeline.sort((a, b) => a.value - b.value);

    const nowTime = now.getTime();
    let start = timeline[0];
    let end = timeline[timeline.length - 1];
    for (let i = 0; i < timeline.length - 1; i++) {
      if (nowTime >= timeline[i].value && nowTime < timeline[i + 1].value) {
        start = timeline[i];
        end = timeline[i + 1];
        break;
      }
    }
    return { start, end };
  }

  _getMinimalData = (): { start: MoonDataItem; end: MoonDataItem } => {
    const { start, end } = this._getMoonTimeRangeItem();
    return {
      start: this.createMoonTime(start.key === 'moonRise' ? 'sunRise' : 'sunSet', start.value),
      end: this.createMoonTime(end.key === 'moonRise' ? 'sunRise' : 'sunSet', end.value),
    };
  };

  private _getTimeData = (
    type: 'moon' | 'sun'
  ): { time: string; index: number; opacity: number; originalTime: number }[] => {
    const timeLabels = this._dynamicChartData.chartData.map((data) => data.timeLabel);
    const inrange = (time: number): boolean => time >= timeLabels[0] && time <= timeLabels[timeLabels.length - 1];
    const closestTime = (time: number): number =>
      timeLabels.reduce((prev, curr) => (Math.abs(curr - time) < Math.abs(prev - time) ? curr : prev));
    const isPast = (time: number): boolean => new Date(closestTime(time)) < this._date;

    return this._dynamicChartData.times[type]
      .filter((time: number) => inrange(time))
      .map((time: number) => ({
        time: this.formatTime(time),
        index: timeLabels.indexOf(closestTime(time)),
        opacity: isPast(time) ? 0.5 : 1,
        originalTime: time,
      }));
  };

  _getMoonHighest = (highest: number | Date): Record<string, any> => {
    const time = new Date(highest);
    const position = this._getSunPosition(time);
    const altitude = `${this.formatNumber(position.altitudeDegrees)}°`;
    const azimuth = this.formatNumber(position.azimuthDegrees);
    const cardinal = this.convertCardinal(position.azimuthDegrees);
    const direction = `${azimuth}° ${cardinal}`;
    return {
      formatedTime: this.formatTime(time),
      contentBody: [altitude, direction],
      rawData: {
        x: time.getTime(),
        y: Number(position.altitudeDegrees.toFixed(2)),
      },
    };
  };

  _getCurrentMoonData = (): string => {
    const now = new Date();
    const currentData = this._getSunData(now);
    const azimuth = this.formatNumber(currentData.azimuthDegrees);
    const cardinal = this.convertCardinal(currentData.azimuthDegrees);
    return `${this.formatTime(now)} - ${azimuth}° ${cardinal}`;
  };

  _getAltituteData = (startTime: Date): { [key: string]: number } => {
    const result: { [key: string]: number } = {};
    const stepSize = 15 * 60 * 1000;
    const steps = (24 * 60 * 60 * 1000) / stepSize;

    for (let i = 0; i < steps; i++) {
      const time = new Date(startTime.getTime() + i * stepSize);
      const position = this._getSunPosition(time);
      result[this.formatTime(time)] = Number(position.altitudeDegrees.toFixed(2));
    }
    return result;
  };

  _getDataAltitude = (startTime: Date) => {
    const stepConfig = this.config.graph_config?.time_step_size ?? 30;
    const result: { x: number; y: number }[] = [];
    const stepSize = stepConfig * 60 * 1000;
    const steps = (24 * 60 * 60 * 1000) / stepSize;

    for (let i = 0; i < steps; i++) {
      const time = new Date(startTime.getTime() + i * stepSize);
      const position = this._getSunPosition(time);
      result.push({ x: time.getTime(), y: Number(position.altitudeDegrees.toFixed(2)) });
    }
    return result;
  };

  _getMoonTime = (today: Date): any => this._getSunTimes(today);

  _getMoonPosition = (today: Date): any => this._getSunPosition(today);

  _getMoonTransit = (rise: Date, set: Date): { main: Date | null; invert: Date | null } => ({ main: rise, invert: set });

  _fetchtCurrentMoon = (): Record<string, any> => {
    const now = new Date();
    const currentData = this._getSunData(now);
    const azimuth = this.formatNumber(currentData.azimuthDegrees);
    const cardinal = this.convertCardinal(currentData.azimuthDegrees);
    const direction = `${azimuth}° ${cardinal}`;
    const altitude = `${this.formatNumber(currentData.altitudeDegrees)}°`;
    const rawData = {
      x: now.getTime(),
      y: Number(currentData.altitudeDegrees.toFixed(2)),
    };
    const currentHourIndex = this._getClosestIndex(rawData.x, this.todayData.altitude);

    return {
      currentHourIndex,
      body: [altitude, direction],
      title: this.formatTime(now),
      altitudeDegrees: currentData.altitudeDegrees,
      rawData,
    };
  };

  private convertCardinal = (degrees: number): string => {
    const pointsMap = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return this.localize(`card.cardinalShort.${pointsMap[index]}`);
  };

  timeDataSet = (timeKey: string): Record<string, any> => {
    const showOnChart = (time: Date): boolean => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      return time > todayStart && time < todayEnd;
    };

    const timeData = this._getSunTimes(new Date());
    const time = new Date(timeData[timeKey as SolarTimeKey]);
    const positionData = this._getSunPosition(time);
    const cardinal = this.convertCardinal(positionData.azimuthDegrees);
    const direction = `${this.formatNumber(positionData.azimuthDegrees)}°${cardinal}`;
    const rawData = {
      x: time.getTime(),
      y: Number(positionData.altitudeDegrees),
    };
    const closetIndex = this._getClosestIndex(rawData.x, this.todayData.altitude);

    return {
      show: showOnChart(time),
      position: {
        index: closetIndex,
        altitude: positionData.altitudeDegrees,
        closetIndex,
      },
      isUp: timeKey !== 'set',
      formatedTime: this.formatTime(time),
      lineOffset: 30,
      direction,
      rawData,
      body: [`${this.formatNumber(positionData.altitudeDegrees)}°`, direction],
    };
  };

  _getClosestIndex = (time: number, data: { x: number; y: number }[]): number => {
    const closest = data.reduce((prev, curr) => (Math.abs(curr.x - time) < Math.abs(prev.x - time) ? curr : prev));
    return data.indexOf(closest);
  };

  getEventsForRange(start: Date, end: Date): { title: string; start: string; allDay: boolean }[] {
    const events: { title: string; start: string; allDay: boolean }[] = [];
    const daysInRange = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    for (let i = 0; i <= daysInRange; i++) {
      const day = new Date(start.getTime() + i * 1000 * 60 * 60 * 24);
      events.push({
        title: '☀️',
        start: day.toISOString().split('T')[0],
        allDay: true,
      });
    }
    return events;
  }

  public _getDaysOfWeek(lang: string): string[] {
    return Array.from({ length: 7 }, (_, i) =>
      DateTime.local()
        .set({ weekday: (i + 1) as WeekdayNumbers })
        .setLocale(lang)
        .toFormat('ccc')
    );
  }

  public _getEmojiForPhase(date: Date): string {
    return this._getSunPosition(date).altitudeDegrees > 0 ? '☀️' : '🌙';
  }

  public _getPhaseNameForPhase(date: Date): string {
    return this._getSunPosition(date).altitudeDegrees > 0 ? this.localize('card.sunTitle') : this.localize('card.sunBelow');
  }

  public _getDataByDate(date: Date): {
    emoji: string;
    phaseId: string;
    phaseName: string;
    isNewMoonOrFullMoon: boolean;
  } {
    const isDaylight = this._getSunPosition(date).altitudeDegrees > 0;
    return {
      emoji: isDaylight ? '☀️' : '🌙',
      phaseId: isDaylight ? 'sun' : 'night',
      phaseName: isDaylight ? this.localize('card.sunTitle') : this.localize('card.sunBelow'),
      isNewMoonOrFullMoon: false,
    };
  }

  private _nextSolarEvent(): { name: string; time: Date } {
    const times = this._getSunTimes(this._date);
    const now = this._date.getTime();
    const events = [
      { name: this.localize('card.sunRise'), time: times.rise },
      { name: this.localize('card.sunHigh'), time: times.solarNoon || times.highest },
      { name: this.localize('card.sunSet'), time: times.set },
    ]
      .filter((event) => event.time && new Date(event.time).getTime() >= now)
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    return events[0] || { name: this.localize('card.sunRise'), time: times.rise };
  }

  private _getSunTimes(date: Date): any {
    const times = (SunCalc as any).getSunTimes(date, this.location.latitude, this.location.longitude);
    const timeValue = (time: any): Date | undefined => {
      if (!time) return undefined;
      return time instanceof Date ? time : time.value;
    };
    return {
      ...times,
      rise: timeValue(times.rise || times.sunrise || times.sunriseStart),
      set: timeValue(times.set || times.sunset || times.sunsetEnd),
      highest: timeValue(times.highest || times.solarNoon),
      solarNoon: timeValue(times.solarNoon),
      nadir: timeValue(times.nadir),
      goldenHour: timeValue(times.goldenHour || times.goldenHourDuskStart),
      goldenHourEnd: timeValue(times.goldenHourEnd || times.goldenHourDawnEnd),
      goldenHourDawnStart: timeValue(times.goldenHourDawnStart),
      goldenHourDawnEnd: timeValue(times.goldenHourDawnEnd),
      goldenHourDuskStart: timeValue(times.goldenHourDuskStart),
      goldenHourDuskEnd: timeValue(times.goldenHourDuskEnd),
    };
  }

  private _getSunPosition(date: Date): any {
    const calc = SunCalc as any;
    const position = calc.getSunPosition
      ? calc.getSunPosition(date, this.location.latitude, this.location.longitude)
      : calc.getPosition(date, this.location.latitude, this.location.longitude);
    const altitudeDegrees = position.altitudeDegrees ?? position.altitude * (180 / Math.PI);
    const rawAzimuthDegrees = position.azimuthDegrees ?? position.azimuth * (180 / Math.PI) + 180;
    const azimuthDegrees = ((rawAzimuthDegrees % 360) + 360) % 360;
    return {
      ...position,
      altitudeDegrees,
      azimuthDegrees,
      distance: 149597870.7,
    };
  }

  private _getSunData(date: Date): any {
    return {
      ...this._getSunPosition(date),
      illumination: this._getSunIllumination(),
    };
  }

  private _getSunIllumination(): any {
    return {
      fraction: 1,
      phaseValue: 0,
      phase: {
        id: 'sun',
        emoji: '☀️',
      },
      next: {},
    };
  }
}
