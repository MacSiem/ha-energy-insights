const assert = require('node:assert/strict');

global.window = { customCards: [] };
global.HTMLElement = class {
  attachShadow() { this.shadowRoot = {}; }
};
const registry = new Map();
global.customElements = {
  get: name => registry.get(name),
  define: (name, value) => registry.set(name, value),
};

require('../ha-energy-insights.js');

const Card = registry.get('ha-energy-insights');
assert.ok(Card, 'card registration');
const card = new Card();
card._config = {
  title: '<img src=x onerror=alert(1)>',
  currency: '<svg onload=alert(1)>',
  energy_cost_per_kwh: 1,
};
card._data = {
  todayKwh: 1,
  todayCost: 1,
  thisWeekKwh: 1,
  prevWeekKwh: 1,
  monthKwh: 1,
  monthCost: 1,
  weekCost: 1,
  topDevices: [{
    name: ['<img src=x onerror=alert(1)>'],
    entity_id: ['<svg onload=alert(1)>'],
    kwh: 1,
    rawVal: 1,
    uom: 'kWh',
  }],
  dailyData: [1],
  weeklyData: [1],
  monthlyData: [1],
};

for (const html of [card._renderHeader(), card._renderOverview(), card._renderChartTab('weekly')]) {
  assert.equal(html.includes('<img'), false, html);
  assert.equal(html.includes('<svg onload'), false, html);
}

const source = require('node:fs').readFileSync(
  require('node:path').join(__dirname, '..', 'ha-energy-insights.js'),
  'utf8',
);
assert.equal(source.includes('cdn.jsdelivr.net'), false);
assert.equal(source.includes('document.createElement(\'script\')'), false);
assert.match(source, /if \(!customElements\.get\('ha-energy-insights'\)\)/);
