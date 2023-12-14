import pLimit from 'p-limit';
import { exit, readLineAsync } from './utils.js';
import config from '../src/config.js';
import imagesData from '../data/urls.json' assert { type: 'json' };
import { extractVariant } from '../src/extractVariant.js';

async function reset() {
	if (!config.accountID || !config.apiToken) {
		exit('Please set both accountID and apiToken in the config file');
	}

	const answer = await readLineAsync('⚠️⚠️⚠️ Warning ⚠️⚠️⚠️ - RESET will delete all Cloudflare Images for imagejam; confirm? yes/[no]: ');
	if (answer !== 'yes') {
		exit('doing nothing');
	}

	const parallel_limit = pLimit(10);
	const promises = [];

	for (const sourceUrl of imagesData as string[]) {
		const { imageName } = extractVariant(sourceUrl);

		promises.push(parallel_limit(() => deleteImage(imageName, config.accountID, config.apiToken)));
	}

	await Promise.all(promises);
	console.log('Done.');
}

async function deleteImage(imageName: string, accountID: string, apiToken: string) {
	console.log(`Deleting Cloudflare Image: ${imageName}`);

	try {
		const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountID}/images/v1/${imageName}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${apiToken}` },
		});

		if (res.status !== 200) {
			throw new Error(`${imageName}: HTTP ` + res.status + ' : ' + (await res.text()));
		}
	} catch (e: any) {
		console.log(e.toString());
	}
}

reset();
