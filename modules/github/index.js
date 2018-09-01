var request = require('request-promise');

const BaseModule = require('../BaseModule');

const API_BASE_URL = 'https://api.github.com/';

class GithubModule extends BaseModule {

    initializeModule() {
        // Initialize db
        // models.sequelize.sync().then(() => {});
    }

    async activateModule({
        userName,
        repoName,
        repoOwner
    }) {
        //TODO validate params
        //TODO Add git hooks
        this.fetchInitialData(userName, repoName, repoOwner); //Works in background
        return {
            message: "Activated Github Module"
        }
    }

    async fetchInitialData(userName, repoName, repoOwner) {
        const commits = await this.getCommits(userName, repoName, repoOwner);
        if (commits.length > 0)
            this.moduleInterface.triggerEvent('FIrst commit');
    }

    refreshData(){
        
    }

    getMetadata() {
        return {
            name: 'Github Module',
            description: 'Track git related activities, earn points and trophies',
            requiredFields: {
                'userName': 'Github Username',
                'repoName': 'Github Repository to track',
                'repoOwner': 'Owner of github repository'
            }
        }
    }

    async getCommits(userName, repoName, repoOwner) {
        //get commits by user on the repo
        var options = {
            uri: `${API_BASE_URL}repos/${repoOwner}/${repoName}/commits?author=${userName}`,
            headers: {
                'User-Agent': 'Gamification'
            },
            json: true
        };
        const commits = await request(options);
        return commits;
    }
}

module.exports = GithubModule;