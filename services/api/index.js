//Api service
const router = require('express').Router();

router.use((req,res,next)=>{
    //for testing
    req.user = {
        id: 1
    }
    next();
})

exports.useChildRouter = (url,childRouter)=> router.use(url,childRouter);
exports.addGetRoute = (url, handler) => router.get(url, handler);
exports.addPostRoute = (url, handler) => router.post(url, handler);

exports.router = router;