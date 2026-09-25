# Smart Commit Generator
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![VS Code](https://img.shields.io/badge/VS%20Code%20Extension-007ACC?style=flat&logo=visualstudiocode&logoColor=white)
![esbuild](https://img.shields.io/badge/esbuild-FFCF00?style=flat&logo=esbuild&logoColor=black)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

A VS Code extension that looks at your staged git changes and suggests a commit message for you so you stop writing commits yourself.

## What it does

1. Reads your currently **staged** changes (`git diff --staged`)
2. Figures out what kind of change it is: new file, deleted file, test
   file, docs or a regular edit
3. Suggests a commit message in **conventional-commit style**
   (e.g. `feat: update extension.ts`, `docs: update README.md`)
4. Drops that message straight into the Source Control commit box, ready
   to edit or commit as-is

Everything runs **locally**  so no AI API, no network calls, no login.

## How to use it

1. Stage your changes as usual (`git add` or the Source Control panel)
2. Click the sparkle icon at the top of the Source Control panel or press
   `Ctrl+Alt+M` (`Cmd+Alt+M` on Mac)
3. The commit message box fills in automatically edit it if you want,
   then commit as normal

## How the message is chosen

The extension looks at the staged diff and applies a few simple rules:

- All changed files got deleted → `chore:`
- All changed files are `.md` files → `docs:`
- All changed files are `.test.ts` / `.spec.ts` files → `test:`
- Any file is brand new → `feat:`
- Otherwise → `fix:`

This is deliberately simple, rule based logic, no AI involved  so it's
fast, predictable and works completely offline.

## Requirements

- Git installed and available on your PATH
- A folder open in VS Code that is a git repository

## Known limitations

- Message wording is currently basic (`prefix: update file1, file2`) smarter summarization is a possible future improvement
- Renamed files aren't specially detected yet like treated as a normal edit

## Status

Actively being developed. Feedback and issues welcome.
