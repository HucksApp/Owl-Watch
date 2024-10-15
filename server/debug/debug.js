export default function allRoutes(app) {
    const routes = [];
    function addRoutes(stack, parentPath = '') {
        stack.forEach((middleware) => {
            if (middleware.route) {
                // Normal route
                const method = Object.keys(middleware.route.methods)[0].toUpperCase();
                const path = parentPath + middleware.route.path;
                routes.push({ method, path });
            } else if (middleware.name === 'router') {
                // Router middleware: recursively extract routes with the base path
                const routerPath = parentPath + (middleware.regexp.source.replace('^\\', '').replace('\\/?(?=\\/|$)', '').replace("\\",""));
                addRoutes(middleware.handle.stack, routerPath);
            }
        });
    }
    // Start adding routes from the main app stack
    addRoutes(app._router.stack);

    console.log('[*] ACCESSIBLE URL CONFIGURATION [*]');
    routes.forEach(route => {
        console.log(`Method: ${route.method.padEnd(7)} Path: <BASE>${route.path}`);
    });
}
