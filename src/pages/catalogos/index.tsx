import { useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select } from "antd";

import { Catalogo } from "./catalogo";

const guaranies = (v: unknown) =>
  typeof v === "number" ? `₲ ${v.toLocaleString("es-PY", { maximumFractionDigits: 0 })}` : "—";

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
      { campo: "duracion_dias", titulo: "Duración (días)", render: (v) => (v as number) ?? "—" },
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
