#!/bin/sh
set -eu
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CC="${CC:-cc}"
fail=0
run() {
  name="$1"
  shift
  echo "→ $name"
  if ! "$@"; then
    echo "✗ $name"
    fail=1
  fi
}
"$CC" -std=c11 -Wall -Wextra -Werror -I"$ROOT/firmware/kit-core" \
  -o /tmp/sb-kit-core "$ROOT/firmware/kit-core/kit_runtime.c" "$ROOT/firmware/kit-core/test_kit_runtime.c"
run kit-core /tmp/sb-kit-core
"$CC" -std=c11 -Wall -Wextra -Werror -DHOST_BUILD -I"$ROOT/firmware" \
  -o /tmp/sb-beken "$ROOT/firmware/ports/beken/port_beken.c" "$ROOT/firmware/kit-core/kit_runtime.c"
run beken /tmp/sb-beken
"$CC" -std=c11 -Wall -Wextra -Werror -DHOST_BUILD -I"$ROOT/firmware" \
  -o /tmp/sb-nrf "$ROOT/firmware/ports/nordic/port_nrf52840.c" "$ROOT/firmware/kit-core/kit_runtime.c"
run nordic /tmp/sb-nrf
"$CC" -std=c11 -Wall -Wextra -Werror -DHOST_BUILD -I"$ROOT/firmware" \
  -o /tmp/sb-stm "$ROOT/firmware/ports/stm32wl/port_stm32wl.c" "$ROOT/firmware/kit-core/kit_runtime.c"
run stm32wl /tmp/sb-stm
"$CC" -std=c11 -Wall -Wextra -Werror -DHOST_BUILD -I"$ROOT/firmware" \
  -o /tmp/sb-cat1 "$ROOT/firmware/ports/cat1/modem_at.c" "$ROOT/firmware/kit-core/kit_runtime.c"
run cat1 /tmp/sb-cat1
exit "$fail"
