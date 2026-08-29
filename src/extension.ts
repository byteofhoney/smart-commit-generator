import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('smart-commit-generator.helloWorld', () => {

		// find the folder currently open in VS Code
		const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

		if (!folder) {
			vscode.window.showErrorMessage('No folder open.');
			return;
		}

		// run "git diff --staged" inside that folder
		exec('git diff --staged', { cwd: folder }, (error, stdout, stderr) => {
			if (error) {
				vscode.window.showErrorMessage('Error running git diff: ' + error.message);
				return;
			}

			if (!stdout) {
				vscode.window.showInformationMessage('Nothing staged. Stage a change first with git add.');
				return;
			}

			// just print the raw diff to the output console for now
			console.log(stdout);
			vscode.window.showInformationMessage('Diff printed to console. Check Debug Console.');
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}