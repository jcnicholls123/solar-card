import * as EDITOR_COMPONENTS from './index';

declare global {
  interface Window {
    SolarAppearanceArea: EDITOR_COMPONENTS.AppearanceArea;
    SolarLocationArea: EDITOR_COMPONENTS.LocationArea;
    SolarLayoutArea: EDITOR_COMPONENTS.LayoutArea;
  }
}
