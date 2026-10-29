import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { keycloak } from "./keycloak";

// Sin sesión no se muestra nada: Keycloak redirige a su pantalla de login (PKCE).
keycloak
  .init({ onLoad: "login-required", pkceMethod: "S256", checkLoginIframe: false })
  .then(() => {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch(() => {
    document.getElementById("root")!.textContent =
      "No se pudo conectar con el servidor de autenticación.";
  });
