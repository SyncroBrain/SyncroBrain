#include "kit-core/kit_runtime.h"

#include <stdio.h>
#include <string.h>

#ifdef NRF_SDK
#include "nrf_gpio.h"
#define KILL_PIN 9
#endif

static kit_state g;

void port_boot(const char *kit_slug) { kit_state_init(&g, kit_slug); }

kit_result port_rpc(const char *method, int channel, int pct, unsigned long max_on_ms) {
#ifdef NRF_SDK
  g.kill = (nrf_gpio_pin_read(KILL_PIN) == 0);
#endif
  return kit_apply(&g, method, channel, pct, max_on_ms);
}

int port_telemetry(char *buf, size_t len) {
  kit_poll(&g);
  return kit_format_telemetry(&g, buf, len);
}

#ifdef HOST_BUILD
int main(void) {
  char buf[256];
  port_boot("kit-env-node");
  /* temperature is internal; telemetry still emits the env-node contract */
  if (port_telemetry(buf, sizeof buf) <= 0) return 1;
  if (!strstr(buf, "temperature")) return 1;
  printf("nordic host port ok\n");
  return 0;
}
#endif
