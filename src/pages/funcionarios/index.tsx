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
import { useShow } from "@refinedev/core";
import { Descriptions, Select, Space, Table, Tag } from "antd";

import { mostrarFecha } from "../../fechas";
import { FormularioFuncionario } from "./formulario";

type Funcionario = {
  id: number;
  numero_documento: string;
  telefono: string;
  estado: "activo" | "inactivo";
  fecha_ingreso: string;
  fecha_egreso?: string | null;
  correo_electronico?: string | null;
  estado_civil?: string | null;
  direccion?: string | null;
  dias_laborales?: string | null;
  horario_ingreso?: string | null;
  horario_salida?: string | null;
};

const meta = { servicio: "funcionarios" };

const EstadoTag = ({ estado }: { estado: Funcionario["estado"] }) => (
  <Tag color={estado === "activo" ? "green" : "default"}>{estado}</Tag>
);

export function ListaFuncionarios() {
  const { tableProps } = useTable<Funcionario>({
    meta,
    filters: { initial: [{ field: "estado", operator: "eq", value: "activo" }] },
    syncWithLocation: true,
  });
  return (
    <List title="Funcionarios">
      <Table {...tableProps} rowKey="id">
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
  const { formProps, saveButtonProps } = useForm({ meta });
  return (
    <Create saveButtonProps={saveButtonProps} title="Nuevo funcionario">
      <FormularioFuncionario formProps={formProps} />
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

export function DetalleFuncionario() {
  const { query } = useShow<Funcionario>({ meta });
  const f = query.data?.data;
  return (
    <Show isLoading={query.isLoading} title="Legajo">
      {f && (
        <Descriptions bordered column={{ xs: 1, md: 2 }}>
          <Descriptions.Item label="Documento">{f.numero_documento}</Descriptions.Item>
          <Descriptions.Item label="Estado">
            <EstadoTag estado={f.estado} />
          </Descriptions.Item>
          <Descriptions.Item label="Ingreso">{mostrarFecha(f.fecha_ingreso)}</Descriptions.Item>
          <Descriptions.Item label="Egreso">{mostrarFecha(f.fecha_egreso)}</Descriptions.Item>
          <Descriptions.Item label="Teléfono">{f.telefono}</Descriptions.Item>
          <Descriptions.Item label="Correo">{f.correo_electronico ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="Estado civil">{f.estado_civil ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="Dirección">{f.direccion ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="Horario">
            {f.horario_ingreso && f.horario_salida
              ? `${f.horario_ingreso.slice(0, 5)} a ${f.horario_salida.slice(0, 5)}`
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Días laborales">{f.dias_laborales ?? "—"}</Descriptions.Item>
        </Descriptions>
      )}
    </Show>
  );
}
