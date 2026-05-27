# Changelog

All notable changes to Solar Card are tracked here.

## [0.1.7] - 2026-05-27

### Changed

- Added the Solar Card icon to the README header for GitHub and HACS details.

## [0.1.6] - 2026-05-27

### Fixed

- Granted the release workflow permission to publish GitHub releases for HACS.

## [0.1.5] - 2026-05-27

### Fixed

- GitHub releases are now published publicly so HACS can show version numbers instead of commit hashes.

## [0.1.4] - 2026-05-27

### Fixed

- Sunny weather no longer renders hidden rain, storm, or snow particles.

## [0.1.3] - 2026-05-27

### Changed

- Set the project version to `0.1.3` while the card is still stabilising.
- Replaced the old lunar project changelog with a Solar Card changelog.
- Updated package repository metadata to `jcnicholls123/homeass`.
- Removed the calendar view from the card.
- Removed bundled moon/lunar image assets from the repository.
- Enlarged the weather visual and added CSS animation for sunny, cloudy, rainy, stormy, snowy, foggy, and windy states.
- Namespaced Solar Card's internal web components so it can run alongside the original Lunar Phase Card.
- Added a dedicated Solar Card package icon.
- Rebuilt the main weather visual as layered animated artwork instead of a small flat icon.

### Fixed

- Weather icons now appear in the main visual area for sunny, cloudy, rainy, stormy, snowy, foggy, and windy states.
- Text contrast was improved for bright sky backgrounds.
- Daytime cards no longer show the star overlay unless the weather state is `clear-night`.
- Sun time values are now parsed correctly, fixing `Invalid DateTime` and `Invalid Date` output.

## [0.1.2] - 2026-05-27

### Added

- Weather-based sky backgrounds using a configured `weather_entity`, or the first available `weather.*` entity.
- Support for `daylight_hours_entity`, defaulting to `sensor.daylight_hours`.

### Fixed

- Old lunar backgrounds are ignored so the solar/weather sky can display.

## [0.1.1] - 2026-05-27

### Added

- Home Assistant package structure for a custom Lovelace resource named `solar-card`.
- Built bundle at `dist/solar-card.js` for HACS/manual installation.

## [0.1.0] - 2026-05-27

### Added

- Initial Solar Card conversion from the lunar card base.
- Solar position, sunrise, sunset, solar noon, golden hour, daylight, azimuth, altitude, and distance data.
- `type: custom:solar-card` registration for Lovelace.
