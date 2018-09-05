const AVAILABLE_MODULES = require('./').AVAILABLE_MODULES;
const db = require('./db');

class ModuleInterface {
    constructor(framework, apiService) {
        this.framework = framework;
        this.apiService = apiService;
        this.app = framework.getApp();
        this.registerModules();
    }

    async initialize() {
        await db.sequelize.sync();
        this.registerRoutes();
    }

    async registerModules() {
        this.modules = {};
        for (let moduleName of AVAILABLE_MODULES) {
            const Module = require('./' + moduleName);
            const module = new Module(this);
            await module.initializeModule();
            this.modules[moduleName] = module;
        }
    }

    registerRoutes() {
        this.apiService.addGetRoute('/activate/:module', (req, res) => {
            const moduleName = req.params.module;
            if (moduleName in this.modules) {
                const metadata = this.modules[moduleName].getMetadata();
                return res.json(metadata);
            }
            return res.status(400).json({
                message: "Invalid module"
            })
        })
        this.apiService.addProtectedPostRoute('/activate/:module', async (req, res) => {
            const moduleName = req.params.module;
            if (moduleName in this.modules) {
                const params = req.body;
                const user = req.user;
                try {
                    const response = await this.activateModule(moduleName, user, params);
                    if (response.status) {
                        return res.status(response.status).json({
                            error: response.error
                        })
                    }
                    return res.json(response);
                } catch (err) {
                    if (err.name == 'SequelizeUniqueConstraintError')
                        return res.json({
                            message: 'Already activated'
                        })
                    else return res.status(400).json({
                        message: 'Unknown Error'
                    })
                }
            }
            return res.status(400).json({
                message: "Invalid module"
            })
        })
        for (let moduleName of AVAILABLE_MODULES) {
            const module = this.modules[moduleName];
            module.registerRoutes(this.apiService);
        }
    }

    async activateModule(moduleName, user, params) {
        const module = this.modules[moduleName];
        const activated = await module.activateModule(user, params);
        if (!activated.error) {
            const moduleMap = await db.models.UserModule.findOne({
                where: {
                    userId: user.id,
                    module: moduleName
                }
            })
            if (!moduleMap) {
                await db.models.UserModule.create({
                    userId: user.id,
                    module: moduleName
                })
            }
        }
        return activated;
    }

    triggerEvent(event) {
        //TODO
        console.log('event triggered', event);
    }
    setupBadges() {
        //TODO
    }
    getEventHistory() {
        //TODO
    }
}

module.exports = ModuleInterface;