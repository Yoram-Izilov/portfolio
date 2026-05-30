<script lang="ts">
	import { onMount } from 'svelte';
	import InteractiveGrid from '$lib/components/InteractiveGrid.svelte';
	import PipelineGraph from '$lib/components/PipelineGraph.svelte';
	import ProjectPanel from '$lib/components/ProjectPanel.svelte';
	import ApproachPipeline from '$lib/components/ApproachPipeline.svelte';
	import { projects } from '$lib/data/projects';

	let selectedId = $state<string | null>(null);
	let originRect = $state<DOMRect | null>(null);

	// 0..1 — drives the hero pipeline's light-up illumination.
	// Starts dormant; tweened to 1 on mount (see onMount). Reduced-motion / no-JS
	// fall back to fully lit.
	let progress = $state(0);
	let heroEl: HTMLElement;

	// The hero light-up tween, hoisted so onMount's cleanup can kill it.
	let tween: { kill: () => void } | undefined;

	const selected = $derived(projects.find((p) => p.id === selectedId) ?? null);

	// Live status badge — hydrated from /status.json (written by the status-exporter
	// sidecar from the monitoring stack). Stays null during prerender / no-JS, so the
	// markup below renders the static green "OPERATIONAL" fallback untouched.
	type SiteStatus = {
		status: 'operational' | 'degraded' | 'down';
		uptime_7d: number | null;
		unique_visitors_7d: number | null;
		generated_at: string;
	};

	let live = $state<SiteStatus | null>(null);

	// The sidecar polls every ~5min; treat data older than 2x that as stale (degraded).
	const STALE_MS = 15 * 60 * 1000;

	const degraded = $derived(
		!!live &&
			(live.status !== 'operational' ||
				Date.now() - new Date(live.generated_at).getTime() > STALE_MS)
	);
	const visitors = $derived(live?.unique_visitors_7d ?? null);

	function handleSelect(id: string, el: Element) {
		originRect = el.getBoundingClientRect();
		selectedId = id;
	}

	function handleClose() {
		selectedId = null;
	}

	onMount(() => {
		// Hydrate the live status badge — independent of the motion setup below, and
		// placed before the reduced-motion early-return so it always runs.
		fetch('/status.json', { cache: 'no-store' })
			.then((r) => (r.ok ? r.json() : null))
			.then((d: SiteStatus | null) => {
				if (d) live = d;
			})
			.catch(() => {
				/* network/parse error — leave the static OPERATIONAL fallback in place */
			});

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			progress = 1;
			return;
		}

		let cancelled = false;

		// Light up the pipeline as a staggered entrance on load — no scroll, no pin.
		// The tween ramps `progress` 0→1; PipelineGraph's per-stage thresholds
		// (0/0.15/0.30/0.45 → 0.62 → 0.76) turn that even ramp into a commit→…→hub cascade.
		import('gsap').then(({ gsap }) => {
			if (cancelled || !heroEl) return;
			const o = { p: 0 };
			tween = gsap.to(o, {
				p: 1,
				duration: 2.1, // total light-up time
				delay: 0.25, // let the node/edge entrance draw first
				ease: 'none', // even cadence; the thresholds supply the stagger
				onUpdate: () => (progress = o.p)
			});
		});

		return () => {
			cancelled = true;
			tween?.kill();
		};
	});
</script>

<InteractiveGrid />

