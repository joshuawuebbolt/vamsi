import * as vscode from 'vscode';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

let hintInterval = null;
let hintHistory = [];

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

            // Construct the Prompt
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
			If the code is the solution, set "hint" to "FINISHED".
			Record each concept the user has issues on, leave empty if none.
			Respond with the following format with no codeblocks:
			{
				"hint": <one-sentence-hint>,
				"issues": [<one-sentence-summary-of-issue1>,
				<one-sentence-summary-of-issue2>, etc.]
			}
            `;

            try {
                // Use the loop-specific aiClient
                const response = await loopAiClient.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                });

                if (response.text) {
					console.log(response.text);
					const responseJSON = JSON.parse(response.text);
                    const hintText = responseJSON.hint;
                    vscode.window.showInformationMessage(`Vamsi Hint: ${hintText}`);
                    hintHistory.push(hintText); // Add to history to avoid repeated hints
					console.log(responseJSON.issues);
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error(`Vamsi Hint Loop Error: ${message}`);
            }

        }, 10000); // 60,000 milliseconds = 1 minute
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
        disposableHintLoop, 
        disposableStopLoop 
    );
}

export function deactivate() {
    // Clean up the interval if the extension is deactivated
    if (hintInterval) {
        clearInterval(hintInterval);
    }
}

