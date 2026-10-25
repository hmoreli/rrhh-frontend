import dayjs, { type Dayjs } from "dayjs";

/** Props para Form.Item con DatePicker/TimePicker: la API usa "YYYY-MM-DD" y "HH:mm:ss". */
export const campoFecha = {
  getValueProps: (v?: string | null) => ({ value: v ? dayjs(v) : undefined }),
  normalize: (v?: Dayjs | null) => (v ? v.format("YYYY-MM-DD") : null),
};

export const campoHora = {
  getValueProps: (v?: string | null) => ({ value: v ? dayjs(v, "HH:mm:ss") : undefined }),
  normalize: (v?: Dayjs | null) => (v ? v.format("HH:mm:ss") : null),
};

export const mostrarFecha = (v?: string | null) => (v ? dayjs(v).format("DD/MM/YYYY") : "—");
