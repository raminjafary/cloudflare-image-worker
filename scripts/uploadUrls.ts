import pLimit from 'p-limit';
import { exit, readLineAsync } from './utils.js';
import imagesData from '../data/urls.json' assert { type: 'json' };
import config from '../src/config.js';
import { extractVariant } from '../src/extractVariant.js';

async function bulkUpload() {
	if (!config.accountID || !config.apiToken) {
		exit('Please set both accountID and apiToken in the environment');
	}

	const answer = await readLineAsync('Proceed with bulk upload to Cloudflare Images ? yes/[no]: ');
	if (answer !== 'yes') {
		exit('doing nothing');
	}

	const parallel_limit = pLimit(10);
	const promises = [];

	for (const sourceUrl of imagesData) {
		const { imageName, url } = extractVariant(sourceUrl);

		promises.push(parallel_limit(() => upload(url, imageName, config.accountID, config.apiToken)));
	}

	await Promise.all(promises);
	console.log('Done.');
}

async function upload(sourceUrl: string, imageName: string, accountID: string, apiToken: string) {
	console.log(`Uploading to Cloudflare Images: ${imageName}`);

	const body = new FormData();
	body.append('url', sourceUrl);
	body.append('id', imageName);

	try {
		const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountID}/images/v1`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${apiToken}` },
			body,
		});

		if (res.status !== 200 && res.status !== 409) {
			throw new Error('HTTP ' + res.status + ' : ' + (await res.text(), sourceUrl));
		}

		if (res.status === 409) {
			// 409: image already exists, it must have been imported by a previous run
			console.log('Already exist: ' + imageName);
		}
	} catch (e) {
		console.log('ERROR:' + e);
	}
}

bulkUpload();
