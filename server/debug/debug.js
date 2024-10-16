/**
 * Extracts and logs all accessible routes from the provided Express application instance.
 *
 * This function traverses the middleware stack of the Express app, identifies routes,
 * and logs them to the console with their respective HTTP methods and paths.
 *
 * @function
 * @param {Object} app - The Express application instance from which to extract routes.
 * @returns {void} This function does not return a value. It logs the routes to the console.
 */

export default function allRoutes(app) {
  const routes = [];

  /**
   * Recursively adds routes from the middleware stack to the routes array.
   *
   * @param {Array} stack - The stack of middleware to traverse.
   * @param {string} [parentPath=''] - The accumulated path from parent routers.
   * @returns {void} This function does not return a value.
   */
  function addRoutes(stack, parentPath = "") {
    stack.forEach((middleware) => {
      if (middleware.route) {
        // Normal route
        const method = Object.keys(middleware.route.methods)[0].toUpperCase();
        const path = parentPath + middleware.route.path;
        routes.push({ method, path });
      } else if (middleware.name === "router") {
        // Router middleware: extract  path
        const routerPath =
          parentPath +
          middleware.regexp.source
            .replace("^\\", "")
            .replace("\\/?(?=\\/|$)", "")
            .replace("\\", "");
        addRoutes(middleware.handle.stack, routerPath);
      }
    });
  }
  addRoutes(app._router.stack);

  console.log("[*] ACCESSIBLE URL CONFIGURATION [*]");
  routes.forEach((route) => {
    console.log(`Method: ${route.method.padEnd(7)} Path: <BASE>${route.path}`);
  });
}
