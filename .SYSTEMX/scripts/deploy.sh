#!/usr/bin/env bash
# =============================================================================
# WebApp Stack G One Point Zero — Auto Deploy
# -----------------------------------------------------------------------------
# Generic, vendor-neutral deploy pipeline for the app at the repo root.
# Runs quality gates → build → version/changelog → commit → push → Firebase
# deploy, with smart targets (only deploys what your firebase.json defines).
#
#   bash .SYSTEMX/scripts/deploy.sh                 # full pipeline
#   bash .SYSTEMX/scripts/deploy.sh full            # alias for full pipeline
#   bash .SYSTEMX/scripts/deploy.sh app             # hosting + functions if present
#   bash .SYSTEMX/scripts/deploy.sh hosting         # hosting only
#   bash .SYSTEMX/scripts/deploy.sh rules           # Firestore/Storage rules + indexes
#   bash .SYSTEMX/scripts/deploy.sh functions       # functions only
#   bash .SYSTEMX/scripts/deploy.sh --preflight     # gates only, no mutations
#   bash .SYSTEMX/scripts/deploy.sh --audit         # full audit only, no deploy
#   bash .SYSTEMX/scripts/deploy.sh --dry-run       # validate deploy command without shipping
#   bash .SYSTEMX/scripts/deploy.sh --check         # deployment health/check info
#   bash .SYSTEMX/scripts/deploy.sh --rollback-info # print safe rollback commands
#   bash .SYSTEMX/scripts/deploy.sh --production --preflight
#   bash .SYSTEMX/scripts/deploy.sh hosting --production --project chromatic-bookstore
#   bash .SYSTEMX/scripts/deploy.sh --allow-live-stripe # only when live Stripe is intentionally approved
#   bash .SYSTEMX/scripts/deploy.sh --bg            # run deploy in background
#   bash .SYSTEMX/scripts/deploy.sh --fast          # skip optional tests/security
#   bash .SYSTEMX/scripts/deploy.sh --fix           # eslint --fix before build
#   bash .SYSTEMX/scripts/deploy.sh --bump patch    # bump version then deploy
#   bash .SYSTEMX/scripts/deploy.sh --project my-id # override Firebase project
#   bash .SYSTEMX/scripts/deploy.sh --skip-tests --skip-deploy
#   bash .SYSTEMX/scripts/deploy.sh --open          # open the live URL after
#   bash .SYSTEMX/scripts/deploy.sh --help
# =============================================================================
set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"     # .SYSTEMX/scripts
SYSTEMX_DIR="$(cd "$SCRIPTS_DIR/.." && pwd)"                     # .SYSTEMX
ROOT_DIR="$(cd "$SYSTEMX_DIR/.." && pwd)"                        # repo root (the app)
VERSION_DIR="$SYSTEMX_DIR/version"
LOG_DIR="$SYSTEMX_DIR/logs"
CHANGELOG_FILE="$VERSION_DIR/CHANGELOG.md"
DEPLOY_FILE="$VERSION_DIR/deploy-count.txt"
VERSION_FILE="$VERSION_DIR/app-version.txt"
VERSION_JSON="$VERSION_DIR/version.json"
EXPECTED_FIREBASE_PROJECT="${EXPECTED_FIREBASE_PROJECT:-chromatic-bookstore}"
PRODUCTION_SITE_URL="${PRODUCTION_SITE_URL:-https://chromatic-bookstore.web.app}"
cd "$ROOT_DIR"

# Load local secrets if present (never committed).
for sf in "$ROOT_DIR/.secrets.env" "$SYSTEMX_DIR/secrets.env"; do
  if [[ -f "$sf" ]]; then set -a; # shellcheck disable=SC1090
    source "$sf"; set +a; break; fi
done

# Defaults
DO_TYPECHECK=1; DO_LINT=1; DO_FIX=0; DO_TESTS=1; DO_SECURITY=1; DO_BUILD=1
DO_PUSH=1; DO_DEPLOY=1; OPEN_BROWSER=0; PRECHECK_ONLY=0; DRY_RUN=0; BG_MODE=0; HEALTH_CHECK=0; ROLLBACK_INFO=0
PRODUCTION_MODE=0; ALLOW_LIVE_STRIPE=0
FIREBASE_PROJECT=""; BUMP_KIND=""
TARGET="all"

