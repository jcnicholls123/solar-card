import { css, CSSResultGroup, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { HomeAssistant } from '../ha';
import { style } from './css/card-styles';

export function computeDarkMode(hass?: HomeAssistant): boolean {
  if (!hass) return false;
  return (hass.themes as any).darkMode as boolean;
}

export class SolarBaseElement extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (changedProps.has('hass') && this.hass) {
      this.toggleAttribute('dark-mode', computeDarkMode(this.hass));
    }
  }

  static get styles(): CSSResultGroup {
    return [style, css``];
  }
}
