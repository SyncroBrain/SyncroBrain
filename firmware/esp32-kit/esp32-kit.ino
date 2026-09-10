/**
 * SyncroBrain public Controller Kit firmware (ESP32-C3 / ESP32-S3).
 * Production MQTT: ThingsBoard `v1/devices/me/telemetry` + RPC.
 * Interlocks (rain / dry-run / low-water) are enforced in Scene Kernel;
 * this sketch only applies local limits, max-on, and a GPIO kill switch.
 */
#include <WiFi.h>
#include <PubSubClient.h>
#include "kit_config.h"

#if __has_include("secrets.h")
#include "secrets.h"
#else
#include "secrets.example.h"
#endif

WiFiClient wifi;
PubSubClient mqtt(wifi);

bool killSwitch = false;
unsigned long lastTelemetry = 0;
unsigned long actuatorUntil = 0;
String lastCommand = "stop";
int positionPct = 0;
int fanPct = 0;
bool relays[4] = {false, false, false, false};
bool rain = false;
bool doorOpen = false;
float temperature = 24.0;
float humidity = 55.0;
float soil = 40.0;
float dissolvedOxygen = 6.5;
float waterLevelM = 0.80;
float illuminanceLux = 400.0;
float shockG = 0.10;

int parseJsonInt(const String& json, const char* key, int fallback) {
  String needle = String("\"") + key + "\"";
  int at = json.indexOf(needle);
  if (at < 0) return fallback;
  int colon = json.indexOf(':', at + needle.length());
  if (colon < 0) return fallback;
  return json.substring(colon + 1).toInt();
}

void allRelaysOff() {
  for (int i = 0; i < 4; i++) relays[i] = false;
}

void forceKillIdle() {
  lastCommand = "stop";
  actuatorUntil = 0;
  fanPct = 0;
  allRelaysOff();
}

void publishTelemetry() {
  char payload[512];
  int gw = mqtt.connected() ? 1 : 0;
  int limitOpen = positionPct >= 95 ? 1 : 0;
  int limitClose = positionPct <= 5 ? 1 : 0;
  int rainI = rain ? 1 : 0;
  int motorOn = actuatorUntil > millis() ? 1 : 0;
  float motorA = motorOn ? 0.35 : 0.0;
  int aerator = lastCommand == "aeratorOn" ? 1 : 0;
  int sprayer = lastCommand == "sprayOn" ? 1 : 0;
  int pump = (lastCommand == "pumpOn" || lastCommand == "zoneOn") ? 1 : 0;
  int valve1 = lastCommand == "zoneOn" ? 1 : 0;
  float flow = motorOn ? 1.2 : 0.0;
  int anyRelay = relays[0] || relays[1] || relays[2] || relays[3];
  float relayCurrent = anyRelay ? 0.20 : 0.0;

  if (strcmp(KIT_SLUG, "kit-win-act") == 0) {
    snprintf(payload, sizeof(payload),
             "{\"position_pct\":%d,\"limit_open\":%d,\"limit_close\":%d,\"rain\":%d,\"motor_current_a\":%.2f,\"gateway_online\":%d}",
             positionPct, limitOpen, limitClose, rainI, motorA, gw);
  } else if (strcmp(KIT_SLUG, "kit-valve-8z") == 0) {
    snprintf(payload, sizeof(payload),
             "{\"soil_pct\":%.1f,\"valve_1\":%d,\"pump\":%d,\"flow_lpm\":%.1f,\"rain\":%d,\"gateway_online\":%d}",
             soil, valve1, pump, flow, rainI, gw);
  } else if (strcmp(KIT_SLUG, "kit-pond-ctrl") == 0) {
    snprintf(payload, sizeof(payload),
             "{\"do_mgl\":%.2f,\"water_temp_c\":%.1f,\"water_level_m\":%.2f,\"aerator\":%d,\"sprayer\":%d,\"gateway_online\":%d}",
             dissolvedOxygen, temperature, waterLevelM, aerator, sprayer, gw);
  } else if (strcmp(KIT_SLUG, "kit-env-node") == 0) {
    snprintf(payload, sizeof(payload),
             "{\"temperature\":%.1f,\"humidity\":%.1f,\"soil_pct\":%.1f,\"illuminance_lux\":%.0f,\"rain\":%d,\"gateway_online\":%d}",
             temperature, humidity, soil, illuminanceLux, rainI, gw);
  } else if (strcmp(KIT_SLUG, "kit-rly-4ch") == 0) {
    snprintf(payload, sizeof(payload),
             "{\"relay_1\":%d,\"relay_2\":%d,\"relay_3\":%d,\"relay_4\":%d,\"current_a\":%.2f,\"gateway_online\":%d}",
             relays[0] ? 1 : 0, relays[1] ? 1 : 0, relays[2] ? 1 : 0, relays[3] ? 1 : 0, relayCurrent, gw);
  } else if (strcmp(KIT_SLUG, "kit-fan-pwm") == 0) {
    snprintf(payload, sizeof(payload),
             "{\"fan_pct\":%d,\"temperature\":%.1f,\"humidity\":%.1f,\"gateway_online\":%d}",
             fanPct, temperature, humidity, gw);
  } else if (strcmp(KIT_SLUG, "kit-gw-esp") == 0) {
    snprintf(payload, sizeof(payload),
             "{\"gateway_online\":%d}",
             gw);
  } else if (strcmp(KIT_SLUG, "kit-cold-trk") == 0) {
    snprintf(payload, sizeof(payload),
             "{\"temperature\":%.1f,\"humidity\":%.1f,\"door\":%d,\"gps\":\"0.00,0.00\",\"lat\":0.00,\"lon\":0.00,\"shock_g\":%.2f,\"gateway_online\":%d}",
             temperature, humidity, doorOpen ? 1 : 0, shockG, gw);
  } else {
    snprintf(payload, sizeof(payload),
             "{\"gateway_online\":%d}",
             gw);
  }
  mqtt.publish("v1/devices/me/telemetry", payload);
}

