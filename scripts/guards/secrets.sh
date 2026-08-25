#!/usr/bin/env bash
# Hard gate: no real credentials. Anything in a VITE_* var ships to every browser.
cd "$(dirname "$0")/../.." || exit 1
grep -raoE 'sk_live_[A-Za-z0-9]{10,}|sk_test_[A-Za-z0-9]{16,}|cal_live_[A-Za-z0-9]{16,}|SG\.[A-Za-z0-9_-]{22,}|AC[0-9a-f]{32}|AIza[A-Za-z0-9_-]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY' \
  src index.html 2>/dev/null | grep -vE 'x{4,}|XXXX' | wc -l | tr -d ' '
