<script lang="ts">
	import { resolve } from '$app/paths';
	import { inview } from '$lib/actions/inview';
	import BotDiagram from '$lib/components/BotDiagram.svelte';
	import { caseStudies } from '$lib/data/caseStudies';

	const cs = caseStudies['discord-bot'];

	const site = 'https://www.yoram-izilov.com';
	const url = `${site}/work/discord-bot`;

	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'TechArticle',
		headline: cs.title,
		description: cs.summary,
		url,
		author: { '@type': 'Person', name: 'Yoram Izilov', url: site },
		about: cs.stack
	});
</script>

<svelte:head>
	<title>{cs.title} - Yoram Izilov</title>
	<meta name="description" content={cs.summary} />
	<link rel="canonical" href={url} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={url} />
	<meta property="og:title" content="{cs.title} - Yoram Izilov" />
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
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external repo link -->
				<a class="repo" href={cs.repo.href} target="_blank" rel="noopener noreferrer">
					<span class="arrow" aria-hidden="true">↗</span>{cs.repo.label}
				</a>
			</div>
		</header>

		<!-- ===== problem ===== -->
		<section class="block" use:inview>
			<h2><span class="mono num">01</span> A hobby bot, run like production</h2>
			<p>
				<strong>discord-bot</strong> is a personal Python bot for my server - it tracks airing anime,
				watches RSS feeds, scrapes MyAnimeList, runs roulettes and plays voice. None of that is the interesting
				part. The interesting part is that I run it with the same operational discipline I apply to production
				systems at work: every code path is traced, profiled and alerting-ready, with all state in a real
				database.
			</p>
			<p>
				It's a deliberately low-stakes place to practise observability end to end - to feel what
				good instrumentation costs to write and what it buys you when something misbehaves at 2am,
				without a production incident to learn it on.
			</p>
		</section>

		<!-- ===== architecture ===== -->
		<section class="block" use:inview>
			<h2><span class="mono num">02</span> Architecture</h2>
			<p>
				<span class="mono">bot.py</span> is a thin entry point: it registers the slash commands,
				sets up OpenTelemetry and Pyroscope, and bootstraps the database pool on
				<span class="mono">on_ready</span>. Command bodies don't live there - each is a thin wrapper
				that delegates to a handler in <span class="mono">functions/</span>. All state lives in
				<strong>Postgres</strong>, reached through a single asyncpg pool in
				<span class="mono">utils/db.py</span>; handlers never touch the pool directly, they call
				per-domain helpers.
			</p>

			<figure class="diagram">
				<BotDiagram />
				<figcaption class="mono">
					the request path runs top-down · telemetry branches right across monitoring_monitoring
					into the observability plane
				</figcaption>
			</figure>

			<p>
				The single most important pattern is the <code>@trace_function</code> decorator: every function,
				sync or async, is wrapped in an OpenTelemetry span. There is no "should I instrument this?" decision
				- instrumentation is the default, and a function without the decorator is the exception that stands
				out in review.
			</p>
		</section>

		<!-- ===== decisions ===== -->
		<section class="block" use:inview>
			<h2><span class="mono num">03</span> Observability &amp; tradeoffs</h2>
			<ul class="decisions">
				<li>
					<span class="d-title mono">Traces to Tempo, by default.</span>
					Every function emits a span via <code>@trace_function</code>, so a slow command shows up
					as a flame of nested spans in Tempo - the Selenium MAL scrape, the asyncpg query, the HTTP
					call - with no guessing about where the time went.
				</li>
				<li>
					<span class="d-title mono">Continuous profiling with Pyroscope.</span>
					Profiling runs with <span class="mono">oncpu=False</span> so it captures blocking I/O (the
					Discord websocket, HTTP, Selenium) and <span class="mono">gil_only=False</span> so native
					threads - ffmpeg, the chromium driver - show up too. Traces tell you <em>which</em> call
					was slow; profiles tell you
					<em>what it was doing</em>.
				</li>
				<li>
					<span class="d-title mono">Metrics &amp; dashboards.</span>
					A <span class="mono">postgres-exporter</span> sidecar exposes database metrics that the monitoring
					stack's Prometheus scrapes across the shared network; Grafana renders dashboards and alerting
					on the bot's own health.
				</li>
				<li>
					<span class="d-title mono">Logs to Loki, via promtail.</span>
					The bot and Postgres log to stdout; a <span class="mono">promtail</span> sidecar scrapes
					the containers' logs off the Docker socket and ships them to
					<span class="mono">Loki</span>, so Grafana queries them next to the traces, profiles and
					metrics - the fourth signal in the same pane of glass.
				</li>
				<li>
					<span class="d-title mono">A debug switch for local dev.</span>
					Setting <code>debug: true</code> never sets up the tracer or profiler and skips the background
					tasks - so I can run the bot against a local Postgres without exporting telemetry to nowhere
					or hammering external feeds.
				</li>
				<li>
					<span class="d-title mono">Secrets from credentials, pinned images.</span>
					The bot deploys via its own Jenkinsfile with
					<span class="mono">docker compose up -d</span>; the token comes from a gitignored local
					config or Jenkins credentials, never committed, and every image is pinned to an explicit
					tag - no <code>:latest</code>.
				</li>
			</ul>
		</section>

		<!-- ===== results ===== -->
		<section class="block" use:inview>
			<h2><span class="mono num">04</span> What it proves</h2>
			<p>
				It's the same observe-before-it-breaks pattern I run on production AWS and Kubernetes -
				traces, logs, profiles, metrics and alerting wired in from the start - at the scale of one
				hobby bot. The bot attaches to the same <span class="mono">monitoring_monitoring</span> network
				as everything else on the box, so it shares the home-server observability stack rather than reinventing
				one. Instrumentation isn't a thing I add when something breaks; it's the default the code is written
				against.
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
