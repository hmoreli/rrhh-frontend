import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import { Authenticated, Refine } from "@refinedev/core";
import routerProvider, { NavigateToResource } from "@refinedev/react-router";
import { App as AntdApp, ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";

import { authProvider } from "./authProvider";
import { dataProvider } from "./dataProvider";
import { i18nProvider } from "./i18n";
import {
  Barrios,
  Cargos,
  Ciudades,
  Departamentos,
  Documentos,
  EntidadesBancarias,
  InstitucionesEducativas,
  Paises,
  Sectores,
  TiposContrato,
  TiposSancion,
} from "./pages/catalogos";
import {
  AltaFuncionario,
  DetalleFuncionario,
  EditarFuncionario,
  ListaFuncionarios,
} from "./pages/funcionarios";

const recursos = [
  {
    name: "funcionarios",
    list: "/funcionarios",
    create: "/funcionarios/nuevo",
    edit: "/funcionarios/:id/editar",
    show: "/funcionarios/:id",
    meta: { servicio: "funcionarios", label: "Funcionarios", canDelete: true },
  },
  { name: "catalogos", meta: { label: "Catálogos" } },
  ...[
    ["sectores", "Sectores"],
    ["cargos", "Cargos"],
    ["tipos-contrato", "Tipos de contrato"],
    ["paises", "Países"],
    ["departamentos", "Departamentos"],
    ["ciudades", "Ciudades"],
    ["barrios", "Barrios"],
    ["entidades-bancarias", "Entidades bancarias"],
    ["tipos-sancion", "Tipos de sanción", "desempeno"],
    ["documentos", "Documentos", "documentacion"],
    ["instituciones-educativas", "Instituciones educativas", "formacion"],
  ].map(([name, label, servicio = "organizacion"]) => ({
    name,
    list: `/catalogos/${name}`,
    meta: { servicio, label, parent: "catalogos", canDelete: name !== "documentos" },
  })),
  // Datos del legajo en otros servicios: se ven dentro del detalle del funcionario.
  ...[
    ["hijos", "funcionarios"],
    ["historicos-cargo", "desempeno"],
    ["sanciones", "desempeno"],
    ["documentos-funcionarios", "documentacion"],
    ["antecedentes-academicos", "formacion"],
    ["antecedentes-laborales", "formacion"],
  ].map(([name, servicio]) => ({ name, meta: { servicio, hide: true, canDelete: true } })),
];

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider locale={esES}>
        <AntdApp>
          <Refine
            dataProvider={dataProvider}
            authProvider={authProvider}
            i18nProvider={i18nProvider}
            routerProvider={routerProvider}
            notificationProvider={useNotificationProvider}
            resources={recursos}
            options={{ syncWithLocation: true, title: { text: "RRHH" } }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated key="app">
                    <ThemedLayoutV2 Sider={() => <ThemedSiderV2 fixed />}>
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route index element={<NavigateToResource resource="funcionarios" />} />
                <Route path="/funcionarios">
                  <Route index element={<ListaFuncionarios />} />
                  <Route path="nuevo" element={<AltaFuncionario />} />
                  <Route path=":id/editar" element={<EditarFuncionario />} />
                  <Route path=":id" element={<DetalleFuncionario />} />
                </Route>
                <Route path="/catalogos">
                  <Route path="sectores" element={<Sectores />} />
                  <Route path="cargos" element={<Cargos />} />
                  <Route path="tipos-contrato" element={<TiposContrato />} />
                  <Route path="paises" element={<Paises />} />
                  <Route path="departamentos" element={<Departamentos />} />
                  <Route path="ciudades" element={<Ciudades />} />
                  <Route path="barrios" element={<Barrios />} />
                  <Route path="entidades-bancarias" element={<EntidadesBancarias />} />
                  <Route path="tipos-sancion" element={<TiposSancion />} />
                  <Route path="documentos" element={<Documentos />} />
                  <Route
                    path="instituciones-educativas"
                    element={<InstitucionesEducativas />}
                  />
                </Route>
                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}
