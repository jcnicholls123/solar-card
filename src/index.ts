import './solar-card/solar-card';

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'solar-card',
  name: 'Solar Card',
  description: 'A card to display solar position, sunrise, sunset, and daylight information.',
  preview: true,
  documentationURL: 'https://github.com/jcnicholls123/homeass',
});
