import * as vscode from 'vscode';
import { exec } from 'child_process';

// A simple shape to hold info about one changed file
interface FileChange {
	fileName: string;
	added: number;
	removed: number;
	isNew: boolean;
	isDeleted: boolean;
}

// Takes the raw diff text and turns it into a list of FileChange objects
function parseDiff(diffText: string): FileChange[] 
{
	const lines = diffText.split('\n');
	const changes: FileChange[] = [];
	let current: FileChange | null = null;

	for (const line of lines) {
		// Only treat it as a new file section if it's at the START of a line
		if (line.startsWith('diff --git ')) 
		{
			if (current) changes.push(current);
			const fileName = line.split(' ')[3]?.replace(/^b\//, '') ?? 'unknown file';
			current = { fileName, added: 0, removed: 0, isNew: false, isDeleted: false };
			continue;
		}

		if (!current) continue; // skip anything before the first real diff header

		if (line.startsWith('new file mode')) current.isNew = true;
		if (line.startsWith('deleted file mode')) current.isDeleted = true;

		if (line.startsWith('+++') || line.startsWith('---')) continue;
		if (line.startsWith('+')) current.added++;
		if (line.startsWith('-')) current.removed++;
	}

	if (current) changes.push(current);
	return changes;
}

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('smart-commit-generator.helloWorld', () => {

		const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

		if (!folder) {
			vscode.window.showErrorMessage('No folder open.');
			return;
		}

		exec('git diff --staged', { cwd: folder }, (error, stdout, stderr) => {
			if (error) {
				vscode.window.showErrorMessage('Error running git diff: ' + error.message);
				return;
			}

			if (!stdout) {
				vscode.window.showInformationMessage('Nothing staged. Stage a change first with git add.');
				return;
			}

			const changes = parseDiff(stdout);
			console.log(changes); // see the parsed result in Debug Console

			vscode.window.showInformationMessage(`Parsed ${changes.length} file(s) changed.`);
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}