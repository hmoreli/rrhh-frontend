import {
  Create,
  DeleteButton,
  Edit,
  EditButton,
  FilterDropdown,
  List,
  Show,
  ShowButton,
  useForm,
  useTable,
} from "@refinedev/antd";
import { type HttpError, useCreate, useList, useOne, useShow } from "@refinedev/core";
import { Descriptions, Input, Select, Space, Table, Tag } from "antd";
import { useRef } from "react";

import { mostrarFecha } from "../../fechas";
import { FormularioFuncionario } from "./formulario";

type Funcionario = {
  id: number;
  nombres: string;
  apellidos: string;
  numero_documento: string;
  telefono: string;
  estado: "activo" | "inactivo";
  fecha_ingreso: string;
  fecha_egreso?: string | null;
  correo_electronico?: string | null;
  estado_civil?: string | null;
  direccion?: string | null;
  numero_cuenta_bancaria?: string | null;
  entidad_bancaria_id?: number | null;
};

type CargoActual = { id: number; cargo_id: number; fecha_ingreso: string };

type DatosAlta = Omit<Funcionario, "id"> & {
  cargo_id?: number | null;
  fecha_asuncion_cargo?: string | null;
};

const meta = { servicio: "funcionarios" };

const nombreCompleto = (f: Funcionario) => `${f.apellidos}, ${f.nombres}`;

const EstadoTag = ({ estado }: { estado: Funcionario["estado"] }) => (
  <Tag color={estado === "activo" ? "green" : "default"}>{estado}</Tag>
);

export function ListaFuncionarios() {
  const { tableProps, filters, setFilters } = useTable<Funcionario>({
    meta,
    filters: {
      initial: [{ field: "estado", operator: "eq", value: "activo" }],
    },
    syncWithLocation: true,
  });
  const busqueda = filters.find((f) => "field" in f && f.field === "q")?.value;
  return (
    <List title="Funcionarios">
      <Input.Search
        placeholder="Buscar por nombre, apellido o documento"
        allowClear
        defaultValue={busqueda}
        onSearch={(q) => setFilters([{ field: "q", operator: "eq", value: q || undefined }])}
        style={{ maxWidth: 360, marginBottom: 16 }}
      />
      <Table {...tableProps} rowKey="id">
        <Table.Column<Funcionario> title="Nombre" render={(_, f) => nombreCompleto(f)} />
        <Table.Column dataIndex="numero_documento" title="Documento" />
        <Table.Column dataIndex="telefono" title="Teléfono" />
        <Table.Column dataIndex="fecha_ingreso" title="Ingreso" render={mostrarFecha} />
        <Table.Column
          dataIndex="estado"
          title="Estado"
          render={(e) => <EstadoTag estado={e} />}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                style={{ minWidth: 160 }}
                options={[
                  { value: "activo", label: "Activo" },
                  { value: "inactivo", label: "Inactivo" },
                ]}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column<Funcionario>
          title="Acciones"
          render={(_, f) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={f.id} />
              <EditButton hideText size="small" recordItemId={f.id} />
              {f.estado === "activo" && (
                <DeleteButton
                  hideText
                  size="small"
                  recordItemId={f.id}
                  confirmTitle="¿Dar de baja a este funcionario?"
                  confirmOkText="Dar de baja"
                />
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
}

export function AltaFuncionario() {
  const { mutateAsync: crearCargo } = useCreate();
  // El cargo inicial va a ms-desempeno: se guarda acá hasta que el legajo tenga id.
  const cargo = useRef<{ cargo_id: number; fecha_ingreso: string }>();
  const { formProps, saveButtonProps } = useForm<Funcionario, HttpError, DatosAlta>({
    meta,
    onMutationSuccess: async ({ data }) => {
      if (!cargo.current) return;
      await crearCargo({
        resource: "historicos-cargo",
        meta: { servicio: "desempeno" },
        values: { funcionario_id: data.id, ...cargo.current },
        successNotification: false,
      });
    },
  });
  const guardar = (valores: DatosAlta) => {
    const { cargo_id, fecha_asuncion_cargo, ...legajo } = valores;
    cargo.current =
      cargo_id && fecha_asuncion_cargo
        ? { cargo_id, fecha_ingreso: fecha_asuncion_cargo }
        : undefined;
    return formProps.onFinish?.(legajo);
  };
  return (
    <Create saveButtonProps={saveButtonProps} title="Nuevo funcionario">
      <FormularioFuncionario formProps={{ ...formProps, onFinish: guardar }} conCargo />
    </Create>
  );
}

export function EditarFuncionario() {
  const { formProps, saveButtonProps } = useForm({ meta });
  return (
    <Edit saveButtonProps={saveButtonProps} title="Editar legajo">
      <FormularioFuncionario formProps={formProps} />
    </Edit>
  );
}

function CargoActual({ funcionarioId }: { funcionarioId: number }) {
  const actual = useList<CargoActual>({
    resource: "cargos-actuales",
    meta: { servicio: "desempeno" },
    filters: [{ field: "funcionario_id", operator: "eq", value: funcionarioId }],
  });
  const registro = actual.data?.data[0];
  const cargo = useOne<{ nombre: string }>({
    resource: "cargos",
    id: registro?.cargo_id,
    meta: { servicio: "organizacion" },
    queryOptions: { enabled: !!registro },
  });
  if (!registro) return <>{actual.isLoading ? "…" : "—"}</>;
  return (
    <>
      {cargo.data?.data.nombre ?? "…"} (desde {mostrarFecha(registro.fecha_ingreso)})
    </>
  );
}

function EntidadBancaria({ id }: { id: number }) {
  const { data } = useOne<{ nombre: string }>({
    resource: "entidades-bancarias",
    id,
    meta: { servicio: "organizacion" },
  });
  return <> ({data?.data.nombre ?? "…"})</>;
}

export function DetalleFuncionario() {
  const { query } = useShow<Funcionario>({ meta });
  const f = query.data?.data;
  return (
    <Show isLoading={query.isLoading} title="Legajo">
      {f && (
        <Descriptions bordered column={{ xs: 1, md: 2 }}>
          <Descriptions.Item label="Nombre">{nombreCompleto(f)}</Descriptions.Item>
          <Descriptions.Item label="Documento">{f.numero_documento}</Descriptions.Item>
          <Descriptions.Item label="Estado">
            <EstadoTag estado={f.estado} />
          </Descriptions.Item>
          <Descriptions.Item label="Ingreso">{mostrarFecha(f.fecha_ingreso)}</Descriptions.Item>
          <Descriptions.Item label="Egreso">{mostrarFecha(f.fecha_egreso)}</Descriptions.Item>
          <Descriptions.Item label="Teléfono">+{f.telefono}</Descriptions.Item>
          <Descriptions.Item label="Correo">{f.correo_electronico ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="Estado civil">{f.estado_civil ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="Dirección">{f.direccion ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="Cargo actual">
            <CargoActual funcionarioId={f.id} />
          </Descriptions.Item>
          <Descriptions.Item label="Cuenta bancaria">
            {f.numero_cuenta_bancaria ?? "—"}
            {f.entidad_bancaria_id && <EntidadBancaria id={f.entidad_bancaria_id} />}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Show>
  );
}
