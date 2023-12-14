import pLimit from 'p-limit';
import { exit, getFilesThroughDir, readLineAsync } from './utils.js';
import config from '../src/config.js';
import { readFileSync, writeFileSync } from 'fs';
import { basename } from 'path';

let files: string[] = [];
const failedUrls: string[] = [];

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

	for (const file of files) {
		const fileContent = readFileSync(file);

		promises.push(parallel_limit(() => upload(fileContent, basename(file), config.accountID, config.apiToken)));
	}

	await Promise.all(promises);
	console.log('Done.');
}

async function upload(file: Buffer, imageName: string, accountID: string, apiToken: string) {
	console.log(`Uploading to Cloudflare Images: ${imageName}`);

	const body = new FormData();
	body.append('file', new Blob([file]), imageName);
	body.append('id', imageName);

	try {
		const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountID}/images/v1`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${apiToken}` },
			body,
		});

		if (res.status !== 200 && res.status !== 409) {
			failedUrls.push(imageName);
			writeFileSync('./data/failedUploadCDNFiles.json', JSON.stringify(failedUrls, null, 2));
			throw new Error('HTTP ' + res.status + ' : ' + (await res.text(), file));
		}

		if (res.status === 409) {
			console.log('Already exist: ' + imageName);
		}
	} catch (e) {
		console.log('ERROR:' + e);
	}
}

files = getFilesThroughDir('./output') ?? [];

if (files.length) {
	bulkUpload();
}
