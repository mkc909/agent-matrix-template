import { DEMO_HTML } from './ui-html.js';

const SCHEMA_TEMPLATE = {
  version: '1.0.0',
  description: 'Adapter contract for Agent Matrix trace visualizer',
  endpoint_requirements: {
    feed_endpoint: 'GET /api/matrix-feed -> { generatedAt, sourceMode, stats, streams, edges }',
    optional_sse: 'GET /api/matrix-stream -> SSE event: feed',
  },
  stream_fields: {
    id: 'string (unique node id, e.g. agent:planner-1 or trace:build-42)',
    kind: 'AGENT | TRACE | DECISION | EVIDENCE | TICKET',
    subkind: 'short category tag (e.g. ORCHESTRATOR, SPAN, C2/A2, ALERT)',
    label: 'short uppercase matrix column handle',
    title: 'human-readable stream title',
    status: 'running | working | completed | enacted | failed | blocked',
    signal: 'emerald (healthy) | cyan (active work) | gold (decision) | crimson (alert)',
    host: 'execution host, cluster, or worker name',
    model: 'model, runtime, or runner identifier',
    timestamp: 'ISO-8601 timestamp string',
    durationMs: 'number | null',
    summary: 'concise trace or span explanation',
    refs: 'string[] of related stream or ticket identifiers',
    tokens: 'string[] rendered vertically in falling rain columns',
    spans: '[{ name: string, status: string, pct: number (0..1) }]',
  },
  edge_fields: {
    from: 'source stream id',
    to: 'target stream id',
    kind: 'oversees | handoff | verifies | emits | governs | catches',
  },
  starter_payload: {
    generatedAt: '2026-11-23T19:30:00Z',
    sourceMode: 'custom-agent-adapter',
    stats: { totalStreams: 3, activeAgents: 1, traces: 1, decisions: 1, alerts: 0, edges: 2 },
    streams: [
      {
        id: 'agent:planner-1',
        kind: 'AGENT',
        subkind: 'PLANNER',
        label: 'PLANNER-01',
        title: 'Planner Agent — Release Coordinator',
        status: 'running',
        signal: 'cyan',
        host: 'worker-01',
        model: 'model-a',
        timestamp: '2026-11-23T19:30:00Z',
        durationMs: null,
        summary: 'Dispatching build and verification tasks.',
        refs: ['trace:build-42'],
        tokens: ['PLANNER', 'RUNNING', 'WORKER-01'],
        spans: [{ name: 'dispatch', status: 'running', pct: 0.7 }],
      },
      {
        id: 'trace:build-42',
        kind: 'TRACE',
        subkind: 'CI-RUN',
        label: 'BUILD-42',
        title: 'run-unit-tests (app-api)',
        status: 'completed',
        signal: 'emerald',
        host: 'app-api',
        model: 'ci-bot',
        timestamp: '2026-11-23T19:30:04Z',
        durationMs: 245,
        summary: 'Passed 24/24 tests cleanly.',
        refs: ['agent:planner-1'],
        tokens: ['PASS', '245MS', '24/24'],
        spans: [{ name: 'test', status: 'completed', pct: 1.0 }],
      },
      {
        id: 'dec:ship-42',
        kind: 'DECISION',
        subkind: 'C2/A2',
        label: 'SHIP-GATE',
        title: 'Approve Canary Promotion',
        status: 'enacted',
        signal: 'gold',
        host: 'governance',
        model: 'policy-v1',
        timestamp: '2026-11-23T19:30:05Z',
        durationMs: null,
        summary: 'Promoted canary after independent checks passed.',
        refs: ['trace:build-42'],
        tokens: ['ENACTED', 'CANARY'],
        spans: [{ name: 'approve', status: 'enacted', pct: 0.95 }],
      },
    ],
    edges: [
      { from: 'agent:planner-1', to: 'trace:build-42', kind: 'emits' },
      { from: 'dec:ship-42', to: 'trace:build-42', kind: 'governs' },
    ],
  },
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(DEMO_HTML, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          ...SECURITY_HEADERS,
        },
      });
    }

    if (request.method === 'GET' && url.pathname === '/api/schema') {
      return Response.json(SCHEMA_TEMPLATE, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300',
          ...SECURITY_HEADERS,
        },
      });
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return Response.json({
        ok: true,
        service: 'agent-matrix-demo',
        mode: 'simulated-template',
        git_sha: env?.GIT_SHA || 'unknown',
        private_data: false,
      }, { headers: { 'Cache-Control': 'no-store', ...SECURITY_HEADERS } });
    }

    return Response.json({ error: 'Not Found' }, { status: 404, headers: SECURITY_HEADERS });
  },
};
