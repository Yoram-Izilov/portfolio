<script lang="ts">
	import { projects } from '$lib/data/projects';

	type Stage = { id: string; label: string; x: number };
	/** `at` = scroll progress at which this edge's packet becomes visible — matches its SOURCE
	    stage lighting up, so flow leaves a stage the moment it goes active. */
	type Edge = { id: string; d: string; dur: number; delay: number; at: number };

	let {
		onSelect,
		activeId = null,
		progress = 1
	}: {
		onSelect: (id: string, el: Element) => void;
		activeId?: string | null;
		/** 0..1 scroll progress driving the "pipeline runs as you scroll" illumination. 1 = fully lit. */
		progress?: number;
	} = $props();

	function handleKey(e: KeyboardEvent, id: string) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onSelect(id, e.currentTarget as Element);
		}
	}

	const stageY = 80;
	const stageW = 120;
	const stageH = 46;
	const stages: Stage[] = [
		{ id: 'commit', label: 'commit', x: 110 },
		{ id: 'build', label: 'build', x: 320 },
		{ id: 'test', label: 'test', x: 530 },
		{ id: 'deploy', label: 'deploy', x: 740 }
	];

	const live = { x: 920, y: stageY, w: 120, h: 46 };
	const hub = { x: 500, y: 300, w: 264, h: 92 };

	const projY = 470;
	const projW = 176;
	const projH = 58;

	const edges: Edge[] = [
		{ id: 'e1', d: 'M170,80 L260,80', dur: 1.5, delay: 0, at: 0 },
		{ id: 'e2', d: 'M380,80 L470,80', dur: 1.5, delay: 0.5, at: 0.15 },
		{ id: 'e3', d: 'M590,80 L680,80', dur: 1.5, delay: 1.0, at: 0.3 },
		{ id: 'e4', d: 'M800,80 L860,80', dur: 1.2, delay: 1.5, at: 0.45 },
		{ id: 'e5', d: 'M740,103 C740,180 600,205 545,254', dur: 2.4, delay: 0.3, at: 0.45 },
		{ id: 'p1', d: 'M448,346 C448,405 250,392 250,441', dur: 2.6, delay: 0.2, at: 0.76 },
		{ id: 'p2', d: 'M500,346 L500,441', dur: 2.2, delay: 0.9, at: 0.76 },
		{ id: 'p3', d: 'M552,346 C552,405 750,392 750,441', dur: 2.6, delay: 1.4, at: 0.76 }
	];

	// scroll-driven illumination: commit is lit by default; build/test/deploy light
	// left-to-right as you scroll, then LIVE, then the hub.
	const litStages = $derived(stages.map((_, i) => progress >= i * 0.15));
	const liveLit = $derived(progress >= 0.62);
	const hubLit = $derived(progress >= 0.76);

	// Below 720px the SVG is too small for legible labels or 44px tap targets, so it
	// becomes a decorative backdrop and the project list (below) carries the interaction.
	let isMobile = $state(false);
	$effect(() => {
		const mq = window.matchMedia('(max-width: 720px)');
		const sync = () => (isMobile = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});
</script>

<svg
	class="graph"
	class:decorative={isMobile}
	viewBox="0 0 1000 540"
	role="img"
	aria-labelledby="graph-title graph-desc"
	aria-hidden={isMobile ? 'true' : undefined}
	preserveAspectRatio="xMidYMid meet"
>
	<title id="graph-title">Yoram Izilov's delivery pipeline</title>
	<desc id="graph-desc">
		An infrastructure diagram: a CI/CD pipeline runs commit, build, test and deploy into a live
		endpoint and a control plane operated by Yoram, which branches to three projects — a Discord bot
		with full observability, the home-server infrastructure and monitoring stack, and this site.
	</desc>

	<!-- edges -->
	{#each edges as e (e.id)}
		<path class="edge" d={e.d} />
	{/each}

	<!-- flowing packets — each appears only once its segment of the pipeline is reached -->
	<g class="packets">
		{#each edges as e (e.id)}
			<circle
				class="packet"
				class:on={progress >= e.at}
				r="3.5"
				style="offset-path: path('{e.d}'); animation-duration: {e.dur}s; animation-delay: {e.delay}s;"
			/>
		{/each}
	</g>

	<!-- pipeline stages -->
	{#each stages as s, i (s.id)}
		<g class="node stage" class:lit={litStages[i]} style="--d: {i * 0.07}s">
			<rect x={s.x - stageW / 2} y={stageY - stageH / 2} width={stageW} height={stageH} rx="9" />
			<text class="label" x={s.x} y={stageY}>{s.label}</text>
		</g>
	{/each}

	<!-- LIVE endpoint -->
	<g class="node live" class:lit={liveLit} style="--d: 0.35s">
		<circle class="live-pulse" cx={live.x - 34} cy={live.y} r="7" />
		<rect x={live.x - live.w / 2} y={live.y - live.h / 2} width={live.w} height={live.h} rx="23" />
		<circle class="live-dot" cx={live.x - 34} cy={live.y} r="5" />
		<text class="label live-label" x={live.x + 10} y={live.y}>LIVE</text>
	</g>

	<!-- control plane hub -->
	<g class="node hub" class:lit={hubLit} style="--d: 0.45s">
		<rect x={hub.x - hub.w / 2} y={hub.y - hub.h / 2} width={hub.w} height={hub.h} rx="14" />
		<text class="hub-title" x={hub.x} y={hub.y - 8}>YORAM IZILOV</text>
		<text class="hub-sub" x={hub.x} y={hub.y + 20}>control-plane</text>
	</g>

	<!-- project nodes (drill-in) -->
	{#each projects as p, i (p.id)}
		<g
			class="node project"
			class:active={activeId === p.id}
			class:dimmed={activeId !== null && activeId !== p.id}
			role="button"
			tabindex={isMobile ? -1 : 0}
			aria-label="Open details for {p.label}"
			style="--d: {0.6 + i * 0.08}s"
			onclick={(e) => onSelect(p.id, e.currentTarget)}
			onkeydown={(e) => handleKey(e, p.id)}
		>
			<rect x={p.x - projW / 2} y={projY - projH / 2} width={projW} height={projH} rx="11" />
			<text class="proj-label" x={p.x} y={projY - 6}>{p.label}</text>
			<text class="proj-sub" x={p.x} y={projY + 14}>{p.sub}</text>
		</g>
	{/each}
</svg>

<!-- Mobile interaction: real ≥44px tappable targets; the SVG above is decorative ≤720px -->
<ul class="project-list" aria-label="Projects">
	{#each projects as p (p.id)}
		<li>
			<button
				type="button"
				class="project-item"
				class:active={activeId === p.id}
				onclick={(e) => onSelect(p.id, e.currentTarget)}
			>
				<span class="pi-text">
					<span class="pi-label">{p.label}</span>
					<span class="pi-sub">{p.sub}</span>
				</span>
				<span class="pi-arrow" aria-hidden="true">→</span>
			</button>
		</li>
	{/each}
</ul>

<style>
	.graph {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	.edge {
		fill: none;
		stroke: #2a3a4f;
		stroke-width: 1.5;
	}

	.packet {
		fill: var(--cyan);
		offset-rotate: 0deg;
		animation-name: flow;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
		filter: drop-shadow(0 0 5px var(--cyan));
		opacity: 0;
		transition: opacity 0.35s var(--ease);
	}
	.packet.on {
		opacity: 1;
	}

	@keyframes flow {
		from {
			offset-distance: 0%;
		}
		to {
			offset-distance: 100%;
		}
	}

	.node rect {
		fill: var(--bg-2);
		stroke: var(--line);
		stroke-width: 1.5;
	}

	.label {
		font-family: var(--font-mono);
		font-size: 17px;
		text-anchor: middle;
		dominant-baseline: middle;
	}

	/* stages: dormant by default, illuminate as scroll progress crosses each threshold */
	.stage rect {
		transition:
			stroke 0.35s var(--ease),
			fill 0.35s var(--ease);
	}
	.stage .label {
		fill: var(--fg-faint);
		transition: fill 0.35s var(--ease);
	}
	.stage.lit rect {
		stroke: color-mix(in srgb, var(--cyan) 55%, var(--line));
		fill: #131d2b;
	}
	.stage.lit .label {
		fill: var(--fg);
	}

	/* LIVE — dormant until the pipeline reaches it, then goes green and pulses */
	.live rect {
		fill: var(--bg-2);
		stroke: var(--line);
		transition:
			fill 0.4s var(--ease),
			stroke 0.4s var(--ease);
	}
	.live-label {
		fill: var(--fg-faint);
		font-weight: 600;
		letter-spacing: 0.08em;
		transition: fill 0.4s var(--ease);
	}
	.live-dot {
		fill: var(--fg-faint);
		transition: fill 0.4s var(--ease);
	}
	.live.lit rect {
		fill: rgba(70, 209, 126, 0.1);
		stroke: var(--green);
	}
	.live.lit .live-label,
	.live.lit .live-dot {
		fill: var(--green);
	}
	.live-pulse {
		fill: var(--green);
		transform-box: fill-box;
		transform-origin: center;
		display: none;
	}
	@keyframes pulse {
		0% {
			transform: scale(0.6);
			opacity: 0.7;
		}
		70% {
			opacity: 0;
		}
		100% {
			transform: scale(2.6);
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: no-preference) {
		.live.lit .live-pulse {
			display: block;
			animation: pulse 2.4s ease-out infinite;
		}
	}

	/* hub — control plane comes online once the pipeline has run */
	.hub rect {
		fill: var(--bg-1);
		stroke: var(--line);
		stroke-width: 1.8;
		transition: stroke 0.4s var(--ease);
	}
	.hub.lit rect {
		stroke: var(--cyan);
	}
	.hub-title {
		fill: var(--fg);
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 25px;
		text-anchor: middle;
		dominant-baseline: middle;
		letter-spacing: 0.01em;
	}
	.hub-sub {
		fill: var(--fg-faint);
		font-family: var(--font-mono);
		font-size: 13px;
		text-anchor: middle;
		dominant-baseline: middle;
		letter-spacing: 0.18em;
		transition: fill 0.4s var(--ease);
	}
	.hub.lit .hub-sub {
		fill: var(--cyan);
	}

	/* projects */
	.project rect {
		transition:
			stroke 0.2s ease,
			fill 0.2s ease;
	}
	.proj-label {
		fill: var(--fg);
		font-family: var(--font-mono);
		font-size: 16px;
		text-anchor: middle;
		dominant-baseline: middle;
	}
	.proj-sub {
		fill: var(--fg-faint);
		font-family: var(--font-mono);
		font-size: 11px;
		text-anchor: middle;
		dominant-baseline: middle;
	}
	.project {
		cursor: pointer;
		transition: opacity 0.25s ease;
	}
	.project:hover rect,
	.project:focus-visible rect,
	.project.active rect {
		stroke: var(--cyan);
		fill: #182433;
	}
	.project.active rect {
		stroke-width: 2;
		filter: drop-shadow(0 0 10px color-mix(in srgb, var(--cyan) 55%, transparent));
	}
	.project.dimmed {
		opacity: 0.4;
	}
	.project:focus {
		outline: none;
	}

	/* entrance — only when motion is welcome; default state is fully visible */
	@media (prefers-reduced-motion: no-preference) {
		.node,
		.edge {
			opacity: 0;
			animation: rise 0.7s var(--ease) forwards;
			animation-delay: var(--d, 0s);
		}
		.edge {
			animation-delay: 0.1s;
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

	/* respect reduced motion: freeze flow + pulse */
	@media (prefers-reduced-motion: reduce) {
		.packet,
		.packet.on {
			animation: none;
			offset-distance: 50%;
			opacity: 0.5;
			transition: none;
		}
		.live-pulse {
			display: none;
		}
	}

	/* ≤720px: the SVG is a decorative backdrop — disable the in-SVG project nodes (the
	   list below is the real interface) and bump label sizes so the diagram stays legible. */
	.graph.decorative .project {
		pointer-events: none;
		cursor: default;
	}

	/* Mobile project list: real ≥44px tappable targets, hidden on desktop. */
	.project-list {
		display: none;
	}
	@media (max-width: 720px) {
		.graph .label {
			font-size: 22px;
		}
		.graph .proj-label {
			font-size: 21px;
		}
		.graph .proj-sub {
			font-size: 15px;
		}
		.graph .hub-sub {
			font-size: 16px;
		}

		.project-list {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			list-style: none;
			margin: 1rem 0 0;
			padding: 0;
		}
	}

	.project-item {
		width: 100%;
		min-height: 48px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.7rem 0.9rem;
		background: var(--bg-2);
		border: 1px solid var(--line);
		border-radius: 11px;
		color: var(--fg);
		font-family: var(--font-mono);
		text-align: left;
		cursor: pointer;
		transition:
			border-color 0.2s ease,
			background 0.2s ease;
	}
	.project-item:hover,
	.project-item:focus-visible,
	.project-item.active {
		border-color: var(--cyan);
		background: #182433;
		outline: none;
	}
	.pi-text {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.pi-label {
		font-size: 0.95rem;
	}
	.pi-sub {
		font-size: 0.78rem;
		color: var(--fg-faint);
	}
	.pi-arrow {
		color: var(--cyan);
		font-size: 1.1rem;
	}
</style>
