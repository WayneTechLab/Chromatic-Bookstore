# .SYSTEMX — WebApp Stack G One Point Zero operational system

This directory is the **operational control layer** for the template: the launcher
menu, the setup/deploy/quality scripts, git hooks, version tracking, and the full
guided playbook.

> The runnable app lives at the **repo root**. `.SYSTEMX/` is the tooling that
> sets it up, deploys it, and keeps it healthy.

## Layout

```
.SYSTEMX/
├── WSG-MENU.sh              # ⭐ the control panel — start here
├── wsg-agi.sh               # governance/sync orchestrator
├── scripts/
│   ├── start-production.sh # 🚀 guided one-time setup → live (menu option #1)
│   ├── bootstrap.sh        # install + auth + verify ALL SDKs/CLIs
│   ├── install-command.sh  # add the `WSG-MENU` terminal command to your shell
│   ├── deploy.sh           # full deploy pipeline (smart Firebase targets)
│   ├── deploy-hosting.sh   # hosting only
│   ├── deploy-rules.sh     # Firestore + Storage rules only
│   ├── deploy-functions.sh # Cloud Functions only
│   ├── quality-check.sh    # typecheck + lint + tests
│   ├── security-check.mjs   # generic rules/config/audit check
│   ├── verify-template-structure.mjs
│   ├── version-bump.sh     # semver bump + version files
│   └── firebase-setup.sh   # firebase login + project selection
├── deploy/                 # production policy docs: canary, MFA, storage, alerts
├── docs/                   # operator runbooks: secrets, monitoring, recovery
├── hooks/                  # git hooks (install-hooks.sh, pre-push, post-merge, post-checkout)
├── logs/                   # local script logs (git-kept, contents ignored downstream)
├── tooling/                # reusable helper tooling
├── Standard-MD-Files/      # source markdown set used to build setup packet zips
├── Stock-Setup-Files/      # stock markdown source mirror for packet generation
├── Setup-Input_MD/         # default import workspace for unpacked setup packets
├── Unified-Setup-Process/  # stack modes, master plan, editions, and setup flow
├── version/                # app-version.txt, version.json, CHANGELOG.md
├── status/                 # TODO.md, IN_PROGRESS.md, DONE.md (this template's build log)
└── Template/               # the guided playbook (steps 00→12, setup.sh, starter/, lib/)
    └── lib/firebase-config.sh  # paste/seed helpers (config capture + .env seeding)
```

## Start here

```bash
bash .SYSTEMX/WSG-MENU.sh
```

Or make it typeable in any terminal:

```bash
bash .SYSTEMX/scripts/install-command.sh   # then just type: WSG-MENU
```

| Menu | What it does |
| --- | --- |
| 1 · 🚀 Start into Production | Guided one-time wizard: tooling → packet export/import → config → build → deploy → security |
| 2 · Setup & Tooling | Bootstrap, doctor, packet export/import, Firebase config, guided setup, hooks, install command |
| 3 · Deploy | Full / hosting / rules / functions / preflight / bump+deploy |
| 4 · Quality Checks | TypeScript · ESLint · tests · audit |
| 5 · Version | Bump patch/minor/major · changelog |
| 6 · Firebase | Login · projects · emulator · indexes · setup |
| 7 · Git | Status · pull · commit · push |
| 8 · Dev & App | Install · dev · build · preview |
| 9 · Project Info | Versions · repo · recent commits |
| 10 · System | WSG-AGI sync · structure check · security check |
| 11 · Update | Update main · update menu/system · update code · checks · deploy update-all |

## Tooling the bootstrap guarantees

| Tool | Type | Purpose |
| --- | --- | --- |
| Node.js + npm | runtime | Build/dev + package manager |
| Git | CLI | Version control |
| GitHub CLI (`gh`) | CLI | Repo + secrets automation |
| Google Cloud SDK (`gcloud`) | SDK/CLI | GCP/Firebase platform |
| Firebase CLI (`firebase-tools`) | CLI | Provisioning + deploy, resolved from PATH or `npx --yes firebase-tools` |
| Firebase Web SDK (`firebase`) | SDK | App auth/data/storage (in `package.json`) |
| Stripe CLI (`stripe`) | CLI | Payments (optional) |
| Stripe SDK (`@stripe/stripe-js`, `stripe`) | SDK | Payments (optional) |

Google/Firebase is the default cloud and sender path. When the project needs
more provider coverage, run:

```bash
bash .SYSTEMX/scripts/bootstrap.sh --with-stripe --with-mcp --with-m365 --with-godaddy --interactive-login
```

