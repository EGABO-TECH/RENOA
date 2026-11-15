/* Payload admin shell. Deliberately does NOT inherit the site layout:
   no site fonts, nav or globals.css leak into the admin. */
import type { ServerFunctionClient } from "payload";
import config from "@payload-config";
import { importMap } from "./admin/importMap.js";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import "@payloadcms/next/css";
import "./custom.scss";

type Args = { children: React.ReactNode };

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default function Layout({ children }: Args) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
