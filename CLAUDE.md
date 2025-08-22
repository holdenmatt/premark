# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📚 Onboarding

At the start of each session, read:

1. Any `**/README.md` docs across the project
2. Any `**/README.*.md` docs across the project

## ✅ Quality Gates

Before finishing any code changes:

1. Run `pnpm format` to auto-fix all formatting/linting issues
2. Run `pnpm check` to verify everything passes

## 💻 Code Style

### TypeScript

- Always use `type` instead of `interface`
