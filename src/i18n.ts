import type { I18nProvider } from "@refinedev/core";

/** Textos de Refine en español. Lo que no está acá cae en el texto por defecto. */
const textos: Record<string, string> = {
  "buttons.create": "Nuevo",
  "buttons.save": "Guardar",
  "buttons.logout": "Cerrar sesión",
  "buttons.delete": "Eliminar",
  "buttons.edit": "Editar",
  "buttons.cancel": "Cancelar",
  "buttons.confirm": "¿Confirmás?",
  "buttons.show": "Ver",
  "buttons.undo": "Deshacer",
  "buttons.import": "Importar",
  "buttons.clone": "Duplicar",
  "buttons.refresh": "Actualizar",
  "buttons.export": "Exportar",
  "buttons.filter": "Filtrar",
  "buttons.clear": "Limpiar",
  "buttons.list": "Volver al listado",
  "buttons.notAccessTitle": "No tenés permiso para esta acción",
  "warnWhenUnsavedChanges": "Hay cambios sin guardar. ¿Salir igual?",
  "notifications.success": "Listo",
  "notifications.error": "Error ({{statusCode}})",
  "notifications.createSuccess": "Se creó el registro",
  "notifications.createError": "No se pudo crear ({{statusCode}})",
  "notifications.editSuccess": "Se guardaron los cambios",
  "notifications.editError": "No se pudo guardar ({{statusCode}})",
  "notifications.deleteSuccess": "Listo",
  "notifications.deleteError": "No se pudo eliminar ({{statusCode}})",
  "notifications.undoable": "Tenés {{seconds}} segundos para deshacer",
  "pages.error.backHome": "Volver al inicio",
  "pages.error.info": "La página no existe.",
  "loading": "Cargando",
  "dashboard.title": "Inicio",
};

export const i18nProvider: I18nProvider = {
  translate: (clave, opciones, porDefecto) => {
    const texto = textos[clave] ?? porDefecto ?? clave;
    if (!opciones || typeof opciones !== "object") return texto;
    return texto.replace(/\{\{(\w+)\}\}/g, (_, k) => String((opciones as Record<string, unknown>)[k] ?? ""));
  },
  changeLocale: async () => {},
  getLocale: () => "es",
};
