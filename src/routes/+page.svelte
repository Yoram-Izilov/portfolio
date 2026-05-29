<script lang="ts">
	import PipelineGraph from '$lib/components/PipelineGraph.svelte';
	import ProjectPanel from '$lib/components/ProjectPanel.svelte';
	import { projects } from '$lib/data/projects';

	let selectedId = $state<string | null>(null);
	let originRect = $state<DOMRect | null>(null);

	const selected = $derived(projects.find((p) => p.id === selectedId) ?? null);

	function handleSelect(id: string, el: Element) {
		originRect = el.getBoundingClientRect();
		selectedId = id;
	}

	function handleClose() {
		selectedId = null;
	}
</script>

<main class="hero">
	<div class="hero-inner">
		<header class="intro">
			<p class="status mono"><span class="dot" aria-hidden="true"></span>OPERATIONAL</p>
			<p class="eyebrow mono">DevOps Engineer</p>
			<h1>Yoram Izilov</h1>
			<p class="tagline">
				I build production infrastructure on <strong>AWS</strong> and <strong>Kubernetes</strong> — the
				observability and CI/CD that keep it boring. Instrumented before it breaks.
			</p>
		</header>

		<figure class="graph-wrap">
			<PipelineGraph onSelect={handleSelect} activeId={selectedId} />
			<figcaption class="caption mono">
				click a project node to drill in — the system above is the site you're on
			</figcaption>
		</figure>
	</div>
</main>

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
