<script lang="ts">
	// Blueprint topology of the home-server box, in the same visual idiom as the hero
	// PipelineGraph: dark nodes, cyan/green signal colour, mono labels. The two Docker
	// networks are drawn as labelled rails — the "contracts" the repos attach to. One
	// packet flows the public request path (visitors → nginx → portfolio) and a dashed
	// return carries status.json back, echoing the hero's flow motif without repeating it.
	//
	// Deliberately free of real internal IPs / hostnames — same discipline as the
	// status-exporter (curated surface only).

	// request-path edges that carry a flowing packet
	const flow: { id: string; d: string; dur: number; delay: number }[] = [
		{ id: 'f1', d: 'M500,70 L500,104', dur: 1.4, delay: 0 },
		{ id: 'f2', d: 'M500,168 L500,212', dur: 1.2, delay: 0.5 },
		{ id: 'f3', d: 'M340,236 L340,268', dur: 1.1, delay: 1 }
	];
</script>

<svg
	class="arch"
	viewBox="0 0 1000 560"
	role="img"
	aria-labelledby="arch-title arch-desc"
	preserveAspectRatio="xMidYMid meet"
>
	<title id="arch-title">home-server architecture</title>
	<desc id="arch-desc">
		Visitor traffic enters the host nginx reverse proxy and is routed over the nginx_nginx_network
		to the portfolio and Discord-bot containers by container name. Both containers attach to a
		second network, monitoring_monitoring, that carries metrics, logs and traces into the monitoring
		stack — Prometheus, Grafana, Loki and Tempo. A status-exporter sidecar reads that stack and
		writes a curated status.json back into the portfolio container. Jenkins deploys each service on
		the main branch.
	</desc>

	<!-- ===== network rails (the contracts) ===== -->
	<g class="rail rail-a">
		<line x1="170" y1="214" x2="830" y2="214" />
		<text class="rail-label" x="170" y="200">nginx_nginx_network</text>
	</g>
	<g class="rail rail-b">
		<line x1="120" y1="392" x2="880" y2="392" />
		<text class="rail-label rail-label-b" x="120" y="378">monitoring_monitoring</text>
	</g>

	<!-- ===== structural edges ===== -->
	<g class="edges">
		<!-- nginx down to rail A -->
		<path class="edge" d="M500,168 L500,214" />
		<!-- rail A to the two app containers -->
		<path class="edge" d="M340,214 L340,268" />
		<path class="edge" d="M660,214 L660,268" />
		<!-- app containers down to rail B (telemetry) -->
		<path class="edge dashed" d="M340,332 L340,392" />
		<path class="edge dashed" d="M660,332 L660,392" />
		<!-- rail B to the monitoring stack -->
		<path class="edge" d="M500,392 L500,420" />
		<!-- monitoring stack read by the status-exporter -->
		<path class="edge dashed" d="M320,470 L246,470" />
		<!-- status-exporter writes status.json back into portfolio (self-reference) -->
		<path class="edge dashed return" d="M172,440 C172,360 300,352 308,302" />
		<!-- Jenkins deploys the app containers -->
		<path class="edge dashed deploy" d="M828,440 C828,360 700,352 692,302" />
	</g>

	<!-- ===== packets on the request path ===== -->
	<g class="packets">
		{#each flow as f (f.id)}
			<circle
				class="packet"
				r="3.5"
				style="offset-path: path('{f.d}'); animation-duration: {f.dur}s; animation-delay: {f.delay}s;"
			/>
		{/each}
	</g>

	<!-- ===== nodes ===== -->
	<!-- visitors -->
	<g class="node edge-node" style="--d: 0s">
		<rect x="418" y="22" width="164" height="44" rx="22" />
		<circle class="ping" cx="452" cy="44" r="5" />
		<text class="label" x="500" y="45">visitors</text>
	</g>

	<!-- host nginx reverse proxy -->
	<g class="node nginx" style="--d: 0.08s">
		<rect x="360" y="106" width="280" height="62" rx="12" />
		<text class="node-title" x="500" y="130">host nginx</text>
		<text class="node-sub" x="500" y="152">reverse proxy · routes by container name</text>
	</g>

	<!-- portfolio container -->
	<g class="node app" style="--d: 0.2s">
		<rect x="250" y="268" width="180" height="64" rx="11" />
		<text class="node-title sm" x="340" y="292">portfolio</text>
		<text class="node-sub" x="340" y="314">SvelteKit → nginx:80</text>
	</g>

	<!-- discord bot container -->
	<g class="node app" style="--d: 0.28s">
		<rect x="570" y="268" width="180" height="64" rx="11" />
		<text class="node-title sm" x="660" y="292">mydiscordbot</text>
		<text class="node-sub" x="660" y="314">Python · OTel traces</text>
	</g>

	<!-- monitoring stack -->
	<g class="node stack" style="--d: 0.4s">
		<rect x="320" y="420" width="360" height="76" rx="12" />
		<text class="node-title" x="500" y="450">monitoring stack</text>
		<text class="node-sub" x="500" y="474">Prometheus · Grafana · Loki · Tempo</text>
	</g>

	<!-- status-exporter sidecar -->
	<g class="node sidecar" style="--d: 0.5s">
		<rect x="92" y="440" width="154" height="60" rx="11" />
		<text class="node-title sm" x="169" y="464">status-exporter</text>
		<text class="node-sub" x="169" y="485">→ status.json</text>
	</g>

	<!-- jenkins -->
	<g class="node jenkins" style="--d: 0.5s">
		<rect x="754" y="440" width="154" height="60" rx="11" />
		<text class="node-title sm" x="831" y="464">Jenkins</text>
		<text class="node-sub" x="831" y="485">deploy on main</text>
	</g>
</svg>

<style>
	.arch {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	/* ---- network rails: the contracts the repos attach to ---- */
	.rail line {
		stroke-width: 1.5;
		stroke-dasharray: 2 6;
		stroke-linecap: round;
	}
	.rail-a line {
		stroke: color-mix(in srgb, var(--cyan) 55%, var(--line));
	}
	.rail-b line {
		stroke: color-mix(in srgb, var(--green) 50%, var(--line));
	}
	.rail-label {
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.08em;
		fill: color-mix(in srgb, var(--cyan) 70%, var(--fg-faint));
	}
	.rail-label-b {
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
	.edge.return {
		stroke: color-mix(in srgb, var(--cyan) 45%, #2a3a4f);
	}
	.edge.deploy {
		stroke: color-mix(in srgb, var(--amber) 40%, #2a3a4f);
	}

	/* ---- flowing packets on the public request path ---- */
	.packet {
		fill: var(--cyan);
		offset-rotate: 0deg;
		animation-name: flow;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
		filter: drop-shadow(0 0 5px var(--cyan));
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

	/* nginx is the entry point — cyan edge */
	.nginx rect {
		stroke: color-mix(in srgb, var(--cyan) 55%, var(--line));
		fill: #131d2b;
	}
	/* monitoring stack reads on the green plane */
	.stack rect {
		stroke: color-mix(in srgb, var(--green) 45%, var(--line));
	}
	.sidecar rect,
	.jenkins rect {
		fill: var(--bg-1);
	}

	/* visitors ping */
	.ping {
		fill: var(--green);
		transform-box: fill-box;
		transform-origin: center;
	}

	/* entrance — only when motion is welcome; default state is fully visible */
	@media (prefers-reduced-motion: no-preference) {
		.node,
		.edges path,
		.rail {
			opacity: 0;
			animation: rise 0.7s var(--ease) forwards;
			animation-delay: var(--d, 0.12s);
		}
		.edges path,
		.rail {
			animation-delay: 0.1s;
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
