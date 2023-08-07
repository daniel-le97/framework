import { Buchta } from "buchta";
import Elysia from "elysia";
import { existsSync, rmSync } from "fs";
import { config } from "../../bux.config";
import { vue } from "buchta/plugins/vue";
import { css } from "buchta/plugins/css";
import { basename, dirname } from "path";


export function bux(app: Elysia) {
    const extraRoutes = new Map<string, Function>();


const fixRoute = (route: string, append = true) => {
    if (!route.endsWith("/") && append) {
        route += "/";
    }

    const matches = route.match(/\[.+?(?=\])./g);
    if (matches) {
        for (const match of matches) {
            route = route.replace(match, match.replace("[", ":").replace("]", ""));
        }
    }

    return route;
}

    // this will prevent piling up files from previous builds
    if (existsSync(process.cwd() + "/.buchta/"))
        rmSync(process.cwd() + "/.buchta/", { recursive: true });

    const buchta = new Buchta(false, {
        port: config.port,
        ssr: config.ssr,
        rootDir: process.cwd() + config.clientRoot,
        dirs: ["pages", "public", "assets", "components", "layouts"],
        plugins: [vue(), css()]
    });

    // This is a hook for files that doesn't have a plugin like pngs
    buchta.earlyHook = (build: Buchta) => {
        build.on("fileLoad", (data) => {
            data.route = "/" + basename(data.path);
            const func = async (_: any) => {
                return Bun.file(data.path);
            }
    
            extraRoutes.set(data.route, func);
        })
    }
    // fsRouter(app);
    buchta.setup().then(() => {
        for (const [route, func] of extraRoutes) {
            // @ts-ignore ssh
            app.get(route, func);
        }

        // @ts-ignore I forgot
        for (const route of buchta.pages) {
            if (route.func) {
                app.get(fixRoute(dirname(route.route)), async (_: any) => {
                    return new Response(await route.func(dirname(route.route), fixRoute(dirname(route.route))),
                                        { headers: { "Content-Type": "text/html" } });
                });
            } else {
                if (!config.ssr && "html" in route) {
                    app.get(fixRoute(dirname(route.route)), (_: any) => {
                        return new Response(route.html, { headers: { "Content-Type": "text/html" } });
                    });
                }

                if (!("html" in route)) {
                    app.get(route.route, () => Bun.file(route.path));
                    app.get(route.originalRoute, () => Bun.file(route.path));
                }
            }
        }
        // app.listen(config.port);
        // console.log(`server started, listening on http://${app.server.hostname + ':' + app.server.port}`)
    });

    
    return app;
}
