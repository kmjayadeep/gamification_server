const request = require('request-promise');
const BaseModule = require('../BaseModule');
const db = require('./db');
const events = require('./events');

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

        apiService.addProtectedGetRoute('/github/history', async (req, res) => {
            try {
                const history = await this.getEventHistory(req.user.id);
                res.json(history);
            } catch (error) {
                res.status(500).json({
                    error: "Unable to fetch event history"
                })
            }
        })

        apiService.addProtectedGetRoute('/github/points', async (req, res) => {
            try {
                const points = await this.getPoints(req.user.id);
                res.json({
                    points: points
                });
            } catch (error) {
                res.status(500).json({
                    error: "Unable to fetch points"
                })
            }
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
        await this.fetchCommits(userName, repoName, repoOwner);
        this.refreshEvents(userName, repoName);
        // if (commits.length > 0) {
        //     let commit = commits[0];
        //     let commitDate = new Date(commit.commit.author.date);
        //     this.saveEvent(events.firstCommit(userName, repoName, commitDate, commit));
        // }
        // if (commits.length >= 10) {
        //     let commit = commits[9];
        //     let commitDate = new Date(commit.commit.author.date);
        //     this.saveEvent(events.tenCommits(userName, repoName, commitDate, commit));
        // }
        // if (commits.length >= 100) {
        //     let commit = commits[99];
        //     let commitDate = new Date(commit.commit.author.date);
        //     this.saveEvent(events.hundredCommits(userName, repoName, commitDate, commit));
        // }
    }

    async saveEvent(event) {
        try {
            let savedEvent = await db.models.userEvent.create(event);
            return savedEvent;
        } catch (err) {
            console.log('Already saved ' + event.key);
        }
    }

    async getPoints(userId) {
        const githubUser = await db.models.githubUser.findOne({
            where: {
                userId
            }
        })
        if (!githubUser)
            throw new Error("No such user");
        const userName = githubUser.userName;
        const points = await db.models.userEvent.findOne({
            attributes: [
                [db.sequelize.fn('sum', db.sequelize.col('points')), 'points']
            ],
            where: {
                userName
            }
        })
        return points.points;
    }

    async getEventHistory(userId) {
        const githubUser = await db.models.githubUser.findOne({
            where: {
                userId
            }
        })
        if (!githubUser)
            throw new Error("No such user");
        const userName = githubUser.userName;
        const events = await db.models.userEvent.findAll({
            where: {
                userName
            }
        })
        return events;
    }

    async refreshEvents(userName) {
        await db.models.userEvent.destroy({
            where: {
                userName
            }
        })
        const GitCommit = db.mongoModels.GitCommit;
        const commitCount = await GitCommit.count({
            userName
        });
        if (commitCount > 0) {
            const commits = await GitCommit.find({
                userName
            }).limit(1).exec();
            this.saveEvent(events.firstCommit(commits[0]));
        }
        if(commitCount > 10) {
            const commits = await GitCommit.find({
                userName
            }).skip(9).limit(1).exec();
            this.saveEvent(events.tenCommits(commits[0]));
        }
        if(commitCount > 100) {
            const commits = await GitCommit.find({
                userName
            }).skip(99).limit(1).exec();
            this.saveEvent(events.hundredCommits(commits[0]));
        }
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

    async fetchCommits(userName, repoName, repoOwner) {
        //get commits by user on the repo
        var options = {
            uri: `${API_BASE_URL}repos/${repoOwner}/${repoName}/commits?author=${userName}`,
            headers: {
                'User-Agent': 'Gamification'
            },
            json: true
        };
        const commits = await request(options);
        const GitCommit = db.mongoModels.GitCommit;
        await GitCommit.deleteMany({
            userName
        }).exec();
        let commitCount = 0;
        for (let commit of commits) {
            let commitObj = new GitCommit({
                userName,
                repoName,
                repoOwner,
                sha: commit.sha,
                time: new Date(commit.commit.author.date),
                message: commit.commit.message,
                raw: commit
            })
            try {
                await commitObj.save();
                commitCount++;
            } catch (err) { }
        }
        console.log(commitCount + ' commits saved for user ' + userName);
    }
}

module.exports = GithubModule;