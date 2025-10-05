# BorderSentinel — Situational Awareness Dashboard

BorderSentinel is a lightweight, browser-based situational awareness dashboard built with React, TypeScript and Vite. It's a demo-ready prototype for operations centres that monitor border activity, anomalies, and system health. The app combines interactive maps, simulated sensor feeds, an AI-powered explanation pane, and tamper-proof logging to demonstrate typical capabilities of a monitoring console.

This repository contains a fully working front-end demo with an in-memory mission store and demo generator so you can exercise the UI without backend services.

---

## Key features

- Interactive map view (Leaflet) focused on India with markers and threat connectors.
- Alerts Feed: list of detected alerts with color-coded severity (Critical / Warning / Info).
- AI Threat Analysis: a panel that explains why an alert was flagged using deterministic supplemental reasons and an anomaly service.
- Tamper-Proof Event Log: compact, hash-backed event log table built from alert metadata.
- System Health: dynamic health status for platform components (AI core, sensors, network, etc.).
- Demo Mode: single-click demo that generates realistic sample alerts, populates the map and logs, and randomizes system health every 15s.
- Role-specific views: Command, Analyst and Field Agent dashboards with different UX and sync behaviour.
- In-memory MissionService: a small evented service that stores alerts and notifies components when the data changes.

---

## Intended use-cases

- Product demos and UX validation for SOC / command-centre interfaces.
- Prototyping threat-detection workflows and alert triage UIs before backend integration.
- Training exercises: instructors can seed scenarios using Demo Mode for analysts and field agents.
- Rapid proof-of-concept for combining map-based visualizations, anomaly scoring and explainability in a single UI.

---

## Architecture & important files

- `index.tsx` / `App.tsx` — app entry & routing.
- `components/` — React components used across dashboards (MapView, AlertCard, AlertDetailPanel, SystemHealthPanel, TopBar, Sidebar, etc.).
- `pages/` — page-level containers for each role: `CommandDashboard`, `AnalystView`, `FieldAgentView`.
- `services/` — lightweight client-side services:
   - `MissionService.ts` — in-memory alert store + subscribe/notify API. Used as the application's single source of truth for alerts.
   - `DemoGenerator.ts` — generates demo alerts around India's border anchors.
   - `SystemHealthService.ts` — dynamic system health manager used by `SystemHealthPanel`.
   - `AnomalyService.ts` & `GeminiService.ts` — mock anomaly scoring and AI integration helpers.
- `constants.ts` — initial `DUMMY_ALERTS`, system health defaults, routes.
- `types.ts` — core TypeScript types and enums used across the app.

---

## Getting started (development)

Prerequisites: Node.js (16+ recommended)

1. Install dependencies

```bash
npm install
```

2. Optional: set the Gemini API key if you want to enable the AI generator via `GeminiService`.

Create a `.env.local` file in the project root and add:

```text
GEMINI_API_KEY=your_key_here
```

If you don't set an API key the UI will still run — `GeminiService` falls back to deterministic mock behavior.

3. Start development server

```bash
npm run dev
```

4. Open the app at the URL printed by Vite (typically http://localhost:5173).

Demo mode

- Navigate to the Command Dashboard and click `Start Demo`. The app will seed demo alerts, display them on the map, populate the tamper-proof log, and randomize system health (every 15s). Click `Stop Demo` to clear demo alerts and reset health.

---

## How the demo sync works (implementation notes)

- `MissionService` stores alerts and exposes `getAlerts()`, `setAlerts()`, `addAlert()`, `clearAlerts()` and `subscribe()`.
- Each page subscribes to `MissionService` so new alerts added by the demo generator are automatically shown in the Command, Analyst and Field Agent views.
- `SystemHealthService` exposes `subscribe()`, `randomize()` and `reset()`; Demo Mode uses `randomize()` on a 15s interval to change component health.
- `AlertDetailPanel` and `IncidentTimeline` use `AnomalyService.detectAnomaly()` to compute and render a short explanation of why an alert was flagged; an array of deterministic supplemental reasons is appended for variety.

---

## Next steps & improvements

Suggested follow-ups you might want to add:

- Persist mission state in localStorage or a small backend so demos survive reloads.
- Replace mock Gemini integration with a real server-side API key proxy and rate-limited calls.
- Add GeoJSON border definitions and snap generated alerts to actual borders for higher realism.
- Integrate marker clustering for dense alert sets.
- Add unit/integration tests for services and critical UI flows.

---

## Contributing

This repo is intended as a prototype—feel free to open PRs, improve data models, or wire a backend.

If you want me to add any of the suggested improvements above, tell me which one and I'll implement it.

---

## License

This project is provided as-is for demonstration purposes.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1bE3cBPL983XJxCdEeG403x-wiCftQROV

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
