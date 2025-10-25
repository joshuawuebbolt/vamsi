// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const cp = require('child_process');
const soundPlay = require('sound-play');
const https = require('https');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "vamsi" is now active!');


	console.log('Vamsi was last seen on May 18, 2025.');

	/**
	 * Play a sound file.
	 * @param {vscode.ExtensionContext} context - The extension context.
	 * @param {string} fileName - The name of the sound file to play.
	 */
	function playSound(context, fileName) {
		// helper to play a bundled media file
		const audioUri = vscode.Uri.joinPath(context.extensionUri, 'media', fileName);
		return soundPlay.play(audioUri.fsPath).catch((err) => {
			vscode.window.showErrorMessage(`Failed to play sound: ${err.message}`);
		});
	}

	/**
	 * Synthesize text to an MP3 using Eleven Labs and save it to the extension's media folder.
	 * Returns a Promise that resolves to the saved file system path.
	 *
	 * @param {string} text - Text to synthesize.
	 * @param {string} [voiceId='21m00Tcm4TlvDq8ikWAM'] - Eleven Labs voice id.
	 * @param {string} [outFileName] - Desired output file name (defaults to a timestamped file).
	 * @returns {Promise<string>} - Resolves to the saved MP3 fsPath.
	 */
	async function synthesizeTextToMp3(text, voiceId = '21m00Tcm4TlvDq8ikWAM', outFileName) {
		if (!text) throw new Error('Text is required for synthesis.');

		// get API key from env or secret storage, prompt if missing

		let apiKey = process.env.ELEVENLABS_API_KEY;
		vscode.window.showInformationMessage('Using Eleven Labs API key: ' + (apiKey ? 'found' : 'not found'));
		if (!apiKey) {
			const input = await vscode.window.showInputBox({
				prompt: 'Enter your Eleven Labs API key',
				ignoreFocusOut: true,
				password: true
			});
			if (!input) throw new Error('Eleven Labs API key is required.');
			apiKey = input;
			const save = await vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Save API key to extension secret storage?' });
			if (save === 'Yes') {
				await context.secrets.store('elevenlabs.apiKey', apiKey);
			}
		}

		outFileName = outFileName || `elevenlabs_${Date.now()}.mp3`;
		const outFsPath = vscode.Uri.joinPath(context.extensionUri, 'media', outFileName).fsPath;

		const options = {
			hostname: 'api.elevenlabs.io',
			path: `/v1/text-to-speech/${voiceId}`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'xi-api-key': apiKey,
				'Accept': 'audio/mpeg'
			}
		};

		return new Promise((resolve, reject) => {
			const req = https.request(options, (res) => {
				if (res.statusCode && res.statusCode >= 400) {
					let errBody = '';
					res.on('data', (chunk) => errBody += chunk);
					res.on('end', () => reject(new Error(`Eleven Labs TTS failed (${res.statusCode}): ${errBody}`)));
					return;
				}

				const fileStream = fs.createWriteStream(outFsPath);
				res.pipe(fileStream);

				fileStream.on('finish', () => {
					fileStream.close((err) => {
						if (err) return reject(err);
						resolve(outFsPath);
					});
				});

				fileStream.on('error', (err) => {
					reject(err);
				});
			});

			req.on('error', (err) => {
				reject(err);
			});

			req.write(JSON.stringify({
				text: text,
				voice_settings: {
					stability: 0.5,
					similarity_boost: 0.75
				}
			}));
			req.end();
		});
	}
	const disposableEleven = vscode.commands.registerCommand('vamsi.synthesizeElevenLabs', async function () {
		const text = await vscode.window.showInputBox({
			prompt: 'Enter text to synthesize with Eleven Labs',
			ignoreFocusOut: true
		});
		if (!text) {
			vscode.window.showErrorMessage('No text provided for synthesis.');
			return;
		}

		try {
			const savedPath = await synthesizeTextToMp3(text);
			await playSound(context, savedPath.split('/').pop());
			vscode.window.showInformationMessage(`Synthesized speech saved to ${savedPath}`);
		} catch (err) {
			vscode.window.showErrorMessage(`Eleven Labs synthesis failed: ${err.message}`);
		}
	});
	context.subscriptions.push(disposableEleven);

	const disposablePlay = vscode.commands.registerCommand('vamsi.playMp3', function () {
		playSound(context, 'StockCharity.mp3');
	});

	context.subscriptions.push(disposablePlay);

	// Hello World command
	const disposable = vscode.commands.registerCommand('vamsi.helloWorld', function () {
		vscode.window.showInformationMessage('Hello World from Vamsi!');
	});

	// Days since last saw Vamsi (last seen: May 18, 2025)
	const disposableDays = vscode.commands.registerCommand('vamsi.daysSince', function () {
		const lastSeen = new Date(2025, 4, 10); // month is 0-indexed: 4 = May
		const now = new Date();
		const diffMs = now.getTime() - lastSeen.getTime();
		const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		if (isNaN(days)) {
			vscode.window.showInformationMessage('Could not compute days since May 18, 2025.');
		} else if (days >= 0) {
			vscode.window.showInformationMessage(`It's been ${days} day(s) since you saw Vamsi (${lastSeen}).`);
		} else {
			vscode.window.showInformationMessage(`May 18, 2025 is ${Math.abs(days)} day(s) from now.`);
		}
	});

	let interval;
	const disposableTalkingLoop = vscode.commands.registerCommand('vamsi.talkingLoop', function () {
		if (interval) return; // already running
		interval = setInterval(() => {
			vscode.window.showInformationMessage('WORK HARDER');
		}, 10000);
	});

	context.subscriptions.push(disposable, disposableDays, disposableTalkingLoop);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
