<script lang="ts">
	// Internal topology of the discord-bot, in the same visual idiom as
	// ArchitectureDiagram: dark nodes, cyan/green signal colour, mono labels.
	// The request path runs top-to-bottom on the left spine
	// (Discord → bot.py → functions/ handler → Postgres); every function on
	// that path is wrapped by @trace_function, so spans and profiles branch
	// right across the monitoring_monitoring network into the observability
	// plane (Tempo, Pyroscope, Prometheus, Grafana). The vertical dashed rail
	// is that external network — the same "contract" motif as the box diagram.
	//
	// Deliberately free of tokens / real IDs — curated surface only.

	// Cyan packets descending the request spine, plus one green packet emitting
	// a trace across the network. Staggered delays make the first pass read as a
	// single wave before settling into ambient flow.
	const flow: { id: string; d: string; dur: number; delay: number; tel?: boolean }[] = [
		{ id: 'f1', d: 'M320,66 L320,90', dur: 1.5, delay: 0 }, // Discord → bot.py
		{ id: 'f2', d: 'M320,156 L320,208', dur: 1.7, delay: 1.2 }, // bot.py → handler
		{ id: 'f3', d: 'M320,274 L320,328', dur: 1.6, delay: 2.6 }, // handler → Postgres
		{ id: 'f4', d: 'M440,230 C560,200 620,130 700,118', dur: 2.1, delay: 4.0, tel: true } // span → Tempo
	];
</script>

<svg
	class="arch"
	viewBox="0 0 1000 540"
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
	<g class="rail" style="--d: 0.7s">
		<line x1="560" y1="84" x2="560" y2="488" />
		<text class="rail-label" x="560" y="74">monitoring_monitoring</text>
	</g>

	<!-- ===== structural edges ===== -->
	<g class="edges">
		<!-- request spine -->
		<path class="edge" d="M320,64 L320,92" style="--d: 0.5s" />
		<path class="edge" d="M320,154 L320,210" style="--d: 0.9s" />
		<path class="edge" d="M320,272 L320,330" style="--d: 1.2s" />
		<path class="edge" d="M320,390 L320,434" style="--d: 1.5s" />
		<!-- telemetry branches across the network -->
		<path class="edge dashed tel" d="M440,230 C560,200 620,130 700,118" style="--d: 1.3s" />
		<path class="edge dashed tel" d="M440,250 C560,260 620,210 700,206" style="--d: 1.5s" />
		<!-- postgres-exporter scraped by Prometheus -->
		<path class="edge dashed tel" d="M430,460 C580,460 640,360 700,326" style="--d: 1.9s" />
		<!-- Prometheus feeds Grafana -->
		<path class="edge" d="M790,356 L790,420" style="--d: 2.1s" />
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

	<!-- ===== nodes ===== -->
	<!-- Discord (entry) -->
	<g class="node edge-node" style="--d: 0s">
		<rect x="238" y="20" width="164" height="44" rx="22" />
		<circle class="ping" cx="272" cy="42" r="5" />
		<text class="label" x="320" y="43">Discord</text>
	</g>

	<!-- bot.py -->
	<g class="node entry" style="--d: 0.3s">
		<rect x="180" y="92" width="280" height="62" rx="12" />
		<text class="node-title" x="320" y="116">bot.py</text>
		<text class="node-sub" x="320" y="138">slash commands · OTel + Pyroscope setup</text>
	</g>

	<!-- functions/ handler -->
	<g class="node app" style="--d: 0.7s">
		<rect x="200" y="210" width="240" height="62" rx="11" />
		<text class="node-title sm" x="320" y="234">functions/</text>
		<text class="node-sub" x="320" y="256">thin wrappers → handlers</text>
	</g>

	<!-- Postgres -->
	<g class="node db" style="--d: 1.1s">
		<rect x="210" y="330" width="220" height="60" rx="11" />
		<text class="node-title sm" x="320" y="353">Postgres</text>
		<text class="node-sub" x="320" y="374">asyncpg · all state</text>
	</g>

	<!-- postgres-exporter -->
	<g class="node sidecar" style="--d: 1.4s">
		<rect x="210" y="434" width="220" height="56" rx="11" />
		<text class="node-title sm" x="320" y="456">postgres-exporter</text>
		<text class="node-sub" x="320" y="476">db metrics endpoint</text>
	</g>

	<!-- @trace_function note on the spine -->
	<text class="edge-note" x="332" y="186">@trace_function</text>

	<!-- ===== observability plane (across the network) ===== -->
	<!-- Tempo -->
	<g class="node obs" style="--d: 0.9s">
		<rect x="700" y="90" width="180" height="56" rx="11" />
		<text class="node-title sm" x="790" y="112">Tempo</text>
		<text class="node-sub" x="790" y="132">traces</text>
	</g>

	<!-- Pyroscope -->
	<g class="node obs" style="--d: 1.1s">
		<rect x="700" y="178" width="180" height="56" rx="11" />
		<text class="node-title sm" x="790" y="200">Pyroscope</text>
		<text class="node-sub" x="790" y="220">continuous profiles</text>
	</g>

	<!-- Prometheus -->
	<g class="node obs" style="--d: 1.6s">
		<rect x="700" y="300" width="180" height="56" rx="11" />
		<text class="node-title sm" x="790" y="322">Prometheus</text>
		<text class="node-sub" x="790" y="342">metrics</text>
	</g>

	<!-- Grafana -->
	<g class="node obs" style="--d: 1.9s">
		<rect x="700" y="420" width="180" height="56" rx="11" />
		<text class="node-title sm" x="790" y="442">Grafana</text>
		<text class="node-sub" x="790" y="462">dashboards · alerts</text>
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
