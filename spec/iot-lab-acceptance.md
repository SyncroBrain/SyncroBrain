# IoT 实体课验收清单

跨产品联调（不把未实测硬件写成已完成）：

1. 合同：`pnpm test:contract`（SyncroBrain）覆盖 `/education-labs/sessions` 与 `LAB_SESSION_EXPIRED`。
2. Gateway：`iot-gateway` `pnpm test` — 学生 dry-run 不 dispatch；教师会话可 dispatch；过期 `LAB_SESSION_EXPIRED`；窗控雨关互锁。
3. BlockyEdu 仿真：`code-app-web` / `code-server` 三套断言（窗控 / 灌溉 / 鱼塘）。
4. 硬件仿真：`HardwareService.runSim` 在无 licensed adapter 时为 `export_only`，不得 stub `passed`。
5. 课程：edu-server 种子「智慧窗控实体课」「智慧灌溉实体课」「鱼塘增氧实体课」；`activityType=iot_lab`；证据写入 `edu_iot_lab_evidence`。
6. E2E（需本地栈）：进入课程 → Blockly 仿真断言通过 → 教师 Fake TB 真机会话 → 同一积木 → 证据回写。
7. 实机：ESP32-C3 / S3 各至少一次 MQTT 上报与 RPC；窗控雨关与限位；灌溉/鱼塘可用 12V 小泵与浮球。**完成前兼容矩阵不得标 `hardware-verified`。**
