// this file is now deprecated as i have released elysia-fs-router

import Elysia from "elysia";
import { config } from "../../bux.config";
type Module = {
    get?: Function,
    post?: Function,
    put?: Function,
    delete?: Function,
}
type Routes = {
    route: string,
    path: string,
    module: Module
}
const validMethods = ['delete', 'get', 'head', 'patch', 'post', 'put', 'options']

export async function elysiaRouter(app: Elysia){
    // we will be pushing our cleaned up and ready to go routes/paths/modules here
    let router: Routes[] = []

    // get all the routers for my chosen directory i would like set as my api
    const {routes} = new Bun.FileSystemRouter({
        dir: process.cwd() + '/server/api',
        style: 'nextjs',
        assetPrefix: 'api/'
    })

    for await(const [route, path] of Object.entries(routes)) {
        // clean the route of [param] and of .post/get/delete/put
        const sanitizedRoute = fixedRoute(route)
        // find the handlers for the routes from exporting GET/PUT/DELETE/POST
        const module: Module = await importModule(path, route)
        // if this route has been declared already, we dont want to make it again
        const found = router.find( route => route.route === sanitizedRoute)
        if (!found) {
            // const newRoute = {route: sanitizedRoute, path, module}
            // console.log(newRoute);
            
            router.push({route: sanitizedRoute, path, module})
        }
      }

      for await (const {route, module} of router) {
        for await (const method of Object.keys(module)) {
            // now we can finally start adding routes and handlers to our Elysia app
            // our ELysia app can now be written with a fileSystem syntax
            //example app.get('/hello', () => return 'Hello, World!')
            app[method](route, module[method])
        }
      }
    return app
}

async function importModule(path: string, route: string) {
    // dynamically import the handlers declared
    const module = await import(path);
    // create an empty option to help reformat the module's imports
    let sanitizedModule: Module = {}
    // if the import is only importing one handler
    if(module.default && typeof module.default === 'function') {
        // find the method in the route if it has one
        const handler = route.split('.')[1]?.toLowerCase()
       // check if $handler is an allowed http method 
        if ((validMethods.includes(handler))) {
            // if it is we want the sanitizedModules method to be set
            sanitizedModule[handler] = module.default
        }else {
            // if its not an allowed method, we are setting it to get
            sanitizedModule['get'] = module.default
        }
        // return the sanitizedModule and not the actual modules themselves
        return sanitizedModule
    }
    //  if there are multiple exports or multiple default exports, reformat it so they are common
    let newObject: Module = module.default ?? module

        for (const key in newObject) {
            // we need to lowercase the key/method so it is cleaned up for adding as a real method
            const sanitizedKey = key.toLowerCase()
            // check to see if the method is an allowed http method
            if (validMethods.includes(sanitizedKey)) {
                // set the module ex: module: {get: Function}
                sanitizedModule[sanitizedKey] = newObject[key]
            }
        }
    // return of cleaned up module
    return sanitizedModule
  }

  const fixedRoute = (_route:string) => {
    // remove/add any / that we need to normalize the routes
    const prefix = config.routes?.apiPrefix.trim().replace(/^\/|\/$/g, '');

    // if we have a prefix we would like to put infront of these routes add it from the config
    let route: string = prefix ? prefix + _route : _route
    
    // if the route has a .post/.get/.delete.put we want to clean that up
    if ((route.includes('.')) && (validMethods.includes(route.split('.')[1]?.toLowerCase()))) {
        route = route.split('.')[0]
    }
    // if the route has a [param] or [param1]-[param2] we want to turn that into /:param or /:param1/:param2
    const regex = /\[([^[]+)\]/g
    if (regex.test(route)) {
        route = route
                .replace(/\[([^[]+)\]/g, ':$1')
                .replace('-', '/')
    }
    // this let replace [...something] to * for wildcard routes
    if (route.includes(':...')) {
        route = route
                .replace(/:\.\.\.[^/]+$/, '*')
    }

    // finally return the route after all the sanitization
    return route
}