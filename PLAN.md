# Smart Commit Generator:- Project Plan

## What this is
A VS Code extension that looks at your **staged git diff** and suggests a commit message for you, no "fix stuff" commits!

## End product (v1)
- A button/command in VS Code: **"Suggest Commit Message"**
- It reads whatever changes you've staged (`git diff --staged`)
- It looks at what changed (file types, added/removed lines, keywords) and
  suggests a message in **conventional-commit style**
  (e.g. `feat: add diff parser`, `fix: correct off-by-one in date logic`)
- No AI API, no backend, no login. Everything runs locally inside VS Code

## Why this approach (no AI API)
Keeps it simple, free and fast to build. Rule-based logic for v1. Can add an optional AI mode later as a stretch goal.

## Stack
- **TypeScript**  the extension logic
- **VS Code Extension API**  commands, status bar button, output
- **esbuild**  bundles the code (fast, low config)
- **Node's built-in `child_process`**  used to actually run `git diff` under
  the hood
- No database, no server, no deployment. It ships as a packaged `.vsix`
  file and later gets published to the VS Code Marketplace

## Build order (roughly, in stages)
1. **Scaffold**  done. Basic extension skeleton exists.
2. **Read the diff**  get the extension to run `git diff --staged` and print the raw output to the console. Proves the plumbing works.
3. **Parse the diff**  turn that raw text into something useful: which files changed, how many lines added/removed, what kind of files
   (test file? config file? source file?).
4. **Message logic**  simple rules that turn the parsed info into a message. Example: mostly `.test.ts` files changed → prefix `test:`. New file created → prefix `feat:`. Only deletions → prefix `chore:`.
5. **UI hook-up**  add a status bar button or command palette entry that runs the whole pipeline and shows the suggested message, with an option to copy it or insert it into the Source Control commit box directly.
6. **Polish**  README with a demo GIF, a few settings (e.g. toggle message style), basic error handling (what if nothing is staged?).
7. **Publish**  package as `.vsix`, publish to the Marketplace.

## Workflow 
- **Branches:** `main` stays stable/working at all times. All actual work happens on `dev`. When a chunk of work is done and works, a Pull
  Request from `dev` → `main`, review it, merge it.
- **Commits:** small and often one commit per small working step.
- **Issues:** upcoming features or ideas go into GitHub Issues.

## Status
In progress scaffold created, folder structure being fixed, not yet writing extension logic.
