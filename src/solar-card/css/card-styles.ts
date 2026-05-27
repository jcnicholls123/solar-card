import { css, unsafeCSS } from 'lit';

import editorStyles from './editor.css';
const DEFAULT_BG = {
  url: `
    :host {
      --solar-bg-image: linear-gradient(180deg, #3bb0ff 0%, #8ed8ff 45%, #ffe29a 100%);
    }
  `,
};
export const editorStyle = css`
  ${unsafeCSS(editorStyles)}
`;

export const DEFAULT_BG_URL = css`
  ${unsafeCSS(DEFAULT_BG.url)}
`;
export const style = css`
  :host {
    --solar-scale: 1;
    --solar-unit: calc(var(--solar-scale) * 36px);
    --solar-card-shell-header-height: calc(var(--solar-unit) + var(--solar-card-shell-gutter));
    --solar-card-shell-padding: 12px;
    --solar-card-shell-gutter: 8px;
    --mdc-icon-button-size: var(--solar-unit);
    --mdc-icon-size: calc(var(--solar-unit) * 0.6);
    --swiper-pagination-bullet-inactive-color: var(--secondary-text-color);
    --swiper-pagination-bottom: 0;
    --vic-gutter-gap: 8px;
    --vic-card-padding: 12px;
    --vic-icon-size: 36px;
    --vic-icon-border-radius: 18px;
    --vic-icon-bg-opacity: 0.2;
    --vsc-unit: 40px;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    transition: none;
  }
  *[hidden] {
    display: none !important;
  }
  ha-icon {
    width: calc(var(--solar-unit) * 0.6);
    height: calc(var(--solar-unit) * 0.6);
    display: flex;
    align-items: center;
  }

  ha-icon-button,
  .mdc-icon-button {
    width: var(--solar-unit) !important;
    height: var(--solar-unit) !important;
    color: var(--solar-icon-color, var(--secondary-text-color));
    opacity: 0.5;
    transition: color 0.25s;
  }

  ha-icon-button[color] {
    color: var(--solar-accent-color, var(--accent-color)) !important;
    opacity: 1 !important;
  }

  ha-icon-button[inactive] {
    opacity: 0.5;
  }

  ha-icon-button:hover,
  ha-icon-button[active] {
    color: var(--solar-primary-color, var(--primary-color)) !important;
    opacity: 0.8 !important;
  }

  ha-icon-button ha-icon {
    display: flex;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
