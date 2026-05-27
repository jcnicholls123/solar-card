import { html, css, TemplateResult, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { MoonImage } from '../../types/config/chart-config';
// import { LunarBaseElement } from '../base-element';

@customElement('lunar-moon-image')
export class LunarMoonImage extends LitElement {
  @property({ attribute: false }) public imageData!: MoonImage;
  @property({ type: String }) public weatherState = 'sunny';

  @query('.moon-image img') private _imgElement!: HTMLImageElement;

  @state() public _hover = false;
  @state() public _focused = false;

  private _touchStarted = false;

  public connectedCallback(): void {
    super.connectedCallback();
    window.LunarMoonPic = this;
  }

  protected firstUpdated(): void {
    if (this._imgElement) {
      this._imgElement.addEventListener('dragstart', (e) => e.preventDefault());
      this._imgElement.addEventListener('contextmenu', (e) => e.preventDefault());
      this._imgElement.draggable = false;

      this._imgElement.addEventListener('focus', () => {
        this._focused = true;
      });
      this._imgElement.addEventListener('blur', () => {
        this._focused = false;
      });

      this._imgElement.addEventListener(
        'touchstart',
        () => {
          this._touchStarted = true;
        },
        { passive: true }
      );

      this._imgElement.addEventListener('touchend', () => {
        setTimeout(() => {
          this._touchStarted = false;
        }, 100);
      });

      this._imgElement.addEventListener('mouseenter', () => {
        if (this._touchStarted) return;
        this._hover = true;
      });
      this._imgElement.addEventListener('mouseleave', () => {
        this._hover = false;
        this.style.removeProperty('--pointer-x');
        this.style.removeProperty('--pointer-y');
      });
      this._imgElement.addEventListener('mousemove', this._handlePointerMove.bind(this));
    }
  }

  private _handlePointerMove(event: MouseEvent) {
    if (!this._hover) return;
    const rect = this._imgElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    this.style.setProperty('--pointer-x', `${xPercent}%`);
    this.style.setProperty('--pointer-y', `${yPercent}%`);
  }

  protected render(): TemplateResult {
    if (!this.imageData) {
      return html``;
    }

    const showOverlay = this._hover || this._focused;
    const lightFraction = this.imageData.fraction && this.imageData.fraction >= 60 ? true : false;
    return html`
      <div
        class=${classMap({
          'moon-image': true,
          hovered: showOverlay,
          'light-fraction': lightFraction,
        })}
        data-weather=${this.weatherState || 'sunny'}
      >
        <ha-icon .icon=${this._weatherIcon(this.weatherState)}></ha-icon>
      </div>
    `;
  }

  private _weatherIcon(state: string): string {
    const iconMap: Record<string, string> = {
      clear: 'mdi:weather-sunny',
      'clear-night': 'mdi:weather-night',
      cloudy: 'mdi:weather-cloudy',
      exceptional: 'mdi:weather-sunny-alert',
      fog: 'mdi:weather-fog',
      hail: 'mdi:weather-hail',
      lightning: 'mdi:weather-lightning',
      'lightning-rainy': 'mdi:weather-lightning-rainy',
      partlycloudy: 'mdi:weather-partly-cloudy',
      pouring: 'mdi:weather-pouring',
      rainy: 'mdi:weather-rainy',
      snowy: 'mdi:weather-snowy',
      'snowy-rainy': 'mdi:weather-snowy-rainy',
      sunny: 'mdi:weather-sunny',
      windy: 'mdi:weather-windy',
      'windy-variant': 'mdi:weather-windy-variant',
    };
    return iconMap[state] || iconMap.sunny;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        max-width: 220px;
      }
      .moon-image {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-width: 132px;
        min-height: 132px;
        transition: transform 0.5s;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
        aspect-ratio: 1;
        flex-shrink: 0;
        position: relative;
      }

      .moon-image::before {
        content: '';
        position: absolute;
        width: 82%;
        height: 82%;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 245, 174, 0.5) 0%, rgba(255, 206, 73, 0.16) 48%, transparent 72%);
      }

      .moon-image::after {
        content: '';
        position: absolute;
        inset: 16%;
        border-radius: 50%;
        opacity: 0;
        pointer-events: none;
      }

      .moon-image ha-icon {
        position: relative;
        z-index: 1;
        width: 92%;
        height: 92%;
        color: #f7b731;
        filter: drop-shadow(0 6px 16px rgba(118, 85, 21, 0.25)) drop-shadow(0 0 18px rgba(255, 215, 87, 0.65));
        animation: solar-weather-float 4.8s ease-in-out infinite;
      }

      .moon-image[data-weather='sunny']::before,
      .moon-image[data-weather='clear']::before,
      .moon-image[data-weather='exceptional']::before {
        animation: solar-weather-pulse 3.4s ease-in-out infinite;
      }

      .moon-image[data-weather='sunny']::after,
      .moon-image[data-weather='clear']::after,
      .moon-image[data-weather='exceptional']::after {
        opacity: 0.7;
        background: conic-gradient(
          from 0deg,
          transparent 0deg 16deg,
          rgba(255, 220, 84, 0.55) 16deg 24deg,
          transparent 24deg 45deg
        );
        animation: solar-weather-spin 18s linear infinite;
      }

      .moon-image[data-weather='clear-night'] ha-icon {
        color: #f5f0c8;
        filter: drop-shadow(0 6px 16px rgba(8, 22, 48, 0.45)) drop-shadow(0 0 18px rgba(205, 224, 255, 0.65));
      }

      .moon-image[data-weather='cloudy'] ha-icon,
      .moon-image[data-weather='fog'] ha-icon,
      .moon-image[data-weather='partlycloudy'] ha-icon,
      .moon-image[data-weather='windy'] ha-icon,
      .moon-image[data-weather='windy-variant'] ha-icon {
        color: #ffffff;
        filter: drop-shadow(0 7px 16px rgba(50, 82, 112, 0.3)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.72));
        animation: solar-weather-drift 5.8s ease-in-out infinite;
      }

      .moon-image[data-weather='cloudy']::before,
      .moon-image[data-weather='fog']::before,
      .moon-image[data-weather='partlycloudy']::before,
      .moon-image[data-weather='windy']::before,
      .moon-image[data-weather='windy-variant']::before {
        background: radial-gradient(circle, rgba(255, 255, 255, 0.58) 0%, rgba(199, 225, 238, 0.24) 54%, transparent 76%);
      }

      .moon-image[data-weather='rainy'] ha-icon,
      .moon-image[data-weather='pouring'] ha-icon,
      .moon-image[data-weather='snowy-rainy'] ha-icon {
        color: #f4fbff;
        filter: drop-shadow(0 7px 16px rgba(29, 59, 88, 0.38)) drop-shadow(0 0 10px rgba(211, 236, 255, 0.75));
        animation: solar-weather-rain 1.7s ease-in-out infinite;
      }

      .moon-image[data-weather='rainy']::before,
      .moon-image[data-weather='pouring']::before,
      .moon-image[data-weather='snowy-rainy']::before {
        background: radial-gradient(circle, rgba(217, 239, 255, 0.52) 0%, rgba(104, 154, 190, 0.22) 55%, transparent 76%);
      }

      .moon-image[data-weather='lightning'] ha-icon,
      .moon-image[data-weather='lightning-rainy'] ha-icon {
        color: #ffe66d;
        filter: drop-shadow(0 7px 16px rgba(30, 31, 70, 0.45)) drop-shadow(0 0 16px rgba(255, 232, 106, 0.78));
        animation: solar-weather-flash 2.3s steps(2, end) infinite;
      }

      .moon-image[data-weather='snowy'] ha-icon,
      .moon-image[data-weather='hail'] ha-icon {
        color: #ffffff;
        filter: drop-shadow(0 7px 16px rgba(70, 103, 133, 0.3)) drop-shadow(0 0 12px rgba(255, 255, 255, 0.82));
        animation: solar-weather-snow 3.8s ease-in-out infinite;
      }
      .moon-image.hovered img {
        filter: saturate(1.25) brightness(1.15) drop-shadow(0 0 22px rgba(255, 190, 61, 0.75));
        cursor: zoom-in;
      }
      .moon-image.hovered.light-fraction img {
        filter: saturate(1.15) brightness(1.05) drop-shadow(0 0 18px rgba(255, 190, 61, 0.7));
      }
      .moon-image.hovered::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(
          circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
          rgba(255, 217, 116, 0.3),
          rgba(246, 134, 31, 0.18) 60%
        );
        pointer-events: none;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: background 0.3s;
      }

      @keyframes solar-weather-float {
        0%,
        100% {
          transform: translateY(0) scale(1);
        }
        50% {
          transform: translateY(-4px) scale(1.035);
        }
      }

      @keyframes solar-weather-pulse {
        0%,
        100% {
          transform: scale(0.94);
          opacity: 0.8;
        }
        50% {
          transform: scale(1.08);
          opacity: 1;
        }
      }

      @keyframes solar-weather-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes solar-weather-drift {
        0%,
        100% {
          transform: translateX(-3px);
        }
        50% {
          transform: translateX(5px);
        }
      }

      @keyframes solar-weather-rain {
        0%,
        100% {
          transform: translateY(-2px);
        }
        50% {
          transform: translateY(5px);
        }
      }

      @keyframes solar-weather-flash {
        0%,
        65%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        70% {
          opacity: 0.35;
          transform: scale(1.08);
        }
        76% {
          opacity: 1;
          transform: scale(1.02);
        }
      }

      @keyframes solar-weather-snow {
        0%,
        100% {
          transform: translateY(-3px) rotate(-2deg);
        }
        50% {
          transform: translateY(4px) rotate(2deg);
        }
      }
    `;
  }
}

declare global {
  interface Window {
    LunarMoonPic: LunarMoonImage;
  }
}
