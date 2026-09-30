#include "kit-core/kit_runtime.h"

#include <stdio.h>
#include <string.h>

#ifdef STM32_HAL
#include "main.h"
#endif

static kit_state g;

void port_boot(const char *kit_slug) { kit_state_init(&g, kit_slug); }

kit_result port_rpc(const char *method, int channel, int pct, unsigned long max_on_ms) {
#ifdef STM32_HAL
  g.kill = (HAL_GPIO_ReadPin(KILL_GPIO_Port, KILL_Pin) == GPIO_PIN_RESET);
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
  port_boot("kit-valve-8z");
  g.now_ms = 1;
  g.flow_lpm = 2.0f;
  if (port_rpc("zoneOn", 0, 0, 5000) != KIT_OK) return 1;
  if (port_telemetry(buf, sizeof buf) <= 0) return 1;
  if (!strstr(buf, "pump")) return 1;
  printf("stm32wl host port ok\n");
  return 0;
}
#endif
