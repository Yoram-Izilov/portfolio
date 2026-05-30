<script lang="ts">
	// Internal topology of the discord-bot, in the same visual idiom as
	// ArchitectureDiagram: dark nodes, cyan/green signal colour, mono labels.
	// The request path runs top-to-bottom on the left spine
	// (Discord → bot.py → functions/ → Postgres). Every function is wrapped by
	// @trace_function, so the bot process emits BOTH traces and profiles — they
	// leave bot.py together and enter the observability stack, grouped inside
	// the bordered monitoring_monitoring panel on the right. The bot itself
	// exposes no Prometheus metrics: the only metrics come from the
	// postgres-exporter sidecar, which Prometheus scrapes. Grafana reads all
	// three signals (traces, profiles, metrics) — the single pane of glass.
	//
	// Deliberately free of tokens / real IDs — curated surface only.

	// One packet per edge. Cyan rides the request path down the left spine;
	// green rides every telemetry edge. Staggered delays make the first pass
	// read as a wave (request in, telemetry out) before settling into ambient
	// flow on every edge.
	const flow: { id: string; d: string; dur: number; delay: number; tel?: boolean }[] = [
		// request path (cyan)
		{ id: 'c1', d: 'M230,68 L230,100', dur: 1.4, delay: 0 }, // Discord → bot.py
		{ id: 'c2', d: 'M230,162 L230,204', dur: 1.5, delay: 0.8 }, // bot.py → functions/
		{ id: 'c3', d: 'M230,264 L230,306', dur: 1.5, delay: 1.6 }, // functions/ → Postgres
		// telemetry (green)
		{ id: 't0', d: 'M230,364 L230,406', dur: 1.4, delay: 2.4, tel: true }, // Postgres → exporter
		{ id: 'tr', d: 'M364,126 C470,126 520,177 598,177', dur: 2.2, delay: 1.2, tel: true }, // traces → Tempo
		{ id: 'pr', d: 'M364,140 C470,160 520,286 598,286', dur: 2.4, delay: 1.6, tel: true }, // profiles → Pyroscope
		{ id: 'me', d: 'M340,432 C470,432 520,395 598,395', dur: 2.2, delay: 3.0, tel: true }, // metrics → Prometheus
		{ id: 'tg', d: 'M746,177 C774,177 788,250 788,262', dur: 1.8, delay: 3.4, tel: true }, // Tempo → Grafana
		{ id: 'pg', d: 'M746,286 L788,286', dur: 1.6, delay: 3.8, tel: true }, // Pyroscope → Grafana
		{ id: 'mg', d: 'M746,395 C774,395 788,322 788,310', dur: 1.6, delay: 4.2, tel: true } // Prometheus → Grafana
	];
</script>

<svg
	class="arch"
	viewBox="0 0 1000 510"
	role="img"
	aria-labelledby="bot-title bot-desc"
	preserveAspectRatio="xMidYMid meet"
