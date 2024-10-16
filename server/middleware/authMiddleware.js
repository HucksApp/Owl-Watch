/**
 * Middleware to ensure that a request is authenticated.
 * 
 * This middleware checks if the user is authenticated using Passport's `isAuthenticated()` method.
 * If the user is not authenticated, it sends a 401 Unauthorized response. If authenticated, 
 * it calls the next middleware in the stack.
 *
 * @function
 * @param {Object} req - The request object, representing the HTTP request.
 * @param {Object} res - The response object, representing the HTTP response that an Express app sends when it gets an HTTP request.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void} This function does not return a value. It either sends a response or calls the next middleware.
 */

 const midWare = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

export default midWare