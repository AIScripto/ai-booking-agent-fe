#!/usr/bin/env bash
# R3: no hardcoded hosts, ports, or tenant UUIDs. Config comes from import.meta.env.
cd "$(dirname "$0")/../.." || exit 1
URLS=$(grep -rnE 'https?://(localhost|127\.0\.0\.1)(:[0-9]+)?' src --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l)
UUID=$(grep -rnE "['\"][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}['\"]" src --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l)
echo $(( URLS + UUID )) | tr -d ' '
