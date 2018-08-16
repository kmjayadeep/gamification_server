const AVAILABLE_MODULES = require('./modules').AVAILABLE_MODULES;

class FrameworkInterface {
    constructor(moduleName) {
        this.moduleName = moduleName;
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

class Framework {
    constructor() {
        this.modules = {};
        for (let moduleName of AVAILABLE_MODULES) {
            const Module = require('./modules/' + moduleName);
            const frameworkInterface = new FrameworkInterface(moduleName);
            const module = new Module(frameworkInterface);
            module.initializeModule();
            this.modules[moduleName] = module;
        }
    }
}

//for testing
const framework = new Framework()
framework.modules.github.registerUser('kmjayadeep','booktradingclub','kmjayadeep');