ts()   { date +"%Y-%m-%d %H:%M:%S"; }
log()  { echo "[$(ts)] $*"; }
err()  { echo "[$(ts)] ERROR: $*" >&2; }
warn() { echo "[$(ts)] WARN: $*" >&2; }

print_help() { sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    all|full) TARGET="all"; shift;;
    app|hosting|rules|functions) TARGET="$1"; shift;;
    --skip-typecheck) DO_TYPECHECK=0; shift;;
    --skip-lint) DO_LINT=0; shift;;
    --fix) DO_FIX=1; shift;;
    --skip-tests) DO_TESTS=0; shift;;
    --skip-security) DO_SECURITY=0; shift;;
    --skip-build) DO_BUILD=0; shift;;
    --skip-push) DO_PUSH=0; shift;;
    --skip-deploy) DO_DEPLOY=0; shift;;
    --audit) PRECHECK_ONLY=1; DO_PUSH=0; DO_DEPLOY=0; OPEN_BROWSER=0; shift;;
    --dry-run) DRY_RUN=1; PRECHECK_ONLY=1; DO_PUSH=0; DO_DEPLOY=0; OPEN_BROWSER=0; shift;;
    --check) HEALTH_CHECK=1; DO_PUSH=0; DO_DEPLOY=0; shift;;
    --rollback-info) ROLLBACK_INFO=1; DO_PUSH=0; DO_DEPLOY=0; shift;;
    --production) PRODUCTION_MODE=1; shift;;
    --allow-live-stripe) ALLOW_LIVE_STRIPE=1; shift;;
    --bg) BG_MODE=1; shift;;
    --fast) DO_TESTS=0; DO_SECURITY=0; shift;;
    --preflight) PRECHECK_ONLY=1; DO_PUSH=0; DO_DEPLOY=0; OPEN_BROWSER=0; shift;;
    --project) FIREBASE_PROJECT="${2:-}"; shift 2;;
    --bump) BUMP_KIND="${2:-}"; shift 2;;
    --open) OPEN_BROWSER=1; shift;;
    --help|-h) print_help; exit 0;;
    *) warn "Unknown flag: $1"; shift;;
  esac
done

if [[ -z "$FIREBASE_PROJECT" ]]; then
  FIREBASE_PROJECT=$(node -e "try{const p=require('./.firebaserc').projects.default; if(p) console.log(p)}catch(e){}" 2>/dev/null || true)
fi
if [[ -z "$FIREBASE_PROJECT" || "$FIREBASE_PROJECT" == "your-firebase-project-id" || "$FIREBASE_PROJECT" == "YOUR_FIREBASE_PROJECT_ID" ]]; then
  err "Firebase project is not configured. Set .firebaserc default or pass --project <id>."
  exit 1
fi

if [[ $PRODUCTION_MODE -eq 1 ]]; then
  if [[ "$FIREBASE_PROJECT" != "$EXPECTED_FIREBASE_PROJECT" ]]; then
    err "Production deploy target mismatch. Expected '$EXPECTED_FIREBASE_PROJECT' but got '$FIREBASE_PROJECT'."
    err "Use --project $EXPECTED_FIREBASE_PROJECT or set EXPECTED_FIREBASE_PROJECT if this is intentional."
    exit 1
  fi

  export NODE_ENV=production
  export VITE_ENVIRONMENT=production
  export VITE_SITE_URL="${VITE_SITE_URL:-$PRODUCTION_SITE_URL}"
fi

