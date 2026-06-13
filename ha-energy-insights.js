/**
 * HA Energy Insights - Lovelace Card
 * v1.0.0 - HACS-ready Home Assistant energy monitoring card
 * https://github.com/MacSiem/ha-energy-insights
 */

const CARD_VERSION = '1.0.0';

// Load Chart.js dynamically
function loadChartJs() {
  return new Promise((resolve, reject) => {
    if (window.Chart) return resolve(window.Chart);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = () => resolve(window.Chart);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

const STYLES = `
  :host {
    display: block;
    font-family: var(--primary-font-family, 'Roboto', sans-serif);
  }
  .card-root {
    background: var(--ha-card-background, var(--card-background-color, #1c1c1c));
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(--ha-card-box-shadow, 0 2px 12px rgba(0,0,0,0.3));
    overflow: hidden;
    color: var(--primary-text-color, #e0e0e0);
  }
  .card-header {
    padding: 16px 20px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.1));
  }
  .card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--primary-text-color, #e0e0e0);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .card-title svg {
    width: 20px;
    height: 20px;
    fill: var(--accent-color, #ff9800);
  }
  .card-version {
    font-size: 0.65rem;
    color: var(--secondary-text-color, #9e9e9e);
    opacity: 0.7;
  }
  .tabs {
    display: flex;
    padding: 0 12px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.1));
    background: var(--secondary-background-color, rgba(255,255,255,0.03));
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar { display: none; }
  .tab {
    padding: 10px 14px;
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--secondary-text-color, #9e9e9e);
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    transition: color 0.2s, border-color 0.2s;
    user-select: none;
  }
  .tab:hover { color: var(--primary-text-color, #e0e0e0); }
  .tab.active {
    color: var(--accent-color, #ff9800);
    border-bottom-color: var(--accent-color, #ff9800);
  }
  .tab-content {
    padding: 16px;
  }
  /* Overview */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 10px;
    margin-bottom: 16px;
  }
  .stat-card {
    background: var(--secondary-background-color, rgba(255,255,255,0.05));
    border-radius: 10px;
    padding: 14px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .stat-label {
    font-size: 0.72rem;
    color: var(--secondary-text-color, #9e9e9e);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .stat-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--primary-text-color, #e0e0e0);
    line-height: 1.2;
  }
  .stat-value.highlight { color: var(--accent-color, #ff9800); }
  .stat-sub {
    font-size: 0.72rem;
    color: var(--secondary-text-color, #9e9e9e);
  }
  /* Trend badge */
  .trend-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 600;
  }
  .trend-up { background: rgba(244,67,54,0.15); color: #f44336; }
  .trend-down { background: rgba(76,175,80,0.15); color: #4caf50; }
  .trend-neutral { background: rgba(158,158,158,0.15); color: #9e9e9e; }
  /* Recommendation */
  .recommendation {
    background: rgba(255,152,0,0.08);
    border-left: 3px solid var(--accent-color, #ff9800);
    border-radius: 0 8px 8px 0;
    padding: 10px 14px;
    font-size: 0.83rem;
    color: var(--primary-text-color, #e0e0e0);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .recommendation-icon { font-size: 1rem; flex-shrink: 0; }
  /* Top devices */
  .section-title {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--secondary-text-color, #9e9e9e);
    margin-bottom: 10px;
  }
  .device-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }
  .device-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: var(--secondary-background-color, rgba(255,255,255,0.04));
    border-radius: 8px;
  }
  .device-rank {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--secondary-text-color, #9e9e9e);
    width: 18px;
    flex-shrink: 0;
  }
  .device-name {
    font-size: 0.82rem;
    flex: 1;
    color: var(--primary-text-color, #e0e0e0);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .device-value {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--accent-color, #ff9800);
    flex-shrink: 0;
  }
  .device-bar-wrap {
    width: 60px;
    height: 4px;
    background: rgba(255,255,255,0.08);
    border-radius: 2px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .device-bar {
    height: 100%;
    background: var(--accent-color, #ff9800);
    border-radius: 2px;
    transition: width 0.4s ease;
  }
  /* Chart */
  .chart-container {
    position: relative;
    height: 200px;
    margin-bottom: 8px;
  }
  canvas { max-width: 100%; }
  /* Loading / error */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 12px;
    color: var(--secondary-text-color, #9e9e9e);
    font-size: 0.85rem;
  }
  .spinner {
    width: 28px;
    height: 28px;
    border: 3px solid rgba(255,255,255,0.1);
    border-top-color: var(--accent-color, #ff9800);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-msg {
    padding: 16px;
    background: rgba(244,67,54,0.08);
    border-left: 3px solid #f44336;
    border-radius: 0 8px 8px 0;
    font-size: 0.83rem;
    color: #f44336;
    margin: 8px;
  }
  /* Chart period label */
  .chart-label {
    text-align: center;
    font-size: 0.75rem;
    color: var(--secondary-text-color, #9e9e9e);
    margin-top: 4px;
  }
  .refresh-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary-text-color, #9e9e9e);
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }
  .refresh-btn:hover { color: var(--accent-color, #ff9800); }
  .refresh-btn svg { width: 16px; height: 16px; }
  .header-right { display: flex; align-items: center; gap: 8px; }
  .no-sensors {
    padding: 16px;
    color: var(--secondary-text-color, #9e9e9e);
    font-size: 0.83rem;
    text-align: center;
  }
`;

class HaEnergyInsights extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._activeTab = 'overview';
    this._data = null;
    this._loading = true;
    this._error = null;
    this._charts = {};
    this._chartJsReady = false;
    this._fetchPromise = null;
  }

  static getConfigElement() {
    return document.createElement('ha-energy-insights-editor');
  }

  static getStubConfig() {
    return {
      title: 'Energy Insights',
      energy_cost_per_kwh: 0.72,
      currency: 'PLN',
      days_history: 7
    };
  }

  setConfig(config) {
    this._config = {
      title: 'Energy Insights',
      energy_cost_per_kwh: 0.72,
      currency: 'PLN',
      days_history: 7,
      ...config
    };
    this._render();
  }

  set hass(hass) {
    const wasNull = !this._hass;
    this._hass = hass;
    if (wasNull) {
      this._render();
      this._fetchData();
    }
  }

  connectedCallback() {
    loadChartJs().then(() => {
      this._chartJsReady = true;
      if (this._data) this._renderCharts();
    }).catch(() => {
      console.warn('[ha-energy-insights] Chart.js failed to load');
    });
  }

  disconnectedCallback() {
    Object.values(this._charts).forEach(c => { try { c.destroy(); } catch(e){} });
    this._charts = {};
  }

  // ── Data fetching ────────────────────────────────────────────────────────

  async _fetchData() {
    if (!this._hass) return;
    this._loading = true;
    this._error = null;
    this._render();

    try {
      const [states, history] = await Promise.all([
        this._callApi('GET', 'states'),
        this._fetchHistory()
      ]);

      const energySensors = this._discoverEnergySensors(states);
      const todayStats = this._calcTodayStats(energySensors);
      const weeklyData = this._processHistory(history, 7);
      const monthlyData = this._processHistory(history, 30);
      const dailyData = this._buildDailyFromHistory(history);
      const prevWeekData = this._calcPrevWeek(history);

      this._data = {
        sensors: energySensors,
        todayKwh: todayStats.kwh,
        todayCost: todayStats.kwh * this._config.energy_cost_per_kwh,
        topDevices: this._getTopDevices(energySensors),
        weeklyData,
        monthlyData,
        dailyData,
        thisWeekKwh: weeklyData.reduce((s, v) => s + v, 0),
        prevWeekKwh: prevWeekData,
        monthKwh: monthlyData.reduce((s, v) => s + v, 0),
      };

      this._data.monthCost = this._data.monthKwh * this._config.energy_cost_per_kwh;
      this._data.weekCost = this._data.thisWeekKwh * this._config.energy_cost_per_kwh;
      this._loading = false;
      this._render();
      if (this._chartJsReady) this._renderCharts();
    } catch (err) {
      console.error('[ha-energy-insights]', err);
      this._error = err.message || 'Failed to load data';
      this._loading = false;
      this._render();
    }
  }

  async _callApi(method, path, body) {
    const hass = this._hass;
    try {
      return await hass.callApi(method, path, body);
    } catch (e) {
      // fallback: direct fetch
      const token = hass.connection?.options?.authToken || hass.auth?.data?.access_token;
      const url = `${hass.hassUrl || ''}/api/${path}`;
      const resp = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!resp.ok) throw new Error(`API ${path} returned ${resp.status}`);
      return resp.json();
    }
  }

  async _fetchHistory() {
    const days = Math.max(this._config.days_history || 7, 30);
    const start = new Date();
    start.setDate(start.getDate() - days);
    const startStr = start.toISOString();
    try {
      return await this._callApi('GET', `history/period/${startStr}?significant_changes_only=false`);
    } catch (e) {
      return [];
    }
  }

  _discoverEnergySensors(states) {
    if (!Array.isArray(states)) return [];
    return states.filter(s => {
      if (!s.entity_id.startsWith('sensor.')) return false;
      const uom = s.attributes?.unit_of_measurement;
      if (!uom) return false;
      const val = parseFloat(s.state);
      if (isNaN(val) || val < 0) return false;
      return uom === 'kWh' || uom === 'W' || uom === 'Wh';
    });
  }

  _calcTodayStats(sensors) {
    let kwh = 0;
    sensors.forEach(s => {
      const uom = s.attributes?.unit_of_measurement;
      const val = parseFloat(s.state) || 0;
      if (uom === 'kWh') kwh += val;
      else if (uom === 'Wh') kwh += val / 1000;
      else if (uom === 'W') kwh += (val * 1) / 1000; // approximate
    });
    return { kwh: Math.round(kwh * 100) / 100 };
  }

  _getTopDevices(sensors) {
    return sensors
      .map(s => {
        const uom = s.attributes?.unit_of_measurement;
        const val = parseFloat(s.state) || 0;
        let kwh = 0;
        if (uom === 'kWh') kwh = val;
        else if (uom === 'Wh') kwh = val / 1000;
        else if (uom === 'W') kwh = val / 1000;
        const name = s.attributes?.friendly_name || s.entity_id.replace('sensor.', '').replace(/_/g, ' ');
        return { name, kwh, entity_id: s.entity_id, uom, rawVal: val };
      })
      .filter(d => d.kwh > 0)
      .sort((a, b) => b.kwh - a.kwh)
      .slice(0, 5);
  }

  _processHistory(history, days) {
    if (!Array.isArray(history)) return new Array(days).fill(0);
    const result = new Array(days).fill(0);
    const now = new Date();
    history.forEach(entityHistory => {
      if (!Array.isArray(entityHistory) || entityHistory.length === 0) return;
      const uom = entityHistory[0]?.attributes?.unit_of_measurement;
      if (!uom || (uom !== 'kWh' && uom !== 'Wh' && uom !== 'W')) return;
      entityHistory.forEach(entry => {
        const val = parseFloat(entry.state);
        if (isNaN(val)) return;
        const date = new Date(entry.last_changed);
        const daysAgo = Math.floor((now - date) / 86400000);
        if (daysAgo >= 0 && daysAgo < days) {
          const idx = days - 1 - daysAgo;
          let kwh = 0;
          if (uom === 'kWh') kwh = val;
          else if (uom === 'Wh') kwh = val / 1000;
          else if (uom === 'W') kwh = val / 1000;
          result[idx] = Math.max(result[idx], kwh);
        }
      });
    });
    return result;
  }

  _buildDailyFromHistory(history) {
    return this._processHistory(history, 24);
  }

  _calcPrevWeek(history) {
    if (!Array.isArray(history)) return 0;
    let total = 0;
    const now = new Date();
    history.forEach(entityHistory => {
      if (!Array.isArray(entityHistory) || entityHistory.length === 0) return;
      const uom = entityHistory[0]?.attributes?.unit_of_measurement;
      if (!uom || (uom !== 'kWh' && uom !== 'Wh')) return;
      entityHistory.forEach(entry => {
        const val = parseFloat(entry.state);
        if (isNaN(val)) return;
        const date = new Date(entry.last_changed);
        const daysAgo = Math.floor((now - date) / 86400000);
        if (daysAgo >= 7 && daysAgo < 14) {
          const kwh = uom === 'kWh' ? val : val / 1000;
          total = Math.max(total, kwh);
        }
      });
    });
    return Math.round(total * 100) / 100;
  }

  // ── Rendering ────────────────────────────────────────────────────────────

  _render() {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    let html = `<style>${STYLES}</style><div class="card-root">`;
    html += this._renderHeader();

    if (this._loading) {
      html += `<div class="loading"><div class="spinner"></div><span>Wczytywanie danych&hellip;</span></div>`;
    } else if (this._error) {
      html += `<div class="error-msg">&#x26A0; ${this._error}</div>`;
    } else {
      html += this._renderTabs();
      html += `<div class="tab-content">`;
      if (this._activeTab === 'overview') html += this._renderOverview();
      else if (this._activeTab === 'daily') html += this._renderChartTab('daily');
      else if (this._activeTab === 'weekly') html += this._renderChartTab('weekly');
      else if (this._activeTab === 'monthly') html += this._renderChartTab('monthly');
      html += `</div>`;
    }

    html += `</div>`;
    shadow.innerHTML = html;
    this._bindEvents();
  }

  _renderHeader() {
    const title = this._config.title || 'Energy Insights';
    return `
      <div class="card-header">
        <div class="card-title">
          <svg viewBox="0 0 24 24"><path d="M11 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M9 7h6M9 11h4M9 15h2M19 16v6M16 19l3-3 3 3"/></svg>
          ${title}
        </div>
        <div class="header-right">
          <span class="card-version">v${CARD_VERSION}</span>
          <button class="refresh-btn" id="refresh-btn" title="Od\u015bwie\u017c">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
          </button>
        </div>
      </div>`;
  }

  _renderTabs() {
    const tabs = [
      { id: 'overview', label: 'Przegl\u0105d' },
      { id: 'daily',    label: 'Dzi\u015b' },
      { id: 'weekly',   label: 'Tydzie\u0144' },
      { id: 'monthly',  label: 'Miesi\u0105c' }
    ];
    return `<div class="tabs">${tabs.map(t =>
      `<div class="tab${this._activeTab === t.id ? ' active' : ''}" data-tab="${t.id}">${t.label}</div>`
    ).join('')}</div>`;
  }

  _renderOverview() {
    if (!this._data) return '';
    const d = this._data;
    const cur = this._config.currency || 'PLN';
    const fmt = v => v.toFixed(2);
    const trendDiff = d.prevWeekKwh > 0
      ? ((d.thisWeekKwh - d.prevWeekKwh) / d.prevWeekKwh * 100)
      : 0;
    const trendClass = trendDiff > 5 ? 'trend-up' : trendDiff < -5 ? 'trend-down' : 'trend-neutral';
    const trendIcon = trendDiff > 5 ? '&#x2191;' : trendDiff < -5 ? '&#x2193;' : '&#x2194;';
    const trendLabel = trendDiff > 0 ? `+${fmt(trendDiff)}%` : `${fmt(trendDiff)}%`;
    const rec = this._getRecommendation(trendDiff, d.todayKwh);

    let html = `<div class="stats-grid">`;
    html += `<div class="stat-card"><div class="stat-label">Dzi\u015b</div><div class="stat-value highlight">${fmt(d.todayKwh)} kWh</div><div class="stat-sub">${fmt(d.todayCost)} ${cur}</div></div>`;
    html += `<div class="stat-card"><div class="stat-label">Ten tydzie\u0144</div><div class="stat-value">${fmt(d.thisWeekKwh)} kWh</div><div class="stat-sub">${fmt(d.weekCost)} ${cur}</div></div>`;
    html += `<div class="stat-card"><div class="stat-label">Ten miesi\u0105c</div><div class="stat-value">${fmt(d.monthKwh)} kWh</div><div class="stat-sub">${fmt(d.monthCost)} ${cur}</div></div>`;
    html += `<div class="stat-card"><div class="stat-label">Trend</div><div class="stat-value"><span class="trend-badge ${trendClass}">${trendIcon} ${trendLabel}</span></div><div class="stat-sub">vs poprzedni tydzie\u0144</div></div>`;
    html += `</div>`;

    html += `<div class="recommendation"><span class="recommendation-icon">&#x1F4A1;</span>${rec}</div>`;

    if (d.topDevices && d.topDevices.length > 0) {
      const maxKwh = d.topDevices[0].kwh || 1;
      html += `<div class="section-title">Top 5 urz\u0105dze\u0144</div><div class="device-list">`;
      d.topDevices.forEach((dev, i) => {
        const pct = Math.round((dev.kwh / maxKwh) * 100);
        const valStr = dev.uom === 'W'
          ? `${dev.rawVal.toFixed(0)} W`
          : `${dev.kwh.toFixed(3)} kWh`;
        html += `
          <div class="device-row">
            <div class="device-rank">#${i + 1}</div>
            <div class="device-name" title="${dev.entity_id}">${dev.name}</div>
            <div class="device-bar-wrap"><div class="device-bar" style="width:${pct}%"></div></div>
            <div class="device-value">${valStr}</div>
          </div>`;
      });
      html += `</div>`;
    } else {
      html += `<div class="no-sensors">Brak czujnik\u00f3w energii (kWh/W). Dodaj sensory energii do HA.</div>`;
    }

    return html;
  }

  _renderChartTab(period) {
    const labels = {
      daily: 'Zu\u017cycie godzinowe (dzi\u015b)',
      weekly: 'Zu\u017cycie dzienne (7 dni)',
      monthly: 'Zu\u017cycie dzienne (30 dni)'
    };
    return `
      <div class="section-title">${labels[period] || ''}</div>
      <div class="chart-container">
        <canvas id="chart-${period}"></canvas>
      </div>
      <div class="chart-label">kWh &bull; ${this._config.currency || 'PLN'} @ ${this._config.energy_cost_per_kwh}/kWh</div>`;
  }

  _getRecommendation(trendDiff, todayKwh) {
    if (trendDiff > 20) return 'Zu\u017cycie znacznie wy\u017csze ni\u017c zwykle \u2014 sprawd\u017a urz\u0105dzenia i ogrzewanie.';
    if (trendDiff > 5)  return 'Zu\u017cycie nieco wy\u017csze ni\u017c w poprzednim tygodniu \u2014 monitoruj zu\u017cycie.';
    if (trendDiff < -10) return 'Zu\u017cycie ni\u017csze ni\u017c zwykle \u2014 dobra robota! Oszcz\u0119dzasz energi\u0119.';
    if (todayKwh > 20)  return 'Wysokie zu\u017cycie dzi\u015b \u2014 sprawd\u017a urz\u0105dzenia o du\u017cej mocy.';
    if (todayKwh < 1)   return 'Bardzo niskie zu\u017cycie dzi\u015b. Wszystko wygl\u0105da dobrze!';
    return 'Zu\u017cycie energii w normie. Kontynuuj monitorowanie.';
  }

  // ── Charts ───────────────────────────────────────────────────────────────

  _renderCharts() {
    if (!window.Chart || !this._data) return;
    const shadow = this.shadowRoot;

    const chartDefs = {
      daily:   { data: this._data.dailyData,   labels: this._buildHourLabels(24) },
      weekly:  { data: this._data.weeklyData,   labels: this._buildDayLabels(7) },
      monthly: { data: this._data.monthlyData,  labels: this._buildDayLabels(30) }
    };

    if (this._activeTab in chartDefs) {
      const def = chartDefs[this._activeTab];
      const canvasId = `chart-${this._activeTab}`;
      const canvas = shadow.getElementById(canvasId);
      if (!canvas) return;

      if (this._charts[this._activeTab]) {
        try { this._charts[this._activeTab].destroy(); } catch(e) {}
      }

      const accentColor = getComputedStyle(this).getPropertyValue('--accent-color').trim() || '#ff9800';
      const textColor = getComputedStyle(this).getPropertyValue('--secondary-text-color').trim() || '#9e9e9e';

      this._charts[this._activeTab] = new window.Chart(canvas, {
        type: 'bar',
        data: {
          labels: def.labels,
          datasets: [{
            label: 'kWh',
            data: def.data,
            backgroundColor: accentColor + '99',
            borderColor: accentColor,
            borderWidth: 1,
            borderRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => {
                  const kwh = ctx.raw || 0;
                  const cost = (kwh * this._config.energy_cost_per_kwh).toFixed(2);
                  return ` ${kwh.toFixed(3)} kWh  (${cost} ${this._config.currency || 'PLN'})`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: { color: textColor, font: { size: 10 }, maxRotation: 45 },
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            y: {
              ticks: { color: textColor, font: { size: 10 } },
              grid: { color: 'rgba(255,255,255,0.05)' },
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  _buildDayLabels(days) {
    const labels = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      labels.push(`${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}`);
    }
    return labels;
  }

  _buildHourLabels(hours) {
    const labels = [];
    for (let i = 0; i < hours; i++) {
      labels.push(`${i.toString().padStart(2,'0')}:00`);
    }
    return labels;
  }

  // ── Event binding ────────────────────────────────────────────────────────

  _bindEvents() {
    const shadow = this.shadowRoot;
    shadow.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this._activeTab = tab.dataset.tab;
        this._render();
        if (this._chartJsReady && this._data) this._renderCharts();
      });
    });

    const refreshBtn = shadow.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this._fetchData());
    }
  }

  // ── Lovelace card size ───────────────────────────────────────────────────
  getCardSize() { return 4; }

  getGridOptions() { return { rows: 8, columns: 12, min_rows: 3, min_columns: 6 }; }
}

customElements.define('ha-energy-insights', HaEnergyInsights);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'ha-energy-insights',
  name: 'HA Energy Insights',
  description: 'Energy monitoring card with cost tracking, top devices, and trends.',
  preview: false,
  documentationURL: 'https://github.com/MacSiem/ha-energy-insights'
});

console.info(
  `%c HA-ENERGY-INSIGHTS %c v${CARD_VERSION} `,
  'color:#fff;background:#ff9800;font-weight:700;padding:2px 6px;border-radius:4px 0 0 4px;',
  'color:#ff9800;background:#1c1c1c;font-weight:700;padding:2px 6px;border-radius:0 4px 4px 0;'
);
