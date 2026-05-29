<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { inview } from '$lib/actions/inview';
	import ArchitectureDiagram from '$lib/components/ArchitectureDiagram.svelte';
	import { caseStudies } from '$lib/data/caseStudies';

	const cs = caseStudies['home-server'];

	const site = 'https://www.yoram-izilov.com';
	const url = `${site}/work/home-server`;

	// Live health of the very box this case study describes — hydrated from /status.json
	// (written by the status-exporter sidecar). Mirrors the homepage logic: stays null
	// during prerender / no-JS so the static fallback below renders untouched.
	type SiteStatus = {
		status: 'operational' | 'degraded' | 'down';
		uptime_7d: number | null;
		unique_visitors_7d: number | null;
		generated_at: string;
	};
	const STALE_MS = 15 * 60 * 1000;

	let live = $state<SiteStatus | null>(null);

	const stale = $derived(!!live && Date.now() - new Date(live.generated_at).getTime() > STALE_MS);
	const operational = $derived(!live || (live.status === 'operational' && !stale));
	const uptime = $derived(live?.uptime_7d ?? null);

	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'TechArticle',
		headline: cs.title,
		description: cs.summary,
		url,
		author: { '@type': 'Person', name: 'Yoram Izilov', url: site },
		about: cs.stack
	});

	onMount(() => {
		fetch('/status.json', { cache: 'no-store' })
			.then((r) => (r.ok ? r.json() : null))
			.then((d: SiteStatus | null) => {
				if (d) live = d;
			})
			.catch(() => {
				/* leave the static fallback in place */
			});
	});
</script>

<svelte:head>
	<title>{cs.title} — Yoram Izilov</title>
	<meta name="description" content={cs.summary} />
	<link rel="canonical" href={url} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={url} />
	<meta property="og:title" content="{cs.title} — Yoram Izilov" />
	<meta property="og:description" content={cs.summary} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted static JSON-LD -->
	{@html `<script type="application/ld+json">${jsonLd}</` + `script>`}
</svelte:head>

