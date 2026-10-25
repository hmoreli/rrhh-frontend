import type { BaseRecord, CrudFilter, DataProvider, HttpError, MetaQuery } from "@refinedev/core";

import { config } from "./config";
import { tokenVigente } from "./keycloak";

/**
 * Data provider para los microservicios de RRHH detrás de Kong.
 *
 * Cada recurso declara en `meta.servicio` a qué microservicio pertenece:
 * el recurso "cargos" con servicio "organizacion" va a /api/organizacion/cargos.
 * Las listas usan ?limit=&offset= y los filtros por igualdad del backend.
 */

function url(resource: string, meta: MetaQuery | undefined, id?: string | number): string {
  if (!meta?.servicio) {
    throw new Error(`El recurso "${resource}" no tiene meta.servicio`);
  }
  const base = `${config.apiUrl}/${meta.servicio}/${meta.ruta ?? resource}`;
  return id === undefined ? base : `${base}/${id}`;
}

async function pedir<T>(metodo: string, destino: string, cuerpo?: unknown): Promise<T> {
  const respuesta = await fetch(destino, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${await tokenVigente()}`,
      ...(cuerpo === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  if (respuesta.status === 204) return undefined as T;
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    // Formato común de rrhh-common: {codigo, mensaje, detalles: [{campo, mensaje}]}
    const errores: Record<string, string[]> = {};
    for (const d of datos.detalles ?? []) {
      errores[String(d.campo).replace(/^body\./, "")] = [d.mensaje];
    }
    const error: HttpError = {
      message: datos.mensaje ?? respuesta.statusText,
      statusCode: respuesta.status,
      errors: errores,
    };
    throw error;
  }
  return datos as T;
}

function filtrosAQuery(filtros: CrudFilter[] = []): Record<string, string> {
  const query: Record<string, string> = {};
  for (const f of filtros) {
    if ("field" in f && f.operator === "eq" && f.value !== undefined && f.value !== "") {
      query[f.field] = String(f.value);
    }
  }
  return query;
}

export const dataProvider: DataProvider = {
  getApiUrl: () => config.apiUrl,

  getList: async ({ resource, pagination, filters, meta }) => {
    const tamanio = pagination?.pageSize ?? 10;
    const pagina = pagination?.current ?? 1;
    const offset = (pagina - 1) * tamanio;
    const params = new URLSearchParams({
      limit: String(tamanio),
      offset: String(offset),
      ...filtrosAQuery(filters),
    });
    const data = await pedir<BaseRecord[]>("GET", `${url(resource, meta)}?${params}`);
    // La API no devuelve el total todavía: si la página vino llena, se asume que hay otra.
    const total = offset + data.length + (data.length === tamanio ? 1 : 0);
    return { data: data as never, total };
  },

  getOne: async ({ resource, id, meta }) => ({
    data: await pedir("GET", url(resource, meta, id)),
  }),

  create: async ({ resource, variables, meta }) => ({
    data: await pedir("POST", url(resource, meta), variables),
  }),

  update: async ({ resource, id, variables, meta }) => ({
    data: await pedir("PATCH", url(resource, meta, id), variables),
  }),

  deleteOne: async ({ resource, id, meta }) => {
    await pedir("DELETE", url(resource, meta, id));
    return { data: { id } as never };
  },
};
