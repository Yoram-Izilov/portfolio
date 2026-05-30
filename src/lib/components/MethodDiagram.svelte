<script lang="ts">
	// The disciplined build loop, in the same visual idiom as BotDiagram /
	// ArchitectureDiagram: dark nodes, mono labels, animated packets.
	//
	// The build path runs top-down on the left spine
	// (plan mode → orchestrator → build → branch + PR → main / live). Cyan packets
	// ride that spine. The orchestrator fans work out to a bordered "agent team"
	// panel of five specialists; the work then has to clear a bordered
	// "quality contract" panel before it can land. Amber packets ride every
	// review / gate edge - including the dashed "fail → fix" loop that sends a
	// failed gate back to build. The two enforcement points are deliberate:
	// the blocking quality-gate hook fires locally on every edit; CI re-runs the
	// same three checks on the PR.
	//
	// Deliberately free of real prompts / tokens - curated surface only.

	// One packet per edge. Cyan rides the build spine; amber rides every
	// delegation / review / gate edge. Staggered delays read as a wave - plan in,
	// agents out, gates close - before settling into ambient flow.
	const flow: { id: string; d: string; dur: number; delay: number; gate?: boolean }[] = [
		// build spine (cyan)
		{ id: 'b1', d: 'M220,68 L220,104', dur: 1.4, delay: 0 }, // plan → orchestrator
		{ id: 'b2', d: 'M220,166 L220,206', dur: 1.5, delay: 1.4 }, // orchestrator → build
		{ id: 'b3', d: 'M220,264 L220,306', dur: 1.5, delay: 3.0 }, // build → PR
		{ id: 'b4', d: 'M220,358 L220,402', dur: 1.5, delay: 4.6 }, // PR → main / live
		// delegation + review + gates (amber)
		{ id: 'g1', d: 'M354,140 C396,140 410,156 430,156', dur: 1.6, delay: 0.8, gate: true }, // orchestrator → agents
		{ id: 'g2', d: 'M320,238 C380,250 410,344 452,358', dur: 1.8, delay: 2.2, gate: true }, // build → quality-gate
		{ id: 'g3', d: 'M310,334 C440,360 580,392 700,388', dur: 2.4, delay: 3.4, gate: true }, // PR → CI
		{ id: 'gf', d: 'M452,372 C384,342 356,292 322,250', dur: 2.0, delay: 5.4, gate: true } // gate fail → build
	];
</script>

<svg
	class="arch"
	viewBox="0 0 1000 500"
	role="img"
	aria-labelledby="method-title method-desc"
	preserveAspectRatio="xMidYMid meet"
