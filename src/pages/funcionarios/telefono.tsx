import { useList } from "@refinedev/core";
import { Input, Select, Space } from "antd";
import type { Rule } from "antd/es/form";
import { useEffect, useMemo, useState } from "react";

type Pais = { id: number; nombre: string; codigo_telefono?: string | null };

/** Mismo formato que valida ms-funcionarios: código de país + número, solo dígitos. */
const FORMATO = /^[1-9][0-9]{7,14}$/;

export const reglasTelefono: Rule[] = [
  { required: true, message: "Ingresá el teléfono" },
  {
    validator: (_, valor?: string) =>
      !valor || FORMATO.test(valor)
        ? Promise.resolve()
        : Promise.reject(
            new Error("Elegí el país y escribí solo números, sin 0 inicial (ej. 981123456)"),
          ),
  },
];

type Props = { value?: string; onChange?: (valor: string) => void };

/**
 * Teléfono en formato internacional: el código sale del catálogo de países
 * (campo código telefónico) y el número se escribe aparte. Guarda "595981123456".
 */
export function CampoTelefono({ value, onChange }: Props) {
  const { data } = useList<Pais>({
    resource: "paises",
    meta: { servicio: "organizacion" },
    pagination: { pageSize: 200 },
  });
  const codigos = useMemo(
    () =>
      (data?.data ?? [])
        .filter((p) => p.codigo_telefono)
        .map((p) => ({ value: p.codigo_telefono!, label: `+${p.codigo_telefono} ${p.nombre}` })),
    [data],
  );
  const [codigo, setCodigo] = useState<string>();
  const [numero, setNumero] = useState("");

  // Separa un valor guardado en código y número (el código más largo que coincida).
  useEffect(() => {
    if (!value || value === (codigo ?? "") + numero) return;
    const encontrado = codigos
      .map((c) => c.value)
      .filter((c) => value.startsWith(c))
      .sort((a, b) => b.length - a.length)[0];
    setCodigo(encontrado);
    setNumero(encontrado ? value.slice(encontrado.length) : value);
  }, [value, codigos]); // eslint-disable-line react-hooks/exhaustive-deps

  const cambiar = (nuevoCodigo: string | undefined, nuevoNumero: string) => {
    setCodigo(nuevoCodigo);
    setNumero(nuevoNumero);
    onChange?.((nuevoCodigo ?? "") + nuevoNumero);
  };

  return (
    <Space.Compact style={{ width: "100%" }}>
      <Select
        style={{ width: "45%" }}
        placeholder="País"
        options={codigos}
        value={codigo}
        onChange={(c) => cambiar(c, numero)}
        showSearch
        optionFilterProp="label"
        notFoundContent="Cargá el código telefónico en Catálogos → Países"
      />
      <Input
        style={{ width: "55%" }}
        inputMode="numeric"
        placeholder="981123456"
        value={numero}
        onChange={(e) => cambiar(codigo, e.target.value.trim())}
      />
    </Space.Compact>
  );
}
