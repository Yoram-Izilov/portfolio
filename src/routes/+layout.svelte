<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();

	const site = 'https://www.yoram-izilov.com';
	const title = 'Yoram Izilov - DevOps Engineer';
	const description =
		'DevOps engineer building production AWS & Kubernetes infrastructure - observability and CI/CD, instrumented before it breaks.';
	const ogImage = `${site}/og.png`;

	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Yoram Izilov',
		url: site,
		jobTitle: 'DevOps Engineer',
		email: 'mailto:izilovy@gmail.com',
		description,
		sameAs: ['https://github.com/yoram-izilov', 'https://www.linkedin.com/in/yoram-izilov'],
		knowsAbout: ['AWS', 'Kubernetes', 'Observability', 'CI/CD', 'Prometheus', 'Grafana', 'Jenkins']
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="theme-color" content="#070a0f" />
	<link rel="canonical" href={site} />
	<link rel="icon" href={favicon} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Yoram Izilov" />
	<meta property="og:url" content={site} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Yoram Izilov - DevOps Engineer" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted static JSON-LD -->
	{@html `<script type="application/ld+json">${jsonLd}</` + `script>`}
</svelte:head>

{@render children()}

<Footer />
