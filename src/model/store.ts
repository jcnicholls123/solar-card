import { HomeAssistant, LocalizeFunc } from '../ha';
import setupTranslation from '../localize/translate';
import { BaseEditor } from '../solar-card/editor/base-editor';
import { SolarCard } from '../solar-card/solar-card';
import { SolarCardConfig } from '../types/config/solar-card-config';

export class Store {
  public hass: HomeAssistant;
  public config: SolarCardConfig;
  public readonly card: SolarCard | BaseEditor;
  public translate: LocalizeFunc;

  constructor(hass: HomeAssistant, config: SolarCardConfig, card: SolarCard | BaseEditor) {
    this.hass = hass;
    this.config = config;
    this.card = card;
    this.translate = setupTranslation(this.config?.language || hass?.selectedLanguage || hass.locale.language);
  }
}
