const AVAILABLE_MODULES = require('./modules').AVAILABLE_MODULES;

class FrameworkInterface {
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
            const module = req.params.module;
            if (module in this.modules) {
                const metadata = this.modules[module].getMetadata();
                return res.json(metadata);
            }
            return res.status(400).json({
                message: "Invalid module"
            })
        })
    }

    activateModule(module, user) {

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

module.exports = FrameworkInterface;