const db = require('./db');
const express = require('express');

class UserService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    async initialize() {
        await db.sequelize.sync();
        const router = express.Router();
        router.post('/register', this.register);
        router.post('/login', this.loginBasic);
        this.apiService.useChildRouter('/user', router);
    }

    async register(req, res) {
        const {
            name,
            email,
            password
        } = req.body;
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

    async loginBasic(req, res) {}

    async verifyLogin(req, res) {

    }
}

module.exports = UserService;