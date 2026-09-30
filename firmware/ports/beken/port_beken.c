#include "kit-core/kit_runtime.h"

#include <stdio.h>
#include <string.h>

#ifdef BK_SDK
/* Beken BK7231N / BK7252: link this file with the Beken IoT SDK.
 * GPIO kill = pin 9 active-low. Wi-Fi uses tuya/beken MQTT or SDK mqtt client
 * to v1/devices/me/telemetry. Do not invent a second topic. */
#include "gpio_pub.h"
#endif

static kit_state g;

void port_boot(const char *kit_slug) {
  kit_state_init(&g, kit_slug);
}

kit_result port_rpc(const char *method, int channel, int pct, unsigned long max_on_ms) {
#ifdef BK_SDK
  g.kill = (bk_gpio_input_get(9) == 0);
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
  port_boot("kit-win-act");
  if (port_rpc("open", 0, 0, 1000) != KIT_OK) return 1;
  if (port_telemetry(buf, sizeof buf) <= 0) return 1;
  if (!strstr(buf, "position_pct")) return 1;
  printf("beken host port ok\n");
  return 0;
}
#endif
