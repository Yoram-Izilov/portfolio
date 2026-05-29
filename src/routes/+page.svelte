<script lang="ts">
	import { onMount } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import PipelineGraph from '$lib/components/PipelineGraph.svelte';
	import ProjectPanel from '$lib/components/ProjectPanel.svelte';
	import ApproachPipeline from '$lib/components/ApproachPipeline.svelte';
	import { projects } from '$lib/data/projects';

	let selectedId = $state<string | null>(null);
	let originRect = $state<DOMRect | null>(null);

	// 0..1 — drives the hero pipeline's scroll-run illumination.
	// Starts dormant; reduced-motion / no-JS fall back to fully lit (see onMount).
	let progress = $state(0);
	let heroEl: HTMLElement;

	// The hero's ScrollTrigger pin handle. Hoisted to component scope so it can be torn
	// down in beforeNavigate (below) — killing it only in onMount's destroy cleanup runs
	// too late on a client-side navigation: GSAP's pin-spacer is left orphaned at the top
	// of the page, pushing the next route's content below the fold ("stays on top" bug).
	let st: { kill: () => void } | undefined;

	// Remove the pin-spacer while the hero is still mounted, before SvelteKit swaps the DOM.
	beforeNavigate(() => {
		st?.kill();
		st = undefined;
	});

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

		let onLoad: (() => void) | undefined;
		let cancelled = false;

		import('gsap').then(async ({ gsap }) => {
			const { ScrollTrigger } = await import('gsap/ScrollTrigger');
			if (cancelled || !heroEl) return;
			gsap.registerPlugin(ScrollTrigger);
			st = ScrollTrigger.create({
				trigger: heroEl,
				start: 'top top',
				end: '+=120%',
				pin: true,
				pinSpacing: true,
				scrub: 0.5,
				onUpdate: (self: { progress: number }) => (progress = self.progress)
			});
			// fonts/late layout can shift pin math — recalc once everything has loaded
			onLoad = () => ScrollTrigger.refresh();
			window.addEventListener('load', onLoad);
		});

		return () => {
			cancelled = true;
			if (onLoad) window.removeEventListener('load', onLoad);
			st?.kill();
		};
	});
</script>

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
				scroll to run the pipeline · click a project node to drill in
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

	/* blueprint grid */
	.hero::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(var(--grid) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid) 1px, transparent 1px);
		background-size: 44px 44px;
		-webkit-mask-image: radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 80%);
		mask-image: radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 80%);
		pointer-events: none;
	}

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
</style>
