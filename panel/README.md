# Donantes de ComiDólar

Corre en Coolify (proyecto `comidolar`), fuera de Vercel.

| Pieza | Qué hace |
|---|---|
| `comidolar-postgres` | Base `donantes`, **sin puerto público**, backup diario (07:00 UTC, 14 copias) |
| `postgrest` | `https://donantes.comidolar.com.ar/donantes`: solo lectura (rol `web_anon`, `SELECT` sobre la vista `api.donantes`) |
| `donaciones-app` | Panel de alta, edición y baja (rol `panel`, solo la tabla `donors`). Sin dominio propio |
| `oauth2-proxy` | `https://panel.comidolar.com.ar`: login de GitHub, solo la cuenta `gefydev` |

## Protección de las escrituras
1. La API pública no tiene ningún permiso de escritura.
2. oauth2-proxy valida la sesión en cada pedido.
3. La app exige además el secreto compartido con el proxy, el usuario permitido, el `Origin` propio y un token CSRF. No envía cabeceras CORS.

## Totales
Cada donación es una fila; la vista pública suma por persona y año (ver la excepción de 2024 en `schema.sql`).

## Variables en Coolify
- `PGHOST`: nombre interno de la base.
- `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET`: de la OAuth App de GitHub (callback `https://panel.comidolar.com.ar/oauth2/callback`).
- `SERVICE_PASSWORD_*`: las genera Coolify. Las de `PGRST` y `PANEL` se asignan a los roles `authenticator` y `panel` con `alter role`.

## Base nueva
`schema.sql` como superusuario, y después las contraseñas de los roles.

## Pruebas
- `bun test` (acceso, CSRF, validación).
- `tests/e2e-login.py` con `tests/fake-github.js`: sin sesión y con otra cuenta de GitHub no se puede escribir.
