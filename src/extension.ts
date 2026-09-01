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

// Looks at the parsed file changes and decides on a commit message
function generateCommitMessage(changes: FileChange[]): string {
	if (changes.length === 0) {
		return 'chore: no changes detected';
	}

	const hasNewFile = changes.some(c => c.isNew);
	const hasDeletedFile = changes.some(c => c.isDeleted);
	const allDeleted = changes.every(c => c.isDeleted);
	const allTestFiles = changes.every(c => /\.(test|spec)\.[jt]s$/.test(c.fileName));
	const allDocFiles = changes.every(c => c.fileName.endsWith('.md'));

	let prefix = 'fix'; // default fallback

	if (allDeleted) {
		prefix = 'chore';
	} else if (allDocFiles) {
		prefix = 'docs';
	} else if (allTestFiles) {
		prefix = 'test';
	} else if (hasNewFile) {
		prefix = 'feat';
	} else if (hasDeletedFile) {
		prefix = 'chore';
	}

	// build a short summary of which files changed
	const fileList = changes.map(c => c.fileName.split('/').pop()).join(', ');

	return `${prefix}: update ${fileList}`;
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
			const message = generateCommitMessage(changes);

			console.log(changes);
			console.log('Suggested message:', message);

			vscode.window.showInformationMessage(`Suggested commit: ${message}`);
					});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}