import { SQL } from "bun";

/** Todas las consultas van parametrizadas (plantillas de Bun.sql). */
export function crearDb(url) {
  const sql = new SQL(url);
  return {
    years: async () => (await sql`select distinct year from donors`).map((f) => f.year),
    nombres: async () => (await sql`select distinct name from donors order by name`).map((f) => f.name),
    listar: (year) => sql`select id, name, total, year from donors where year = ${year} order by total desc, name`,
    buscar: async (id) => (await sql`select id, name, total, year from donors where id = ${id}`)[0] ?? null,
    // Igual que el panel viejo: mismo nombre y año acumulan
    sumar: ({ name, total, year }) =>
      sql.begin(async (tx) => {
        await tx`select pg_advisory_xact_lock(hashtext(${name + "|" + year}))`;
        const [fila] = await tx`select id from donors where name = ${name} and year = ${year} order by id limit 1`;
        if (fila) await tx`update donors set total = total + ${total} where id = ${fila.id}`;
        else await tx`insert into donors (name, total, year) values (${name}, ${total}, ${year})`;
      }),
    editar: (id, { name, total, year }) => sql`update donors set name = ${name}, total = ${total}, year = ${year} where id = ${id}`,
    borrar: (id) => sql`delete from donors where id = ${id}`,
  };
}