production_readiness_check() {
  log "Production readiness checks"

  [[ -f firebase.json ]] || { err "firebase.json missing"; exit 1; }
  [[ -f .firebaserc ]] || { err ".firebaserc missing"; exit 1; }
  [[ -f public/robots.txt ]] || { err "public/robots.txt missing"; exit 1; }
  [[ -f public/sitemap.xml ]] || { err "public/sitemap.xml missing"; exit 1; }
  [[ -f public/site.webmanifest ]] || { err "public/site.webmanifest missing"; exit 1; }
  [[ -f public/media/chromatic-bookstore-hero-hd.png ]] || { err "Production share image missing: public/media/chromatic-bookstore-hero-hd.png"; exit 1; }

  node -e "
    const fs=require('fs');
    const rc=JSON.parse(fs.readFileSync('.firebaserc','utf8'));
    const fb=JSON.parse(fs.readFileSync('firebase.json','utf8'));
    const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
    const project=rc.projects && rc.projects.default;
    if(project !== '$EXPECTED_FIREBASE_PROJECT') {
      console.error('Expected .firebaserc default $EXPECTED_FIREBASE_PROJECT, got '+project);
      process.exit(1);
    }
    if(!fb.hosting || fb.hosting.public !== 'dist') {
      console.error('Firebase hosting public directory must be dist.');
      process.exit(1);
    }
    for (const dep of ['firebase','@stripe/stripe-js','react','react-router-dom']) {
      if(!pkg.dependencies || !pkg.dependencies[dep]) {
        console.error('Missing production dependency: '+dep);
        process.exit(1);
      }
    }
  "

  case "${VITE_STRIPE_PUBLISHABLE_KEY:-}" in
    pk_live_*)
      if [[ $ALLOW_LIVE_STRIPE -ne 1 ]]; then
        err "Live Stripe publishable key detected. Re-run with --allow-live-stripe only after real products, webhooks, fulfillment, and support policy are approved."
        exit 1
      fi
      warn "Live Stripe publishable key allowed by operator flag."
      ;;
    pk_test_*) log "Stripe publishable key is test-mode.";;
    *) warn "No Stripe test publishable key loaded. Billing remains demo-only until VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... is provided.";;
  esac

  if [[ "${VITE_FIREBASE_PROJECT_ID:-$FIREBASE_PROJECT}" != "$FIREBASE_PROJECT" ]]; then
    err "VITE_FIREBASE_PROJECT_ID (${VITE_FIREBASE_PROJECT_ID:-unset}) does not match Firebase deploy project ($FIREBASE_PROJECT)."
    exit 1
  fi

  log "Production env: VITE_ENVIRONMENT=${VITE_ENVIRONMENT:-unset} VITE_SITE_URL=${VITE_SITE_URL:-unset}"
}

if [[ $ROLLBACK_INFO -eq 1 ]]; then
  PROJECT_LABEL="${FIREBASE_PROJECT:-$(node -e "try{console.log(require('./.firebaserc').projects.default)}catch(e){console.log('your-firebase-project-id')}" 2>/dev/null)}"
  cat <<EOF
Safe Firebase Hosting rollback
  List releases: firebase hosting:releases:list --project $PROJECT_LABEL
  Roll back:     firebase hosting:rollback --project $PROJECT_LABEL
  Re-check:      bash .SYSTEMX/scripts/deploy.sh --check --project $PROJECT_LABEL
EOF
  exit 0
fi

if [[ $BG_MODE -eq 1 ]]; then
  BG_LOG="$LOG_DIR/deploy-bg-$(date +"%Y%m%d-%H%M%S").log"
  mkdir -p "$LOG_DIR"
  log "Starting background deploy target=$TARGET log=$BG_LOG"
  nohup "${BASH_SOURCE[0]}" "$TARGET" "${@}" > "$BG_LOG" 2>&1 &
  log "PID $!; tail -f $BG_LOG"
  exit 0
fi

command -v npm >/dev/null 2>&1 || { err "npm not found"; exit 1; }

mkdir -p "$LOG_DIR" "$VERSION_DIR"
RUN_ID=$(date +"%Y%m%d-%H%M%S")
RUN_LOG="$LOG_DIR/deploy-$RUN_ID.log"
trap 'err "Deploy failed. See $RUN_LOG"' ERR
exec > >(tee -a "$RUN_LOG") 2>&1
log "=== WebApp Stack G1 deploy (run $RUN_ID target=$TARGET) ==="
[[ $PRODUCTION_MODE -eq 1 ]] && log "Production mode enabled for project=$FIREBASE_PROJECT site=${VITE_SITE_URL:-$PRODUCTION_SITE_URL}"

if [[ $HEALTH_CHECK -eq 1 ]]; then
  log "Health/check mode"
  npm run -s ci:security --if-present || true
  [[ -f firebase.json ]] && node -e "const j=require('./firebase.json'); console.log(JSON.stringify({hosting:!!j.hosting,firestore:!!j.firestore,storage:!!j.storage,functions:!!j.functions},null,2))"
  exit 0
fi

if [[ $PRODUCTION_MODE -eq 1 ]]; then
  production_readiness_check
fi

# Optional version bump --------------------------------------------------------
if [[ -n "$BUMP_KIND" ]]; then
  case "$BUMP_KIND" in patch|minor|major) ;; *) err "--bump must be patch|minor|major"; exit 1;; esac
  log "Bumping version ($BUMP_KIND)"
  npm version "$BUMP_KIND" --no-git-tag-version >/dev/null 2>&1 || { err "Version bump failed"; exit 1; }