>
	<title id="bot-title">discord-bot architecture</title>
	<desc id="bot-desc">
		A Discord slash command enters bot.py, which delegates to a thin handler in functions/ that
		reads and writes all state in Postgres through an asyncpg pool. Every function is wrapped by an
		@trace_function decorator, so the bot process emits both OpenTelemetry traces to Tempo and
		continuous profiles to Pyroscope across the external monitoring_monitoring network. The bot
		exposes no Prometheus metrics itself; a postgres-exporter sidecar exposes database metrics that
		Prometheus scrapes, and Grafana renders dashboards and alerts on all three signals.
	</desc>

	<!-- ===== the monitoring stack, grouped on the monitoring_monitoring network ===== -->
	<g class="panel" style="--d: 0.45s">
		<rect x="560" y="96" width="410" height="388" rx="16" />
		<text class="panel-label" x="582" y="124">monitoring_monitoring</text>
	</g>

	<!-- ===== structural edges ===== -->
	<g class="edges">
		<!-- request path (left spine) -->
		<path class="edge" d="M230,68 L230,100" style="--d: 0.2s" />
		<path class="edge" d="M230,162 L230,204" style="--d: 0.45s" />
		<path class="edge" d="M230,264 L230,306" style="--d: 0.8s" />
		<!-- Postgres read by the exporter -->
		<path class="edge dashed tel" d="M230,364 L230,406" style="--d: 1.1s" />
		<!-- bot process emits traces + profiles together, into the stack -->
		<path class="edge dashed tel" d="M364,126 C470,126 520,177 598,177" style="--d: 0.7s" />
		<path class="edge dashed tel" d="M364,140 C470,160 520,286 598,286" style="--d: 0.9s" />
		<!-- exporter metrics scraped by Prometheus -->
		<path class="edge dashed tel" d="M340,432 C470,432 520,395 598,395" style="--d: 1.5s" />
		<!-- Grafana reads all three signals -->
		<path class="edge dashed tel" d="M746,177 C774,177 788,250 788,262" style="--d: 1.6s" />
		<path class="edge dashed tel" d="M746,286 L788,286" style="--d: 1.8s" />
		<path class="edge dashed tel" d="M746,395 C774,395 788,322 788,310" style="--d: 1.9s" />
	</g>

	<!-- ===== packets ===== -->
	<g class="packets">
		{#each flow as f (f.id)}
			<circle
				class="packet"
				class:tel={f.tel}
				r="3.5"
				style="offset-path: path('{f.d}'); animation-duration: {f.dur}s; animation-delay: {f.delay}s;"
			/>
		{/each}
	</g>

	<!-- ===== application (left of the panel) ===== -->
	<!-- Discord (entry) -->
	<g class="node edge-node" style="--d: 0s">
		<rect x="150" y="24" width="160" height="44" rx="22" />
		<circle class="ping" cx="184" cy="46" r="5" />
		<text class="label" x="230" y="47">Discord</text>
	</g>

	<!-- bot.py -->
	<g class="node entry" style="--d: 0.25s">
		<rect x="96" y="100" width="268" height="62" rx="12" />
		<text class="node-title" x="230" y="124">bot.py</text>
		<text class="node-sub" x="230" y="146">slash commands · OTel + Pyroscope</text>
	</g>

	<!-- functions/ handler -->
	<g class="node app" style="--d: 0.7s">
		<rect x="120" y="204" width="220" height="60" rx="11" />
		<text class="node-title sm" x="230" y="228">functions/</text>
		<text class="node-sub" x="230" y="250">thin wrappers → handlers</text>
	</g>

	<!-- Postgres -->
	<g class="node db" style="--d: 1.0s">
		<rect x="130" y="306" width="200" height="58" rx="11" />
		<text class="node-title sm" x="230" y="330">Postgres</text>
		<text class="node-sub" x="230" y="351">asyncpg · all state</text>
	</g>

	<!-- postgres-exporter -->
	<g class="node sidecar" style="--d: 1.3s">
		<rect x="120" y="406" width="220" height="58" rx="11" />
		<text class="node-title sm" x="230" y="430">postgres-exporter</text>
		<text class="node-sub" x="230" y="451">db metrics endpoint</text>
	</g>

	<!-- @trace_function note on the spine -->
	<text class="edge-note" x="246" y="188">@trace_function</text>

	<!-- ===== observability stack (inside the panel) ===== -->
	<!-- Tempo -->
	<g class="node obs" style="--d: 0.6s">
		<rect x="598" y="150" width="148" height="54" rx="11" />
		<text class="node-title sm" x="672" y="172">Tempo</text>
		<text class="node-sub" x="672" y="190">traces</text>
	</g>

	<!-- Pyroscope -->
	<g class="node obs" style="--d: 0.85s">
		<rect x="598" y="259" width="148" height="54" rx="11" />
		<text class="node-title sm" x="672" y="281">Pyroscope</text>
		<text class="node-sub" x="672" y="299">profiles</text>
	</g>

	<!-- Prometheus -->
	<g class="node obs" style="--d: 1.4s">
		<rect x="598" y="368" width="148" height="54" rx="11" />
		<text class="node-title sm" x="672" y="390">Prometheus</text>
		<text class="node-sub" x="672" y="408">metrics</text>
	</g>

	<!-- Grafana -->
	<g class="node obs grafana" style="--d: 1.7s">
		<rect x="788" y="238" width="164" height="96" rx="12" />
		<text class="node-title sm" x="870" y="280">Grafana</text>
		<text class="node-sub" x="870" y="302">dashboards · alerts</text>
	</g>
</svg>

<style>
	.arch {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	/* ---- the monitoring stack container (the monitoring_monitoring network) ---- */
	.panel rect {
		fill: color-mix(in srgb, var(--green) 5%, transparent);
		stroke: color-mix(in srgb, var(--green) 35%, var(--line));
		stroke-width: 1.5;
		stroke-dasharray: 3 7;
		stroke-linecap: round;
	}
	.panel-label {
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.08em;
		fill: color-mix(in srgb, var(--green) 70%, var(--fg-faint));
	}

	/* ---- edges ---- */
	.edge {
		fill: none;
		stroke: #2a3a4f;
		stroke-width: 1.5;
	}
	.edge.dashed {
		stroke-dasharray: 4 5;
	}
	.edge.tel {
		stroke: color-mix(in srgb, var(--green) 45%, #2a3a4f);
	}

	/* ---- flowing packets ---- */
	.packet {
		fill: var(--cyan);
		offset-rotate: 0deg;
		animation-name: flow;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
		filter: drop-shadow(0 0 5px var(--cyan));
	}
	.packet.tel {
		fill: var(--green);
		filter: drop-shadow(0 0 5px var(--green));
	}
	@keyframes flow {
		from {
			offset-distance: 0%;
		}
		to {
			offset-distance: 100%;
		}
	}

	/* ---- nodes ---- */
	.node rect {
		fill: var(--bg-2);
		stroke: var(--line);
		stroke-width: 1.5;
	}
	.node-title {
		fill: var(--fg);
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 19px;
		text-anchor: middle;
		dominant-baseline: middle;
	}
	.node-title.sm {
		font-size: 16px;
		font-family: var(--font-mono);
	}
	.node-sub {
		fill: var(--fg-faint);
		font-family: var(--font-mono);
		font-size: 12px;
		text-anchor: middle;
		dominant-baseline: middle;
	}
	.label {
		fill: var(--fg);
		font-family: var(--font-mono);
		font-size: 15px;
		text-anchor: middle;
		dominant-baseline: middle;
	}
	.edge-note {
		fill: color-mix(in srgb, var(--cyan) 70%, var(--fg-faint));
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.04em;
	}

	/* bot.py is the entry point — cyan edge */
	.entry rect {
		stroke: color-mix(in srgb, var(--cyan) 55%, var(--line));
		fill: #131d2b;
	}
	/* observability nodes sit on the green plane */
	.obs rect {
		stroke: color-mix(in srgb, var(--green) 45%, var(--line));
	}
	/* Grafana is the single pane of glass — slightly brighter */
	.grafana rect {
		stroke: color-mix(in srgb, var(--green) 65%, var(--line));
		fill: #10201a;
	}
	.db rect,
	.sidecar rect {
		fill: var(--bg-1);
	}

	/* Discord ping */
	.ping {
		fill: var(--green);
		transform-box: fill-box;
		transform-origin: center;
	}

	/* entrance — only when motion is welcome; default state is fully visible.
	   Each element carries its own --d so the diagram unfurls top-to-bottom. */
	@media (prefers-reduced-motion: no-preference) {
		.node,
		.edges path,
		.panel {
			opacity: 0;
			animation: rise 0.9s var(--ease) forwards;
			animation-delay: var(--d, 0.12s);
		}
		.ping {
			animation: ping 2.4s ease-out infinite;
		}
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes ping {
		0% {
			transform: scale(0.6);
			opacity: 0.8;
		}
		70% {
			opacity: 0;
		}
		100% {
			transform: scale(2.4);
			opacity: 0;
		}
	}

	/* respect reduced motion: freeze the packet flow + ping */
	@media (prefers-reduced-motion: reduce) {
		.packet {
			animation: none;
			offset-distance: 50%;
			opacity: 0.6;
		}
		.ping {
			display: none;
		}
	}
</style>