void applyCommand(const String& method, const String& params) {
  if (killSwitch || digitalRead(LOCAL_KILL_GPIO) == LOW) {
    forceKillIdle();
    return;
  }
  lastCommand = method;
  if (method == "open") {
    positionPct = 80;
    actuatorUntil = millis() + MAX_ON_MS;
  } else if (method == "setPosition") {
    int pct = parseJsonInt(params, "pct", 40);
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    positionPct = pct;
    actuatorUntil = millis() + MAX_ON_MS;
  } else if (method == "close") {
    positionPct = 0;
    actuatorUntil = 0;
  } else if (method == "stop") {
    actuatorUntil = 0;
    fanPct = 0;
    allRelaysOff();
  } else if (method == "setFan") {
    int pct = parseJsonInt(params, "pct", 0);
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    fanPct = pct;
  } else if (method == "relayOn") {
    int ch = parseJsonInt(params, "ch", 0);
    if (ch >= 1 && ch <= 4) {
      relays[ch - 1] = true;
      actuatorUntil = millis() + MAX_ON_MS;
    }
  } else if (method == "relayOff") {
    int ch = parseJsonInt(params, "ch", 0);
    if (ch >= 1 && ch <= 4) relays[ch - 1] = false;
    if (!relays[0] && !relays[1] && !relays[2] && !relays[3]) actuatorUntil = 0;
  } else if (method == "pumpOn" || method == "zoneOn" || method == "aeratorOn" || method == "sprayOn") {
    actuatorUntil = millis() + MAX_ON_MS;
  } else {
    actuatorUntil = 0;
  }
}

void onRpc(char* topic, byte* payload, unsigned int length) {
  String body;
  body.reserve(length);
  for (unsigned int i = 0; i < length; i++) body += (char)payload[i];
  int requestIdEnd = String(topic).lastIndexOf('/');
  String requestId = requestIdEnd >= 0 ? String(topic).substring(requestIdEnd + 1) : "0";
  int methodAt = body.indexOf("\"method\"");
  String method = "stop";
  if (methodAt >= 0) {
    int q1 = body.indexOf('"', methodAt + 8);
    int q2 = body.indexOf('"', q1 + 1);
    if (q1 >= 0 && q2 > q1) method = body.substring(q1 + 1, q2);
  }
  applyCommand(method, body);
  String replyTopic = "v1/devices/me/rpc/response/" + requestId;
  mqtt.publish(replyTopic.c_str(), "{\"ok\":true}");
}

void reconnect() {
  while (!mqtt.connected()) {
    if (mqtt.connect("esp32-kit", TB_TOKEN, nullptr)) {
      mqtt.subscribe("v1/devices/me/rpc/request/+");
    } else {
      delay(2000);
    }
  }
}

void setup() {
  pinMode(LOCAL_KILL_GPIO, INPUT_PULLUP);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) delay(200);
  mqtt.setServer(TB_SERVER, TB_PORT);
  mqtt.setCallback(onRpc);
}

void loop() {
  if (digitalRead(LOCAL_KILL_GPIO) == LOW) {
    killSwitch = true;
    forceKillIdle();
  }
  if (actuatorUntil && millis() > actuatorUntil) {
    lastCommand = "stop";
    actuatorUntil = 0;
    allRelaysOff();
  }
  if (!mqtt.connected()) reconnect();
  mqtt.loop();
  if (millis() - lastTelemetry >= TELEMETRY_INTERVAL_MS) {
    lastTelemetry = millis();
    publishTelemetry();
  }
}
