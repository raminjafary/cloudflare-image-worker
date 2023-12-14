import { createInterface } from 'node:readline';
import { rmdirSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

export function readLineAsync(message: string) {
	const rl = createInterface(process.stdin, process.stdout);
	return new Promise((resolve) => {
		rl.question(message, (answer) => {
			resolve(answer);
			rl.close();
		});
	});
}

export function exit(msg: string) {
	console.error(msg);
	process.exit(1);
}

export function createOutputDir(outDir: string) {
	if (existsSync(outDir)) {
		console.log('🗑️  Removing stale files');
		rmdirSync(outDir, { recursive: true });
		console.log('✔️  Removed stale files');
	}
	mkdirSync(outDir);
	console.log(`✔️  Created ${outDir} directory`);
}

export function getFilesThroughDir(dir: string) {
	const files: string[] = [];
	try {
		readdirSync(dir).forEach((file) => {
			const absPath = path.join(dir, file);
			if (statSync(absPath).isDirectory()) {
				return getFilesThroughDir(absPath);
			} else {
				return files.push(absPath);
			}
		});
		return files;
	} catch (error) {
		exit('Please specify an directory for uploading images!');
	}
}
