const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const db = require('./db');
const sha1 = require('./helpers/sha1');

class UserService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    async initialize() {
        await db.sequelize.sync();
        const router = express.Router();
        router.post('/register', this.register);
        router.post('/login', this.loginBasic);
        this.apiService.useMiddleware('/', this.verifyLogin);
        this.apiService.useMiddleware('/user', router);
    }

    async register(req, res) {
        let {
            name,
            email,
            password
        } = req.body;
        const checkEmail = await db.models.User.findOne({
            where: {
                email
            }
        })
        if (checkEmail) {
            return res.status(400).json({
                message: "Email already registered"
            })
        }
        password = sha1(password);
        try {
            const user = await db.models.User.create({
                name,
                email,
                password
            })
            res.json(user);
        } catch (err) {
            res.status(400).json({
                message: "Unable to register user"
            })
        }
    }

    async loginBasic(req, res) {
        let {
            email,
            password
        } = req.body;
        password = sha1(password);
        const user = await db.models.User.findOne({
            where: {
                email,
                password
            }
        })
        const expiresIn = config.user.tokenExpires;
        const token = jwt.sign({
            id: user.id
        }, config.user.tokenSecret, {
            expiresIn
        });
        res.json({
            user: {
                id: user.id,
                name: user.name
            },
            token,
            expiresIn
        })
    }

    async verifyLogin(req, res, next) {
        const authHeader = req.headers.authorization
        if (authHeader && authHeader.split(' ')[0] === 'Bearer' && authHeader.split(' ').length == 2) {
            const token = authHeader.split(' ')[1];
            try {
                let decoded = jwt.verify(token, config.user.tokenSecret)
                req.user = {
                    id: decoded.id
                }
            } catch (err) {}
        }
        next()
    }
}

module.exports = UserService;