import Keycloak from "keycloak-js";

import { config } from "./config";

export const keycloak = new Keycloak(config.keycloak);

/** Devuelve un token vigente, renovándolo si vence en menos de 30 segundos. */
export async function tokenVigente(): Promise<string> {
  await keycloak.updateToken(30);
  return keycloak.token!;
}

export function roles(): string[] {
  return keycloak.tokenParsed?.realm_access?.roles ?? [];
}
