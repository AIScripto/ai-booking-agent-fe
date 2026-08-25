#!/usr/bin/env bash
# R5: all network I/O lives in src/services/api.ts. No inline fetch in components/pages.
cd "$(dirname "$0")/../.." || exit 1
grep -rnE '\bfetch\(' src/components src/pages --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' '