<main class="case">
	<div class="wrap">
		<!-- ===== header ===== -->
		<header class="head">
			<a class="back mono" href={resolve('/')}>
				<span class="arrow" aria-hidden="true">←</span> back
			</a>
			<p class="eyebrow mono">// case study</p>
			<h1>{cs.title}</h1>
			<p class="summary">{cs.summary}</p>

			<div class="meta">
				<span class="role mono">{cs.role}</span>
				<ul class="stack" aria-label="Stack">
					{#each cs.stack as s (s)}
						<li class="mono">{s}</li>
					{/each}
				</ul>
			</div>

			<div class="stats mono">
				<span class="stat health" class:degraded={!operational}>
					<span class="dot" aria-hidden="true"></span>{operational ? 'OPERATIONAL' : 'DEGRADED'}
				</span>
				{#if uptime != null}
					<span class="stat">{uptime.toFixed(uptime >= 99.95 ? 2 : 1)}% uptime · 7d</span>
				{/if}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external repo link -->
				<a class="repo" href={cs.repo.href} target="_blank" rel="noopener noreferrer">
					<span class="arrow" aria-hidden="true">↗</span>{cs.repo.label}
				</a>
			</div>
		</header>

		<!-- ===== problem ===== -->
		<section class="block" use:inview>
			<h2><span class="mono num">01</span> Why self-host</h2>
			<p>
				I wanted a single box I fully own — somewhere to run my own services and, more importantly,
				to practise the operational discipline I apply at work without a cloud bill metering every
				experiment. The brief I set myself: every service publicly reachable over TLS, every service
				observable before it breaks, and every deploy reproducible from a commit. No pets, no manual
				SSH-and-fix.
			</p>
			<p>
				The result is <strong>home-server</strong> — the infrastructure control repo for the box at
				<span class="mono">yoram-izilov.com</span>. It owns the monitoring stack and the host
				reverse-proxy layer; the applications living on the box (this site, a Discord bot) deploy
				themselves against the contracts it defines.
			</p>
		</section>

		<!-- ===== architecture ===== -->
		<section class="block" use:inview>
			<h2><span class="mono num">02</span> Architecture</h2>
			<p>
				Three independent git repos sit side by side on the host — the infrastructure repo, the
				Discord bot, and this site. They never import each other. What keeps them working together
				is two <strong>external Docker networks</strong>, each a deliberate contract that the
				infrastructure repo owns and the apps attach to.
			</p>

			<figure class="diagram">
				<ArchitectureDiagram />
				<figcaption class="mono">
					two networks as contracts · the public path flows top-down · telemetry and the status feed
					flow back up
				</figcaption>
			</figure>

			<p>
				<strong class="cyan">nginx_nginx_network</strong> is the public path. The host nginx reverse
				proxy terminates TLS and routes each hostname to a container <em>by name</em> —
				<span class="mono">www.yoram-izilov.com</span> resolves to the
				<span class="mono">portfolio</span> container's nginx on port 80; the apex redirects to
				<span class="mono">www</span>. A new public service just joins this network and picks a
				hostname.
			</p>
			<p>
				<strong class="green">monitoring_monitoring</strong> is the observability plane. Every container
				that needs to be watched attaches to it: the bot exports OpenTelemetry traces to Tempo, Prometheus
				scrapes exporters across it, and nginx's structured logs land in Loki. Grafana sits on top. A
				service that needs both reach and observability simply joins both networks — that is the entire
				integration surface between repos.
			</p>
		</section>

		<!-- ===== decisions ===== -->
		<section class="block" use:inview>
			<h2><span class="mono num">03</span> Decisions &amp; tradeoffs</h2>
			<ul class="decisions">
				<li>
					<span class="d-title mono">Networks as the contract.</span>
					The repos coordinate through two named networks and container names — nothing else. It's a silent
					dependency by design: rename a network and a service detaches with no error, so the names are
					treated as a frozen interface and documented as such.
				</li>
				<li>
					<span class="d-title mono">Pinned images, never <code>:latest</code>.</span>
					Every image is pinned to an explicit version tag. A redeploy pulls exactly what last passed
					CI, not whatever moved upstream overnight.
				</li>
				<li>
					<span class="d-title mono">Secrets from credentials, never committed.</span>
					Each repo has its own Jenkinsfile; Jenkins and the Docker daemon share the host. Secrets are
					injected from Jenkins credentials at deploy time — a pre-commit hook blocks staging them, and
					nothing sensitive ever lands in git.
				</li>
				<li>
					<span class="d-title mono">A dependency-free status sidecar.</span>
					The live badge on my homepage is driven by a small Python sidecar that polls Prometheus and
					Loki and writes a curated <span class="mono">status.json</span> — exactly four fields: health,
					7-day uptime, 7-day unique visitors, and a timestamp. Standard library only, no public metrics
					endpoint, no internal hostnames or IPs leaving the box. The frontend fetches that file and treats
					anything older than two poll intervals as stale.
				</li>
			</ul>
		</section>

		<!-- ===== results ===== -->
		<section class="block" use:inview>
			<h2><span class="mono num">04</span> What it proves</h2>
			<p>
				The badge in this page header isn't decoration — it's this box reporting its own health,
				served by the very infrastructure described above. Each app self-deploys with
				<span class="mono">docker compose up -d</span> on its <span class="mono">main</span> branch through
				its own Jenkins pipeline; the monitoring stack deploys the same way. It's the same observe-before-it-breaks
				pattern I run on production AWS and Kubernetes — at the scale of one honest box, with nothing
				hidden.
			</p>

			<div class="cta-row">
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external repo link -->
				<a class="cta mono" href={cs.repo.href} target="_blank" rel="noopener noreferrer">
					<span class="arrow" aria-hidden="true">↗</span>
					{cs.repo.label}
				</a>
				<a class="back mono" href={resolve('/')}>
					<span class="arrow" aria-hidden="true">←</span> back to the diagram
				</a>
			</div>
		</section>
	</div>
</main>

<style>
	.case {
		position: relative;
		min-height: 100svh;
		padding: clamp(2rem, 6vw, 5rem) clamp(1.25rem, 5vw, 3rem);
	}
	.wrap {
		max-width: 820px;
		margin-inline: auto;
		display: flex;
		flex-direction: column;
		gap: clamp(2.5rem, 6vh, 4.5rem);
	}

	/* ---- header ---- */
	.head {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.back {
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		color: var(--fg-faint);
		font-size: 0.78rem;
		letter-spacing: 0.04em;
		transition: color 0.15s ease;
	}
	.back:hover,
	.back:focus-visible {
		color: var(--cyan);
	}
	.eyebrow {
		color: var(--cyan);
		text-transform: uppercase;
		letter-spacing: 0.22em;
		font-size: 0.78rem;
		margin-top: 0.6rem;
	}
	h1 {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: clamp(2rem, 6vw, 3.4rem);
		line-height: 1.02;
		letter-spacing: -0.02em;
	}
	.summary {
		color: var(--fg-dim);
		font-size: clamp(1rem, 2.2vw, 1.2rem);
		line-height: 1.55;
		max-width: 60ch;
		margin-top: 0.3rem;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1rem;
		margin-top: 0.6rem;
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

	.stats {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.55rem 1.1rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--line);
		font-size: 0.75rem;
	}
	.stat {
		display: inline-flex;
		align-items: center;
		gap: 0.5em;
		color: var(--fg-dim);
		letter-spacing: 0.06em;
	}
	.health {
		color: var(--green);
	}
	.health.degraded {
		color: var(--amber);
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--green);
		box-shadow: 0 0 8px var(--green);
	}
	.health.degraded .dot {
		background: var(--amber);
		box-shadow: 0 0 8px var(--amber);
	}
	.stats .repo {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		color: var(--cyan);
		transition: opacity 0.15s ease;
	}
	.stats .repo:hover,
	.stats .repo:focus-visible {
		opacity: 0.8;
		text-decoration: underline;
	}

	/* ---- content blocks ---- */
	.block {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}
	h2 {
		display: flex;
		align-items: baseline;
		gap: 0.7rem;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: clamp(1.4rem, 3.5vw, 1.9rem);
		letter-spacing: -0.01em;
	}
	.num {
		color: var(--cyan);
		font-size: 0.8em;
		opacity: 0.85;
	}
	.block p {
		color: var(--fg-dim);
		font-size: 1rem;
		line-height: 1.65;
		max-width: 68ch;
	}
	.block strong {
		color: var(--fg);
		font-weight: 600;
	}
	.cyan {
		color: var(--cyan) !important;
	}
	.green {
		color: var(--green) !important;
	}
	.block .mono,
	.block code {
		font-family: var(--font-mono);
		font-size: 0.92em;
	}
	code {
		color: var(--fg);
		background: var(--bg-2);
		padding: 0.1em 0.4em;
		border-radius: 5px;
		border: 1px solid var(--line);
	}

	/* ---- diagram ---- */
	.diagram {
		margin: 0.5rem 0;
		padding: clamp(1rem, 3vw, 2rem);
		background: color-mix(in srgb, var(--bg-1) 60%, transparent);
		border: 1px solid var(--line);
		border-radius: 14px;
	}
	.diagram figcaption {
		margin-top: 1rem;
		text-align: center;
		color: var(--fg-faint);
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		line-height: 1.5;
	}

	/* ---- decisions list ---- */
	.decisions {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.decisions li {
		position: relative;
		padding-left: 1.4rem;
		color: var(--fg-dim);
		font-size: 1rem;
		line-height: 1.6;
		max-width: 68ch;
	}
	.decisions li::before {
		content: '▸';
		position: absolute;
		left: 0;
		top: 0.05em;
		color: var(--cyan);
	}
	.d-title {
		color: var(--fg);
		font-size: 0.92em;
	}

	/* ---- closing CTAs ---- */
	.cta-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem 1.4rem;
		margin-top: 0.5rem;
	}
	.cta {
		display: inline-flex;
		align-items: center;
		gap: 0.5em;
		font-size: 0.85rem;
		color: var(--bg);
		background: var(--cyan);
		padding: 0.6em 1.1em;
		border-radius: 8px;
		letter-spacing: 0.02em;
		transition: box-shadow 0.15s ease;
	}
	.cta:hover,
	.cta:focus-visible {
		box-shadow: 0 0 24px -4px color-mix(in srgb, var(--cyan) 60%, transparent);
	}
</style>
