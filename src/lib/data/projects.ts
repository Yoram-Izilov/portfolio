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
};

export const projects: Project[] = [
	{
		id: 'discord',
		label: 'discord-bot',
		sub: 'full observability',
		x: 250,
		tagline: 'A Python Discord bot wired for end-to-end observability.',
		stack: ['Python', 'Prometheus', 'Grafana'],
		role: 'Solo build',
		points: [
			'Prometheus metrics across commands and the runtime hot path',
			'Grafana dashboards and alerting on the bot’s own health',
			'The same observe-before-it-breaks pattern I run in production — in miniature'
		],
		repo: {
			label: 'github.com/Yoram-Izilov/discord-py',
			href: 'https://github.com/Yoram-Izilov/discord-py'
		}
	},
	{
		id: 'nitzanim',
		label: 'nitzanim',
		sub: 'EKS status platform',
		x: 500,
		tagline:
			'A status & incident-communication platform on EKS — in the spirit of Atlassian Statuspage.',
		stack: ['AWS', 'EKS', 'Kubernetes'],
		role: 'Designed & deployed the infrastructure',
		points: ['Final project for the Nitzanim program', 'Showcased at Microsoft Israel'],
		note: 'Case study write-up coming.'
	},
	{
		id: 'site',
		label: 'this-site',
		sub: "you're in it",
		x: 750,
		tagline: 'The site you’re reading — and a project in its own right.',
		stack: ['SvelteKit', 'TypeScript', 'GitHub Actions'],
		role: 'Designed, built, shipped',
		points: [
			'Prerendered to static via SvelteKit adapter-static',
			'CI gates lint, typecheck and build on every PR',
			'The concept: the navigation you’re using is the system diagram'
		],
		repo: {
			label: 'github.com/Yoram-Izilov/portfolio',
			href: 'https://github.com/Yoram-Izilov/portfolio'
		}
	}
];
