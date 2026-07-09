#!/usr/bin/env node

import { existsSync, statSync } from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const systemxDir = path.join(rootDir, '.SYSTEMX')

const requiredDirs = [
  '.SYSTEMX',
  '.SYSTEMX/deploy',
  '.SYSTEMX/deploy/monitoring',
  '.SYSTEMX/docs',
  '.SYSTEMX/hooks',
  '.SYSTEMX/logs',
  '.SYSTEMX/scripts',
  '.SYSTEMX/status',
  '.SYSTEMX/tooling',
  '.SYSTEMX/Standard-MD-Files',
  '.SYSTEMX/Stock-Setup-Files',
  '.SYSTEMX/Setup-Input_MD',
  '.SYSTEMX/version',
  '.SYSTEMX/Template',
  '.SYSTEMX/Unified-Setup-Process',
  '.SYSTEMX/Unified-Setup-Process/editions',
  '.SYSTEMX/Unified-Setup-Process/phases',
  '.SYSTEMX/Unified-Setup-Process/steps',
  '.SYSTEMX/Unified-Setup-Process/modules',
  '.SYSTEMX/Unified-Setup-Process/standards',
  '.SYSTEMX/Unified-Setup-Process/scrape',
  '.SYSTEMX/Unified-Setup-Process/intake',
  '.SYSTEMX/Unified-Setup-Process/stacks',
  '.SYSTEMX/Unified-Setup-Process/master-plan',
  '.SYSTEMX/Unified-Setup-Process/packet-assets',
  'wiki',
]

