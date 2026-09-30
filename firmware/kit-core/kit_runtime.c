#include "kit_runtime.h"

#include <stdio.h>
#include <string.h>

static void copy_cmd(kit_state *s, const char *method) {
  snprintf(s->last_command, sizeof s->last_command, "%s", method ? method : "stop");
}

void kit_state_init(kit_state *s, const char *kit_slug) {
  memset(s, 0, sizeof *s);
  s->kit_slug = kit_slug ? kit_slug : "kit-env-node";
  s->temperature_c = 24.0f;
  s->humidity = 55.0f;
  s->soil_pct = 40.0f;
  s->do_mgl = 6.5f;
  s->water_level_m = 0.80f;
  s->min_level_m = 0.30f;
  s->illuminance_lux = 400.0f;
  s->shock_g = 0.1f;
  s->dry_run_ms = 15000;
  copy_cmd(s, "stop");
}

void kit_force_idle(kit_state *s) {
  copy_cmd(s, "stop");
  s->actuator_until_ms = 0;
  s->pump_on_since_ms = 0;
  s->fan_pct = 0;
  s->pump = 0;
  s->valve_1 = 0;
  s->aerator = 0;
  s->sprayer = 0;
  s->position_pct = 0;
  for (int i = 0; i < 4; i++) s->relays[i] = 0;
}

const char *kit_result_name(kit_result r) {
  switch (r) {
    case KIT_OK: return "ok";
    case KIT_DENIED_KILL: return "kill";
    case KIT_DENIED_RAIN: return "rain";
    case KIT_DENIED_LEVEL: return "low-water";
    case KIT_DENIED_DRY: return "dry-run";
    default: return "unknown";
  }
}

kit_result kit_apply(kit_state *s, const char *method, int channel, int pct, unsigned long max_on_ms) {
  if (!method || !method[0]) return KIT_DENIED_UNKNOWN;
  if (s->kill) {
    kit_force_idle(s);
    return KIT_DENIED_KILL;
  }
  if (pct < 0) pct = 0;
  if (pct > 100) pct = 100;

  if (strcmp(method, "open") == 0 || strcmp(method, "setPosition") == 0) {
    if (s->rain) return KIT_DENIED_RAIN;
    s->position_pct = strcmp(method, "open") == 0 ? 80 : pct;
    s->actuator_until_ms = s->now_ms + max_on_ms;
    copy_cmd(s, method);
    return KIT_OK;
  }
  if (strcmp(method, "close") == 0) {
    s->position_pct = 0;
    s->actuator_until_ms = 0;
    copy_cmd(s, method);
    return KIT_OK;
  }
  if (strcmp(method, "stop") == 0) {
    kit_force_idle(s);
    return KIT_OK;
  }
  if (strcmp(method, "setFan") == 0) {
    s->fan_pct = pct;
    copy_cmd(s, method);
    return KIT_OK;
  }
  if (strcmp(method, "relayOn") == 0) {
    if (channel < 1 || channel > 4) return KIT_DENIED_UNKNOWN;
    s->relays[channel - 1] = 1;
    s->actuator_until_ms = s->now_ms + max_on_ms;
    copy_cmd(s, method);
    return KIT_OK;
  }
  if (strcmp(method, "relayOff") == 0) {
    if (channel < 1 || channel > 4) return KIT_DENIED_UNKNOWN;
    s->relays[channel - 1] = 0;
    copy_cmd(s, method);
    return KIT_OK;
  }
  if (strcmp(method, "sprayOn") == 0) {
    if (s->water_level_m < s->min_level_m) return KIT_DENIED_LEVEL;
    s->sprayer = 1;
    s->actuator_until_ms = s->now_ms + max_on_ms;
    copy_cmd(s, method);
    return KIT_OK;
  }
  if (strcmp(method, "sprayOff") == 0) {
    s->sprayer = 0;
    copy_cmd(s, method);
    return KIT_OK;
  }
  if (strcmp(method, "aeratorOn") == 0) {
    s->aerator = 1;
    s->actuator_until_ms = s->now_ms + max_on_ms;
    copy_cmd(s, method);
    return KIT_OK;
  }
  if (strcmp(method, "aeratorOff") == 0) {
    s->aerator = 0;
    copy_cmd(s, method);
    return KIT_OK;
  }
  if (strcmp(method, "pumpOn") == 0 || strcmp(method, "zoneOn") == 0) {
    s->pump = 1;
    if (strcmp(method, "zoneOn") == 0) s->valve_1 = 1;
    if (s->pump_on_since_ms == 0) s->pump_on_since_ms = s->now_ms;
    s->actuator_until_ms = s->now_ms + max_on_ms;
    copy_cmd(s, method);
    return KIT_OK;
  }
  if (strcmp(method, "pumpOff") == 0 || strcmp(method, "zoneOff") == 0) {
    s->pump = 0;
    s->valve_1 = 0;
    s->pump_on_since_ms = 0;
    s->flow_lpm = 0;
    copy_cmd(s, method);
    return KIT_OK;
  }
  return KIT_DENIED_UNKNOWN;
}

