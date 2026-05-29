<script lang="ts">
	type Stage = { id: string; label: string; x: number };
	type Project = { id: string; label: string; sub: string; x: number; href?: string };
	type Edge = { id: string; d: string; dur: number; delay: number };

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
	const projects: Project[] = [
		{
			id: 'discord',
			label: 'discord-bot',
			sub: 'full observability',
			x: 250,
			href: 'https://github.com/Yoram-Izilov/discord-py'
		},
		{ id: 'nitzanim', label: 'nitzanim', sub: 'EKS status platform', x: 500 },
		{
			id: 'site',
			label: 'this-site',
			sub: "you're in it",
			x: 750,
			href: 'https://github.com/Yoram-Izilov/portfolio'
		}
	];

	const edges: Edge[] = [
		{ id: 'e1', d: 'M170,80 L260,80', dur: 1.5, delay: 0 },
		{ id: 'e2', d: 'M380,80 L470,80', dur: 1.5, delay: 0.5 },
		{ id: 'e3', d: 'M590,80 L680,80', dur: 1.5, delay: 1.0 },
		{ id: 'e4', d: 'M800,80 L860,80', dur: 1.2, delay: 1.5 },
		{ id: 'e5', d: 'M740,103 C740,180 600,205 545,254', dur: 2.4, delay: 0.3 },
		{ id: 'p1', d: 'M448,346 C448,405 250,392 250,441', dur: 2.6, delay: 0.2 },
		{ id: 'p2', d: 'M500,346 L500,441', dur: 2.2, delay: 0.9 },
		{ id: 'p3', d: 'M552,346 C552,405 750,392 750,441', dur: 2.6, delay: 1.4 }
	];
</script>

<svg
	class="graph"
	viewBox="0 0 1000 540"
	role="img"
	aria-labelledby="graph-title graph-desc"
	preserveAspectRatio="xMidYMid meet"
>
	<title id="graph-title">Yoram Izilov's delivery pipeline</title>
	<desc id="graph-desc">
		An infrastructure diagram: a CI/CD pipeline runs commit, build, test and deploy into a live
		endpoint and a control plane operated by Yoram, which branches to three projects — a Discord bot
		with full observability, the Nitzanim EKS status platform, and this site.
	</desc>

	<!-- edges -->
	{#each edges as e (e.id)}
		<path class="edge" d={e.d} />
	{/each}

	<!-- flowing packets -->
	{#each edges as e (e.id)}
		<circle
			class="packet"
			r="3.5"
			style="offset-path: path('{e.d}'); animation-duration: {e.dur}s; animation-delay: {e.delay}s;"
		/>
	{/each}

	<!-- pipeline stages -->
	{#each stages as s, i (s.id)}
		<g class="node stage" style="--d: {i * 0.07}s">
			<rect x={s.x - stageW / 2} y={stageY - stageH / 2} width={stageW} height={stageH} rx="9" />
			<text class="label" x={s.x} y={stageY}>{s.label}</text>
		</g>
	{/each}

	<!-- LIVE endpoint -->
	<g class="node live" style="--d: 0.35s">
		<circle class="live-pulse" cx={live.x - 34} cy={live.y} r="7" />
		<rect x={live.x - live.w / 2} y={live.y - live.h / 2} width={live.w} height={live.h} rx="23" />
		<circle class="live-dot" cx={live.x - 34} cy={live.y} r="5" />
		<text class="label live-label" x={live.x + 10} y={live.y}>LIVE</text>
	</g>

	<!-- control plane hub -->
	<g class="node hub" style="--d: 0.45s">
		<rect x={hub.x - hub.w / 2} y={hub.y - hub.h / 2} width={hub.w} height={hub.h} rx="14" />
		<text class="hub-title" x={hub.x} y={hub.y - 8}>YORAM IZILOV</text>
		<text class="hub-sub" x={hub.x} y={hub.y + 20}>control-plane</text>
	</g>

	<!-- project nodes -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -- external repo links; resolve() is for internal SvelteKit routes -->
	{#each projects as p, i (p.id)}
		{#if p.href}
			<a
				href={p.href}
				target="_blank"
				rel="noopener noreferrer"
				class="node project"
				style="--d: {0.6 + i * 0.08}s"
			>
				<rect x={p.x - projW / 2} y={projY - projH / 2} width={projW} height={projH} rx="11" />
				<text class="proj-label" x={p.x} y={projY - 6}>{p.label}</text>
				<text class="proj-sub" x={p.x} y={projY + 14}>{p.sub}</text>
			</a>
		{:else}
			<g class="node project" style="--d: {0.6 + i * 0.08}s">
				<rect x={p.x - projW / 2} y={projY - projH / 2} width={projW} height={projH} rx="11" />
				<text class="proj-label" x={p.x} y={projY - 6}>{p.label}</text>
				<text class="proj-sub" x={p.x} y={projY + 14}>{p.sub}</text>
			</g>
		{/if}
	{/each}
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
</svg>

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

	.stage .label {
		fill: var(--fg-dim);
	}

	/* LIVE */
	.live rect {
		fill: rgba(70, 209, 126, 0.1);
		stroke: var(--green);
	}
	.live-label {
		fill: var(--green);
		font-weight: 600;
		letter-spacing: 0.08em;
	}
	.live-dot {
		fill: var(--green);
	}
	.live-pulse {
		fill: var(--green);
		transform-box: fill-box;
		transform-origin: center;
		animation: pulse 2.4s ease-out infinite;
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

	/* hub */
	.hub rect {
		fill: var(--bg-1);
		stroke: var(--cyan);
		stroke-width: 1.8;
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
		fill: var(--cyan);
		font-family: var(--font-mono);
		font-size: 13px;
		text-anchor: middle;
		dominant-baseline: middle;
		letter-spacing: 0.18em;
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
	a.project {
		cursor: pointer;
	}
	a.project:hover rect,
	a.project:focus-visible rect {
		stroke: var(--cyan);
		fill: #182433;
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
		.packet {
			animation: none;
			offset-distance: 50%;
			opacity: 0.5;
		}
		.live-pulse {
			display: none;
		}
	}
</style>