const requiredFiles = [
  '.SYSTEMX/README.md',
  '.SYSTEMX/WSG-MENU.sh',
  '.SYSTEMX/wsg-agi.sh',
  '.SYSTEMX/scripts/quality-check.sh',
  '.SYSTEMX/scripts/deploy.sh',
  '.SYSTEMX/scripts/verify-template-structure.mjs',
  '.SYSTEMX/scripts/security-check.mjs',
  '.SYSTEMX/scripts/account-level-check.mjs',
  '.SYSTEMX/scripts/auth-mfa-readiness-check.mjs',
  '.SYSTEMX/scripts/setup-state.sh',
  '.SYSTEMX/scripts/build-setup-packet.sh',
  '.SYSTEMX/scripts/import-setup-packet.sh',
  '.SYSTEMX/scripts/validate-setup-packet.mjs',
  '.SYSTEMX/scripts/first-time-setup-packet.sh',
  '.SYSTEMX/scripts/export-standard-md-packet.sh',
  '.SYSTEMX/scripts/ingest-setup-md.sh',
  '.SYSTEMX/scripts/system-audit.sh',
  '.SYSTEMX/version/app-version.txt',
  '.SYSTEMX/version/version.json',
  '.SYSTEMX/Unified-Setup-Process/README.md',
  '.SYSTEMX/Unified-Setup-Process/master-plan/README.md',
  '.SYSTEMX/Unified-Setup-Process/master-plan/20-PHASE-OUTLINE.md',
  '.SYSTEMX/Unified-Setup-Process/packet-assets/README.md',
  '.SYSTEMX/Unified-Setup-Process/packet-assets/schemas/setup-packet.schema.json',
  '.SYSTEMX/Unified-Setup-Process/packet-assets/prompts/project-research-refresh.md',
  '.SYSTEMX/Unified-Setup-Process/packet-assets/visuals/20-phase-flow.mmd',
  '.SYSTEMX/Unified-Setup-Process/stacks/README.md',
  '.SYSTEMX/Unified-Setup-Process/stacks/google-firebase.json',
  '.SYSTEMX/Unified-Setup-Process/stacks/microsoft-365.json',
  '.SYSTEMX/Unified-Setup-Process/stacks/custom.json',
  '.SYSTEMX/Unified-Setup-Process/standards/@@CODER.SatoshiUNO.md',
  '.SYSTEMX/Unified-Setup-Process/standards/WSG-Basic-Visual-Baseline.md',
  '.SYSTEMX/Unified-Setup-Process/standards/WSG-Account-Levels.md',
  '.SYSTEMX/Unified-Setup-Process/standards/Unified-Login.md',
  '.SYSTEMX/Unified-Setup-Process/standards/Firebase-Sender-Auth-MFA.md',
  '.SYSTEMX/Unified-Setup-Process/intake/README.md',
  '.SYSTEMX/Unified-Setup-Process/intake/01-PROJECT-BRIEF.md',
  '.SYSTEMX/Unified-Setup-Process/intake/02-EDITION-MODULES.md',
  '.SYSTEMX/Unified-Setup-Process/intake/03-PAGES-ROUTES.md',
  '.SYSTEMX/Unified-Setup-Process/intake/04-DATA-AUTH-SECURITY.md',
  '.SYSTEMX/Unified-Setup-Process/intake/05-INTEGRATIONS-DEPLOY.md',
  '.SYSTEMX/Unified-Setup-Process/intake/06-AI-REINJECTION-PROMPT.md',
  '.SYSTEMX/Unified-Setup-Process/intake/07-MASTER-PLAN.md',
  '.SYSTEMX/Unified-Setup-Process/intake/08-INSTRUCTIONS-AND-CONSTRAINTS.md',
  '.SYSTEMX/Unified-Setup-Process/intake/09-BUSINESS-PLAN.md',
  '.SYSTEMX/Unified-Setup-Process/intake/10-FIRST-PHASE-TODO.md',
  '.SYSTEMX/Unified-Setup-Process/intake/11-PROJECT-ARCHITECTURE.md',
  '.SYSTEMX/Unified-Setup-Process/intake/12-FRONTEND-UI-UX-PLAN.md',
  '.SYSTEMX/Unified-Setup-Process/intake/13-BACKEND-DATA-INTEGRATION-PLAN.md',
  '.SYSTEMX/Unified-Setup-Process/intake/14-SECURITY-OPERATIONS-PLAN.md',
  '.SYSTEMX/Unified-Setup-Process/intake/15-LAUNCH-POST-LAUNCH-PLAN.md',
  '.SYSTEMX/Standard-MD-Files/README.md',
  '.SYSTEMX/Standard-MD-Files/00-COPY-ORDER.md',
  '.SYSTEMX/Standard-MD-Files/01-LLM-ROLE-AND-RULES.md',
  '.SYSTEMX/Standard-MD-Files/02-TEMPLATE-UPDATE-REQUEST.md',
  '.SYSTEMX/Standard-MD-Files/03-SYSTEMX-CONTEXT.md',
  '.SYSTEMX/Standard-MD-Files/04-EDITION-AND-MODULES.md',
  '.SYSTEMX/Standard-MD-Files/05-SECURITY-LOGIN-ACCOUNT-LEVELS.md',
  '.SYSTEMX/Standard-MD-Files/06-SETUP-DEPLOY-QUALITY-GATES.md',
  '.SYSTEMX/Standard-MD-Files/07-OUTPUT-CHECKLIST.md',
  '.SYSTEMX/Standard-MD-Files/08-DESIGN.md',
  '.SYSTEMX/Standard-MD-Files/09-MEDIA-ASSETS.md',
  '.SYSTEMX/Standard-MD-Files/10-CONTENT-SEO.md',
  '.SYSTEMX/Standard-MD-Files/11-ACCESSIBILITY-UX.md',
  '.SYSTEMX/Standard-MD-Files/12-BRAND-TOKENS.md',
  '.SYSTEMX/Stock-Setup-Files/README-FIRST.md',
  '.SYSTEMX/Stock-Setup-Files/README.md',
  '.SYSTEMX/Stock-Setup-Files/00-COPY-ORDER.md',
  '.SYSTEMX/Stock-Setup-Files/01-LLM-ROLE-AND-RULES.md',
  '.SYSTEMX/Stock-Setup-Files/02-TEMPLATE-UPDATE-REQUEST.md',
  '.SYSTEMX/Stock-Setup-Files/03-SYSTEMX-CONTEXT.md',
  '.SYSTEMX/Stock-Setup-Files/04-EDITION-AND-MODULES.md',
  '.SYSTEMX/Stock-Setup-Files/05-SECURITY-LOGIN-ACCOUNT-LEVELS.md',
  '.SYSTEMX/Stock-Setup-Files/06-SETUP-DEPLOY-QUALITY-GATES.md',
  '.SYSTEMX/Stock-Setup-Files/07-OUTPUT-CHECKLIST.md',
  '.SYSTEMX/Stock-Setup-Files/08-DESIGN.md',
  '.SYSTEMX/Stock-Setup-Files/09-MEDIA-ASSETS.md',
  '.SYSTEMX/Stock-Setup-Files/10-CONTENT-SEO.md',
  '.SYSTEMX/Stock-Setup-Files/11-ACCESSIBILITY-UX.md',
  '.SYSTEMX/Stock-Setup-Files/12-BRAND-TOKENS.md',
  '.SYSTEMX/Setup-Input_MD/README.md',
  '.SYSTEMX/Setup-Input_MD/.gitkeep',
  '.SYSTEMX/Unified-Setup-Process/editions/enterprise.json',
  '.SYSTEMX/Unified-Setup-Process/editions/business.json',
  '.SYSTEMX/Unified-Setup-Process/editions/consumer.json',
  '.SYSTEMX/Unified-Setup-Process/editions/wsgt.json',
  '.SYSTEMX/Unified-Setup-Process/editions/wsgd.json',
  '.SYSTEMX/Unified-Setup-Process/scrape/repo-manifest-scraper.mjs',
  'package.json',
  'firebase.json',
  'firestore.rules',
  'storage.rules',
]

function assertPath(relativePath, expectedType) {
  const target = path.join(rootDir, relativePath)
  if (!existsSync(target)) {
    throw new Error(`Missing ${expectedType}: ${relativePath}`)
  }

  const stats = statSync(target)
  if (expectedType === 'directory' && !stats.isDirectory()) {
    throw new Error(`Expected directory but found file: ${relativePath}`)
  }
  if (expectedType === 'file' && !stats.isFile()) {
    throw new Error(`Expected file but found directory: ${relativePath}`)
  }
}

try {
  assertPath('.SYSTEMX', 'directory')

  for (const dir of requiredDirs) assertPath(dir, 'directory')
  for (const file of requiredFiles) assertPath(file, 'file')

  if (!existsSync(systemxDir)) {
    throw new Error('.SYSTEMX is required for template operations')
  }

  console.log('[WSG] Template structure check passed')
} catch (error) {
  console.error('[WSG] Template structure check failed:')
  console.error(error.message)
  process.exit(1)
}
