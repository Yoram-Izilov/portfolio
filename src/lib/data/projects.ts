import type { Pathname } from '$app/types';

export type Project = {
	id: string;
	/** node label (mono) */
	label: string;
	/** node sub-label */
	sub: string;
	/** x position in the graph's 1000-unit viewBox */
	x: number;
	/** panel headline */
	tagline: string;
	stack: string[];
	role: string;
	points: string[];
	repo?: { label: string; href: string };
	note?: string;
	/** internal route to a deep-dive case study, if one exists */
	caseStudy?: Pathname;
};

export const projects: Project[] = [
	{
		id: 'discord',
		label: 'discord-bot',
		sub: 'full observability',
		x: 250,
		tagline: 'A Python Discord bot wired for end-to-end observability.',
		stack: ['Python', 'OpenTelemetry', 'Tempo', 'Pyroscope', 'Prometheus', 'Loki', 'Grafana'],
		role: 'Built with a friend',
		points: [
			'Every function traced to Tempo and continuously profiled by Pyroscope',
			'Prometheus metrics and Loki logs, all rendered in Grafana with alerting',
			'The same observe-before-it-breaks pattern I run in production - in miniature'
		],
		repo: {
			label: 'github.com/yoram-izilov/discord-py',
			href: 'https://github.com/yoram-izilov/discord-py'
		},
		caseStudy: '/work/discord-bot'
	},
	{
		id: 'home-server',
		label: 'home-server',
		sub: 'observability + infra',
		x: 500,
		tagline:
			'The infrastructure control repo behind this box - a self-hosted observability stack and reverse-proxy layer.',
		stack: ['Prometheus', 'Grafana', 'Loki'],
		role: 'Designed & operate the infrastructure',
		points: [
			'Self-hosted observability: Prometheus metrics, Grafana dashboards, Tempo traces and Loki logs',
			'Host nginx reverse proxy routing every service on the box by container name',
			'Each app self-deploys via Jenkins on the same host - secrets from credentials, never committed'
		],
		repo: {
			label: 'github.com/yoram-izilov/home-server',
			href: 'https://github.com/yoram-izilov/home-server'
		},
		caseStudy: '/work/home-server'
	},
	{
		id: 'site',
		label: 'this-site',
		sub: "you're in it",
		x: 750,
		tagline: 'The site you’re reading - and a project in its own right.',
		stack: ['SvelteKit', 'TypeScript', 'GitHub Actions'],
		role: 'Designed, built, shipped',
		points: [
			'Prerendered to static via SvelteKit adapter-static',
			'CI gates lint, typecheck and build on every PR',
			'Built by Claude Code on rails: plan mode, a review-each-other agent team, blocking gates'
		],
		repo: {
			label: 'github.com/yoram-izilov/portfolio',
			href: 'https://github.com/yoram-izilov/portfolio'
		},
		caseStudy: '/work/building-with-ai'
	}
];
