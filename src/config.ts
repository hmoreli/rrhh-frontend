export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  keycloak: {
    url: import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8080",
    realm: import.meta.env.VITE_KEYCLOAK_REALM ?? "rrhh",
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "rrhh-frontend",
  },
};
