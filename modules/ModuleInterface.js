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

    registerModules() {
        this.modules = {};
        for (let moduleName of AVAILABLE_MODULES) {
            const Module = require('./' + moduleName);
            const module = new Module(this);
            module.initializeModule();
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
    }

    async activateModule(moduleName, user, params) {
        await db.models.UserModule.create({
            userId: user.id,
            module: moduleName
        })
        const module = this.modules[moduleName];
        return await module.activateModule(params);
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