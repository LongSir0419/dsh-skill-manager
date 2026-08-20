# dsh-skill-manager

[English](README.md) | [中文](README_CN.md)

A Skill management plugin for DeepSeek Harness (DSH) — manage all user-level Skills from the Web settings: view, enable/disable, edit, add, delete and rename. Disabled Skills are excluded from the model catalog (no longer loaded).

[![npm](https://img.shields.io/npm/v/@wanghailong0419/dsh-skill-manager)](https://www.npmjs.com/package/@wanghailong0419/dsh-skill-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

![preview](docs/preview_01.png)

## Features

- **Skill list**: go to Settings → "Skill Manager", lists all Skills under `$DSH_HOME/skills` (name + description)
- **Click to expand / collapse**: click anywhere on a row to expand details (Skill name + SKILL.md content), click again to collapse (input fields and buttons excluded)
- **Enable / disable**: one toggle per Skill, takes effect immediately, updates state locally without flicker
- **Edit / rename**: inline editing of name and SKILL.md content; renaming syncs the directory name
- **Add / delete**: inline form to create new Skills; delete has a confirmation step
- **Disabled = not loaded**: disabling adds `disable-model-invocation: true` to the SKILL.md frontmatter; DSH's skill-filesystem watcher picks it up and immediately excludes the Skill from the model catalog — no restart needed

## Architecture

A single-package, two-half DSH bundle:

| Half | Entry | Role |
|---|---|---|
| Host | `lib/index.js` | `skillManager` Remote service: skillList / skillSet / skillGet / skillCreate / skillUpdate / skillDelete / skillRename, edits SKILL.md frontmatter |
| Client | `lib/client.js` | "Skill Manager" section in the settings panel (`dsh.client` bundle) |

## Installation

```bash
dsh plugin --profile web add @wanghailong0419/dsh-skill-manager
dsh web   # restart to take effect
```

### Local development / unpublished

```bash
dsh plugin --profile web add file:/path/to/dsh-skill-manager
dsh web
```

### Upgrade / Remove

```bash
dsh plugin --profile web update @wanghailong0419/dsh-skill-manager
dsh plugin --profile web remove @wanghailong0419/dsh-skill-manager
```

## Usage

1. Start `dsh web`, open **Settings → Skill Manager**
2. The list shows each Skill: status dot (green = enabled / gray = disabled), name, description
3. Toggle enable/disable with the switch on the right
4. Click a row to expand details: view Skill name and SKILL.md content, **edit** or **delete**
5. Add: click "Add Skill", fill in the name and content inline

> Disable effect: adds `disable-model-invocation: true` to the SKILL.md frontmatter. DSH's skill-filesystem provider excludes the Skill from the model catalog and loader (watcher auto-refreshes, no restart needed).

## How It Works

- `skillList`: scans `$DSH_HOME/skills/<name>/SKILL.md`, parses `description` and `disable-model-invocation` from frontmatter
- `skillGet`: reads the full SKILL.md content of a single Skill
- `skillSet`: text-level frontmatter editing (preserves existing fields and formatting such as `name`/`description`/`origin`), adds/removes `disable-model-invocation: true`
- `skillCreate` / `skillUpdate`: creates a new SKILL.md or replaces the full content
- `skillRename`: renames the Skill directory and syncs the `name` field in frontmatter
- `skillDelete`: deletes the entire Skill directory
- Idempotent: repeated toggles never double-modify

## License

MIT
