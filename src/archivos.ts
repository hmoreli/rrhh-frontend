import { config } from "./config";
import { tokenVigente } from "./keycloak";

/**
 * Archivos de los documentos del legajo. Viven en el volumen de ms-documentacion y
 * van aparte del JSON: PUT (multipart), GET y DELETE en /documentos-funcionarios/{id}/archivo.
 */

const ruta = (id: number | string) =>
  `${config.apiUrl}/documentacion/documentos-funcionarios/${id}/archivo`;

async function fallo(respuesta: Response): Promise<never> {
  const datos = await respuesta.json().catch(() => ({}));
  throw new Error(datos.mensaje ?? `Error ${respuesta.status}`);
}

export const TIPOS_ARCHIVO = ".pdf,.jpg,.jpeg,.png";

export async function subirArchivo(id: number | string, archivo: File): Promise<void> {
  const cuerpo = new FormData();
  cuerpo.append("archivo", archivo);
  const respuesta = await fetch(ruta(id), {
    method: "PUT",
    headers: { Authorization: `Bearer ${await tokenVigente()}` },
    body: cuerpo,
  });
  if (!respuesta.ok) await fallo(respuesta);
}

export async function quitarArchivo(id: number | string): Promise<void> {
  const respuesta = await fetch(ruta(id), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${await tokenVigente()}` },
  });
  if (!respuesta.ok) await fallo(respuesta);
}

/** Baja el archivo con el token y lo guarda con su nombre original. */
export async function bajarArchivo(id: number | string, nombre: string): Promise<void> {
  const respuesta = await fetch(ruta(id), {
    headers: { Authorization: `Bearer ${await tokenVigente()}` },
  });
  if (!respuesta.ok) await fallo(respuesta);
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(await respuesta.blob());
  enlace.download = nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 60_000);
}
