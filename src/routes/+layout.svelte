<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const title = 'Yoram Izilov — DevOps Engineer';
	const description =
		'DevOps engineer building production AWS & Kubernetes infrastructure — observability and CI/CD, instrumented before it breaks.';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="theme-color" content="#070a0f" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
