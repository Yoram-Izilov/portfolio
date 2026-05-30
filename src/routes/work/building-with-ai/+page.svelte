<script lang="ts">
	import { resolve } from '$app/paths';
	import { inview } from '$lib/actions/inview';
	import MethodDiagram from '$lib/components/MethodDiagram.svelte';
	import { caseStudies } from '$lib/data/caseStudies';

	const cs = caseStudies['building-with-ai'];

	const site = 'https://www.yoram-izilov.com';
	const url = `${site}/work/building-with-ai`;

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

		<!-- ===== premise ===== -->
		<section class="block" use:inview>
			<h2><span class="mono num">01</span> Discipline, not vibes</h2>
			<p>
				A language model can produce a portfolio in an afternoon. That's not the interesting part -
				and it's usually how you get the <em>generic AI site</em>: a purple gradient, a glass card,
				default Inter, copy that says nothing.
				<strong>This site was built by Claude Code too.</strong>
				The interesting part is the rails I put around it so it couldn't ship that.
			</p>
			<p>
				The site is the artifact; the method is the subject. The same operational discipline I apply
				to production - plan before you touch anything, delegate to people who'll disagree, and let
				automated gates - not good intentions - decide what lands - is the discipline I held the AI
				to here.
			</p>
		</section>

		<!-- ===== plan mode ===== -->
		<section class="block" use:inview>
			<h2><span class="mono num">02</span> Plan before any edit</h2>
			<p>
				Nothing gets written until there's an approved plan. In <strong>plan mode</strong> the model
				is read-only: it explores the codebase, asks me the questions it can't answer from the code,
				and produces a written plan I sign off on <em>before</em> a single file changes. No "I'll just
				start typing and see what happens."
			</p>
			<p>
				Driving that is an <code>orchestrator</code> agent that owns the plan and the sequencing.
				It's told to check in at milestones rather than after every file, to defend the concept once
				it's chosen, and - the line that matters most - to
				<strong>surface questions rather than fabricate</strong>
				project facts. An AI that invents a detail to keep moving is worse than one that stops and asks.
			</p>

			<figure class="diagram">
				<MethodDiagram />
				<figcaption class="mono">
					the build path runs top-down on the left · work fans out to the agent team and must clear
					the quality contract before it can land · a failed gate loops back to build
				</figcaption>
			</figure>
		</section>

		<!-- ===== agents ===== -->
		<section class="block" use:inview>
			<h2><span class="mono num">03</span> A team that argues</h2>
			<p>
				There isn't one model doing everything. The work is split across five specialists, each with
				a narrow remit: a <span class="mono">content-strategist</span> for who I am and what to
				feature, a <span class="mono">frontend-engineer</span> that builds, and three reviewers -
				<span class="mono">design-critic</span>, <span class="mono">qa-engineer</span> and
				<span class="mono">a11y-perf</span> - whose only job is to find what's wrong.
			</p>
			<p>
				The orchestrator is explicitly instructed to <strong>force healthy conflict</strong>: the
				design-critic and qa-engineer review the engineer's work <em>before</em> anything is called
				done - no rubber-stamping. It's the same reason I open a PR instead of pushing to
				<code>main</code>: the most useful review is the one that happens before the work lands, by
				someone whose job is to disagree.
			</p>
		</section>

		<!-- ===== gates ===== -->
		<section class="block" use:inview>
			<h2><span class="mono num">04</span> Gates the AI can't talk past</h2>
			<p>
				Reviews catch judgement calls; gates catch the rest, automatically. These run whether or not
				anyone's paying attention, and a few are <strong>blocking</strong> - the work physically can't
				proceed until they're green.
			</p>
			<ul class="decisions">
				<li>
					<span class="d-title mono">quality-gate.sh - blocking.</span>
					A <code>PostToolUse</code> hook that runs lint, typecheck and build after <em>every</em> source
					edit. It exits non-zero on failure, which tells Claude Code the edit broke something and must
					be fixed before continuing. Broken code can't be quietly left behind.
				</li>
				<li>
					<span class="d-title mono">no-generic-ai.sh - the taste gate.</span>
					A non-blocking hook that greps edited files for the tells of an off-the-shelf AI look - the
					purple-gradient-and-glassmorphism starter-template aesthetic, default body fonts, leftover placeholder
					copy - and nudges for a braver choice or a written justification. (This very page is checked
					by it - and passes.)
				</li>
				<li>
					<span class="d-title mono">CI re-runs the same checks.</span>
					The blocking hook is local; <span class="mono">.github/workflows/ci.yml</span> runs the exact
					same three - lint, typecheck, build - on every pull request. The same contract, enforced twice:
					once on my machine, once where it can't be skipped.
				</li>
				<li>
					<span class="d-title mono">Branch + PR, never push to main.</span>
					Every change lands through a feature branch and a reviewable PR. Nothing reaches
					<code>main</code> unreviewed - not mine, not the AI's.
				</li>
				<li>
					<span class="d-title mono">Secrets never get staged.</span>
					Across the repos, <span class="mono">.claude/</span> hooks block staging secrets and validate
					commit format; real secrets come from Jenkins credentials, never a committed file. The AI is
					constrained from doing the destructive thing, not just asked not to.
				</li>
				<li>
					<span class="d-title mono">Pinned images, reproducible deploys.</span>
					Every container image is pinned to an explicit version tag - no <code>:latest</code> - so a
					deploy is the same thing today and next month, not whatever happened to be newest.
				</li>
			</ul>
		</section>

		<!-- ===== what it proves ===== -->
		<section class="block" use:inview>
			<h2><span class="mono num">05</span> What it proves</h2>
			<p>
				Used like this, the AI is a fast contributor on a short leash: plan-gated before it writes,
				delegated across specialists that review each other, and unable to ship code that's broken
				or a design that's generic. That's the opposite of an unsupervised autocomplete - it's the
				same plan, delegate, review, gate loop I'd want from any engineer, just running quickly. The
				proof is the site you're reading: if the rails had failed, you'd be looking at the purple
				gradient.
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
