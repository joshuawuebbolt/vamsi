// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "vamsi" is now active!');

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
		}, 60000);
	});

	context.subscriptions.push(disposable, disposableDays, disposableTalkingLoop);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
