import { SQL } from "bun";

/** Todas las consultas van parametrizadas (plantillas de Bun.sql). */
export function crearDb(url) {
  const sql = new SQL(url);
  return {
    years: async () => (await sql`select distinct year from donors`).map((f) => f.year),
    nombres: async () => (await sql`select distinct name from donors order by name`).map((f) => f.name),
    listar: (year) => sql`select id, name, total, year from donors where year = ${year} order by total desc, name`,
    buscar: async (id) => (await sql`select id, name, total, year from donors where id = ${id}`)[0] ?? null,
    agregar: ({ name, total, year }) =>
      sql`insert into donors (name, total, year) values (${name}, ${total}, ${year})`,
    editar: (id, { name, total, year }) => sql`update donors set name = ${name}, total = ${total}, year = ${year} where id = ${id}`,
    borrar: (id) => sql`delete from donors where id = ${id}`,
  };
}
