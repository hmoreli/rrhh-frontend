import type { AuthProvider } from "@refinedev/core";

import { keycloak, roles } from "./keycloak";

/** La sesión la maneja Keycloak; Refine solo consulta su estado. */
export const authProvider: AuthProvider = {
  login: async () => {
    await keycloak.login();
    return { success: true };
  },
  logout: async () => {
    await keycloak.logout({ redirectUri: window.location.origin });
    return { success: true };
  },
  check: async () => {
    if (!keycloak.authenticated) {
      return { authenticated: false, redirectTo: "/login" };
    }
    try {
      await keycloak.updateToken(30);
      return { authenticated: true };
    } catch {
      return { authenticated: false, logout: true, redirectTo: "/login" };
    }
  },
  onError: async (error) => {
    if (error?.statusCode === 401) {
      return { logout: true };
    }
    return { error };
  },
  getIdentity: async () => {
    const t = keycloak.tokenParsed;
    if (!t) return null;
    return { id: t.sub, name: t.name ?? t.preferred_username, email: t.email };
  },
  getPermissions: async () => roles(),
};
