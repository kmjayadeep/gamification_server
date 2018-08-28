//Api service
const router = require('express').Router();

router.get('/ping', (req, res) => (res.json('pong')))

exports.addGetRoute = (url, handler) => router.get(url, handler);
exports.addPostRoute = (url, handler) => router.post(url, handler);

exports.router = router;