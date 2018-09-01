//base class of all pluggable modules, eg: Github module

class BaseModule {
    constructor(moduleInterface) {
        if (typeof moduleInterface !== 'object')
            throw new Error('Cannot initialize Module without framework')
        this.moduleInterface = moduleInterface;
    }
    initializeModule() {
        //Initialize the module by adding necessary badges to framework,
        //Setup DB etc
        throw new Error('Not implemented');
    }
    activateModule() {
        //setup new user, fill initial data, update coins, badges
        throw new Error('Not implemented');
    }
    refreshData() {
        //In case data is inconsistant
        throw new Error('Not implemented');
    }
    getMetadata() {
        //get metadata of module
        return {
            name: "Base Module"
        };
    }
}

module.exports = BaseModule;