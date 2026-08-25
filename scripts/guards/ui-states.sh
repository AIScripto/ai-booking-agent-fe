#!/usr/bin/env bash
# R4: no swallowed errors. Counts empty catch blocks and console-only catches.
cd "$(dirname "$0")/../.." || exit 1
EMPTY=$(grep -rnE 'catch[[:space:]]*\([^)]*\)[[:space:]]*\{[[:space:]]*\}' src --include='*.tsx' --include='*.ts' 2>/dev/null | wc -l)
LOGONLY=$(grep -rnA1 -E 'catch[[:space:]]*\([^)]*\)[[:space:]]*\{[[:space:]]*$' src --include='*.tsx' 2>/dev/null \
          | grep -cE 'console\.(log|error|warn)\([^)]*\);?[[:space:]]*$')
echo $(( EMPTY + LOGONLY )) | tr -d ' '
