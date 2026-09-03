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
bool rain = false;
float temperature = 24.0;
float soil = 40.0;
float dissolvedOxygen = 6.5;
float waterLevel = 80.0;

void publishTelemetry() {
  char payload[384];
  if (strcmp(KIT_SLUG, "kit-win-act") == 0) {
    snprintf(payload, sizeof(payload),
             "{\"kitSlug\":\"%s\",\"rain\":%d,\"temperature\":%.1f,\"position\":%d,\"limit_open\":%d,\"limit_close\":%d,\"killSwitch\":%d}",
             KIT_SLUG, rain ? 1 : 0, temperature, positionPct, positionPct >= 95, positionPct <= 5, killSwitch ? 1 : 0);
  } else if (strcmp(KIT_SLUG, "kit-valve-8z") == 0) {
    snprintf(payload, sizeof(payload),
             "{\"kitSlug\":\"%s\",\"soil\":%.1f,\"rain\":%d,\"flow\":%.1f,\"pump\":%d,\"killSwitch\":%d}",
             KIT_SLUG, soil, rain ? 1 : 0, actuatorUntil > millis() ? 1.2 : 0.0, actuatorUntil > millis(), killSwitch ? 1 : 0);
  } else if (strcmp(KIT_SLUG, "kit-pond-ctrl") == 0) {
    snprintf(payload, sizeof(payload),
             "{\"kitSlug\":\"%s\",\"do_mgl\":%.2f,\"level_pct\":%.1f,\"temp\":%.1f,\"aerator\":%d,\"spray\":%d,\"killSwitch\":%d}",
             KIT_SLUG, dissolvedOxygen, waterLevel, temperature, lastCommand == "aerateOn", lastCommand == "sprayOn", killSwitch ? 1 : 0);
  } else {
    snprintf(payload, sizeof(payload),
             "{\"kitSlug\":\"%s\",\"temperature\":%.1f,\"humidity\":55.0,\"killSwitch\":%d}",
             KIT_SLUG, temperature, killSwitch ? 1 : 0);
  }
  mqtt.publish("v1/devices/me/telemetry", payload);
}

void applyCommand(const String& method, const String& params) {
  if (killSwitch || digitalRead(LOCAL_KILL_GPIO) == LOW) {
    lastCommand = "stop";
    actuatorUntil = 0;
    return;
  }
  lastCommand = method;
  if (method == "open" || method == "setPosition") {
    positionPct = method == "open" ? 80 : 40;
    actuatorUntil = millis() + MAX_ON_MS;
  } else if (method == "close" || method == "stop") {
    positionPct = method == "close" ? 0 : positionPct;
    actuatorUntil = 0;
  } else if (method == "pumpOn" || method == "zoneOn" || method == "aerateOn" || method == "sprayOn") {
    actuatorUntil = millis() + MAX_ON_MS;
  } else {
    actuatorUntil = 0;
  }
  (void)params;
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
    lastCommand = "stop";
    actuatorUntil = 0;
  }
  if (actuatorUntil && millis() > actuatorUntil) {
    lastCommand = "stop";
    actuatorUntil = 0;
  }
  if (!mqtt.connected()) reconnect();
  mqtt.loop();
  if (millis() - lastTelemetry >= TELEMETRY_INTERVAL_MS) {
    lastTelemetry = millis();
    publishTelemetry();
  }
}
