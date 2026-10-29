import dayjs, { type Dayjs } from "dayjs";

/** Props para Form.Item con DatePicker: la API usa "YYYY-MM-DD". */
export const campoFecha = {
  getValueProps: (v?: string | null) => ({ value: v ? dayjs(v) : undefined }),
  normalize: (v?: Dayjs | null) => (v ? v.format("YYYY-MM-DD") : null),
};

export const mostrarFecha = (v?: string | null) => (v ? dayjs(v).format("DD/MM/YYYY") : "—");
