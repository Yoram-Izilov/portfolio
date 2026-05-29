<script lang="ts">
	import { inview } from '$lib/actions/inview';

	type Stage = {
		tag: string;
		title: string;
		body: string;
		tech: string[];
		live?: boolean;
	};

	const stages: Stage[] = [
		{
			tag: 'SOURCE',
			title: 'I started on the other side of the deploy.',
			body: 'I came up writing full-stack applications, then moved to the infrastructure that runs them. I build for developers because I was one — the ergonomics matter.',
			tech: ['Full-stack roots', 'DevOps']
		},
		{
			tag: 'BUILD',
			title: 'Production infrastructure on AWS and Kubernetes.',
			body: 'I design and run workloads on AWS and EKS — the kind of systems that are supposed to be boring, because boring means they are working.',
			tech: ['AWS', 'EKS', 'Kubernetes', 'Docker']
		},
		{
			tag: 'OBSERVE',
			title: 'Instrumented before it breaks.',
			body: 'Metrics, dashboards and alerting with Prometheus, Grafana and the ELK stack. If it is running in production, it is telling me how it feels.',
			tech: ['Prometheus', 'Grafana', 'ELK']
		},
		{
			tag: 'SHIP',
			title: 'Everything ships through a pipeline.',
			body: 'CI/CD with Jenkins and Bitbucket Pipelines — including this site, which builds, tests and deploys itself on every push.',
			tech: ['Jenkins', 'Bitbucket Pipelines', 'CI/CD'],
			live: true
		}
	];
</script>

<section class="approach" aria-labelledby="approach-heading">
	<p class="section-label mono">// the operator</p>
	<h2 id="approach-heading" class="visually-hidden">How Yoram works</h2>

	<ol class="rail">
		{#each stages as s (s.tag)}
			<li class="stage-row" class:is-live={s.live} use:inview>
				<div class="marker" aria-hidden="true">
					<span class="node-dot"></span>
				</div>
				<div class="content">
					<p class="stage-tag mono">{s.tag}</p>
					<h3>{s.title}</h3>
					<p class="body">{s.body}</p>
					<ul class="tech mono" aria-label="Tools">
						{#each s.tech as t (t)}
							<li>{t}</li>
						{/each}
					</ul>
				</div>
			</li>
		{/each}
	</ol>
</section>

<style>
	.approach {
		max-width: var(--maxw);
		margin-inline: auto;
		padding: clamp(3rem, 9vh, 7rem) clamp(1.25rem, 5vw, 3rem) clamp(2rem, 6vh, 4rem);
	}

	.section-label {
		color: var(--fg-faint);
		font-size: 0.78rem;
		letter-spacing: 0.16em;
		margin-bottom: clamp(1.75rem, 5vh, 3rem);
	}

	.rail {
		list-style: none;
		margin: 0;
		padding: 0;
		position: relative;
		max-width: 760px;
	}
	/* the vertical pipeline line */
	.rail::before {
		content: '';
		position: absolute;
		left: 6px;
		top: 6px;
		bottom: 6px;
		width: 2px;
		background: linear-gradient(var(--line), color-mix(in srgb, var(--green) 35%, var(--line)));
	}

	.stage-row {
		position: relative;
		display: grid;
		grid-template-columns: auto 1fr;
		gap: clamp(1rem, 3vw, 2rem);
		padding-bottom: clamp(2rem, 6vh, 4rem);
	}
	.stage-row:last-child {
		padding-bottom: 0;
	}

	.marker {
		position: relative;
		width: 14px;
		display: flex;
		justify-content: center;
		padding-top: 0.35rem;
	}
	.node-dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--bg-2);
		border: 2px solid var(--cyan);
		box-shadow: 0 0 0 4px var(--bg);
	}
	.is-live .node-dot {
		border-color: var(--green);
		background: color-mix(in srgb, var(--green) 25%, var(--bg-2));
		box-shadow:
			0 0 0 4px var(--bg),
			0 0 12px color-mix(in srgb, var(--green) 70%, transparent);
	}

	.stage-tag {
		color: var(--cyan);
		font-size: 0.74rem;
		letter-spacing: 0.2em;
		margin-bottom: 0.5rem;
	}
	.is-live .stage-tag {
		color: var(--green);
	}

	.content h3 {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: clamp(1.3rem, 3.2vw, 1.95rem);
		line-height: 1.18;
		letter-spacing: -0.01em;
		margin-bottom: 0.75rem;
		max-width: 22ch;
	}

	.body {
		color: var(--fg-dim);
		font-size: clamp(1rem, 1.6vw, 1.1rem);
		line-height: 1.6;
		max-width: 60ch;
	}

	.tech {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		margin: 1.1rem 0 0;
		padding: 0;
		list-style: none;
	}
	.tech li {
		font-size: 0.72rem;
		color: var(--fg-dim);
		padding: 0.25em 0.7em;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--bg-1);
	}
</style>
