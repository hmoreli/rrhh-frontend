import { useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Radio, Select, Switch, Tag } from "antd";

import { NombreDe } from "../../componentes/nombreDe";
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
      {
        campo,
        titulo: etiqueta,
        render: (v) => <NombreDe recurso={recurso} servicio="organizacion" id={v} />,
      },
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

const Descripcion = () => (
  <Form.Item label="Descripción" name="descripcion" rules={[{ required: true }]}>
    <Input maxLength={100} />
  </Form.Item>
);

export const TiposSancion = () => (
  <Catalogo
    servicio="desempeno"
    titulo="Tipos de sanción"
    columnas={[{ campo: "descripcion", titulo: "Descripción" }]}
    campos={<Descripcion />}
  />
);

const siNo = (v: unknown) => (v ? "Sí" : "No");

export const Documentos = () => (
  <Catalogo
    servicio="documentacion"
    titulo="Documentos"
    sinBorrar
    columnas={[
      { campo: "descripcion", titulo: "Descripción" },
      {
        campo: "tipo",
        titulo: "Tipo",
        render: (v) =>
          v === "obligatoria" ? <Tag color="red">obligatorio</Tag> : <Tag>opcional</Tag>,
      },
      {
        campo: "tiempo_presentacion",
        titulo: "Plazo (días)",
        render: (v) => (v as number) ?? "—",
      },
      { campo: "tiene_vencimiento", titulo: "Vence", render: siNo },
    ]}
    campos={
      <>
        <Descripcion />
        <Form.Item label="Tipo" name="tipo" rules={[{ required: true }]} initialValue="obligatoria">
          <Radio.Group
            options={[
              { value: "obligatoria", label: "Obligatorio" },
              { value: "opcional", label: "Opcional" },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="Tiempo de presentación (días)"
          name="tiempo_presentacion"
          tooltip="Días que tiene el funcionario para presentarlo desde su ingreso"
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Tiene vencimiento"
          name="tiene_vencimiento"
          rules={[{ required: true }]}
          initialValue={false}
        >
          <Radio.Group
            options={[
              { value: true, label: "Sí" },
              { value: false, label: "No" },
            ]}
          />
        </Form.Item>
      </>
    }
  />
);

function CamposInstitucion() {
  const { selectProps } = useSelect({
    resource: "paises",
    meta: { servicio: "organizacion" },
    optionLabel: "nombre",
    pagination: { pageSize: 200 },
  });
  return (
    <>
      <Nombre />
      <Form.Item label="País" name="pais_id">
        <Select {...selectProps} allowClear />
      </Form.Item>
    </>
  );
}

export const InstitucionesEducativas = () => (
  <Catalogo
    servicio="formacion"
    titulo="Instituciones educativas"
    columnas={[
      { campo: "nombre", titulo: "Nombre" },
      {
        campo: "pais_id",
        titulo: "País",
        render: (v) => <NombreDe recurso="paises" servicio="organizacion" id={v} />,
      },
    ]}
    campos={<CamposInstitucion />}
  />
);
