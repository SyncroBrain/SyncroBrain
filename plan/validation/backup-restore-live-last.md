# Backup / restore live evidence

| Field | Value |
|-------|-------|
| status | pass |
| runId | 20260920T094146Z |
| end | 2026-09-20T09:41:57Z |
| compose | docker-compose.dev.yml |
| outdir | /var/folders/42/pfm5w0617dv4_9sjkkf40nf00000gn/T//syncrobrain-backup-restore-live-20260920T094146Z |
| dumpBytes | 172103 |
| verify | pg_restore --list + restore into iot_core_restore_probe_20260920094146 (dropped) |
| gatewayUrl | http://127.0.0.1:13200 |
| destructive | no (live iot_core / TB volume untouched) |

## Notes

- Full `restore.sh` against production volumes is **not** run by this drill.
- Does **not** claim hardware-verified or Multi-Vertical complete.
