import { Config } from "elysia-fs-router";
import "./vue.config";
export type BuxConfig = {
    port?: number,
    ssr?: boolean,
    clientRoot?: string,
    routes?: Config
}

export const config: BuxConfig = {
    //these are used by buchta and elysia
    port: 3005,
    ssr: true,
    clientRoot: 'client',
    routes: {
        serverDir: 'server',
        apiPrefix: 'api'
    }
}