>
	<title id="method-title">how this site is built with Claude</title>
	<desc id="method-desc">
		The build runs top-down on the left: plan mode produces an approved plan before any edit, an
		orchestrator agent owns the sequencing and delegates to five specialists (frontend-engineer,
		content-strategist, design-critic, qa-engineer, a11y-perf), the work is built and reviewed, then
		opened as a branch and pull request, then merged to main and shipped live. Before work can land
		it must clear a quality contract: a blocking quality-gate hook runs lint, typecheck and build
		after every edit, a non-blocking no-generic-ai hook flags an off-the-shelf AI look, and CI
		re-runs the same three checks on every pull request. A failed gate loops back to build.
	</desc>

	<!-- ===== agent team panel ===== -->
	<g class="panel" style="--d: 0.4s">
		<rect x="430" y="92" width="520" height="176" rx="16" />
		<text class="panel-label" x="452" y="116">agent team - delegate &amp; argue</text>
	</g>

	<!-- ===== quality contract panel ===== -->
	<g class="panel gate" style="--d: 0.55s">
		<rect x="430" y="300" width="520" height="172" rx="16" />
		<text class="panel-label gate" x="452" y="324">quality contract - must pass to land</text>
	</g>

	<!-- ===== structural edges ===== -->
	<g class="edges">
		<!-- build spine -->
		<path class="edge" d="M220,68 L220,104" style="--d: 0.2s" />
		<path class="edge" d="M220,166 L220,206" style="--d: 0.5s" />
		<path class="edge" d="M220,264 L220,306" style="--d: 0.8s" />
		<path class="edge" d="M220,358 L220,402" style="--d: 1.05s" />
		<!-- delegation + gates -->
		<path class="edge dashed gate" d="M354,140 C396,140 410,156 430,156" style="--d: 0.65s" />
		<path class="edge dashed gate" d="M320,238 C380,250 410,344 452,358" style="--d: 0.95s" />
		<path class="edge dashed gate" d="M310,334 C440,360 580,392 700,388" style="--d: 1.2s" />
		<!-- fail → fix loop -->
		<path class="edge dashed gate fail" d="M452,372 C384,342 356,292 322,250" style="--d: 1.4s" />
	</g>

	<!-- ===== flowing packets ===== -->
	<g class="packets">
		{#each flow as f (f.id)}
			<circle
				class="packet"
				class:gate={f.gate}
				r="3.5"
				style="offset-path: path('{f.d}'); animation-duration: {f.dur}s; animation-delay: {f.delay}s;"
			/>
		{/each}
	</g>

	<!-- ===== left spine: the build path ===== -->
	<!-- plan mode (entry) -->
	<g class="node edge-node" style="--d: 0s">
		<rect x="140" y="24" width="160" height="44" rx="22" />
		<circle class="ping" cx="172" cy="46" r="5" />
		<text class="label" x="222" y="47">plan mode</text>
	</g>

	<!-- orchestrator -->
	<g class="node entry" style="--d: 0.25s">
		<rect x="86" y="104" width="268" height="62" rx="12" />
		<text class="node-title" x="220" y="128">orchestrator</text>
		<text class="node-sub" x="220" y="150">owns plan · sequences · checks in</text>
	</g>

	<!-- build & review -->
	<g class="node app" style="--d: 0.7s">
		<rect x="120" y="206" width="200" height="58" rx="11" />
		<text class="node-title sm" x="220" y="230">build &amp; review</text>
		<text class="node-sub" x="220" y="250">edit · review · iterate</text>
	</g>

	<!-- branch + PR -->
	<g class="node app" style="--d: 1.0s">
		<rect x="120" y="306" width="200" height="52" rx="11" />
		<text class="node-title sm" x="220" y="328">branch + PR</text>
		<text class="node-sub" x="220" y="346">never push to main</text>
	</g>

	<!-- main / live -->
	<g class="node ship" style="--d: 1.25s">
		<rect x="120" y="402" width="200" height="58" rx="11" />
		<text class="node-title sm" x="220" y="426">main / live</text>
		<text class="node-sub" x="220" y="446">prerendered · shipped</text>
	</g>

	<!-- plan-mode note on the spine -->
	<text class="edge-note" x="236" y="92">approved plan first</text>

	<!-- ===== agents (inside the agent panel) ===== -->
	<g class="node agent" style="--d: 0.6s">
		<rect x="452" y="128" width="150" height="44" rx="10" />
		<text class="agent-label" x="527" y="151">frontend-engineer</text>
	</g>
	<g class="node agent" style="--d: 0.72s">
		<rect x="620" y="128" width="150" height="44" rx="10" />
		<text class="agent-label" x="695" y="151">content-strategist</text>
	</g>
	<g class="node agent critic" style="--d: 0.84s">
		<rect x="788" y="128" width="150" height="44" rx="10" />
		<text class="agent-label" x="863" y="151">design-critic</text>
	</g>
	<g class="node agent critic" style="--d: 0.96s">
		<rect x="536" y="200" width="150" height="44" rx="10" />
		<text class="agent-label" x="611" y="223">qa-engineer</text>
	</g>
	<g class="node agent" style="--d: 1.08s">
		<rect x="704" y="200" width="150" height="44" rx="10" />
		<text class="agent-label" x="779" y="223">a11y-perf</text>
	</g>

	<!-- ===== gates (inside the quality-contract panel) ===== -->
	<!-- quality-gate.sh: blocking -->
	<g class="node gate-node blocking" style="--d: 0.7s">
		<rect x="452" y="336" width="214" height="56" rx="11" />
		<text class="node-title sm" x="559" y="358">quality-gate.sh</text>
		<text class="node-sub" x="559" y="378">BLOCKING · lint type build</text>
	</g>
	<!-- no-generic-ai.sh: nudge -->
	<g class="node gate-node" style="--d: 0.85s">
		<rect x="452" y="404" width="214" height="50" rx="11" />
		<text class="node-title sm" x="559" y="425">no-generic-ai.sh</text>
		<text class="node-sub" x="559" y="443">nudge · flags the AI look</text>
	</g>
	<!-- CI -->
	<g class="node gate-node ci" style="--d: 1.0s">
		<rect x="700" y="356" width="226" height="80" rx="11" />
		<text class="node-title sm" x="813" y="386">CI on PR</text>
		<text class="node-sub" x="813" y="408">same three checks, again</text>
	</g>

	<!-- fail loop note -->
	<text class="edge-note fail" x="338" y="300">fail → fix</text>
</svg>

<style>
	.arch {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	/* ---- bordered panels ---- */
	.panel rect {
		fill: color-mix(in srgb, var(--cyan) 4%, transparent);
		stroke: color-mix(in srgb, var(--cyan) 30%, var(--line));
		stroke-width: 1.5;
		stroke-dasharray: 3 7;
		stroke-linecap: round;
	}
	.panel.gate rect {
		fill: color-mix(in srgb, var(--amber) 5%, transparent);
		stroke: color-mix(in srgb, var(--amber) 35%, var(--line));
	}
	.panel-label {
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.08em;
		fill: color-mix(in srgb, var(--cyan) 70%, var(--fg-faint));
	}
	.panel-label.gate {
		fill: color-mix(in srgb, var(--amber) 70%, var(--fg-faint));
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
	.edge.gate {
		stroke: color-mix(in srgb, var(--amber) 45%, #2a3a4f);
	}
	.edge.fail {
		stroke-dasharray: 2 6;
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
	.packet.gate {
		fill: var(--amber);
		filter: drop-shadow(0 0 5px var(--amber));
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
	.agent-label {
		fill: var(--fg-dim);
		font-family: var(--font-mono);
		font-size: 12.5px;
		text-anchor: middle;
		dominant-baseline: middle;
	}
	.edge-note {
		fill: color-mix(in srgb, var(--cyan) 70%, var(--fg-faint));
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.04em;
	}
	.edge-note.fail {
		fill: color-mix(in srgb, var(--amber) 75%, var(--fg-faint));
	}

	/* orchestrator is the entry point - cyan edge */
	.entry rect {
		stroke: color-mix(in srgb, var(--cyan) 55%, var(--line));
		fill: #131d2b;
	}
	/* agents sit on a neutral plane; the two reviewers carry an amber edge */
	.agent rect {
		fill: var(--bg-1);
	}
	.agent.critic rect {
		stroke: color-mix(in srgb, var(--amber) 45%, var(--line));
	}
	/* gate nodes sit on the amber plane; the blocking one is the loudest (red) */
	.gate-node rect {
		fill: var(--bg-1);
		stroke: color-mix(in srgb, var(--amber) 40%, var(--line));
	}
	.gate-node.blocking rect {
		stroke: color-mix(in srgb, var(--red) 55%, var(--line));
		fill: #20151a;
	}
	.gate-node.blocking .node-sub {
		fill: color-mix(in srgb, var(--red) 60%, var(--fg-faint));
	}
	/* main / live is the ship target - brighter green */
	.ship rect {
		stroke: color-mix(in srgb, var(--green) 60%, var(--line));
		fill: #10201a;
	}

	/* plan-mode ping */
	.ping {
		fill: var(--cyan);
		transform-box: fill-box;
		transform-origin: center;
	}

	/* entrance - only when motion is welcome; default state is fully visible.
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
