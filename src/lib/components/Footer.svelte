<script lang="ts">
	const year = new Date().getFullYear();
</script>

<footer class="site-footer mono">
	<div class="footer-inner">
		<p class="sig">
			<span class="dot" aria-hidden="true"></span>
			© {year} Yoram Izilov
		</p>

		<nav class="endpoints" aria-label="Contact">
			<span class="label" aria-hidden="true">ENDPOINTS</span>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- mailto -->
			<a href="mailto:izilovy@gmail.com">email</a>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external -->
			<a href="https://github.com/yoram-izilov" target="_blank" rel="noopener noreferrer">
				github<span class="ext" aria-hidden="true">↗</span>
			</a>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external -->
			<a href="https://www.linkedin.com/in/yoram-izilov" target="_blank" rel="noopener noreferrer">
				linkedin<span class="ext" aria-hidden="true">↗</span>
			</a>
		</nav>
	</div>
</footer>

<style>
	.site-footer {
		border-top: 1px solid var(--line);
		background: color-mix(in srgb, var(--bg-1) 70%, transparent);
		padding: clamp(1rem, 3vw, 1.4rem) clamp(1.25rem, 5vw, 3rem);
		font-size: 0.74rem;
	}

	.footer-inner {
		max-width: var(--maxw);
		margin-inline: auto;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.9rem 1.5rem;
	}

	.sig {
		display: inline-flex;
		align-items: center;
		gap: 0.55em;
		color: var(--fg-faint);
		letter-spacing: 0.04em;
	}
	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--green);
		box-shadow: 0 0 7px var(--green);
	}

	.endpoints {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem 1.1rem;
	}
	.label {
		color: var(--fg-faint);
		letter-spacing: 0.18em;
		opacity: 0.7;
	}
	.endpoints a {
		display: inline-flex;
		align-items: center;
		gap: 0.25em;
		color: var(--fg-dim);
		letter-spacing: 0.02em;
		transition: color 0.15s ease;
	}
	.endpoints a:hover,
	.endpoints a:focus-visible {
		color: var(--cyan);
	}
	.ext {
		font-size: 0.85em;
		opacity: 0.7;
	}
</style>
