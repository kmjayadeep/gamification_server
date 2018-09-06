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
            const repoResult = await this.addRepo(githubUser, repoName, repoOwner);
            if (repoResult.error)
                res.status(repoResult.status).json({
                    error: repoResult.error
                });
            else
                res.json(repoResult);
        })

        apiService.addProtectedGetRoute('/github/refresh/:repository', async (req, res) => {
            const repo = await db.models.repository.findOne({
                where: {
                    id: req.params.repository
                }
            })
            const githubUser = await db.models.githubUser.findOne({
                where: {
                    id: repo.githubUserId
                }
            })
            this.refreshRepoEvents(githubUser, repo); //background
            res.json('success');
        })

        apiService.addProtectedGetRoute('/github/history', async (req, res) => {
            try {
                const history = await this.getEventHistory(req.user.id);
                res.json(history);
            } catch (error) {
                console.log(error)
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

    async addRepo(githubUser, repoName, repoOwner) {
        try {
            const existing = await db.models.repository.findOne({
                where: {
                    repoName,
                    repoOwner,
                    githubUserId: githubUser.id
                }
            })
            if (existing)
                return {
                    message: "Already Added repository"
                }
            let verified = await this.verifyDetails(repoName, repoOwner);
            if (!verified) {
                return {
                    error: "Invalid details",
                    status: 400
                }
            }
            const repository = await db.models.repository.create({
                repoName,
                repoOwner,
                githubUserId: githubUser.id
            })
            this.fetchInitialData(githubUser, repository); //Works in background
            return {
                message: "Added Repository"
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
            uri: `${API_BASE_URL}repos/${repoOwner}/${repoName}?access_token=76af92859310bebdb64da403f0ebbd8ff21324de`,
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

    async fetchInitialData(githubUser, repository) {
        await this.fetchCommits(githubUser.userName, repository.repoName, repository.repoOwner);
        await this.refreshRepoEvents(githubUser, repository);
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

    async refreshRepoEvents(githubUser, repository) {
        const { userName } = githubUser;
        const { repoName, repoOwner, id: repositoryId } = repository;
        await db.models.userEvent.destroy({
            where: {
                userName,
                repositoryId
            }
        })
        const GitCommit = db.mongoModels.GitCommit;
        const commitFilter = {
            userName,
            repoName,
            repoOwner
        }
        const commitCount = await GitCommit.count(commitFilter);
        if (commitCount > 0) {
            const commits = await GitCommit.find(commitFilter).limit(1).exec();
            this.saveEvent(events.firstCommit(commits[0], repository));
        }
        if (commitCount > 10) {
            const commits = await GitCommit.find(commitFilter).skip(9).limit(1).exec();
            this.saveEvent(events.tenCommits(commits[0], repository));
        }
        if (commitCount > 100) {
            const commits = await GitCommit.find(commitFilter).skip(99).limit(1).exec();
            this.saveEvent(events.hundredCommits(commits[0], repository));
        }
        const mapReduce = {
            map: function () {
                emit(this.time.toDateString(), 1);
            },
            reduce: function (key, values) {
                var reducedValue = values.reduce(function (a, b) {
                    return a + b;
                }, 0)
                return reducedValue;
            },
            query: {
                userName: userName,
                repoName: repoName,
                repoOwner: repoOwner
            }
        }
        const { results: dailyCommits } = await GitCommit.mapReduce(mapReduce);
        for (let dailyCommit of dailyCommits) {
            const { _id: date, value: count } = dailyCommit;
            await this.saveEvent(events.oneCommitPerday(userName, date, repository));
            if (count >= 5)
                await this.saveEvent(events.fiveCommitsPerday(userName, date, repository));
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
            uri: `${API_BASE_URL}repos/${repoOwner}/${repoName}/commits?author=${userName}&access_token=76af92859310bebdb64da403f0ebbd8ff21324de`,
            headers: {
                'User-Agent': 'Gamification'
            },
            json: true
        };
        const commits = await request(options);
        const GitCommit = db.mongoModels.GitCommit;
        await GitCommit.deleteMany({
            userName,
            repoName,
            repoOwner
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