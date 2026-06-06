import { css, CSSResultGroup, html, nothing, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import { CardState, SECTION } from '../const';
import './components/card';
import './components/sun-compact-view';
import './components/sun-base';
import './components/sun-data-info';
import './components/sun-chart-dynamic';
import './components/sun-chart-horizon';
import './components/solar-card-header';
import '../shared/solar-star-particles';
import { HomeAssistant, LovelaceCardEditor } from '../ha';
import { Store } from '../model/store';
import { Sun } from '../model/sun';
import { MoonData } from '../types/config/chart-config';
import { CSS_FONT_SIZE } from '../types/config/font-config';
import { SolarCardConfig } from '../types/config/solar-card-config';
import { computeCssColor } from '../utils/compute-color';
import { computeStubConfig } from '../utils/compute-stub-config';
import { debounce } from '../utils/debounce';
import { applyTheme } from '../utils/ha-helper';
import { SolarBaseCard } from './base-card';
import { SOLAR_CARD_EDITOR_NAME, SOLAR_CARD_NAME } from './const';
import { DEFAULT_BG_URL } from './css/card-styles';

@customElement(SOLAR_CARD_NAME)
export class SolarCard extends SolarBaseCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor/solar-card-editor');
    return document.createElement(SOLAR_CARD_EDITOR_NAME) as LovelaceCardEditor;
  }

  public static async getStubConfig(hass: HomeAssistant): Promise<SolarCardConfig> {
    const initConfig = computeStubConfig(hass);
    return {
      type: `custom:${SOLAR_CARD_NAME}`,
      ...initConfig,
    };
  }

  @state() private _state: CardState = CardState.READY;
  @state() private _activePage: SECTION = SECTION.BASE;
  @state() private _cardWidth = 0;
  @state() private _cardHeight = 0;
  @state() _cardReady: boolean = false;
  @property() public _selectedDate?: Date;

  private _resizeObserver?: ResizeObserver;

  public setConfig(config: SolarCardConfig): void {
    super.setConfig(config);
    this._cardReady = false;
    this._activePage = this._normalizeSection(this.config?.default_section);
    this._cardReady = true;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    window.SolarCard = this as SolarCard;
    this.updateComplete.then(() => this._attachObserver());
  }

  private async _attachObserver(): Promise<void> {
    if (!this._resizeObserver) {
      this._resizeObserver = new ResizeObserver(debounce(() => this._measureCard(), 250));
    }
    const card = this.shadowRoot!.querySelector('ha-card');
    // If we show an error or warning there is no ha-card
    if (!card) {
      return;
    }
    this._resizeObserver.observe(card);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  protected willUpdate(_changedProperties: PropertyValues): void {
    super.willUpdate(_changedProperties);

    if (_changedProperties.has('config') && this.config?.custom_theme) {
      const oldTheme = _changedProperties.get('config')?.custom_theme;
      const newTheme = this.config?.custom_theme;
      if (oldTheme !== newTheme && newTheme !== 'default') {
        console.debug('Applying custom theme:', newTheme);
        applyTheme(this, this.hass, newTheme!);
      }
    }
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);
  }

  get _date(): Date {
    return this._selectedDate ? new Date(this._selectedDate) : new Date();
  }

  get _filteredData(): MoonData {
    const hiddenItems = ['direction', ...(this.config?.hide_items || [])];
    const dataItems = Object.fromEntries(
      Object.entries(this.moon.moonData).filter(([key]) => !hiddenItems.includes(key))
    );
    return dataItems as MoonData;
  }

  private _measureCard(): void {
    const card = this.shadowRoot!.querySelector('ha-card') as HTMLElement;
    if (!card) {
      return;
    }
    this._cardWidth = card.clientWidth;
    this._cardHeight = card.clientHeight;
    // console.debug('Measured card size:', this._cardWidth, this._cardHeight);
  }

  protected render(): TemplateResult {
    if (!this.config || !this.hass || !this._cardReady) {
      return html``;
    }
    // create store if not exists
    this.createStore();
    // create moon
    this.createMoon();

    const appearance = this._configAppearance;
    return html`
      <ha-card
        class=${this._computeClasses()}
        style=${styleMap(this._computeStyles())}
        ?raised=${appearance.hide_background !== true}
      >
        <solar-card-shell
          .cardWidth=${this._cardWidth}
          .cardHeight=${this._cardHeight}
          .appearance=${appearance}
          .calendarPopup=${false}
          .activePage=${this._activePage}
          .changingContent=${this._state === CardState.CONTENT_CHANGING}
        >
          ${choose(this._activePage, [
            [SECTION.BASE, () => this._renderBaseSection()],
            [SECTION.HORIZON, () => this._renderHorizonSection()],
          ])}
        </solar-card-shell>
      </ha-card>
      ${this._showStarfield() ? html`<solar-star-particles></solar-star-particles>` : nothing}
    `;
  }

  private _renderBaseSection() {
    const appearance = this._configAppearance;
    const configLayout = this._configLayout;
    const moonData = this._filteredData;
    const moonImage = this.renderMoonImage();
    const isButtonHidden = appearance.hide_buttons === true;
    // determine chunk limit for data info based on card width and config
    // by default for card width > 460 show 6 items per page, else undefined
    // allow config to override this value via max_data_per_page setting but only apply if card width is > 460
    const chunkLimit = this._cardWidth > 460 ? configLayout.max_data_per_page || 6 : configLayout.max_data_per_page || 4;

    return html` ${appearance.compact_view === true
      ? html` <solar-sun-compact-view
          .moonData=${moonData}
          .moon=${this.moon}
          .store=${this.store}
          .config=${this.config}
          .hass=${this.hass}
          .appearance=${appearance}
          .header=${this._renderHeader('moon-header', this.moon.phaseName, isButtonHidden)}
          slot="content"
        ></solar-sun-compact-view>`
      : html` ${!isButtonHidden ? this._renderHeader('header') : nothing}
          <solar-sun-base
            slot="content"
            .moon=${this.moon}
            .store=${this.store}
            .config=${this.config}
            .hass=${this.hass}
            .activePage=${this._activePage}
            .appearance=${appearance}
          >
            ${moonImage} ${isButtonHidden ? this._renderHeader('moon-header', undefined, true) : nothing}
            <solar-sun-data-info
              slot="moon-info"
              .moonData=${moonData}
              .chunkedLimit=${chunkLimit}
            ></solar-sun-data-info
          ></solar-sun-base>`}`;
  }

  private _renderHorizonSection(): TemplateResult {
    if (this._configGraph?.graph_type === 'dynamic') {
      return html`
        ${this._renderHeader('header')}
        <solar-sun-chart-dynamic
          slot="content"
          .hass=${this.hass}
          .store=${this.store}
          .config=${this.config}
          .moon=${this.moon}
          .cardWidth=${this._cardWidth}
        ></solar-sun-chart-dynamic>
      `;
    }
    const headerTitle = this.store.translate('card.horizonTitle');
    return html`
      ${this._renderHeader('header', headerTitle)}
      <solar-sun-chart-horizon
        slot="content"
        .hass=${this.hass}
        .store=${this.store}
        .config=${this.config}
        .moon=${this.moon}
        .cardWidth=${this._cardWidth}
      ></solar-sun-chart-horizon>
    `;
  }

  public _renderHeader(slot: string, title?: string, force: boolean = false): TemplateResult {
    const appearance = this._configAppearance;
    if (appearance.hide_buttons === true && !force) {
      return html``;
    }

    if (!title) {
      title = this.moon.phaseName;
    }
    return html`
      <solar-card-header
        slot=${slot}
        .activePage=${this._activePage}
        .moonName=${title}
        .hideButtons=${appearance.hide_buttons}
        .store=${this.store}
        .config=${this.config}
        ._buttonDisabled=${this._state === CardState.CONTENT_CHANGING}
        @change-section=${this._handleChangeSection.bind(this)}
      ></solar-card-header>
    `;
  }

  public renderMoonImage(): TemplateResult {
    return html`
      <solar-weather-image
        slot="moon-pic"
        .imageData=${this.moon.moonImage}
        .weatherState=${this._weatherState()}
      ></solar-weather-image>
    `;
  }

  public _resetSelectedDate(): void {
    if (this._selectedDate !== undefined) {
      this._selectedDate = undefined;
    }
  }
  private createStore() {
    if (this.store) {
      return;
    }
    this.store = new Store(this.hass, this.config, this);
  }
  private createMoon() {
    const initData = {
      date: this._date,
      config: this.config,
      locale: this._configLocale,
      daylightHours: this._getDaylightHoursSensorValue(),
    };
    this.moon = new Sun(initData);
  }

  private _getDaylightHoursSensorValue(): number | undefined {
    const entityId = this.config?.daylight_hours_entity || 'sensor.daylight_hours';
    const stateObj = entityId ? this.hass.states[entityId] : undefined;
    if (!stateObj || ['unknown', 'unavailable'].includes(stateObj.state)) {
      return undefined;
    }
    const value = Number.parseFloat(stateObj.state);
    return Number.isFinite(value) ? value : undefined;
  }

  private _handleChangeSection(ev: CustomEvent) {
    ev.stopPropagation();
    const section = ev.detail.section;
    this._state = CardState.CONTENT_CHANGING;
    this._activePage = this._normalizeSection(section);
    setTimeout(() => {
      this._state = CardState.READY;
    }, 500);
  }

  private _computeClasses() {
    const appearance = this._configAppearance;
    const classes = {
      compact: appearance?.compact_view === true,
      '--has-bg': appearance?.hide_background !== true,
    };
    return classMap(classes);
  }

  private _normalizeSection(section?: SECTION): SECTION {
    return section === SECTION.HORIZON ? SECTION.HORIZON : SECTION.BASE;
  }

  private _computeStyles() {
    const appearance = this._configAppearance;
    const styles: Record<string, string> = {};
    const bg = appearance?.custom_background;
    if (bg && appearance.hide_background !== true && !this._isLegacyMoonBackground(bg)) {
      styles['--solar-bg-image'] = `url(${bg})`;
    } else if (appearance.hide_background !== true) {
      styles['--solar-bg-image'] = this._weatherBackground();
    }
    // header styles
    const { _configHeaderStyles, _configLabelStyles } = this;
    Object.entries({ ..._configHeaderStyles, ..._configLabelStyles }).forEach(([key, value]) => {
      // only set style if value is valid, not undefined, not empty, and not 'auto' or 'none'
      if (Boolean(value !== undefined && value !== '' && !['auto', 'none'].includes(value as string))) {
        styles[`--solar-${key.replace(/_/g, '-')}`] = key.includes('font_size')
          ? CSS_FONT_SIZE[value] || value
          : key.includes('font_color')
            ? computeCssColor(value)
            : value;
      }
    });

    return styles;
  }

  private _weatherBackground(): string {
    const state = this._weatherState();
    const backgroundMap: Record<string, string> = {
      clear: 'linear-gradient(180deg, #50b7ff 0%, #9fddff 46%, #ffe7a6 100%)',
      'clear-night': 'linear-gradient(180deg, #12345c 0%, #2f5f8f 58%, #8bb4d8 100%)',
      cloudy: 'linear-gradient(180deg, #7fb6d8 0%, #b9d5e6 48%, #edf4f8 100%)',
      exceptional: 'linear-gradient(180deg, #53aee8 0%, #c4e8fb 54%, #f7e9b1 100%)',
      fog: 'linear-gradient(180deg, #9db6c2 0%, #d2dde2 54%, #f4f7f7 100%)',
      hail: 'linear-gradient(180deg, #6c95b8 0%, #a9c4d8 50%, #eef6fb 100%)',
      lightning: 'linear-gradient(180deg, #4b5d82 0%, #7d8fb1 48%, #d4d7e7 100%)',
      'lightning-rainy': 'linear-gradient(180deg, #40597a 0%, #6e89a8 48%, #b9cad8 100%)',
      partlycloudy: 'linear-gradient(180deg, #57aeea 0%, #a9d7f3 45%, #f2f7fb 100%)',
      pouring: 'linear-gradient(180deg, #456987 0%, #7296ad 48%, #b8cbd7 100%)',
      rainy: 'linear-gradient(180deg, #5f86a3 0%, #91afc3 48%, #d0dde5 100%)',
      snowy: 'linear-gradient(180deg, #8fb7d7 0%, #dbeaf4 55%, #ffffff 100%)',
      'snowy-rainy': 'linear-gradient(180deg, #7297b5 0%, #b8cedd 52%, #eef5f8 100%)',
      sunny: 'linear-gradient(180deg, #3bb0ff 0%, #8ed8ff 45%, #ffe29a 100%)',
      windy: 'linear-gradient(180deg, #62ace1 0%, #b5d7ea 48%, #f0f7fb 100%)',
      'windy-variant': 'linear-gradient(180deg, #6da9d6 0%, #b7d4e7 48%, #edf6fa 100%)',
    };
    return backgroundMap[state] || backgroundMap.sunny;
  }

  private _isLegacyMoonBackground(background: string): boolean {
    return /moon_bg_|lunar-phase-card|\/background\/moon/i.test(background);
  }

  private _showStarfield(): boolean {
    return this._configAppearance.hide_starfield !== true && this._weatherState() === 'clear-night';
  }

  private _weatherState(): string {
    const configuredEntity = this.config?.weather_entity;
    if (configuredEntity) {
      return this._normaliseWeatherState(this.hass.states[configuredEntity]?.state);
    }

    const weatherStates = Object.keys(this.hass.states)
      .filter((entityId) => entityId.startsWith('weather.'))
      .map((entityId) => this._normaliseWeatherState(this.hass.states[entityId]?.state))
      .filter((state) => state !== 'sunny');

    return weatherStates.find((state) => !['clear', 'exceptional'].includes(state)) || weatherStates[0] || 'sunny';
  }

  private _normaliseWeatherState(state?: string): string {
    const value = (state || '').toLowerCase().trim().replace(/\s+/g, '-');
    if (!value || ['unknown', 'unavailable'].includes(value)) return 'sunny';
    if (value.includes('thunder') || value.includes('lightning')) return value.includes('rain') ? 'lightning-rainy' : 'lightning';
    if (value.includes('pouring') || value.includes('heavy-rain')) return 'pouring';
    if (value.includes('rain') || value.includes('drizzle') || value.includes('shower')) return 'rainy';
    if (value.includes('sleet') || value.includes('snowy-rainy')) return 'snowy-rainy';
    if (value.includes('snow') || value.includes('hail')) return value.includes('hail') ? 'hail' : 'snowy';
    if (value.includes('fog') || value.includes('mist')) return 'fog';
    if (value.includes('partly') || value.includes('partlycloudy')) return 'partlycloudy';
    if (value.includes('cloud')) return 'cloudy';
    if (value.includes('wind')) return value.includes('variant') ? 'windy-variant' : 'windy';
    if (value.includes('night')) return 'clear-night';
    if (value === 'clear') return 'clear';
    if (value === 'sunny') return 'sunny';
    return value;
  }

  static get styles(): CSSResultGroup {
    return [
      super.styles,
      css`
        :host {
          display: block;
          width: 100%;
          height: 100%;
          /* margin: calc(-1 * var(--ha-card-border-width, 1px)); */
          padding: 0;
          position: relative;
        }
        ${DEFAULT_BG_URL}
        solar-star-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }
        ha-card {
          position: relative;
          overflow: hidden;
          display: flex;
          width: 100%;
          height: fit-content;
          flex-direction: column;
        }
        ha-card.--has-bg {
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-image: var(--solar-bg-image);
          --primary-text-color: var(--solar-label-font-color, #17324a);
          --secondary-text-color: rgba(23, 50, 74, 0.72);
          color: var(--primary-text-color);
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.52);
          box-shadow: none !important;
        }
      `,
    ];
  }
}

declare global {
  interface Window {
    SolarCard: SolarCard;
  }
}
