#!/usr/bin/env bash
# R8: oxlint error count (warnings excluded).
cd "$(dirname "$0")/../.." || exit 1
npx oxlint 2>/dev/null | grep -cE '^\S+:[0-9]+:[0-9]+: error' | tr -d ' '
