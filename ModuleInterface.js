const AVAILABLE_MODULES = require('./modules').AVAILABLE_MODULES;

class ModuleInterface {
    constructor(framework, apiService) {
        this.framework = framework;
        this.apiService = apiService;
        this.app = framework.getApp();
        this.registerModules();
    }

    async initialize() {
        this.registerRoutes();
    }

    registerModules() {
        this.modules = {};
        for (let moduleName of AVAILABLE_MODULES) {
            const Module = require('./modules/' + moduleName);
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
        this.apiService.addPostRoute('/activate/:module', async (req, res) => {
            const moduleName = req.params.module;
            if (moduleName in this.modules) {
                const params = req.body;
                const user = req.user;
                const response = await this.activateModule(moduleName, user, params);
                return res.json(response);
            }
            return res.status(400).json({
                message: "Invalid module"
            })
        })
    }

    async activateModule(moduleName, user, params) {
        //TODO save user-module mapping to db
        const module = this.modules[moduleName];
        return module.activateModule(params);
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