const AVAILABLE_MODULES = require('./modules').AVAILABLE_MODULES;

class FrameworkInterface {
    constructor(framework) {
        this.framework = framework;
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
        this.app.get('/api/v1', (req, res) => {
            res.json({
                version: '0.0.1'
            });
        })
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