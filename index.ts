import swagger from "@elysiajs/swagger";
import Elysia from "elysia";
import { Config, elysiaFsRouter } from "elysia-fs-router";
import { config } from "./bux.config";
import { bux, port } from "./plugin";
// import { bue } from "./plugin";

const app = new Elysia()
.use(swagger())
.use(await elysiaFsRouter(config.routes))
.use(bux)
.use(port)

export type App = typeof app
