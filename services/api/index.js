//Api service
const router = require('express').Router();

exports.useMiddleware = (url, middleware) => router.use(url, middleware);
exports.addGetRoute = (url, handler) => router.get(url, handler);
exports.addPostRoute = (url, handler) => router.post(url, handler);
exports.addProtectedPostRoute = (url, handler) => router.post(url, (req, res, next) => {
    if (req.user)
        return next();
    res.status(401).json({
        message: 'Not authorized'
    })
}, handler);

exports.router = router;