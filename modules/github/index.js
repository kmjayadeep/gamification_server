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
        try {
            let verified = await this.verifyDetails(userName, repoName, repoOwner);
            if (verified) {
                this.fetchInitialData(userName, repoName, repoOwner); //Works in background
                return {
                    message: "Activated Github Module"
                }
            }
            return {
                error: "Invalid details",
                status: 400
            }
        } catch (err) {
            return {
                error: "Something went wrong",
                status: 500
            };
        }
    }

    async verifyDetails(userName, repoName, repoOwner) {
        var options = {
            uri: `${API_BASE_URL}repos/${repoOwner}/${repoName}`,
            headers: {
                'User-Agent': 'Gamification'
            },
            json: true
        };
        try {
            const repo = await request(options);
            return true;
        } catch (err) {
            return false;
        }
    }

    async fetchInitialData(userName, repoName, repoOwner) {
        const commits = await this.getCommits(userName, repoName, repoOwner);
        if (commits.length > 0)
            this.moduleInterface.triggerEvent('FIrst commit');
    }

    refreshData() {

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