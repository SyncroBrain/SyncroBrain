#ifndef KIT_RUNTIME_H
#define KIT_RUNTIME_H

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

#define KIT_CMD_LEN 32

typedef struct kit_state {
  const char *kit_slug;
  int kill;
  int rain;
  int door;
  int gateway_online;
  int position_pct;
  int fan_pct;
  int relays[4];
  int pump;
  int valve_1;
  int aerator;
  int sprayer;
  int limit_open;
  int limit_close;
  float temperature_c;
  float humidity;
  float soil_pct;
  float do_mgl;
  float water_level_m;
  float min_level_m;
  float flow_lpm;
  float illuminance_lux;
  float shock_g;
  float lat;
  float lon;
  unsigned long now_ms;
  unsigned long actuator_until_ms;
  unsigned long pump_on_since_ms;
  unsigned long dry_run_ms;
  char last_command[KIT_CMD_LEN];
} kit_state;

typedef enum kit_result {
  KIT_OK = 0,
  KIT_DENIED_KILL = 1,
  KIT_DENIED_RAIN = 2,
  KIT_DENIED_LEVEL = 3,
  KIT_DENIED_DRY = 4,
  KIT_DENIED_UNKNOWN = 5
} kit_result;

void kit_state_init(kit_state *s, const char *kit_slug);
void kit_force_idle(kit_state *s);
kit_result kit_apply(kit_state *s, const char *method, int channel, int pct, unsigned long max_on_ms);
void kit_poll(kit_state *s);
int kit_format_telemetry(const kit_state *s, char *buf, size_t len);
const char *kit_result_name(kit_result r);

#ifdef __cplusplus
}
#endif

#endif
