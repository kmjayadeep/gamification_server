var request = require('request-promise');

const BaseModule = require('../BaseModule');

const API_BASE_URL = 'https://api.github.com/';

class GithubModule extends BaseModule {

    initializeModule() {
        // Initialize db
        // models.sequelize.sync().then(() => {});
    }

    async registerUser(userName, repoName, repoOwner) {
        const commits = await this.getCommits(userName, repoName, repoOwner);
        if (commits.length > 0)
            this.frameworkInterface.triggerEvent('FIrst commit');
    }

    refreshData() {
        //TODO
    }

    getMetadata() {
        return {
            name: 'Github Module',
            requiredFields: {
                'userName': 'Github Username',
                'repoName': 'Github Repository to track',
                'repoName': 'Owner of github repository'
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