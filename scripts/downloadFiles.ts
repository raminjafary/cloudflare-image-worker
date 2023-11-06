import pLimit from 'p-limit';
import path from 'path';
import data from '../data/urls.json' assert { type: 'json' };
import { downloadFile } from './downloadFile.js';
import { extractVariant } from '../src/extractVariant.js';
import { createOutputDir } from './utils.js';
import { writeFileSync } from 'fs';

console.log('Launching image downloader');

let downloaded = 0;
const cwd = process.cwd();

const failedUrls: string[] = [];

const outDir = path.join(cwd, 'output');

createOutputDir(outDir);

const totalDownloads = data.length;

console.log(`Batch downloading ${totalDownloads} images`);

async function main() {
	const parallel_limit = pLimit(10);
	const promises = [];

	for (let i = 0; i < totalDownloads; i++) {
		const cdnURL = data[i];
		const { url, imageName } = extractVariant(cdnURL);

		if (url) {
			promises.push(parallel_limit(() => download(url, imageName, path.join(outDir, imageName))));
		} else {
			downloaded++;
			console.log(`x Missing URL for ${imageName} (${downloaded} of ${totalDownloads})`);
			finish();
		}
	}
	await Promise.all(promises);
	console.log('Done.');
}

async function download(url: string, fileName: string, path: string) {
	try {
		await downloadFile(url, path);
		downloaded++;
		console.log(`✔️  Downloaded ${fileName} (${downloaded} of ${totalDownloads})`);
		finish();
	} catch (e: any) {
		console.log(e.toString(), 'url: ', url, 'path: ', fileName);
		failedUrls.push(url);
		writeFileSync('./data/failedUrls.json', JSON.stringify(failedUrls, null, 2));
	}
}

function finish() {
	if (downloaded === totalDownloads) {
		console.log('✔️  Downloads completed');
		process.exit(0);
	}
}

main();
