#!/usr/bin/env bash
# R6: interactive elements must be semantic and labelled.
# Counts div/span with onClick (not keyboard reachable).
cd "$(dirname "$0")/../.." || exit 1
grep -rnE '<(div|span|li|td)[^>]*onClick' src --include='*.tsx' 2>/dev/null | wc -l | tr -d ' '
