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
function parseDiff(diffText: string): FileChange[] {
	const fileSections = diffText.split('diff --git ').slice(1); // drop empty first chunk
	const changes: FileChange[] = [];

	for (const section of fileSections) {
		const lines = section.split('\n');

		// first line looks like: a/src/extension.ts b/src/extension.ts
		const firstLine = lines[0];
		const fileName = firstLine.split(' ')[1]?.replace(/^b\//, '') ?? 'unknown file';

		let added = 0;
		let removed = 0;

		for (const line of lines) {
			if (line.startsWith('+++') || line.startsWith('---')) {
				continue; // these are header lines, not actual changes
			}
			if (line.startsWith('+')) added++;
			if (line.startsWith('-')) removed++;
		}

		const isNew = section.includes('new file mode');
		const isDeleted = section.includes('deleted file mode');

		changes.push({ fileName, added, removed, isNew, isDeleted });
	}

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