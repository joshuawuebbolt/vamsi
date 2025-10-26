import * as vscode from 'vscode';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

let hintInterval = null;
let hintHistory = [];
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as soundPlay from 'sound-play';
import * as https from 'https';
import * as fs from 'fs';
import { textToSpeech } from '@elevenlabs/elevenlabs-js/api/index.js';

/**
 * @param {vscode.ExtensionContext} context
 */
export async function activate(context) {
    dotenv.config({ path: context.asAbsolutePath('.env') });

    console.log('Congratulations, your extension "vamsi" is now active!');

    // Hello World command 
    const disposable = vscode.commands.registerCommand('vamsi.helloWorld', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const w = editor.document.fileName;
            vscode.window.showInformationMessage(w);
        }
    });

	console.log('Vamsi was last seen on May 18, 2025.');

	/**
	 * Play a sound file.
	 * @param {vscode.ExtensionContext} context - The extension context.
	 * @param {string} fileName - The name of the sound file to play.
	 */
	async function playSound(context, fileName) {
		// helper to play a bundled media file
		const audioUri = vscode.Uri.joinPath(context.extensionUri, 'media', fileName);
		const fsPath = audioUri.fsPath;

		// sound-play may be imported as a namespace, default, or the module itself; find the play function robustly
		const playFn =
			(soundPlay && typeof soundPlay.play === 'function') ? soundPlay.play :
			(typeof soundPlay === 'function') ? soundPlay :
			(soundPlay && soundPlay.default && typeof soundPlay.default.play === 'function') ? soundPlay.default.play :
			null;

		if (!playFn) {
			vscode.window.showErrorMessage('Failed to play sound: play function not found on sound-play module.');
			return;
		}

		try {
			await playFn(fsPath);
		} catch (err) {
			vscode.window.showErrorMessage(`Failed to play sound: ${err.message}`);
		}
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
		vscode.window.showInformationMessage('Using Eleven Labs API key: ' + `${apiKey}`);
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
			let sound = savedPath.split('\\').pop();
			await playSound(context, sound);
			vscode.window.showInformationMessage(`Audio file ${sound} synthesized speech saved to ${savedPath}`);
		} catch (err) {
			vscode.window.showErrorMessage(`Eleven Labs synthesis failed: ${err.message}`);
		}
	});
	context.subscriptions.push(disposableEleven);

	const disposablePlay = vscode.commands.registerCommand('vamsi.playMp3', function () {
		playSound(context, 'StockCharity.mp3');
	});

	context.subscriptions.push(disposablePlay);

    // Days since last saw Vamsi 
    const disposableDays = vscode.commands.registerCommand('vamsi.daysSince', function () {
        const lastSeen = new Date(2025, 4, 10);
        const now = new Date();
        const diffMs = now.getTime() - lastSeen.getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (isNaN(days)) {
            vscode.window.showInformationMessage('Could not compute days since May 10, 2025.');
        } else if (days >= 0) {
            vscode.window.showInformationMessage(`It's been ${days} day(s) since you saw Vamsi (${lastSeen.toDateString()}).`);
        } else {
            vscode.window.showInformationMessage(`May 10, 2025 is ${Math.abs(days)} day(s) from now.`);
        }
    });

    const disposableHintLoop = vscode.commands.registerCommand('vamsi.hintLoop', function () {
        if (hintInterval) {
            vscode.window.showInformationMessage('Hint loop is already running.');
            return;
        }

		// Instantiate the AI client
        let loopAiClient;
        try {
            loopAiClient = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Failed to start hint loop: ${message}. Make sure .env file is set up.`);
            return; 
        }

        // Clear history for the new session
        hintHistory = [];
        vscode.window.showInformationMessage('Vamsi Hint Loop: Started. Giving hints every 60 seconds.');

        // Set the interval to 60 seconds (60000 ms)
        hintInterval = setInterval(async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                console.log("Vamsi Hint Loop: No active editor. Skipping hint.");
                return; 
            }
            
            const fileContent = editor.document.getText();

            // --- Construct the Prompt ---
            const prompt = `
            You are a patient and helpful coding assistant.
            The user is trying to solve the problem specified on the top of the file.

            Here are the previous hints you've given (do not repeat them):
            ${hintHistory.join('\n') || '- None'}

            Here is the file:
            ---
            ${fileContent}
            ---

            Please provide a new, subtle, one-sentence hint to guide them.
            Do not give the solution. Focus on the next logical step.
            `;

            try {
                // Use the loop-specific aiClient
                const response = await loopAiClient.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                });

                if (response.text) {
                    const hintText = response.text.trim();
					console.log(hintText)
                    vscode.window.showInformationMessage(`Vamsi Hint: ${hintText}`);
							try {
								const savedPath = await synthesizeTextToMp3(hintText);
								let sound = savedPath.split('\\').pop();
								await playSound(context, sound);
								vscode.window.showInformationMessage(`Audio file ${sound} synthesized speech saved to ${savedPath}`);
							} catch (err) {
								vscode.window.showErrorMessage(`Eleven Labs synthesis failed: ${err.message}`);
							}
                    hintHistory.push(hintText); // Add to history to avoid repeats
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error(`Vamsi Hint Loop Error: ${message}`);
            }

        }, 15000); // 60,000 milliseconds = 1 minute
    });

    const disposableStopLoop = vscode.commands.registerCommand('vamsi.stopLoop', function () {
        if (hintInterval) {
            clearInterval(hintInterval);
            hintInterval = null;
            hintHistory = []; // Clear the history
            vscode.window.showInformationMessage('Vamsi Hint Loop: Stopped.');
        } else {
            vscode.window.showInformationMessage('Vamsi Hint Loop: Not currently running.');
        }
    });

    context.subscriptions.push(
        disposable, 
        disposableDays, 
        disposableStopLoop,
		disposableHintLoop 
    );
}


// This method is called when your extension is deactivated
export function deactivate() {}

