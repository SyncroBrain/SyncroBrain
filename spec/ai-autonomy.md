# SyncroBrain AI 自治边界 (v1.0)

> 对齐 [LuminaryWorks AI 集成指南](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/ai-product-integration.md)。  
> 产品代码：`syncrobrain` · feature：`ai.copilot`、`ai.autopilot`。

## 1. 接入

1. Gateway `modules/ai` 为产品 orchestrator（意图、工具、领域校验）。
2. 每次 tool call 重做 Casbin + Entitlement。
3. 通过 `@luminaryworks/ai-client`（或本地兼容适配器）调模型；`AI_MODE=off|local|central`。
4. Console 用 `@luminaryworks/ai-react` 的 `ModelForm`（若包不可用则 Gateway 暴露同一 Provider 合同，前端不复制密钥表单语义）。
5. 对话、证据、`AiUsageEvent` 留在 SyncroBrain 库。
6. LLM **不得**拥有资源删除权、任意 RPC、原始 SQL 或任意代码执行。

## 2. 自治包络

租户管理员按 Pack 预授权：

- 设备范围、动作白名单、数值上下限、频率、预算、时间窗
- 前置传感证据（例如 SOC、温度、连接状态）
- 回滚命令、kill switch

**包络内**无需逐次人工确认。下列任一则 **fail closed**：证据不足、模型超时、策略冲突、连接异常、权限/许可变化、kill switch。

## 3. 运行时红线

- AI 不是基础告警或设备安全的唯一依赖。断网由 EdgeAgent + 确定性规则继续运行。
- LLM 不接触设备凭据、TLS 私钥、TB 系统管理员密码。
- 命令只走 `CommandDispatcher` → Outbox → Edge；禁止模型拼 MQTT topic。
- 保存：证据摘要、模型/提示版本、tool call、策略判定、命令结果、token/费用。

## 4. 工具面

| 类 | 允许 | 禁止 |
|----|------|------|
| 读 | 资产、遥测、Incident、报告、Pack 目录 | 跨租户、原始库查询 |
| 写 | Pack 声明的命令 id | 删除项目/设备、任意 method RPC |
| 草案 | Pack/规则/报告草稿（需 `iot.pack:apply` 才落地） | 静默覆盖已冻结 Pack |

## 5. 测试

确定性门：固定模型桩。必须覆盖 prompt injection、越权诱饵、跨租户、任意 RPC、超范围设定值、重复扣费、kill switch、fail-closed。真实模型只作评测，不代替 CI。
