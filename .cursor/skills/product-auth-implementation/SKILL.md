---
name: product-auth-implementation
description: >-
  Implements LuminaryWorks product login (Logto OIDC + Experience API Headless)
  and resource authorization (Casbin) for NestJS + React SPAs. Use when wiring
  unified login, OIDC, JWT guards, Casbin ACL, permissions JSON on resources,
  or when the user asks to integrate Logto/Casbin into a product repo.
---

# Product Auth Implementation (Logto + Casbin)

Follow MetaRepo spec: `LuminaryWorks/spec/identity-and-permissions.md`.

## Non-negotiables

1. **AuthN = Logto only.** Do not invent product-local password stores for SaaS/private Logto modes.
2. **AuthZ = product Casbin.** Never put dashboard/device/course ACL into JWT or Logto roles.
3. **Login UI = Experience API / OIDC PKCE Headless.** Do not fork Logto `packages/experience` as the default path. Do not call Management API from the browser.
4. Use shared packages when available:
   - Backend: `@luminaryworks/auth-core` (JWKS verify + `LuminaryJwtAuthGuard`)
   - Frontend: `@luminaryworks/auth-react` (OIDC PKCE)
   - Optional: `@luminaryworks/pal` as abstraction over Casbin adapter
5. Map Logto `sub` → local `user_id` on first authenticated request (upsert).
6. List/detail APIs return `permissions: { view, edit, delete, ... }` computed by Casbin.

## Preconditions

- Local IdP: `cd LuminaryWorks && pnpm id:up` → OIDC `http://localhost:3001/oidc`, Admin `:3002`
- App registered in `identity/apps.json` + `node scripts/register-apps.mjs`
- Product `.env` has `IDP_ISSUER`, `IDP_AUDIENCE`, and SPA `VITE_IDP_*`

## Implementation checklist

### A. Backend (NestJS)

1. Add deps: `@luminaryworks/auth-core`, `casbin`, adapter (e.g. `typeorm-adapter` or file adapter for MVP).
2. Register `LuminaryAuthModule` + global `LuminaryJwtAuthGuard`.
3. Add `CasbinModule` / `PermissionService`:
   - Model: request `sub, obj, act`; policy `p, sub, obj, act`; optional `g, _, _` for RBAC.
   - `enforce(userKey, resourceKey, action)` and `batchPermissions(userKey, resourceKey, actions[])`.
4. Replace ad-hoc RBAC checks gradually: controllers keep `@RequirePermission`; implementation delegates to Casbin.
5. Webhook (optional P2): Logto user disable → clear local cache / disable user.

Env:

```bash
IDP_ISSUER=http://localhost:3001/oidc
IDP_AUDIENCE=https://api.<product>.local
IDP_MODE=logto
```

### B. Frontend (React SPA)

1. Wrap app with `LuminaryAuthProvider` from `@luminaryworks/auth-react`.
2. Routes: `/auth/callback`, login entry that starts OIDC (or Experience Headless flows).
3. Attach `Authorization: Bearer <access_token>` to API client.
4. Drive UI from resource `permissions` fields — do not hardcode role names for buttons.
5. Brand the login page per product (logo, colors, copy). Auth logic stays SDK/API.

Env:

```bash
VITE_IDP_ISSUER=http://localhost:3001/oidc
VITE_IDP_CLIENT_ID=<from identity/registered-apps.json>
VITE_IDP_REDIRECT_URI=http://localhost:<port>/auth/callback
```

### C. Casbin model (starter)

```ini
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && (r.obj == p.obj || p.obj == "*") && (r.act == p.act || p.act == "*")
```

Resource keys: `<type>:<id>` e.g. `dashboard:100`, `space:16`, `course:9`.  
Actions: `view|create|edit|delete|export|import|download|share` (product may subset).

### D. Permissions JSON shape

Match existing product contracts when present:

```json
{
  "id": 100,
  "name": "…",
  "permission": {
    "view": true,
    "edit": true,
    "delete": false,
    "export": true,
    "share": true
  }
}
```

(List items may use `permissions` plural — keep product-consistent.)

### E. Product-specific namespaces

| Product | Prefix / domain | Typical objects |
|---------|-----------------|-----------------|
| DataLuminary | `dashboard`, `space`, `dataset`, `datasource` | BI resources |
| BlockyEdu | `edu` | course, class, assignment |
| DoerFlow | `agent` | strategy, task, audit |
| VistaCast | `cast` | camera, alert, stream |
| VistaRemote | `remote` | device, session, file |
| SyncroBrain | `iot` | device, rule, telemetry |

### F. Out of scope / do not

- Do not store business ACL in Logto custom claims.
- Do not call Logto Management API from SPA.
- Do not break offline `IDP_MODE=legacy` until OIDC path is verified (feature-flag if needed).
- Do not cross-import other products' permission tables.

## Done criteria

- [ ] Unauthenticated API → 401; invalid JWT → 401
- [ ] Valid JWT without Casbin policy → deny protected actions
- [ ] Resource GET returns computed `permission(s)` map
- [ ] Login + callback works against local Logto
- [ ] README / product `spec` mentions Logto + Casbin and links MetaRepo IAM spec
- [ ] `.env.example` documents `IDP_*` / `VITE_IDP_*`

## References

- MetaRepo: `spec/identity-and-permissions.md`
- Docs: `docs/docs/develop/unified-login.md`
- Identity: `identity/README.md`, `identity/apps.json`
- Shared: `shared/packages/auth-core`, `auth-react`, `pal`
