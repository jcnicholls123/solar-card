import {
  mdiCalendarMonthOutline,
  mdiCalendarSearch,
  mdiChartBellCurve,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiClose,
  mdiRestore,
  mdiWeatherSunny,
} from '@mdi/js';

import { version } from '../package.json';

export const CARD_VERSION = `v${version}`;

export const enum MoonState {
  READY = 'ready',
  LOADING = 'loading',
  CONTENT_CHANGING = 'content-changing',
}

export const ICON = {
  CALENDAR: mdiCalendarMonthOutline,
  CHART: mdiChartBellCurve,
  CHEVRON_DOWN: mdiChevronDown,
  LEFT: mdiChevronLeft,
  RESTORE: mdiRestore,
  RIGHT: mdiChevronRight,
  SEARCH: mdiCalendarSearch,
  WEATHER: mdiWeatherSunny,
  CLOSE: mdiClose,
};

export const enum CHART_DATA {
  OFFSET_TIME = 6,
  BORDER_WIDTH_BOLD = 1.2,
  BORDER_WIDTH_LIGHT = 1,
}

export const enum CHART_COLOR {
  TODAY_FILL = '#47546b', // Original
  NEXTDAY_FILL = '#3d4b63', // Original
  FILL_ABOVE = '#47546b33',
  STROKE_LINE = '#7a8eaa',
  SECONDARY_TEXT = '#9b9b9b',
  PRIMARY_TEXT = '#e1e1e1',
  SUN_LINE_BOLD = '#f4da95',
  SUN_LINE_LIGHT = '#b4ae95',
  MOON_LINE_BOLD = '#fefffeaa',
  MOON_LINE_LIGHT = '#b9c0ca',
  MOON_SHADOW = '#161616',
  TOOLTIP_BACKGROUND = '#1f1f1f',
}

export const DATAKEYS = {
  moonAge: 'moonAge',
  moonFraction: 'illumination',
  azimuthDegress: 'azimuth',
  altitudeDegrees: 'altitude',
  distance: 'distance',
  moonRise: 'moonRise',
  moonSet: 'moonSet',
  moonHighest: 'moonHigh',
  nextFullMoon: 'fullMoon',
  nextNewMoon: 'newMoon',
};

export const PREFIX_NAME = 'solar';

export const enum SECTION {
  BASE = 'base',
  HORIZON = 'horizon',
  CALENDAR = 'calendar',
  FULL_CALENDAR = 'full_calendar',
}
