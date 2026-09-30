#include "kit-core/kit_runtime.h"

#include <stdio.h>
#include <string.h>

/* Quectel EC800 / EG800 class AT publisher.
 * Host build checks the AT text. On target, uart_write is the modem UART. */

static kit_state g;

void port_boot(const char *kit_slug) { kit_state_init(&g, kit_slug); }

int modem_build_publish(const kit_state *s, char *at, size_t len) {
  char payload[480];
  int n = kit_format_telemetry(s, payload, sizeof payload);
  if (n <= 0 || (size_t)n >= sizeof payload) return -1;
  return snprintf(at, len,
                  "AT+QMTPUB=0,1,1,0,\"v1/devices/me/telemetry\",%d,\"%s\"\r\n",
                  n, payload);
}

#ifdef HOST_BUILD
int main(void) {
  char at[640];
  port_boot("kit-cold-trk");
  g.temperature_c = -18.0f;
  g.door = 1;
  g.gateway_online = 1;
  kit_poll(&g);
  if (modem_build_publish(&g, at, sizeof at) <= 0) return 1;
  if (!strstr(at, "AT+QMTPUB")) return 1;
  if (!strstr(at, "v1/devices/me/telemetry")) return 1;
  if (!strstr(at, "temperature")) return 1;
  printf("cat1 modem at ok\n");
  return 0;
}
#endif
