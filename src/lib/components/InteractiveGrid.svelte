<script lang="ts">
	import { onMount } from 'svelte';

	let root: HTMLDivElement;

	onMount(() => {
		// Static grid only when motion is reduced or there's no fine pointer (touch).
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
		if (reduced || !fineHover) return;

		// Target = cursor; current = the lagging glow position that eases toward it.
		let tx = -1000;
		let ty = -1000;
		let cx = -1000;
		let cy = -1000;
		let frame = 0;
		let lit = false;
		const EASE = 0.14; // lower = longer, lazier trail

		const tick = () => {
			cx += (tx - cx) * EASE;
			cy += (ty - cy) * EASE;
			root.style.setProperty('--mx', `${cx}px`);
			root.style.setProperty('--my', `${cy}px`);
			// Settled on the cursor — stop the loop until the next move.
			if (Math.abs(tx - cx) < 0.5 && Math.abs(ty - cy) < 0.5) {
				frame = 0;
				return;
			}
			frame = requestAnimationFrame(tick);
		};

		const onMove = (e: PointerEvent) => {
			tx = e.clientX;
			ty = e.clientY;
			if (!lit) {
				lit = true;
				cx = tx; // snap on first appearance so it doesn't streak from a corner
				cy = ty;
				root.style.setProperty('--glow-o', '1');
			}
			if (!frame) frame = requestAnimationFrame(tick);
		};

		const onLeave = () => {
			lit = false;
			root.style.setProperty('--glow-o', '0');
		};

		window.addEventListener('pointermove', onMove, { passive: true });
		document.addEventListener('pointerleave', onLeave);
		window.addEventListener('blur', onLeave);

		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('pointermove', onMove);
			document.removeEventListener('pointerleave', onLeave);
			window.removeEventListener('blur', onLeave);
		};
	});
</script>

<div class="grid-bg" bind:this={root} aria-hidden="true"></div>

<style>
	.grid-bg {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
	}

	/* base blueprint grid — always visible, faded at the viewport edges */
	.grid-bg::before,
	.grid-bg::after {
		content: '';
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(var(--grid) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid) 1px, transparent 1px);
		background-size: 44px 44px;
		-webkit-mask-image: radial-gradient(130% 110% at 50% 0%, #000 35%, transparent 85%);
		mask-image: radial-gradient(130% 110% at 50% 0%, #000 35%, transparent 85%);
	}

	/* glow grid — same lines, brighter, revealed only near the cursor */
	.grid-bg::after {
		background-image:
			linear-gradient(rgba(79, 227, 212, 0.35) 1px, transparent 1px),
			linear-gradient(90deg, rgba(79, 227, 212, 0.35) 1px, transparent 1px);
		opacity: var(--glow-o, 0);
		transition: opacity 0.4s var(--ease);
		-webkit-mask-image: radial-gradient(
			circle var(--glow-r, 150px) at var(--mx, -1000px) var(--my, -1000px),
			#000 0%,
			transparent 70%
		);
		mask-image: radial-gradient(
			circle var(--glow-r, 150px) at var(--mx, -1000px) var(--my, -1000px),
			#000 0%,
			transparent 70%
		);
	}
</style>
