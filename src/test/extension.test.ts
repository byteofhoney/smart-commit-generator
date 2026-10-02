import * as assert from 'assert';
import { parseDiff, generateCommitMessage, FileChange } from '../extension';

suite('parseDiff', () => {

	test('parses a simple modified file', () => {
		const diff = `diff --git a/src/foo.ts b/src/foo.ts
index 111..222 100644
--- a/src/foo.ts
+++ b/src/foo.ts
@@ -1,2 +1,3 @@
 line one
+line two added
-line three removed
`;
		const result = parseDiff(diff);
		assert.strictEqual(result.length, 1);
		assert.strictEqual(result[0].fileName, 'src/foo.ts');
		assert.strictEqual(result[0].added, 1);
		assert.strictEqual(result[0].removed, 1);
		assert.strictEqual(result[0].isNew, false);
		assert.strictEqual(result[0].isDeleted, false);
	});

	test('detects a new file', () => {
		const diff = `diff --git a/src/newfile.ts b/src/newfile.ts
new file mode 100644
index 000..111
--- /dev/null
+++ b/src/newfile.ts
@@ -0,0 +1,2 @@
+hello
+world
`;
		const result = parseDiff(diff);
		assert.strictEqual(result[0].isNew, true);
		assert.strictEqual(result[0].added, 2);
	});

	test('detects a deleted file', () => {
		const diff = `diff --git a/src/oldfile.ts b/src/oldfile.ts
deleted file mode 100644
index 111..000
--- a/src/oldfile.ts
+++ /dev/null
@@ -1,2 +0,0 @@
-goodbye
-world
`;
		const result = parseDiff(diff);
		assert.strictEqual(result[0].isDeleted, true);
		assert.strictEqual(result[0].removed, 2);
	});

	test('returns empty array for empty diff', () => {
		const result = parseDiff('');
		assert.strictEqual(result.length, 0);
	});

	test('does not get confused by diff-like text inside file content', () => {
		// This is the exact bug you found and fixed earlier!
		const diff = `diff --git a/src/parser.ts b/src/parser.ts
index 111..222 100644
--- a/src/parser.ts
+++ b/src/parser.ts
@@ -1,2 +1,3 @@
 line one
+if (line.startsWith('diff --git ')) { }
`;
		const result = parseDiff(diff);
		assert.strictEqual(result.length, 1); // should NOT be treated as 2 files
	});
	test('detects a renamed file', () => {
		const diff = `diff --git a/src/old-name.ts b/src/new-name.ts
similarity index 95%
rename from src/old-name.ts
rename to src/new-name.ts
index 111..222 100644
--- a/src/old-name.ts
+++ b/src/new-name.ts
@@ -1,2 +1,2 @@
 line one
-old line
+new line
`;
		const result = parseDiff(diff);
		assert.strictEqual(result[0].isRenamed, true);
		assert.strictEqual(result[0].oldFileName, 'src/old-name.ts');
		assert.strictEqual(result[0].fileName, 'src/new-name.ts');
	});

});

suite('generateCommitMessage', () => {

	test('returns chore for no changes', () => {
		const result = generateCommitMessage([]);
		assert.strictEqual(result, 'chore: no changes detected');
	});

	test('returns feat when a new file is added', () => {
		const changes: FileChange[] = [
			{ fileName: 'src/newthing.ts', added: 5, removed: 0, isNew: true, isDeleted: false }
		];
		const result = generateCommitMessage(changes);
		assert.ok(result.startsWith('feat:'));
	});

	test('returns docs when only markdown files changed', () => {
		const changes: FileChange[] = [
			{ fileName: 'README.md', added: 3, removed: 1, isNew: false, isDeleted: false }
		];
		const result = generateCommitMessage(changes);
		assert.ok(result.startsWith('docs:'));
	});

	test('returns test when only test files changed', () => {
		const changes: FileChange[] = [
			{ fileName: 'src/foo.test.ts', added: 3, removed: 1, isNew: false, isDeleted: false }
		];
		const result = generateCommitMessage(changes);
		assert.ok(result.startsWith('test:'));
	});

	test('returns fix as the default fallback', () => {
		const changes: FileChange[] = [
			{ fileName: 'src/foo.ts', added: 3, removed: 1, isNew: false, isDeleted: false }
		];
		const result = generateCommitMessage(changes);
		assert.ok(result.startsWith('fix:'));
	});
});