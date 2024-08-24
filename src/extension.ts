import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "add-story" is now active!');

	const disposable = vscode.commands.registerCommand('add-story.add', () => {
		vscode.window.showInformationMessage('Hello World from Add Story!');
	});
	
	context.subscriptions.push(disposable);
}

export function deactivate() {}
