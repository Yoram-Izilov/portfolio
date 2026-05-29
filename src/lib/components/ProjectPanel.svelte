<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import type { Project } from '$lib/data/projects';

	let {
		project,
		originRect = null,
		onClose
	}: {
		project: Project | null;
		originRect?: DOMRect | null;
		onClose: () => void;
	} = $props();

	let dialogEl = $state<HTMLDialogElement>();
	let panelEl = $state<HTMLDivElement>();
	let reduced = false;

	// local copy so content survives the close animation
	let current = $state<Project | null>(null);

	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	$effect(() => {
		if (project && project.id !== current?.id) {
			current = project;
			open();
		}
	});

	function open() {
		if (!dialogEl) return;
		if (!dialogEl.open) dialogEl.showModal();
		if (reduced || !panelEl) return;

		// grow from the clicked node's position
		const r = panelEl.getBoundingClientRect();
		if (originRect) {
			const ox = originRect.left + originRect.width / 2 - r.left;
			const oy = originRect.top + originRect.height / 2 - r.top;
			panelEl.style.transformOrigin = `${ox}px ${oy}px`;
		} else {
			panelEl.style.transformOrigin = 'center';
		}
		gsap.fromTo(
			panelEl,
			{ scale: 0.55, opacity: 0 },
			{ scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' }
		);
	}

	function requestClose() {
		if (reduced || !panelEl) {
			finish();
			return;
		}
		gsap.to(panelEl, {
			scale: 0.85,
			opacity: 0,
			duration: 0.22,
			ease: 'power2.in',
			onComplete: finish
		});
	}

	function finish() {
		dialogEl?.close();
		current = null;
		onClose();
	}
</script>

<dialog
	bind:this={dialogEl}
	class="panel-dialog"
	aria-labelledby="panel-title"
	oncancel={(e) => {
		e.preventDefault();
		requestClose();
	}}
	onclick={(e) => {
		if (e.target === dialogEl) requestClose();
	}}
>
	{#if current}
		<div class="panel" bind:this={panelEl}>
			<button class="close" type="button" aria-label="Close" onclick={requestClose}>
				<span aria-hidden="true">×</span>
			</button>

			<p class="node-id mono">{current.label}</p>
			<h2 id="panel-title">{current.tagline}</h2>

			<div class="meta">
				<span class="role mono">{current.role}</span>
				<ul class="stack" aria-label="Stack">
					{#each current.stack as s (s)}
						<li class="mono">{s}</li>
					{/each}
				</ul>
			</div>

			<ul class="points">
				{#each current.points as pt (pt)}
					<li>{pt}</li>
				{/each}
			</ul>

			<div class="foot">
				{#if current.repo}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external repo link -->
					<a class="repo mono" href={current.repo.href} target="_blank" rel="noopener noreferrer">
						<span class="arrow" aria-hidden="true">↗</span>
						{current.repo.label}
					</a>
				{:else if current.note}
					<p class="note mono">{current.note}</p>
				{/if}
			</div>
		</div>
	{/if}
</dialog>

<style>
	.panel-dialog {
		margin: auto;
		padding: 0;
		border: none;
		background: transparent;
		max-width: min(560px, calc(100vw - 2rem));
		width: 100%;
		color: var(--fg);
		overflow: visible;
	}
	.panel-dialog::backdrop {
		background: rgba(4, 7, 11, 0.72);
		backdrop-filter: blur(5px);
	}

	.panel {
		position: relative;
		background: var(--bg-1);
		border: 1px solid color-mix(in srgb, var(--cyan) 45%, var(--line));
		border-radius: 16px;
		padding: clamp(1.5rem, 4vw, 2.25rem);
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.4),
			0 30px 80px -20px rgba(0, 0, 0, 0.7),
			0 0 60px -20px color-mix(in srgb, var(--cyan) 40%, transparent);
		will-change: transform, opacity;
	}

	.close {
		position: absolute;
		top: 0.9rem;
		right: 0.9rem;
		width: 2rem;
		height: 2rem;
		display: grid;
		place-items: center;
		font-size: 1.5rem;
		line-height: 1;
		color: var(--fg-dim);
		background: transparent;
		border: 1px solid var(--line);
		border-radius: 8px;
		cursor: pointer;
		transition:
			color 0.15s ease,
			border-color 0.15s ease;
	}
	.close:hover,
	.close:focus-visible {
		color: var(--fg);
		border-color: var(--cyan);
	}

	.node-id {
		color: var(--cyan);
		font-size: 0.8rem;
		letter-spacing: 0.06em;
		margin: 0 0 0.5rem;
	}
	h2 {
		margin: 0 0 1.25rem;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: clamp(1.35rem, 3.5vw, 1.85rem);
		line-height: 1.15;
		letter-spacing: -0.01em;
		padding-right: 2rem;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1rem;
		margin-bottom: 1.25rem;
	}
	.role {
		color: var(--fg-dim);
		font-size: 0.78rem;
	}
	.stack {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.stack li {
		font-size: 0.72rem;
		color: var(--fg);
		padding: 0.2em 0.6em;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--bg-2);
	}

	.points {
		margin: 0 0 1.5rem;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.points li {
		position: relative;
		padding-left: 1.3rem;
		color: var(--fg-dim);
		font-size: 0.95rem;
		line-height: 1.5;
	}
	.points li::before {
		content: '▸';
		position: absolute;
		left: 0;
		color: var(--cyan);
	}

	.foot {
		border-top: 1px solid var(--line);
		padding-top: 1.1rem;
	}
	.repo {
		display: inline-flex;
		align-items: center;
		gap: 0.5em;
		font-size: 0.85rem;
		color: var(--cyan);
		transition: opacity 0.15s ease;
	}
	.repo:hover,
	.repo:focus-visible {
		opacity: 0.8;
		text-decoration: underline;
	}
	.note {
		color: var(--fg-faint);
		font-size: 0.8rem;
		margin: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.panel {
			will-change: auto;
		}
	}
</style>
