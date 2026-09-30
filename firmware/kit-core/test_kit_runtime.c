#include "kit_runtime.h"

#include <stdio.h>
#include <string.h>

static int fails = 0;

static void expect(int cond, const char *msg) {
  if (!cond) {
    fprintf(stderr, "FAIL %s\n", msg);
    fails++;
  }
}

int main(void) {
  kit_state s;
  char buf[512];

  kit_state_init(&s, "kit-win-act");
  s.rain = 1;
  expect(kit_apply(&s, "open", 0, 0, 30000) == KIT_DENIED_RAIN, "rain blocks open");
  expect(s.position_pct == 0, "position unchanged");

  s.rain = 0;
  s.kill = 1;
  expect(kit_apply(&s, "open", 0, 0, 30000) == KIT_DENIED_KILL, "kill blocks");
  s.kill = 0;
  expect(kit_apply(&s, "setPosition", 0, 120, 30000) == KIT_OK, "set position");
  expect(s.position_pct == 100, "pct clamped");

  kit_state_init(&s, "kit-pond-ctrl");
  s.water_level_m = 0.1f;
  expect(kit_apply(&s, "sprayOn", 0, 0, 30000) == KIT_DENIED_LEVEL, "low water");
  s.water_level_m = 0.8f;
  expect(kit_apply(&s, "sprayOn", 0, 0, 30000) == KIT_OK, "spray ok");
  s.water_level_m = 0.1f;
  kit_poll(&s);
  expect(s.sprayer == 0, "spray stopped when level drops");

  kit_state_init(&s, "kit-valve-8z");
  s.now_ms = 1000;
  s.flow_lpm = 0;
  expect(kit_apply(&s, "zoneOn", 0, 0, 60000) == KIT_OK, "zone on");
  s.now_ms = 1000 + s.dry_run_ms;
  kit_poll(&s);
  expect(s.pump == 0 && s.valve_1 == 0, "dry run stops pump");

  kit_state_init(&s, "kit-rly-4ch");
  s.now_ms = 0;
  expect(kit_apply(&s, "relayOn", 2, 0, 1000) == KIT_OK, "relay 2");
  expect(s.relays[1] == 1, "relay bit");
  s.now_ms = 1000;
  kit_poll(&s);
  expect(s.relays[1] == 0, "max on elapsed");

  kit_state_init(&s, "kit-env-node");
  s.gateway_online = 1;
  kit_poll(&s);
  expect(kit_format_telemetry(&s, buf, sizeof buf) > 0, "telemetry");
  expect(strstr(buf, "\"temperature\"") != NULL, "env key");

  kit_state_init(&s, "kit-cold-trk");
  s.lat = 31.2f;
  s.lon = 121.5f;
  expect(kit_format_telemetry(&s, buf, sizeof buf) > 0, "cold telemetry");
  expect(strstr(buf, "\"lat\"") != NULL, "lat key");

  if (fails) {
    fprintf(stderr, "%d failed\n", fails);
    return 1;
  }
  printf("kit-core host tests passed\n");
  return 0;
}
