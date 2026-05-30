export type CaseStudy = {
	/** route slug, e.g. 'home-server' → /work/home-server */
	slug: string;
	/** page <h1> + <title> */
	title: string;
	/** one-line deck — also the page meta description */
	summary: string;
	role: string;
	stack: string[];
	repo: { label: string; href: string };
	/** id of the matching node in projects.ts */
	projectId: string;
};

/**
 * Deep-dive write-ups, keyed by slug. The narrative lives in each route's
 * +page.svelte; this module holds only the metadata that drives the page <head>
 * and the shared header. A new case study = add a /work/<slug> folder + an entry here.
 */
export const caseStudies: Record<string, CaseStudy> = {
	'home-server': {
		slug: 'home-server',
		title: 'home-server: the box that runs this site',
		summary:
			'A self-hosted observability and reverse-proxy platform — three independent repos, two Docker networks as contracts, every service instrumented and self-deploying. It also serves the page you are reading.',
		role: 'Designed & operate the infrastructure',
		stack: ['nginx', 'Docker Compose', 'Jenkins', 'Prometheus', 'Grafana', 'Loki', 'Tempo'],
		repo: {
			label: 'github.com/yoram-izilov/home-server',
			href: 'https://github.com/yoram-izilov/home-server'
		},
		projectId: 'home-server'
	},
	'discord-bot': {
		slug: 'discord-bot',
		title: 'discord-bot: a hobby bot run like production',
		summary:
			'A personal Python Discord bot instrumented end-to-end — every function traced to Tempo, continuously profiled by Pyroscope, metrics scraped into Prometheus, logs shipped to Loki, all rendered in Grafana. A hobby project used to practise the observability discipline I run at work.',
		role: 'Built with a friend',
		stack: [
			'Python',
			'discord.py',
			'PostgreSQL',
			'OpenTelemetry',
			'Tempo',
			'Pyroscope',
			'Prometheus',
			'Loki',
			'Grafana'
		],
		repo: {
			label: 'github.com/yoram-izilov/discord-py',
			href: 'https://github.com/yoram-izilov/discord-py'
		},
		projectId: 'discord'
	}
};
