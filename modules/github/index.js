var request = require('request-promise');

const BaseModule = require('../BaseModule');

const API_BASE_URL = 'https://api.github.com/';

class GithubModule extends BaseModule {

    initializeModule() {
        //TODO
    }

    registerUser(userName, repoName, repoOwner) {
        this.getCommits(userName, repoName, repoOwner);
    }

    refreshData() {
        //TODO
    }

    getMetadata() {
        return {
            name: 'Github Module'
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
        console.log(commits.length)
    }
}

module.exports = GithubModule;