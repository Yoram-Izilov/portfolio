// Reveal-on-scroll, progressive-enhancement style.
// No JS / no IntersectionObserver  -> element stays in its default (visible) CSS.
// JS + reduced-motion               -> revealed immediately, no transition.
// JS + motion welcome               -> `.reveal` hides it, `.in-view` (on enter) animates it in.
export function inview(
	node: HTMLElement,
	params: { threshold?: number; rootMargin?: string } = {}
) {
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (reduce || typeof IntersectionObserver === 'undefined') {
		node.classList.add('in-view');
		return;
	}

	node.classList.add('reveal');
	const observer = new IntersectionObserver(
		(entries, obs) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.classList.add('in-view');
					obs.unobserve(node);
				}
			}
		},
		{ threshold: params.threshold ?? 0.25, rootMargin: params.rootMargin ?? '0px 0px -8% 0px' }
	);
	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
