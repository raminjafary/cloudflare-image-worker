export function normalizeUrl(sourceUrl: string) {
	const url = new URL(sourceUrl);

	if (url.hostname) {
		url.hostname = url.hostname.replace(/\.$/, '');
	}

	if (url.pathname) {
		url.pathname = url.pathname
			.replace(/(?<!https?:)\/{2,}/gi, '/')
			.replace(/%2520/gi, '')
			.replace(/'/gi, '')
			.replace(/\/$/, '');

		url.pathname = encodeURI(url.pathname);
	}

	url.searchParams.sort();

	sourceUrl = url.toString();

	if (url.pathname === '/' && url.hash === '') {
		sourceUrl = sourceUrl.replace(/\/$/, '');
	}

	sourceUrl = sourceUrl.replace(/https:%2F%2F/gi, 'https%3A%2F%2F');

	return sourceUrl;
}