void kit_poll(kit_state *s) {
  s->limit_open = s->position_pct >= 95 ? 1 : 0;
  s->limit_close = s->position_pct <= 5 ? 1 : 0;
  if (s->kill) {
    kit_force_idle(s);
    return;
  }
  if (s->actuator_until_ms && s->now_ms >= s->actuator_until_ms) {
    int fan = s->fan_pct;
    kit_force_idle(s);
    s->fan_pct = fan;
    return;
  }
  if (s->pump && s->flow_lpm <= 0.01f && s->pump_on_since_ms &&
      s->now_ms >= s->pump_on_since_ms + s->dry_run_ms) {
    s->pump = 0;
    s->valve_1 = 0;
    s->pump_on_since_ms = 0;
    copy_cmd(s, "stop");
  }
  if (s->sprayer && s->water_level_m < s->min_level_m) {
    s->sprayer = 0;
    copy_cmd(s, "stop");
  }
}

int kit_format_telemetry(const kit_state *s, char *buf, size_t len) {
  const char *slug = s->kit_slug;
  int n = 0;
  if (strcmp(slug, "kit-win-act") == 0) {
    n = snprintf(buf, len,
                 "{\"position_pct\":%d,\"limit_open\":%d,\"limit_close\":%d,\"rain\":%d,\"gateway_online\":%d}",
                 s->position_pct, s->limit_open, s->limit_close, s->rain, s->gateway_online);
  } else if (strcmp(slug, "kit-valve-8z") == 0) {
    n = snprintf(buf, len,
                 "{\"soil_pct\":%.1f,\"valve_1\":%d,\"pump\":%d,\"flow_lpm\":%.1f,\"rain\":%d,\"gateway_online\":%d}",
                 s->soil_pct, s->valve_1, s->pump, s->flow_lpm, s->rain, s->gateway_online);
  } else if (strcmp(slug, "kit-pond-ctrl") == 0) {
    n = snprintf(buf, len,
                 "{\"do_mgl\":%.2f,\"water_temp_c\":%.1f,\"water_level_m\":%.2f,\"aerator\":%d,\"sprayer\":%d,\"gateway_online\":%d}",
                 s->do_mgl, s->temperature_c, s->water_level_m, s->aerator, s->sprayer, s->gateway_online);
  } else if (strcmp(slug, "kit-rly-4ch") == 0) {
    n = snprintf(buf, len,
                 "{\"relay_1\":%d,\"relay_2\":%d,\"relay_3\":%d,\"relay_4\":%d,\"gateway_online\":%d}",
                 s->relays[0], s->relays[1], s->relays[2], s->relays[3], s->gateway_online);
  } else if (strcmp(slug, "kit-fan-pwm") == 0) {
    n = snprintf(buf, len,
                 "{\"fan_pct\":%d,\"temperature\":%.1f,\"humidity\":%.1f,\"gateway_online\":%d}",
                 s->fan_pct, s->temperature_c, s->humidity, s->gateway_online);
  } else if (strcmp(slug, "kit-cold-trk") == 0) {
    n = snprintf(buf, len,
                 "{\"temperature\":%.1f,\"humidity\":%.1f,\"door\":%d,\"lat\":%.5f,\"lon\":%.5f,\"shock_g\":%.2f,\"gateway_online\":%d}",
                 s->temperature_c, s->humidity, s->door, s->lat, s->lon, s->shock_g, s->gateway_online);
  } else if (strcmp(slug, "kit-gw-esp") == 0) {
    n = snprintf(buf, len, "{\"gateway_online\":%d}", s->gateway_online);
  } else {
    n = snprintf(buf, len,
                 "{\"temperature\":%.1f,\"humidity\":%.1f,\"soil_pct\":%.1f,\"illuminance_lux\":%.0f,\"rain\":%d,\"gateway_online\":%d}",
                 s->temperature_c, s->humidity, s->soil_pct, s->illuminance_lux, s->rain, s->gateway_online);
  }
  return n;
}
