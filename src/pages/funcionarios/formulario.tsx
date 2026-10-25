import { useSelect } from "@refinedev/antd";
import { Col, DatePicker, Form, Input, Row, Select, TimePicker } from "antd";
import type { FormProps } from "antd";

import { campoFecha, campoHora } from "../../fechas";

const ESTADOS_CIVILES = [
  { value: "soltero", label: "Soltero/a" },
  { value: "casado", label: "Casado/a" },
  { value: "viudo", label: "Viudo/a" },
  { value: "union_de_hecho", label: "Unión de hecho" },
];

const organizacion = (resource: string) => ({
  resource,
  meta: { servicio: "organizacion" },
  optionLabel: "nombre" as const,
  pagination: { pageSize: 200 },
});

/** Campos del legajo, compartidos por el alta y la edición. */
export function FormularioFuncionario({ formProps }: { formProps: FormProps }) {
  const paises = useSelect(organizacion("paises"));
  const cargos = useSelect(organizacion("cargos"));
  const tipos = useSelect(organizacion("tipos-contrato"));
  const ciudades = useSelect(organizacion("ciudades"));

  return (
    <Form {...formProps} layout="vertical">
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item label="Número de documento" name="numero_documento" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="País del documento" name="pais_documento_id" rules={[{ required: true }]}>
            <Select {...paises.selectProps} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="País de origen" name="pais_origen_id" rules={[{ required: true }]}>
            <Select {...paises.selectProps} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Estado civil" name="estado_civil">
            <Select options={ESTADOS_CIVILES} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Teléfono" name="telefono" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Correo electrónico" name="correo_electronico" rules={[{ type: "email" }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={16}>
          <Form.Item label="Dirección" name="direccion">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Ciudad" name="ciudad_id">
            <Select {...ciudades.selectProps} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Fecha de ingreso" name="fecha_ingreso" rules={[{ required: true }]} {...campoFecha}>
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Ingreso al seguro social (IPS)" name="fecha_ingreso_seguro_social" {...campoFecha}>
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Estado" name="estado" initialValue="activo" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "activo", label: "Activo" },
                { value: "inactivo", label: "Inactivo" },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Cargo" name="cargo_id">
            <Select {...cargos.selectProps} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Asunción del cargo" name="fecha_asuncion_cargo" {...campoFecha}>
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Tipo de contrato" name="tipo_contrato_id">
            <Select {...tipos.selectProps} allowClear />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item label="Horario de ingreso" name="horario_ingreso" {...campoHora}>
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item label="Horario de salida" name="horario_salida" {...campoHora}>
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Días laborales" name="dias_laborales">
            <Input placeholder="Lunes a viernes" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Cuenta bancaria" name="numero_cuenta_bancaria">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Contacto de emergencia" name="contacto_emergencia">
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
