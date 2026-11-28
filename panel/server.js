import { crearApp } from "./app.js";
import { crearDb } from "./db.js";

const requerida = (nombre) => {
  const v = process.env[nombre];
  if (!v) throw new Error(`Falta la variable ${nombre}`);
  return v;
};

const app = crearApp({
  // La contraseña va aparte (PGPASSWORD) para no armar URLs con secretos
  db: crearDb({
    adapter: "postgres",
    hostname: requerida("PGHOST"),
    database: requerida("PGDATABASE"),
    username: requerida("PGUSER"),
    password: requerida("PGPASSWORD"),
    max: 4,
  }),
  usuario: requerida("ALLOWED_USER"),
  secreto: requerida("PROXY_SECRET"),
  origen: requerida("PUBLIC_ORIGIN"),
});

Bun.serve({ port: 3000, maxRequestBodySize: 16 * 1024, fetch: app });
console.info("Panel escuchando en :3000");
