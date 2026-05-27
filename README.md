# Solar Card

A Home Assistant Lovelace custom card for solar position data.

Solar Card shows the current sun position, sunrise, sunset, solar noon, daylight length, golden hour times, altitude, azimuth, and horizon charts using the location configured in Home Assistant or a custom latitude/longitude.

The package includes a dedicated `icon.svg` and animated weather artwork for sunny, cloudy, rainy, stormy, snowy, foggy, windy, and night conditions.

## Installation

### HACS

1. Open HACS in Home Assistant.
2. Add this repository as a custom repository with category `Dashboard`.
3. Search for `Solar Card`.
4. Download it.
5. Refresh Home Assistant.

### Manual

1. Build or download `solar-card.js`.
2. Copy it to your Home Assistant `config/www` folder.
3. Add a Lovelace resource:

```yaml
url: /local/solar-card.js
type: module
```

4. Refresh Home Assistant.

## Usage

Add the card to a dashboard with:

```yaml
type: custom:solar-card
location_source: default
language: en
default_section: base
graph_chart_config:
  graph_type: dynamic
  show_time: true
  show_current: true
  show_highest: true
daylight_hours_entity: sensor.daylight_hours
weather_entity: weather.home
```

## Configuration

| Name | Type | Description |
| ---- | ---- | ----------- |
| `type` | string | Required. Use `custom:solar-card`. |
| `location_source` | string | `default`, `entity`, or `custom`. Defaults to `default`. |
| `entity` | string | Entity used as a location source when `location_source: entity`. |
| `latitude` | number | Custom latitude when `location_source: custom`. |
| `longitude` | number | Custom longitude when `location_source: custom`. |
| `language` | string | Language code. Defaults to Home Assistant language or `en`. |
| `default_section` | string | `base` or `horizon`. Calendar views were removed in `0.1.3`. |
| `compact_view` | boolean | Enables compact layout. |
| `hide_background` | boolean | Hides the card background. |
| `custom_background` | string | Custom background image URL. |
| `weather_entity` | string | Optional weather entity for sunny, cloudy, rainy, snowy, foggy, and stormy sky backgrounds. If omitted, the first `weather.*` entity is used. |
| `hide_starfield` | boolean | Hides the starfield layer. |
| `hide_buttons` | boolean | Hides section buttons. |
| `hide_items` | list | Data items to hide. |
| `number_decimals` | number | Number of decimals for numeric values. |
| `12hr_format` | boolean | Uses 12-hour time. |
| `daylight_hours_entity` | string | Optional daylight-hours sensor. Defaults to `sensor.daylight_hours` when that entity exists. |
| `graph_chart_config` | object | Horizon chart options. |

## Build

```bash
npm install
npm run rollup
```

The production bundle is written to:

```text
build/solar-card.js
```