Use `Unified-Login.md` for the five-step login flow,
`WSG-Account-Levels.md` for Level 0-5 Firebase, security, emulator, and
Playwright standards, and `Firebase-Sender-Auth-MFA.md` for the sender email,
authorized-domain, MFA, claims, and smoke-test order that prevents unified login
drift.

Use the stack definitions in `.SYSTEMX/Unified-Setup-Process/stacks/` to keep
`Google/Firebase` as the default setup path, `Microsoft 365` as the alternative
sender/tenant path, and `Custom` as the explicit service-selection path.

See [status/](status/TODO.md) for the build log and [version/CHANGELOG.md](version/CHANGELOG.md).

## First-Time Setup Intake

When a repo is opened from this template as a new project, run:

```bash
bash .SYSTEMX/scripts/first-time-setup-packet.sh --pause
```

The script asks `Mac` or `Windows` first, then stack mode, edition, packet
tier, and packet shape. It exports one setup zip to Downloads, pauses for
external work, imports the returned zip into `.SYSTEMX/Setup-Input_MD/`, and
then continues the guided setup.

Fill the intake and master-plan files in `.SYSTEMX/Unified-Setup-Process/intake/`,
then re-inject `06-AI-REINJECTION-PROMPT.md` into the AI/code tooling session.
Setup/deploy events append to `.SYSTEMX/logs/setup-history.jsonl` and
`.SYSTEMX/logs/deploy-history.jsonl`.

For the full scratch-to-production flow, read
[`USER-INGEST-AND-PRODUCTION-SETUP.md`](USER-INGEST-AND-PRODUCTION-SETUP.md).

## Deploy Controls

```bash
bash .SYSTEMX/scripts/deploy.sh --preflight
bash .SYSTEMX/scripts/deploy.sh hosting --dry-run
bash .SYSTEMX/scripts/deploy.sh rules
bash .SYSTEMX/scripts/deploy.sh app --fast
bash .SYSTEMX/scripts/deploy.sh --check
bash .SYSTEMX/scripts/deploy.sh --rollback-info
```

Firebase CLI is no longer vendored into app dev dependencies; scripts resolve it
from local PATH or `npx --yes firebase-tools` to keep generated apps audit-clean.

## Governance sync

Run WSG-AGI before releases to validate the operational layer:

```bash
npm run sync:system:check
npm run sync:system
npm run auth:mfa:check
```

## Unified setup

The modular edition-aware setup process lives at
[`Unified-Setup-Process/`](Unified-Setup-Process/). It defines stack modes, five
edition manifests, the 20-phase canonical master plan, the 10-phase/15-step
compatibility flow, repo learning, and the
[`@@CODER.SatoshiUNO`](Unified-Setup-Process/standards/@@CODER.SatoshiUNO.md)
human/AI interaction standard.

The original [`Template/steps/`](Template/steps/) flow remains the legacy
golden-path source material.

## Standard MD files

Use [`Standard-MD-Files/`](Standard-MD-Files/) when a human needs the source set
that WSG uses to build setup packet zips for an LLM to produce an updated
template version, initialize a new project from the template, or continue setup
without relying on chat memory.

Run this to export one setup packet zip to the user's Downloads folder and
create a matching setup import target:

```bash
bash .SYSTEMX/scripts/build-setup-packet.sh
```

The script asks the operator for OS, stack mode, edition, packet tier, and
packet shape, then writes a timestamped zip to the OS Downloads folder.

After receiving an updated setup zip, import and validate it with:

```bash
bash .SYSTEMX/scripts/import-setup-packet.sh
```

<!-- WSG-AGI:START -->

## System Map (Synced By WSG-AGI)

This block is generated by `.SYSTEMX/wsg-agi.sh`.

| Surface | Entry point |
| --- | --- |
| Control panel | `.SYSTEMX/WSG-MENU.sh` |
| Governance sync | `.SYSTEMX/wsg-agi.sh` |
| Quality gate | `.SYSTEMX/scripts/quality-check.sh` |
| Security gate | `.SYSTEMX/scripts/security-check.mjs` |
| Auth/MFA readiness | `.SYSTEMX/scripts/auth-mfa-readiness-check.mjs` |
| Packet export | `.SYSTEMX/scripts/build-setup-packet.sh` |
| Packet import | `.SYSTEMX/scripts/import-setup-packet.sh` |
| Packet validate | `.SYSTEMX/scripts/validate-setup-packet.mjs` |
| System audit | `.SYSTEMX/scripts/system-audit.sh` |
| Structure check | `.SYSTEMX/scripts/verify-template-structure.mjs` |

Run `bash .SYSTEMX/wsg-agi.sh --check` before deploys to detect drift.

<!-- WSG-AGI:END -->
