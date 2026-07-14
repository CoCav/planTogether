/* ==========================================================================
   Route Test Helper

   Provides reusable assertions for Express route configuration.

   Responsibilities
   - Find registered Express routes
   - Test HTTP methods and paths
   - Test route middleware order
   - Test route declaration order
   - Test mounted subrouters

   Notes
   - Expected handler arrays are flattened to match Express behavior.
   - Route behavior remains covered by integration tests.
=========================================================================== */

/* =============================
   ROUTE LOOKUP
============================= */

const flattenHandlers = (handlers = []) => {
    return handlers.flat(Infinity);
};

const findRouteLayer = (
    router,
    method,
    path
) => {
    const normalizedMethod = method.toLowerCase();

    return router.stack.find((layer) => {
        return (
            layer.route?.path === path &&
            layer.route.methods[normalizedMethod]
        );
    });
};

/* =============================
   ROUTE ASSERTIONS
============================= */

const expectRoute = (
    router,
    {
        method,
        path,
        handlers
    }
) => {
    const routeLayer = findRouteLayer(
        router,
        method,
        path
    );

    expect(routeLayer).toBeDefined();

    const registeredHandlers =
        routeLayer.route.stack.map(
            (layer) => layer.handle
        );

    expect(registeredHandlers).toEqual(flattenHandlers(handlers));
};

const expectRouteOrder = (
    router,
    expectedRoutes
) => {
    const registeredRoutes = router.stack
        .filter((layer) => layer.route)
        .map((layer) => {
            const method = Object.keys(layer.route.methods).find(
                (routeMethod) => layer.route.methods[routeMethod]
            );

            return {
                method,
                path: layer.route.path
            };
        });

    expect(registeredRoutes).toEqual(
        expectedRoutes.map(({ method, path }) => ({
            method: method.toLowerCase(),
            path
        }))
    );
};

/* =============================
   SUBROUTER ASSERTIONS
============================= */

const expectMountedRouters = (
    router,
    expectedRouters
) => {
    const mountedRouters = router.stack
        .filter((layer) => !layer.route)
        .map((layer) => layer.handle);

    expect(mountedRouters).toEqual(expectedRouters);
};

module.exports = {
    expectRoute,
    expectRouteOrder,
    expectMountedRouters
};
