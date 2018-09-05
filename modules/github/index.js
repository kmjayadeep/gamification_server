const request = require('request-promise');
const BaseModule = require('../BaseModule');
const db = require('./db');

const API_BASE_URL = 'https://api.github.com/';

class GithubModule extends BaseModule {

    async initializeModule() {
        await db.sequelize.sync();
    }

    registerRoutes(apiService) {
        apiService.addProtectedPostRoute('/github/repo', async (req, res) => {
            const {
                repoName,
                repoOwner
            } = req.body;
            const user = req.user;
            const githubUser = await db.models.githubUser.findOne({
                where: {
                    userId: user.id
                }
            });
            if (!githubUser)
                return res.status(400).json({
                    error: 'Github module not activated for this user'
                });
            const userName = githubUser.userName;
            const repoResult = await this.addRepo(userName, repoName, repoOwner);
            if (repoResult.error)
                res.status(repoResult.status).json({
                    error: repoResult.error
                });
            else
                res.json(repoResult);
        })
    }

    async activateModule(user, {
        userName
    }) {
        try {
            const existing = await db.models.githubUser.findOne({
                where: {
                    userId: user.id
                }
            })
            if (existing)
                return {
                    message: "Already activated"
                }
            await db.models.githubUser.create({
                userId: user.id,
                userName
            })
            return {
                message: "Activated Github module"
            }
        } catch (error) {
            return {
                error
            }
        }
    }

    async addRepo(userName, repoName, repoOwner) {
        try {
            let verified = await this.verifyDetails(repoName, repoOwner);
            if (verified) {
                this.fetchInitialData(userName, repoName, repoOwner); //Works in background
                return {
                    message: "Added Repository"
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

    async verifyDetails(repoName, repoOwner) {
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
                'userName': 'Github Username'
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