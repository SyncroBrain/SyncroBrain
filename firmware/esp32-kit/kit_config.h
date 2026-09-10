#ifndef KIT_CONFIG_H
#define KIT_CONFIG_H

// kit-win-act | kit-valve-8z | kit-pond-ctrl | kit-env-node | kit-rly-4ch | kit-fan-pwm | kit-gw-esp | kit-cold-trk
#ifndef KIT_SLUG
#define KIT_SLUG "kit-win-act"
#endif

#ifndef BOARD_MCU
#define BOARD_MCU "esp32-c3"
#endif

#define TELEMETRY_INTERVAL_MS 2000
#define MAX_ON_MS 30000
#define LOCAL_KILL_GPIO 9

#endif
