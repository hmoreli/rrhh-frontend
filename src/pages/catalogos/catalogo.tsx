import { DeleteButton, EditButton, List, useModalForm, useTable } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Form, Input, Modal, Space, Table } from "antd";
import type { ReactNode } from "react";

export type Columna = {
  campo: string;
  titulo: string;
  render?: (v: unknown) => ReactNode;
};

type Props = {
  servicio: string;
  titulo: string;
  columnas: Columna[];
  /** Campos del formulario de alta y edición (Form.Item). */
  campos: ReactNode;
};

/** Pantalla genérica para catálogos simples: tabla + alta y edición en un modal. */
export function Catalogo({ servicio, titulo, columnas, campos }: Props) {
  const meta = { servicio };
  const { tableProps, setFilters } = useTable({ meta, syncWithLocation: true });
  const alta = useModalForm({
    action: "create",
    meta,
    syncWithLocation: false,
  });
  const edicion = useModalForm({
    action: "edit",
    meta,
    syncWithLocation: false,
  });

  return (
    <List title={titulo} createButtonProps={{ onClick: () => alta.show() }}>
      <Input.Search
        placeholder="Buscar"
        allowClear
        onSearch={(q) => setFilters([{ field: "q", operator: "eq", value: q || undefined }])}
        style={{ maxWidth: 320, marginBottom: 16 }}
      />
      <Table {...tableProps} rowKey="id">
        {columnas.map((c) => (
          <Table.Column key={c.campo} dataIndex={c.campo} title={c.titulo} render={c.render} />
        ))}
        <Table.Column<BaseRecord>
          title="Acciones"
          render={(_, r) => (
            <Space>
              <EditButton hideText size="small" onClick={() => edicion.show(r.id)} />
              <DeleteButton hideText size="small" recordItemId={r.id} meta={meta} />
            </Space>
          )}
        />
      </Table>
      <Modal {...alta.modalProps} forceRender title={`Nuevo: ${titulo.toLowerCase()}`}>
        <Form {...alta.formProps} name="alta" layout="vertical">
          {campos}
        </Form>
      </Modal>
      <Modal {...edicion.modalProps} forceRender title={`Editar: ${titulo.toLowerCase()}`}>
        <Form {...edicion.formProps} name="edicion" layout="vertical">
          {campos}
        </Form>
      </Modal>
    </List>
  );
}
