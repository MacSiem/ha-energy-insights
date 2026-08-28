# HA Energy Insights

> A HACS-ready Lovelace card for Home Assistant energy monitoring — cost tracking, top devices, weekly trends, and smart recommendations.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![release](https://img.shields.io/github/v/release/MacSiem/ha-energy-insights)](https://github.com/MacSiem/ha-energy-insights/releases)
[![license](https://img.shields.io/github/license/MacSiem/ha-energy-insights)](LICENSE)

---

## Features

| Feature | Description |
|---|---|
| 📊 **4-tab Dashboard** | Overview · Today · Week · Month, rendered without third-party runtime scripts |
| 💰 **Cost Tracking** | Configurable cost per kWh with currency |
| 🔌 **Top 5 Devices** | Auto-discovers sensors with `kWh` / `W` / `Wh` units |
| 📈 **Trend Badge** | This week vs previous week comparison |
| 💡 **Recommendations** | Smart text based on consumption patterns |
| 🌙 **Dark Theme** | Fully adapts to HA CSS variables |

---

## Installation

### Via HACS (recommended)

1. Open HACS → **Frontend** → **Custom repositories**
2. Add `https://github.com/MacSiem/ha-energy-insights` as type **Lovelace**
3. Install **HA Energy Insights**
4. Add to your dashboard resources (or let HACS do it)

### Manual

1. Download `ha-energy-insights.js` from [releases](https://github.com/MacSiem/ha-energy-insights/releases)
2. Copy to `<config>/www/community/ha-energy-insights/ha-energy-insights.js`
3. Add resource in HA **Settings → Dashboards → Resources**:
   ```
   /local/community/ha-energy-insights/ha-energy-insights.js
   ```

---

## Configuration

```yaml
type: custom:ha-energy-insights
title: "Energy Insights"
energy_cost_per_kwh: 0.72
currency: "PLN"
days_history: 7
```

| Option | Type | Default | Description |
|---|---|---|---|
| `title` | string | `"Energy Insights"` | Card title |
| `energy_cost_per_kwh` | number | `0.72` | Price per kWh |
| `currency` | string | `"PLN"` | Currency symbol shown in costs |
| `days_history` | number | `7` | Days of history to fetch (min 7, fetches 30 for monthly view) |

---

## Sensor Discovery

The card automatically discovers all `sensor.*` entities where `unit_of_measurement` is one of:

- `kWh` — energy sensors (used directly)
- `Wh`  — energy in watt-hours (converted to kWh)
- `W`   — power sensors (used for relative ranking)

No manual entity configuration needed.

---

## Screenshots

> _(screenshots coming soon)_

---

## Requirements

- Home Assistant 2023.1.0+
- No external CDN or internet dependency at runtime

---

## License

[MIT](LICENSE) © 2026 MacSiem / Maciej