fi

PKG_VERSION=$(node -e 'console.log(require("./package.json").version)')

# Version/deploy-count tracking (skipped in preflight) -------------------------
COUNT=0
if [[ $PRECHECK_ONLY -eq 1 ]]; then
  COUNT=$(grep -o '[0-9]\+' "$DEPLOY_FILE" 2>/dev/null | head -1 || echo 0)
  log "Preflight: skipping version/changelog/git mutations"
else
  if [[ -f "$DEPLOY_FILE" ]]; then
    COUNT=$(grep -o '[0-9]\+' "$DEPLOY_FILE" | head -1 || echo 0); COUNT=$((COUNT+1))
  else COUNT=1; fi
  printf 'Deploy count: %d\n' "$COUNT" > "$DEPLOY_FILE"
  printf '%s\n' "$PKG_VERSION" > "$VERSION_FILE"
  if [[ -f "$VERSION_JSON" ]]; then
    TMP_JSON=$(mktemp)
    node -e "
      const fs=require('fs');
      const v=JSON.parse(fs.readFileSync('$VERSION_JSON','utf8'));
      v.app=v.app||{};
      v.app.previousVersion=v.app.version||'$PKG_VERSION';
      v.app.version='$PKG_VERSION';
      v.app.deployCount=$COUNT;
      v.app.lastUpdated=new Date().toISOString();
      v.app.branch='$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)';
      fs.writeFileSync('$TMP_JSON', JSON.stringify(v,null,2)+'\n');
    " 2>/dev/null && mv "$TMP_JSON" "$VERSION_JSON" || rm -f "$TMP_JSON"
  fi
fi

# Quality gates ----------------------------------------------------------------
if [[ $DO_TYPECHECK -eq 1 ]]; then
  log "Typecheck"; npm run -s typecheck --if-present || { err "Typecheck failed"; exit 1; }
else log "Skip typecheck"; fi

if [[ $DO_LINT -eq 1 ]]; then
  if [[ $DO_FIX -eq 1 ]]; then log "Lint --fix"; npm run -s lint:fix --if-present || { err "Lint fix failed"; exit 1; }
  else log "Lint"; npm run -s lint --if-present || warn "Lint reported issues"; fi
else log "Skip lint"; fi

if [[ $DO_TESTS -eq 1 ]]; then
  log "Tests"; npm run -s test --if-present || { err "Tests failed"; exit 1; }
else log "Skip tests"; fi

if [[ $DO_SECURITY -eq 1 ]]; then
  log "Security"; npm run -s ci:security --if-present || { err "Security gate failed"; exit 1; }
else log "Skip security"; fi

# Build ------------------------------------------------------------------------
HOSTING_PUBLIC=$(node -e "try{console.log(JSON.parse(require('fs').readFileSync('firebase.json','utf8')).hosting?.public||'dist')}catch(e){console.log('dist')}" 2>/dev/null || echo dist)
if [[ $DO_BUILD -eq 1 ]]; then
  log "Build"
  # Publish a public/version.json so the running app can detect new releases.
  if [[ -d "$ROOT_DIR/public" ]]; then
    node -e "require('fs').writeFileSync('public/version.json', JSON.stringify({version:'$PKG_VERSION',buildTime:new Date().toISOString()},null,2)+'\n')" 2>/dev/null \
      && log "Wrote public/version.json → v$PKG_VERSION" || warn "Could not write public/version.json"
  fi
  npm run -s build || { err "Build failed"; exit 1; }
else log "Skip build"; fi

# Changelog + git (skipped in preflight) --------------------------------------
CHANGED=$(git status --porcelain 2>/dev/null || true)
if [[ $PRECHECK_ONLY -eq 0 ]]; then
  if [[ -n "$CHANGED" ]]; then
    { echo "## $(ts) v$PKG_VERSION"; echo '```'; echo "$CHANGED"; echo '```'; } >> "$CHANGELOG_FILE"
    log "Staging + committing changes"
    git add -A
    git commit -m "Deploy v$PKG_VERSION" || warn "Nothing to commit"
  else log "No working-tree changes"; fi
else log "Preflight: skip changelog/commit"; fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)
if [[ $DO_PUSH -eq 1 ]]; then
  log "Pushing $CURRENT_BRANCH"; git push origin "$CURRENT_BRANCH" || warn "Push failed or not configured"
