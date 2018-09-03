//Api service
const router = require('express').Router();

exports.useMiddleware = (url, middleware) => router.use(url, middleware);

exports.addGetRoute = (url, handler) => router.get(url, handler);
exports.addPostRoute = (url, handler) => router.post(url, handler);
exports.addPutRoute = (url, handler) => router.put(url, handler);
exports.addDeleteRoute = (url, handler) => router.delete(url, handler);

const checkAuth = (req, res, next) => {
    if (req.user)
        return next();
    res.status(401).json({
        message: 'Not authorized'
    })
};

exports.addProtectedGetRoute = (url, handler) => router.get(url, checkAuth, handler);
exports.addProtectedPostRoute = (url, handler) => router.post(url, checkAuth, handler);
exports.addProtectedPutRoute = (url, handler) => router.put(url, checkAuth, handler);
exports.addProtectedDeleteRoute = (url, handler) => router.delete(url, checkAuth, handler);

exports.router = router;