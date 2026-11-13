import { UploadOutlined } from "@ant-design/icons";
import { DeleteButton, EditButton, useModalForm, useSelect, useTable } from "@refinedev/antd";
import { type BaseRecord, useInvalidate } from "@refinedev/core";
import {
  App,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import type { ReactNode } from "react";

import { TIPOS_ARCHIVO, bajarArchivo, quitarArchivo, subirArchivo } from "../../archivos";
import { NombreDe } from "../../componentes/nombreDe";
import { campoFecha, mostrarFecha } from "../../fechas";

/**
 * Datos del legajo que viven en otros microservicios: hijos (ms-funcionarios),
 * historial de cargos y sanciones (ms-desempeno), documentos (ms-documentacion),
 * antecedentes académicos y laborales (ms-formacion). Todos se filtran con
 * ?funcionario_id= y se editan en un modal.
 */

type PropsSeccion = {
  recurso: string;
  servicio: string;
  funcionarioId: number;
  /** En singular y minúscula, para el título del modal ("hijo", "sanción"). */
  nombre: string;
  columnas: ColumnsType<BaseRecord>;
  campos: ReactNode;
  /** Botones extra por fila (p. ej. subir el archivo de un documento). */
  acciones?: (registro: BaseRecord) => ReactNode;
  /** Después de crear, editar o borrar (p. ej. refrescar el cargo actual). */
  alCambiar?: () => void;
};

function Seccion({
  recurso,
  servicio,
  funcionarioId,
  nombre,
  columnas,
  campos,
  acciones,
  alCambiar,
}: PropsSeccion) {
  const meta = { servicio };
  const { tableProps } = useTable({
    resource: recurso,
    meta,
    syncWithLocation: false,
    pagination: { pageSize: 50 },
    filters: { permanent: [{ field: "funcionario_id", operator: "eq", value: funcionarioId }] },
  });
  const alta = useModalForm({
    resource: recurso,
    action: "create",
    meta,
    syncWithLocation: false,
    onMutationSuccess: alCambiar,
  });
  const edicion = useModalForm({
    resource: recurso,
    action: "edit",
    meta,
    syncWithLocation: false,
    onMutationSuccess: alCambiar,
  });

  return (
    <>
      <Button type="primary" onClick={() => alta.show()} style={{ marginBottom: 12 }}>
        Agregar
      </Button>
      <Table
        {...tableProps}
        rowKey="id"
        size="small"
        scroll={{ x: true }}
        columns={[
          ...columnas,
          {
            title: "Acciones",
            render: (_, r) => (
              <Space>
                {acciones?.(r)}
                <EditButton hideText size="small" onClick={() => edicion.show(r.id)} />
                <DeleteButton
                  hideText
                  size="small"
                  resource={recurso}
                  meta={meta}
                  recordItemId={r.id}
                  onSuccess={alCambiar}
                />
              </Space>
            ),
          },
        ]}
      />
      <Modal {...alta.modalProps} forceRender title={`Agregar ${nombre}`}>
        <Form
          {...alta.formProps}
          layout="vertical"
          onFinish={(v) => alta.formProps.onFinish?.({ ...v, funcionario_id: funcionarioId })}
        >
          {campos}
        </Form>
      </Modal>
      <Modal {...edicion.modalProps} forceRender title={`Editar ${nombre}`}>
        <Form {...edicion.formProps} layout="vertical">
          {campos}
        </Form>
      </Modal>
    </>
  );
}

const esFutura = (d: Dayjs) => d.isAfter(dayjs(), "day");

const Fecha = ({
  label,
  name,
  requerida = false,
  sinFuturas = false,
}: {
  label: string;
  name: string;
  requerida?: boolean;
  sinFuturas?: boolean;
}) => (
  <Form.Item label={label} name={name} rules={[{ required: requerida }]} {...campoFecha}>
    <DatePicker
      format="DD/MM/YYYY"
      style={{ width: "100%" }}
      disabledDate={sinFuturas ? esFutura : undefined}
    />
  </Form.Item>
);

const SI_NO = [
  { value: true, label: "Sí" },
  { value: false, label: "No" },
];

const opciones = (recurso: string, servicio: string, campo = "nombre") => ({
  resource: recurso,
  meta: { servicio },
  optionLabel: (r: BaseRecord) => String(r[campo]),
  pagination: { pageSize: 200 },
});

type PropsLegajo = { funcionarioId: number };

// ---------------------------------------------------------------- Hijos

function Hijos({ funcionarioId }: PropsLegajo) {
  return (
    <Seccion
      recurso="hijos"
      servicio="funcionarios"
      funcionarioId={funcionarioId}
      nombre="hijo"
      columnas={[
        { title: "Nombre", dataIndex: "nombre" },
        { title: "Nacimiento", dataIndex: "fecha_nacimiento", render: mostrarFecha },
        { title: "Documento", dataIndex: "documento", render: (v) => v ?? "—" },
        {
          title: "Apto para bonificación",
          dataIndex: "apto_bonificacion",
          render: (v) => (v ? <Tag color="green">Sí</Tag> : <Tag>No</Tag>),
        },
      ]}
      campos={
        <>
          <Form.Item label="Nombre" name="nombre" rules={[{ required: true }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Fecha label="Fecha de nacimiento" name="fecha_nacimiento" requerida sinFuturas />
          <Form.Item label="Documento" name="documento">
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item
            label="Apto para bonificación"
            name="apto_bonificacion"
            initialValue={false}
            rules={[{ required: true }]}
          >
            <Radio.Group options={SI_NO} />
          </Form.Item>
        </>
      }
    />
  );
}

// ---------------------------------------------------------------- Cargos

function CamposCargo() {
  const { selectProps } = useSelect(opciones("cargos", "organizacion"));
  return (
    <>
      <Form.Item label="Cargo" name="cargo_id" rules={[{ required: true }]}>
        <Select {...selectProps} showSearch />
      </Form.Item>
      <Fecha label="Fecha de ingreso al cargo" name="fecha_ingreso" requerida />
      <Form.Item
        label="Fecha de egreso del cargo"
        name="fecha_egreso"
        tooltip="Vacía si es el cargo actual. Al cargar un cargo actual nuevo, el anterior se cierra el día antes."
        {...campoFecha}
      >
        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
      </Form.Item>
    </>
  );
}

function Cargos({ funcionarioId }: PropsLegajo) {
  const invalidar = useInvalidate();
  return (
    <Seccion
      recurso="historicos-cargo"
      servicio="desempeno"
      funcionarioId={funcionarioId}
      nombre="cargo"
      alCambiar={() => invalidar({ resource: "cargos-actuales", invalidates: ["list"] })}
      columnas={[
        {
          title: "Cargo",
          dataIndex: "cargo_id",
          render: (v) => <NombreDe recurso="cargos" servicio="organizacion" id={v} />,
        },
        { title: "Ingreso", dataIndex: "fecha_ingreso", render: mostrarFecha },
        {
          title: "Egreso",
          dataIndex: "fecha_egreso",
          render: (v) => (v ? mostrarFecha(v) : <Tag color="blue">actual</Tag>),
        },
      ]}
      campos={<CamposCargo />}
    />
  );
}

// ---------------------------------------------------------------- Sanciones

function CamposSancion() {
  const { selectProps } = useSelect(opciones("tipos-sancion", "desempeno", "descripcion"));
  return (
    <>
      <Form.Item label="Tipo de sanción" name="tipo_sancion_id" rules={[{ required: true }]}>
        <Select {...selectProps} />
      </Form.Item>
      <Form.Item label="Motivo" name="motivo" rules={[{ required: true }]}>
        <Input.TextArea rows={3} />
      </Form.Item>
      <Fecha label="Período desde" name="periodo_desde" />
      <Fecha label="Período hasta" name="periodo_hasta" />
    </>
  );
}

function Sanciones({ funcionarioId }: PropsLegajo) {
  return (
    <Seccion
      recurso="sanciones"
      servicio="desempeno"
      funcionarioId={funcionarioId}
      nombre="sanción"
      columnas={[
        {
          title: "Tipo",
          dataIndex: "tipo_sancion_id",
          render: (v) => (
            <NombreDe recurso="tipos-sancion" servicio="desempeno" id={v} campo="descripcion" />
          ),
        },
        { title: "Motivo", dataIndex: "motivo" },
        { title: "Desde", dataIndex: "periodo_desde", render: mostrarFecha },
        { title: "Hasta", dataIndex: "periodo_hasta", render: mostrarFecha },
      ]}
      campos={<CamposSancion />}
    />
  );
}

// ---------------------------------------------------------------- Documentos

type Documento = { id: number; descripcion: string; tiene_vencimiento: boolean };

function CamposDocumento() {
  const form = Form.useFormInstance();
  const documentoId = Form.useWatch("documento_id", form);
  const { selectProps, query } = useSelect(opciones("documentos", "documentacion", "descripcion"));
  const elegido = (query.data?.data as Documento[] | undefined)?.find((d) => d.id === documentoId);
  return (
    <>
      <Form.Item label="Documento" name="documento_id" rules={[{ required: true }]}>
        <Select {...selectProps} />
      </Form.Item>
      {elegido?.tiene_vencimiento && (
        <Fecha label="Vencimiento" name="fecha_vencimiento" requerida />
      )}
      <Form.Item
        label="Presentado"
        name="presentado"
        initialValue={false}
        tooltip="Se marca solo al subir el archivo"
      >
        <Radio.Group options={SI_NO} />
      </Form.Item>
    </>
  );
}

type Archivo = { nombre: string; tamano: number };

function AccionesArchivo({ registro }: { registro: BaseRecord }) {
  const { message } = App.useApp();
  const invalidar = useInvalidate();
  const refrescar = () =>
    invalidar({ resource: "documentos-funcionarios", invalidates: ["list", "detail"] });
  const archivo = registro.archivo as Archivo | null;
  const id = registro.id!;
  return (
    <>
      <Upload
        accept={TIPOS_ARCHIVO}
        showUploadList={false}
        customRequest={async ({ file, onSuccess, onError }) => {
          try {
            await subirArchivo(id, file as File);
            onSuccess?.({});
            message.success("Archivo subido");
            refrescar();
          } catch (e) {
            onError?.(e as Error);
            message.error((e as Error).message);
          }
        }}
      >
        <Tooltip title={archivo ? "Reemplazar archivo" : "Subir archivo (PDF, JPG o PNG)"}>
          <Button size="small" icon={<UploadOutlined />} />
        </Tooltip>
      </Upload>
      {archivo && (
        <Popconfirm
          title="¿Quitar el archivo?"
          description="El documento queda como no presentado."
          okText="Quitar"
          onConfirm={async () => {
            try {
              await quitarArchivo(id);
              refrescar();
            } catch (e) {
              message.error((e as Error).message);
            }
          }}
        >
          <Button size="small" danger>
            Quitar archivo
          </Button>
        </Popconfirm>
      )}
    </>
  );
}

function ArchivoEnlace({ registro }: { registro: BaseRecord }) {
  const { message } = App.useApp();
  const archivo = registro.archivo as Archivo | null;
  if (!archivo) return <>—</>;
  return (
    <Button
      type="link"
      size="small"
      style={{ padding: 0 }}
      onClick={() =>
        bajarArchivo(registro.id!, archivo.nombre).catch((e) => message.error(e.message))
      }
    >
      {archivo.nombre} ({Math.ceil(archivo.tamano / 1024)} KB)
    </Button>
  );
}

function Documentos({ funcionarioId }: PropsLegajo) {
  return (
    <Seccion
      recurso="documentos-funcionarios"
      servicio="documentacion"
      funcionarioId={funcionarioId}
      nombre="documento"
      columnas={[
        {
          title: "Documento",
          dataIndex: "documento_id",
          render: (v) => (
            <NombreDe recurso="documentos" servicio="documentacion" id={v} campo="descripcion" />
          ),
        },
        {
          title: "Vencimiento",
          dataIndex: "fecha_vencimiento",
          render: (v?: string | null) =>
            v && dayjs(v).isBefore(dayjs(), "day") ? (
              <Tag color="red">{mostrarFecha(v)} vencido</Tag>
            ) : (
              mostrarFecha(v)
            ),
        },
        {
          title: "Presentado",
          dataIndex: "presentado",
          render: (v) => (v ? <Tag color="green">Sí</Tag> : <Tag color="orange">No</Tag>),
        },
        { title: "Archivo", render: (_, r) => <ArchivoEnlace registro={r} /> },
      ]}
      acciones={(r) => <AccionesArchivo registro={r} />}
      campos={<CamposDocumento />}
    />
  );
}

// ---------------------------------------------------------------- Formación

const GRADOS = [
  { value: "bachiller", label: "Bachiller" },
  { value: "universitario", label: "Universitario" },
  { value: "maestria", label: "Maestría" },
  { value: "diplomado", label: "Diplomado" },
  { value: "doctorado", label: "Doctorado" },
];

function CamposAcademico() {
  const { selectProps } = useSelect(opciones("instituciones-educativas", "formacion"));
  return (
    <>
      <Form.Item label="Grado" name="grado" rules={[{ required: true }]}>
        <Select options={GRADOS} />
      </Form.Item>
      <Form.Item label="Título obtenido" name="titulo_obtenido" rules={[{ required: true }]}>
        <Input maxLength={255} />
      </Form.Item>
      <Form.Item label="Año" name="anio" rules={[{ required: true }]}>
        <InputNumber min={1900} max={dayjs().year()} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        label="Institución"
        name="institucion_educativa_id"
        rules={[{ required: true }]}
        tooltip="Se cargan en Catálogos > Instituciones educativas"
      >
        <Select {...selectProps} showSearch />
      </Form.Item>
    </>
  );
}

function Academicos({ funcionarioId }: PropsLegajo) {
  return (
    <Seccion
      recurso="antecedentes-academicos"
      servicio="formacion"
      funcionarioId={funcionarioId}
      nombre="antecedente académico"
      columnas={[
        {
          title: "Grado",
          dataIndex: "grado",
          render: (v) => GRADOS.find((g) => g.value === v)?.label ?? v,
        },
        { title: "Título", dataIndex: "titulo_obtenido" },
        { title: "Año", dataIndex: "anio" },
        {
          title: "Institución",
          dataIndex: "institucion_educativa_id",
          render: (v) => (
            <NombreDe recurso="instituciones-educativas" servicio="formacion" id={v} />
          ),
        },
      ]}
      campos={<CamposAcademico />}
    />
  );
}

function Laborales({ funcionarioId }: PropsLegajo) {
  return (
    <Seccion
      recurso="antecedentes-laborales"
      servicio="formacion"
      funcionarioId={funcionarioId}
      nombre="antecedente laboral"
      columnas={[
        { title: "Empresa", dataIndex: "nombre_empresa" },
        { title: "Cargo ocupado", dataIndex: "cargo_ocupado" },
        { title: "Motivo de salida", dataIndex: "motivo_salida", render: (v) => v ?? "—" },
        { title: "Ingreso", dataIndex: "fecha_ingreso", render: mostrarFecha },
        { title: "Salida", dataIndex: "fecha_salida", render: mostrarFecha },
      ]}
      campos={
        <>
          <Form.Item label="Nombre de la empresa" name="nombre_empresa" rules={[{ required: true }]}>
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item label="Cargo ocupado" name="cargo_ocupado" rules={[{ required: true }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item label="Motivo de salida" name="motivo_salida">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Fecha label="Fecha de ingreso" name="fecha_ingreso" sinFuturas />
          <Fecha label="Fecha de salida" name="fecha_salida" sinFuturas />
        </>
      }
    />
  );
}

/** Pestañas del legajo, debajo de los datos personales. */
export function PestaniasLegajo({ funcionarioId }: PropsLegajo) {
  const p = { funcionarioId };
  return (
    <Tabs
      style={{ marginTop: 24 }}
      destroyInactiveTabPane
      items={[
        { key: "cargos", label: "Historial de cargos", children: <Cargos {...p} /> },
        { key: "documentos", label: "Documentos", children: <Documentos {...p} /> },
        { key: "hijos", label: "Hijos", children: <Hijos {...p} /> },
        { key: "academicos", label: "Antecedentes académicos", children: <Academicos {...p} /> },
        { key: "laborales", label: "Antecedentes laborales", children: <Laborales {...p} /> },
        { key: "sanciones", label: "Sanciones", children: <Sanciones {...p} /> },
      ]}
    />
  );
}
