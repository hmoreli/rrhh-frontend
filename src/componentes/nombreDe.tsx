import { useOne } from "@refinedev/core";

type Props = {
  recurso: string;
  servicio: string;
  id: unknown;
  /** Campo a mostrar: "nombre" en casi todos los catálogos, "descripcion" en algunos. */
  campo?: string;
};

/** Muestra el nombre de un registro de otro recurso (país, cargo, tipo de sanción...). */
export function NombreDe({ recurso, servicio, id, campo = "nombre" }: Props) {
  const { data } = useOne<Record<string, unknown>>({
    resource: recurso,
    id: id as number,
    meta: { servicio },
    queryOptions: { enabled: id != null },
  });
  if (id == null) return <>—</>;
  const valor = data?.data[campo];
  return <>{valor == null ? "…" : String(valor)}</>;
}
