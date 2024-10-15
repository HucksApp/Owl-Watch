// /middleware/authMiddleware.js
 const midWare = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

export default midWare