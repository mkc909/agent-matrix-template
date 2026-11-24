# Agent Matrix — Simulated Fleet Visualizer & Starter Template

A lightweight, zero-dependency, Matrix-inspired visualizer for multi-agent swarms, tool call traces, governance decisions, and real-time anomaly alerts.

- **Public Live Demo:** `https://matrix-demo.apidevelopment.dev`
- **Template JSON Schema:** `https://matrix-demo.apidevelopment.dev/api/schema`

---

## Controls & Shortcuts

| Input | Action |
|---|---|
| **Click any falling column** | Lock a vertical spotlight beam and open the **Trace Decryptor** drawer (spans, refs, raw JSON) |
| **`Space`** | Cycle **Bullet-Time** speed (`1.0x` normal -> `0.15x` slow motion -> `0.0x` frozen frame) |
| **`P`** or **PULSE** | Emit an emerald radar shockwave and draw causal dependency arcs between linked agents, decisions, and traces |
| **`+ SIM EVENT`** | Inject a synthetic multi-agent event cascade on demand |
| **`DECODE` slider** | Morph rain between `0%` pure cryptic katakana and `100%` clear telemetry tokens |
| **`ALL / AGENTS / TRACES / DECISIONS / ALERTS`** | Filter columns by category (alerts flicker crimson) |
| **`/`** + text + **`Enter`** | Quick spotlight search and jump directly into matching stream inspection |
| **`H`** or **ZEN** | Hide HUD chrome for pure fullscreen ambient Matrix wall mode |
| **`M`** | Toggle optional WebAudio phosphor hum/chirp |
| **`?`** or **GUIDE** | Toggle the built-in Quick Guide overlay (includes 1-click JSON template copy) |

---

## Signal Palette

- **Emerald (`emerald`):** Completed spans, healthy checks, verified traces
- **Cyan (`cyan`):** Active running agents, builders, streaming tool relays
- **Gold (`gold`):** Governance rules & enacted decisions
- **Crimson (`crimson`):** Rate limits, drift alerts, failing gates (slight CRT glitch offset)

---

## Connect Your Own Agent System (Template Adapter)

To swap the simulated "Nexus Fleet" engine in `index.html` with your real agent backend:

1. Point an HTTP endpoint `/api/matrix-feed` (and optional SSE `/api/matrix-stream`) at your orchestrator returning JSON matching `/api/schema`:
   ```json
   {
     "generatedAt": "2026-11-23T19:30:00Z",
     "sourceMode": "live",
     "stats": { "totalStreams": 3, "activeAgents": 1, "traces": 1, "decisions": 1, "alerts": 0, "edges": 2 },
     "streams": [
       {
         "id": "agent:planner-1",
         "kind": "AGENT",
         "subkind": "PLANNER",
         "label": "PLANNER-01",
         "title": "Planner Agent",
         "status": "running",
         "signal": "cyan",
         "host": "worker-01",
         "model": "model-a",
         "timestamp": "2026-11-23T19:30:00Z",
         "summary": "Orchestrating tasks.",
         "refs": ["trace:build-42"],
         "tokens": ["PLANNER", "RUNNING"],
         "spans": [{ "name": "dispatch", "status": "running", pct: 0.7 }]
       }
     ],
     "edges": [
       { "from": "agent:planner-1", "to": "trace:build-42", "kind": "emits" }
     ]
   }
   ```
2. Call `fetch('/api/matrix-feed')` (or subscribe via `new EventSource('/api/matrix-stream')`), push new payloads into `feed`, call `updateStats(); rebuildColumns(true);`, and replace `setInterval(() => emitSimulatedEvent(false), 3500)`.

---

## Deploy Your Own Copy on Cloudflare Workers (2 Minutes)

1. Generate `src/ui-html.js` from `index.html`:
   ```bash
   python3 -c 'import json, pathlib; p = pathlib.Path("."); (p / "src/ui-html.js").write_text("export const DEMO_HTML = " + json.dumps((p / "index.html").read_text()) + ";\n")'
   ```
2. Replace `<YOUR_CF_ACCOUNT_ID>` in `wrangler.jsonc` with your Cloudflare account ID.
3. Deploy cleanly:
   ```bash
   npx wrangler deploy
   ```
4. If connecting private telemetry, place your custom Worker behind Cloudflare Access and verify `Cf-Access-Jwt-Assertion` inside `src/worker.js` before serving any route.