else log "Skip push"; fi

# Firebase deploy (smart targets) ---------------------------------------------
HOSTING_URL=""
if [[ $DO_DEPLOY -eq 1 ]]; then
  FB_CMD=()
  if command -v firebase >/dev/null 2>&1; then FB_CMD=(firebase)
  elif command -v npx >/dev/null 2>&1; then FB_CMD=(npx --yes firebase-tools)
  else err "Firebase CLI not found and npx unavailable"; exit 1; fi

  # Compile Cloud Functions if present.
  if [[ -f "$ROOT_DIR/functions/package.json" ]]; then
    log "Installing + compiling Cloud Functions"
    npm --prefix functions install --no-audit --no-fund || warn "functions install issues"
    if [[ -f "$ROOT_DIR/functions/tsconfig.json" ]]; then
      (cd "$ROOT_DIR/functions" && npx tsc --noEmitOnError false) || warn "functions compile had type errors; JS emitted anyway"
    fi
  fi

  # Build the --only target list from what actually exists.
  FB_TARGETS=$(node -e "
    const fs=require('fs'); let j={};
    try{ j=JSON.parse(fs.readFileSync('firebase.json','utf8')); }catch(e){}
    const t=[];
    const target='$TARGET';
    if((target==='all'||target==='app'||target==='hosting') && j.hosting) t.push('hosting');
    if((target==='all'||target==='rules') && j.firestore?.rules) t.push('firestore:rules');
    if((target==='all'||target==='rules') && j.firestore?.indexes && fs.existsSync('firestore.indexes.json')) t.push('firestore:indexes');
    if((target==='all'||target==='rules') && j.storage) t.push('storage');
    if((target==='all'||target==='app'||target==='functions') && (j.functions || fs.existsSync('functions/package.json'))) t.push('functions');
    process.stdout.write(t.join(',') || 'hosting');
  " 2>/dev/null || echo hosting)

  FB_ARGS=("deploy" "--only" "$FB_TARGETS")
  [[ -n "$FIREBASE_PROJECT" ]] && FB_ARGS+=("--project" "$FIREBASE_PROJECT")
  [[ $DRY_RUN -eq 1 ]] && FB_ARGS+=("--dry-run")
  export FUNCTIONS_DISCOVERY_TIMEOUT="${FUNCTIONS_DISCOVERY_TIMEOUT:-60000}"

  log "Deploying to Firebase ($FB_TARGETS)"
  set +e
  DEPLOY_OUTPUT=$("${FB_CMD[@]}" "${FB_ARGS[@]}" 2>&1)
  FB_STATUS=$?
  set -e
  echo "$DEPLOY_OUTPUT"
  [[ $FB_STATUS -ne 0 ]] && { err "Firebase deploy failed"; exit 1; }

  HOSTING_URL=$(echo "$DEPLOY_OUTPUT" | grep -Eo 'https?://[a-zA-Z0-9_.-]+\.web\.app' | head -1 || true)
  [[ -n "$HOSTING_URL" ]] && log "Deployed: $HOSTING_URL"
else log "Skip deploy"; fi

log "Done. version=$PKG_VERSION deploy#=$COUNT branch=$CURRENT_BRANCH log=$RUN_LOG"
printf '{"timestamp":"%s","event":"deploy","runId":"%s","target":"%s","version":"%s","deployCount":%d,"branch":"%s","dryRun":%s,"log":"%s"}\n' \
  "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$RUN_ID" "$TARGET" "$PKG_VERSION" "$COUNT" "$CURRENT_BRANCH" "$([[ $DRY_RUN -eq 1 ]] && echo true || echo false)" "$RUN_LOG" \
  >> "$LOG_DIR/deploy-history.jsonl"
[[ -n "$HOSTING_URL" ]] && log "Hosting URL: $HOSTING_URL"

if [[ $OPEN_BROWSER -eq 1 && -n "$HOSTING_URL" ]]; then
  if   [[ "$(uname -s)" == "Darwin" ]] && command -v open >/dev/null 2>&1; then open "$HOSTING_URL" || true
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$HOSTING_URL" || true
  elif [[ -n "${BROWSER:-}" ]]; then "$BROWSER" "$HOSTING_URL" || true
  else warn "No opener found for $HOSTING_URL"; fi
fi
