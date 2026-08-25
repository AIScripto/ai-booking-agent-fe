#!/usr/bin/env bash
# R2: no `any`, no unjustified ts-ignore.
cd "$(dirname "$0")/../.." || exit 1
ANY=$(grep -rnE ':[[:space:]]*any\b|<any>|as any|any\[\]' src --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l)
IGN=$(grep -rn -E '@ts-(ignore|expect-error)' src --include='*.ts' --include='*.tsx' 2>/dev/null \
      | grep -vE '@ts-(ignore|expect-error).*[A-Za-z]{10,}' | wc -l)
echo $(( ANY + IGN )) | tr -d ' '
