# Offline soak evidence

| Field | Value |
|-------|-------|
| status | pass |
| start | 2026-09-20T09:41:47Z |
| end | 2026-09-20T10:42:23Z |
| soakSeconds | 3600 |
| pollInterval | 30 |
| pollOk | 121 |
| pollFail | 0 |
| gatewayUrl | http://127.0.0.1:13200 |
| compose | docker-compose.dev.yml |
| tbBefore | 1 |
| tbDuring | 0 |
| tbAfter | 1 |
| runDir | /var/folders/42/pfm5w0617dv4_9sjkkf40nf00000gn/T//syncrobrain-offline-soak-20260920T094147Z |

## Notes

- Strategy: `docker compose stop thingsboard` for SOAK_SECONDS; Gateway `/api/v1/health` must stay HTTP 200.
- Does **not** claim hardware-verified or Multi-Vertical complete.
