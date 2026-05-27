import { html, css, TemplateResult, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { MoonImage } from '../../types/config/chart-config';

@customElement('solar-weather-image')
export class SolarWeatherImage extends LitElement {
  @property({ attribute: false }) public imageData!: MoonImage;
  @property({ type: String }) public weatherState = 'sunny';

  public connectedCallback(): void {
    super.connectedCallback();
    window.SolarWeatherPic = this;
  }

  protected render(): TemplateResult {
    if (!this.imageData) {
      return html``;
    }

    const weatherClass = this._weatherClass(this.weatherState);

    return html`
      <div
        class=${classMap({
          'weather-scene': true,
          [weatherClass]: true,
        })}
        aria-label=${this._weatherLabel(this.weatherState)}
      >
        <div class="scene-glow"></div>
        <div class="sun-rays"></div>
        <div class="sun-core"><span></span></div>
        <div class="night-disc"></div>
        <div class="cloud cloud-main"></div>
        <div class="cloud cloud-soft"></div>
        <div class="mist mist-one"></div>
        <div class="mist mist-two"></div>
        <div class="rain rain-one"></div>
        <div class="rain rain-two"></div>
        <div class="rain rain-three"></div>
        <div class="bolt"></div>
        <div class="flake flake-one"></div>
        <div class="flake flake-two"></div>
        <div class="flake flake-three"></div>
      </div>
    `;
  }

  private _weatherClass(state: string): string {
    const normalised = (state || 'sunny').toLowerCase();

    if (normalised === 'clear-night') return 'is-night';
    if (normalised.includes('lightning')) return 'is-storm';
    if (normalised.includes('snow') || normalised === 'hail') return 'is-snow';
    if (normalised === 'rainy' || normalised === 'pouring') return 'is-rain';
    if (normalised === 'fog') return 'is-fog';
    if (normalised.includes('windy')) return 'is-wind';
    if (normalised === 'cloudy') return 'is-cloudy';
    if (normalised === 'partlycloudy') return 'is-partly-cloudy';

    return 'is-sunny';
  }

  private _weatherLabel(state: string): string {
    const labels: Record<string, string> = {
      clear: 'Sunny weather',
      'clear-night': 'Clear night weather',
      cloudy: 'Cloudy weather',
      exceptional: 'Exceptional sunny weather',
      fog: 'Foggy weather',
      hail: 'Hail weather',
      lightning: 'Thunder weather',
      'lightning-rainy': 'Thunder and rain weather',
      partlycloudy: 'Partly cloudy weather',
      pouring: 'Heavy rain weather',
      rainy: 'Rainy weather',
      snowy: 'Snowy weather',
      'snowy-rainy': 'Sleet weather',
      sunny: 'Sunny weather',
      windy: 'Windy weather',
      'windy-variant': 'Windy weather',
    };

    return labels[(state || 'sunny').toLowerCase()] || labels.sunny;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        max-width: 230px;
      }

      .weather-scene {
        --sun-x: 50%;
        --sun-y: 46%;
        --sun-size: 61%;
        --cloud-x: 50%;
        --cloud-y: 62%;
        --cloud-scale: 1;
        position: relative;
        width: 100%;
        min-width: 150px;
        min-height: 150px;
        aspect-ratio: 1;
        overflow: visible;
        isolation: isolate;
        filter: drop-shadow(0 14px 18px rgba(42, 83, 116, 0.2));
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
      }

      .scene-glow {
        position: absolute;
        inset: 7%;
        border-radius: 50%;
        background:
          radial-gradient(circle at 48% 43%, rgba(255, 255, 214, 0.94) 0 16%, rgba(255, 216, 82, 0.34) 34%, transparent 66%),
          radial-gradient(circle, rgba(83, 197, 255, 0.18), transparent 64%);
        animation: solar-scene-breathe 4.2s ease-in-out infinite;
        z-index: 0;
      }

      .sun-rays {
        position: absolute;
        left: var(--sun-x);
        top: var(--sun-y);
        width: calc(var(--sun-size) * 1.26);
        height: calc(var(--sun-size) * 1.26);
        border-radius: 50%;
        background: repeating-conic-gradient(
          from 4deg,
          rgba(255, 231, 106, 0.8) 0deg 8deg,
          transparent 8deg 22deg
        );
        opacity: 0.72;
        transform: translate(-50%, -50%);
        animation: solar-ray-turn 22s linear infinite;
        filter: blur(0.2px);
        z-index: 1;
      }

      .sun-core {
        position: absolute;
        left: var(--sun-x);
        top: var(--sun-y);
        width: var(--sun-size);
        height: var(--sun-size);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background:
          radial-gradient(circle at 33% 29%, #fff8bb 0 18%, #ffe86f 34%, #ffb72b 69%, #fb8f16 100%);
        box-shadow:
          inset -12px -18px 22px rgba(208, 91, 19, 0.28),
          inset 9px 10px 18px rgba(255, 255, 255, 0.38),
          0 0 22px rgba(255, 224, 96, 0.8),
          0 0 48px rgba(255, 174, 45, 0.46);
        animation: solar-sun-float 5s ease-in-out infinite;
        z-index: 2;
      }

      .sun-core span {
        position: absolute;
        inset: 19%;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.08) 48%, transparent 70%);
      }

      .night-disc,
      .cloud,
      .mist,
      .rain,
      .bolt,
      .flake {
        position: absolute;
      }

      .night-disc {
        left: 46%;
        top: 46%;
        width: 55%;
        height: 55%;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background:
          radial-gradient(circle at 33% 28%, rgba(255, 255, 255, 0.9) 0 9%, transparent 10%),
          radial-gradient(circle at 61% 55%, rgba(255, 255, 255, 0.5) 0 5%, transparent 6%),
          radial-gradient(circle at 49% 45%, #fff8ce 0 48%, #d8e5ff 70%, #9fb5d8 100%);
        box-shadow: 0 0 26px rgba(206, 224, 255, 0.65);
        opacity: 0;
        z-index: 3;
      }

      .cloud {
        left: var(--cloud-x);
        top: var(--cloud-y);
        width: 58%;
        height: 27%;
        border-radius: 999px;
        transform: translate(-50%, -50%) scale(var(--cloud-scale));
        background: linear-gradient(180deg, #ffffff 0%, #e8f6ff 58%, #c5d9e4 100%);
        box-shadow:
          inset 9px 10px 15px rgba(255, 255, 255, 0.72),
          inset -9px -8px 14px rgba(123, 155, 174, 0.22),
          0 11px 16px rgba(67, 104, 124, 0.18);
        opacity: 0;
        z-index: 5;
      }

      .cloud::before,
      .cloud::after {
        content: '';
        position: absolute;
        bottom: 32%;
        border-radius: 50%;
        background: inherit;
      }

      .cloud::before {
        left: 12%;
        width: 38%;
        height: 92%;
      }

      .cloud::after {
        right: 15%;
        width: 45%;
        height: 122%;
      }

      .cloud-soft {
        --cloud-x: 64%;
        --cloud-y: 52%;
        --cloud-scale: 0.66;
        opacity: 0;
        z-index: 4;
        filter: blur(0.2px);
      }

      .mist {
        left: 24%;
        width: 58%;
        height: 7%;
        border-radius: 999px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.78), transparent);
        opacity: 0;
        z-index: 7;
      }

      .mist-one {
        top: 61%;
        animation: solar-mist-slide 4s ease-in-out infinite;
      }

      .mist-two {
        top: 72%;
        width: 48%;
        animation: solar-mist-slide 4.7s ease-in-out infinite reverse;
      }

      .rain {
        top: 72%;
        width: 4%;
        height: 25%;
        border-radius: 999px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(60, 167, 237, 0.82));
        opacity: 0;
        transform: rotate(13deg);
        z-index: 4;
      }

      .rain-one {
        left: 36%;
      }

      .rain-two {
        left: 51%;
      }

      .rain-three {
        left: 66%;
      }

      .bolt {
        left: 50%;
        top: 64%;
        width: 23%;
        height: 35%;
        background: linear-gradient(180deg, #fff487 0%, #ffd43b 56%, #ff9500 100%);
        clip-path: polygon(43% 0, 84% 0, 59% 39%, 88% 39%, 28% 100%, 43% 54%, 16% 54%);
        filter: drop-shadow(0 0 10px rgba(255, 225, 83, 0.9));
        opacity: 0;
        transform: translate(-50%, -12%) rotate(4deg);
        z-index: 7;
      }

      .flake {
        width: 9%;
        height: 9%;
        border-radius: 50%;
        background: radial-gradient(circle, #ffffff 0 36%, rgba(192, 233, 255, 0.85) 58%, transparent 62%);
        opacity: 0;
        z-index: 4;
      }

      .flake-one {
        left: 34%;
        top: 69%;
      }

      .flake-two {
        left: 52%;
        top: 75%;
        width: 7%;
        height: 7%;
      }

      .flake-three {
        left: 68%;
        top: 68%;
        width: 8%;
        height: 8%;
      }

      .is-cloudy,
      .is-rain,
      .is-storm,
      .is-snow,
      .is-fog,
      .is-wind {
        --sun-x: 38%;
        --sun-y: 39%;
        --sun-size: 48%;
        --cloud-y: 59%;
      }

      .is-partly-cloudy {
        --sun-x: 38%;
        --sun-y: 38%;
        --sun-size: 54%;
        --cloud-x: 58%;
        --cloud-y: 61%;
      }

      .is-cloudy .sun-core,
      .is-cloudy .sun-rays,
      .is-rain .sun-core,
      .is-rain .sun-rays,
      .is-storm .sun-core,
      .is-storm .sun-rays,
      .is-snow .sun-core,
      .is-snow .sun-rays,
      .is-fog .sun-core,
      .is-fog .sun-rays,
      .is-wind .sun-core,
      .is-wind .sun-rays {
        opacity: 0.28;
      }

      .is-cloudy .cloud-main,
      .is-cloudy .cloud-soft,
      .is-partly-cloudy .cloud-main,
      .is-rain .cloud-main,
      .is-storm .cloud-main,
      .is-snow .cloud-main,
      .is-fog .cloud-main,
      .is-wind .cloud-main {
        opacity: 1;
        animation: solar-cloud-drift 5.8s ease-in-out infinite;
      }

      .is-cloudy .cloud-soft,
      .is-fog .cloud-soft,
      .is-wind .cloud-soft {
        opacity: 0.78;
        animation-delay: -1.8s;
      }

      .is-rain .rain,
      .is-storm .rain,
      .is-snow .flake {
        opacity: 1;
      }

      .is-rain .rain-one,
      .is-storm .rain-one {
        animation: solar-rain-drop 0.92s linear infinite;
      }

      .is-rain .rain-two,
      .is-storm .rain-two {
        animation: solar-rain-drop 0.92s linear 0.18s infinite;
      }

      .is-rain .rain-three,
      .is-storm .rain-three {
        animation: solar-rain-drop 0.92s linear 0.36s infinite;
      }

      .is-storm .bolt {
        animation: solar-bolt-flash 2.2s steps(2, end) infinite;
      }

      .is-snow .flake-one {
        animation: solar-snow-fall 2.5s ease-in-out infinite;
      }

      .is-snow .flake-two {
        animation: solar-snow-fall 2.8s ease-in-out 0.35s infinite;
      }

      .is-snow .flake-three {
        animation: solar-snow-fall 2.65s ease-in-out 0.7s infinite;
      }

      .is-fog .mist,
      .is-wind .mist {
        opacity: 1;
      }

      .is-night .scene-glow {
        background:
          radial-gradient(circle at 47% 43%, rgba(215, 230, 255, 0.54), transparent 48%),
          radial-gradient(circle, rgba(10, 30, 72, 0.3), transparent 70%);
      }

      .is-night .sun-core,
      .is-night .sun-rays {
        opacity: 0;
      }

      .is-night .night-disc {
        opacity: 1;
        animation: solar-sun-float 5.4s ease-in-out infinite;
      }

      @keyframes solar-scene-breathe {
        0%,
        100% {
          transform: scale(0.96);
          opacity: 0.84;
        }
        50% {
          transform: scale(1.04);
          opacity: 1;
        }
      }

      @keyframes solar-ray-turn {
        to {
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }

      @keyframes solar-sun-float {
        0%,
        100% {
          transform: translate(-50%, -50%) translateY(0) scale(1);
        }
        50% {
          transform: translate(-50%, -50%) translateY(-4px) scale(1.025);
        }
      }

      @keyframes solar-cloud-drift {
        0%,
        100% {
          transform: translate(-52%, -50%) scale(var(--cloud-scale));
        }
        50% {
          transform: translate(-46%, -51%) scale(var(--cloud-scale));
        }
      }

      @keyframes solar-rain-drop {
        0% {
          opacity: 0;
          transform: translateY(-15%) rotate(13deg);
        }
        28% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: translateY(62%) rotate(13deg);
        }
      }

      @keyframes solar-bolt-flash {
        0%,
        62%,
        100% {
          opacity: 0;
        }
        66%,
        72% {
          opacity: 1;
        }
        69% {
          opacity: 0.36;
        }
      }

      @keyframes solar-snow-fall {
        0%,
        100% {
          opacity: 0.2;
          transform: translateY(-6%) translateX(-2px);
        }
        42% {
          opacity: 1;
        }
        75% {
          opacity: 0.8;
          transform: translateY(58%) translateX(4px);
        }
      }

      @keyframes solar-mist-slide {
        0%,
        100% {
          transform: translateX(-8%);
        }
        50% {
          transform: translateX(10%);
        }
      }
    `;
  }
}

declare global {
  interface Window {
    SolarWeatherPic: SolarWeatherImage;
  }
}
