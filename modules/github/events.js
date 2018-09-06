const EventTypes = {
    oneTime: 'ONE_TIME',
    daily: 'DAILY',
    monthly: 'MONTHLY'
}

const Points = {
    firstCommit: 10,
    tenCommits: 100,
    hundredCommits: 1000
}


exports.firstCommit = (userName, repoName, time, commit) => {
    return {
        userName,
        repoName,
        name: 'First Commit',
        type: EventTypes.oneTime,
        points: Points.firstCommit,
        time,
        key: commit.sha + '_' + repoName
    }
}

exports.tenCommits = (userName, repoName, time, commit) => {
    return {
        userName,
        repoName,
        name: '10 Commits',
        type: EventTypes.oneTime,
        points: Points.tenCommits,
        time,
        key: commit.sha + '_' + repoName
    }
}

exports.hundredCommits = (userName, repoName, time, commit) => {
    return {
        userName,
        repoName,
        name: '100 Commits',
        type: EventTypes.oneTime,
        points: Points.hundredCommits,
        time,
        key: commit.sha + '_' + repoName
    }
}