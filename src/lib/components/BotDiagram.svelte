<script lang="ts">
	// Internal topology of the discord-bot, in the same visual idiom as
	// ArchitectureDiagram: dark nodes, cyan/green signal colour, mono labels,
	// and a labelled network rail as the contract. The vertical dashed rail is
	// the external monitoring_monitoring network: the application lives to its
	// left (Discord → bot.py → functions/ → Postgres), the observability stack
	// to its right (Tempo, Pyroscope, Prometheus, Grafana). Telemetry edges
	// cross the rail as straight perpendicular lines — every function is
	// @trace_function-wrapped, so spans and profiles flow out across it.
	//
	// Deliberately free of tokens / real IDs — curated surface only.

	// One packet per edge. Cyan rides the request path down the left spine;
	// green rides every telemetry edge across the rail and through the stack.
	// Staggered delays make the first pass read as a single wave (request in,
	// telemetry out) before settling into ambient flow on every edge.
	const flow: { id: string; d: string; dur: number; delay: number; tel?: boolean }[] = [
		// request path (cyan)
		{ id: 'c1', d: 'M270,68 L270,100', dur: 1.4, delay: 0 }, // Discord → bot.py
		{ id: 'c2', d: 'M270,164 L270,206', dur: 1.5, delay: 0.9 }, // bot.py → functions/
		{ id: 'c3', d: 'M270,268 L270,300', dur: 1.5, delay: 1.8 }, // functions/ → Postgres
		// telemetry (green)
		{ id: 'g1', d: 'M400,132 L710,132', dur: 2.4, delay: 1.2, tel: true }, // traces → Tempo
		{ id: 'g2', d: 'M385,237 L710,237', dur: 2.4, delay: 2.1, tel: true }, // profiles → Pyroscope
		{ id: 'g3', d: 'M270,360 L270,401', dur: 1.4, delay: 2.6, tel: true }, // Postgres → exporter
		{ id: 'g4', d: 'M380,430 L710,430', dur: 2.4, delay: 3.2, tel: true }, // scrape → Prometheus
		{ id: 'g5', d: 'M800,459 L800,491', dur: 1.4, delay: 3.8, tel: true } // Prometheus → Grafana
	];
</script>

<svg
	class="arch"
	viewBox="0 0 1000 580"
	role="img"
	aria-labelledby="bot-title bot-desc"
	preserveAspectRatio="xMidYMid meet"
>
	<title id="bot-title">discord-bot architecture</title>
	<desc id="bot-desc">
		A Discord slash command enters bot.py, which delegates to a thin handler in functions/ that
		reads and writes all state in Postgres through an asyncpg pool. Every function is wrapped by an
		@trace_function decorator, so OpenTelemetry spans flow to Tempo and continuous profiles to
		Pyroscope across the external monitoring_monitoring network. A postgres-exporter exposes
		database metrics that Prometheus scrapes, and Grafana renders dashboards and alerts on top.
	</desc>

	<!-- ===== the external monitoring network (the contract) ===== -->
	<g class="rail" style="--d: 0.4s">
		<line x1="540" y1="90" x2="540" y2="545" />
		<text class="rail-label" x="540" y="80">monitoring_monitoring</text>
	</g>

	<!-- ===== structural edges ===== -->
	<g class="edges">
		<!-- request path (left spine) -->
		<path class="edge" d="M270,68 L270,100" style="--d: 0.2s" />
		<path class="edge" d="M270,164 L270,206" style="--d: 0.45s" />
		<path class="edge" d="M270,268 L270,300" style="--d: 0.8s" />
		<!-- telemetry crossing the rail (straight, perpendicular) -->
		<path class="edge dashed tel" d="M400,132 L710,132" style="--d: 0.7s" />
		<path class="edge dashed tel" d="M385,237 L710,237" style="--d: 0.95s" />
		<path class="edge dashed tel" d="M270,360 L270,401" style="--d: 1.1s" />
		<path class="edge dashed tel" d="M380,430 L710,430" style="--d: 1.5s" />
		<!-- Prometheus feeds Grafana -->
		<path class="edge dashed tel" d="M800,459 L800,491" style="--d: 1.8s" />
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

	<!-- ===== application (left of the rail) ===== -->
	<!-- Discord (entry) -->
	<g class="node edge-node" style="--d: 0s">
		<rect x="188" y="24" width="164" height="44" rx="22" />
		<circle class="ping" cx="222" cy="46" r="5" />
		<text class="label" x="270" y="47">Discord</text>
	</g>

	<!-- bot.py -->
	<g class="node entry" style="--d: 0.25s">
		<rect x="140" y="100" width="260" height="64" rx="12" />
		<text class="node-title" x="270" y="124">bot.py</text>
		<text class="node-sub" x="270" y="146">slash commands · OTel + Pyroscope setup</text>
	</g>

	<!-- functions/ handler -->
	<g class="node app" style="--d: 0.6s">
		<rect x="155" y="206" width="230" height="62" rx="11" />
		<text class="node-title sm" x="270" y="230">functions/</text>
		<text class="node-sub" x="270" y="252">thin wrappers → handlers</text>
	</g>

	<!-- Postgres -->
	<g class="node db" style="--d: 0.95s">
		<rect x="165" y="300" width="210" height="60" rx="11" />
		<text class="node-title sm" x="270" y="323">Postgres</text>
		<text class="node-sub" x="270" y="344">asyncpg · all state</text>
	</g>

	<!-- postgres-exporter -->
	<g class="node sidecar" style="--d: 1.25s">
		<rect x="160" y="401" width="220" height="58" rx="11" />
		<text class="node-title sm" x="270" y="424">postgres-exporter</text>
		<text class="node-sub" x="270" y="444">db metrics endpoint</text>
	</g>

	<!-- @trace_function note on the spine -->
	<text class="edge-note" x="286" y="190">@trace_function</text>

	<!-- ===== observability stack (right of the rail) ===== -->
	<!-- Tempo -->
	<g class="node obs" style="--d: 0.5s">
		<rect x="710" y="103" width="180" height="58" rx="11" />
		<text class="node-title sm" x="800" y="126">Tempo</text>
		<text class="node-sub" x="800" y="146">traces</text>
	</g>

	<!-- Pyroscope -->
	<g class="node obs" style="--d: 0.85s">
		<rect x="710" y="208" width="180" height="58" rx="11" />
		<text class="node-title sm" x="800" y="231">Pyroscope</text>
		<text class="node-sub" x="800" y="251">continuous profiles</text>
	</g>

	<!-- Prometheus -->
	<g class="node obs" style="--d: 1.4s">
		<rect x="710" y="401" width="180" height="58" rx="11" />
		<text class="node-title sm" x="800" y="424">Prometheus</text>
		<text class="node-sub" x="800" y="444">metrics</text>
	</g>

	<!-- Grafana -->
	<g class="node obs" style="--d: 1.7s">
		<rect x="710" y="491" width="180" height="58" rx="11" />
		<text class="node-title sm" x="800" y="514">Grafana</text>
		<text class="node-sub" x="800" y="534">dashboards · alerts</text>
	</g>
</svg>

<style>
	.arch {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	/* ---- the external network rail: the contract the bot attaches to ---- */
	.rail line {
		stroke-width: 1.5;
		stroke-dasharray: 2 6;
		stroke-linecap: round;
		stroke: color-mix(in srgb, var(--green) 50%, var(--line));
	}
	.rail-label {
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.08em;
		text-anchor: middle;
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
		.rail {
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