<main class="hero" bind:this={heroEl}>
	<div class="hero-inner">
		<header class="intro">
			<div class="badges">
				<p class="status mono" class:degraded>
					<span class="dot" aria-hidden="true"></span>{degraded ? 'DEGRADED' : 'OPERATIONAL'}
				</p>
				{#if visitors != null}
					<p class="status visitors mono">
						<span class="dot" aria-hidden="true"></span>{visitors.toLocaleString()} unique visitors ·
						7d
					</p>
				{/if}
			</div>
			<p class="eyebrow mono">DevOps Engineer</p>
			<h1>Yoram Izilov</h1>
			<p class="tagline">
				I build production infrastructure on <strong>AWS</strong> and <strong>Kubernetes</strong> — the
				observability and CI/CD that keep it boring. Instrumented before it breaks.
			</p>
		</header>

		<figure class="graph-wrap">
			<PipelineGraph onSelect={handleSelect} activeId={selectedId} {progress} />
			<figcaption class="caption mono">
				the pipeline that ships this site<span class="drill-hint"> · click a node to drill in</span>
			</figcaption>
		</figure>
	</div>
</main>

<ApproachPipeline />

<ProjectPanel project={selected} {originRect} onClose={handleClose} />

<style>
	.hero {
		position: relative;
		min-height: 100svh;
		display: flex;
		align-items: center;
		overflow: hidden;
		padding: clamp(2rem, 5vw, 4rem) clamp(1.25rem, 5vw, 3rem);
	}

	/* blueprint grid is now provided site-wide by InteractiveGrid (mounted in
	   +layout.svelte); the hero-local grid was removed to avoid doubled, drifting
	   lines against the fixed global grid on scroll. */

	.hero-inner {
		position: relative;
		width: 100%;
		max-width: var(--maxw);
		margin-inline: auto;
		display: flex;
		flex-direction: column;
		gap: clamp(1.75rem, 5vh, 3.5rem);
	}

	.intro {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		max-width: 52ch;
	}

	.status {
		display: inline-flex;
		align-items: center;
		gap: 0.55em;
		align-self: flex-start;
		color: var(--green);
		font-size: 0.75rem;
		letter-spacing: 0.16em;
		padding: 0.3em 0.7em;
		border: 1px solid color-mix(in srgb, var(--green) 35%, transparent);
		border-radius: 999px;
		background: color-mix(in srgb, var(--green) 8%, transparent);
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--green);
		box-shadow: 0 0 8px var(--green);
	}

	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-self: flex-start;
	}

	/* Degraded / stale health — amber, so green stays meaningful as "healthy". */
	.status.degraded {
		color: var(--amber);
		border-color: color-mix(in srgb, var(--amber) 35%, transparent);
		background: color-mix(in srgb, var(--amber) 8%, transparent);
	}
	.status.degraded .dot {
		background: var(--amber);
		box-shadow: 0 0 8px var(--amber);
	}

	/* Visitor count — understated cyan, distinct from the health badge. */
	.visitors {
		color: var(--fg-dim);
		border-color: color-mix(in srgb, var(--cyan) 30%, transparent);
		background: color-mix(in srgb, var(--cyan) 6%, transparent);
	}
	.visitors .dot {
		background: var(--cyan);
		box-shadow: 0 0 8px var(--cyan);
	}

	.eyebrow {
		color: var(--cyan);
		text-transform: uppercase;
		letter-spacing: 0.22em;
		font-size: 0.8rem;
		margin-top: 0.4rem;
	}

	h1 {
		font-size: clamp(2.75rem, 9vw, 6.5rem);
		font-weight: 600;
		line-height: 0.95;
		letter-spacing: -0.02em;
	}

	.tagline {
		color: var(--fg-dim);
		font-size: clamp(1rem, 2.2vw, 1.3rem);
		line-height: 1.55;
		max-width: 48ch;
	}
	.tagline strong {
		color: var(--fg);
		font-weight: 600;
	}

	.graph-wrap {
		margin: 0;
		width: 100%;
		max-width: 1000px;
		align-self: center;
	}
	.caption {
		margin-top: 0.85rem;
		text-align: center;
		color: var(--fg-faint);
		font-size: 0.72rem;
		letter-spacing: 0.04em;
	}

	@media (min-width: 980px) {
		.caption {
			text-align: right;
		}
	}

	@media (max-width: 720px) {
		.drill-hint {
			display: none;
		}
	}
</style>
