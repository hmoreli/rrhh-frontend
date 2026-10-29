import { useSelect } from "@refinedev/antd";
import { useOne } from "@refinedev/core";
import { Form, Input, InputNumber, Select, Switch, Tag } from "antd";

import { Catalogo } from "./catalogo";

// Los montos llegan como texto ("4500000.00") para no perder precisión.
const guaranies = (v: unknown) => {
  const n = typeof v === "string" || typeof v === "number" ? Number(v) : NaN;
  return Number.isFinite(n) ? `₲ ${n.toLocaleString("es-PY", { maximumFractionDigits: 0 })}` : "—";
};

const Nombre = () => (
  <Form.Item label="Nombre" name="nombre" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
);

export const Sectores = () => (
  <Catalogo
    servicio="organizacion"
    titulo="Sectores"
    columnas={[{ campo: "nombre", titulo: "Nombre" }]}
    campos={<Nombre />}
  />
);

export const TiposContrato = () => (
  <Catalogo
    servicio="organizacion"
    titulo="Tipos de contrato"
    columnas={[
      { campo: "nombre", titulo: "Nombre" },
      {
        campo: "duracion_dias",
        titulo: "Duración (días)",
        render: (v) => (v as number) ?? "—",
      },
    ]}
    campos={
      <>
        <Nombre />
        <Form.Item label="Duración (días)" name="duracion_dias">
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      </>
    }
  />
);

export const Paises = () => (
  <Catalogo
    servicio="organizacion"
    titulo="Países"
    columnas={[
      { campo: "nombre", titulo: "Nombre" },
      { campo: "codigo_iso", titulo: "ISO" },
      { campo: "gentilicio", titulo: "Gentilicio" },
      {
        campo: "codigo_telefono",
        titulo: "Código telefónico",
        render: (v) => (v ? `+${v}` : "—"),
      },
    ]}
    campos={
      <>
        <Nombre />
        <Form.Item label="Código ISO" name="codigo_iso">
          <Input maxLength={3} />
        </Form.Item>
        <Form.Item label="Gentilicio" name="gentilicio">
          <Input />
        </Form.Item>
        <Form.Item
          label="Código telefónico"
          name="codigo_telefono"
          tooltip="Sin el +. Paraguay: 595"
          rules={[{ pattern: /^[1-9][0-9]{0,2}$/, message: "De 1 a 3 números, sin +" }]}
        >
          <Input maxLength={3} inputMode="numeric" placeholder="595" />
        </Form.Item>
      </>
    }
  />
);

function CamposCargo() {
  const { selectProps } = useSelect({
    resource: "sectores",
    meta: { servicio: "organizacion" },
    optionLabel: "nombre",
    pagination: { pageSize: 200 },
  });
  return (
    <>
      <Nombre />
      <Form.Item label="Salario base (₲)" name="salario_base" rules={[{ required: true }]}>
        <InputNumber min={0} step={100000} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item label="Sector" name="sector_id">
        <Select {...selectProps} allowClear />
      </Form.Item>
    </>
  );
}

export const Cargos = () => (
  <Catalogo
    servicio="organizacion"
    titulo="Cargos"
    columnas={[
      { campo: "nombre", titulo: "Nombre" },
      { campo: "salario_base", titulo: "Salario base", render: guaranies },
    ]}
    campos={<CamposCargo />}
  />
);

/** Muestra el nombre de un registro padre (país de un departamento, etc.). */
function NombreDe({ recurso, id }: { recurso: string; id: unknown }) {
  const { data } = useOne<{ nombre: string }>({
    resource: recurso,
    id: id as number,
    meta: { servicio: "organizacion" },
    queryOptions: { enabled: id != null },
  });
  return <>{id == null ? "—" : (data?.data.nombre ?? "…")}</>;
}

function SelectPadre({
  recurso,
  campo,
  etiqueta,
}: {
  recurso: string;
  campo: string;
  etiqueta: string;
}) {
  const { selectProps } = useSelect({
    resource: recurso,
    meta: { servicio: "organizacion" },
    optionLabel: "nombre",
    pagination: { pageSize: 200 },
  });
  return (
    <Form.Item label={etiqueta} name={campo} rules={[{ required: true }]}>
      <Select {...selectProps} />
    </Form.Item>
  );
}

const hijoDe = (titulo: string, recurso: string, campo: string, etiqueta: string) => () => (
  <Catalogo
    servicio="organizacion"
    titulo={titulo}
    columnas={[
      { campo: "nombre", titulo: "Nombre" },
      { campo, titulo: etiqueta, render: (v) => <NombreDe recurso={recurso} id={v} /> },
    ]}
    campos={
      <>
        <Nombre />
        <SelectPadre recurso={recurso} campo={campo} etiqueta={etiqueta} />
      </>
    }
  />
);

export const Departamentos = hijoDe("Departamentos", "paises", "pais_id", "País");
export const Ciudades = hijoDe("Ciudades", "departamentos", "departamento_id", "Departamento");
export const Barrios = hijoDe("Barrios", "ciudades", "ciudad_id", "Ciudad");

export const EntidadesBancarias = () => (
  <Catalogo
    servicio="organizacion"
    titulo="Entidades bancarias"
    columnas={[
      { campo: "nombre", titulo: "Nombre" },
      {
        campo: "activo",
        titulo: "Estado",
        render: (v) => (v ? <Tag color="green">activa</Tag> : <Tag>inactiva</Tag>),
      },
    ]}
    campos={
      <>
        <Nombre />
        <Form.Item label="Activa" name="activo" valuePropName="checked" initialValue={true}>
          <Switch />
        </Form.Item>
      </>
    }
  />
);
