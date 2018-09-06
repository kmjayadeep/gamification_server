const EventTypes = {
    oneTime: 'ONE_TIME',
    daily: 'DAILY',
    monthly: 'MONTHLY'
}

const Points = {
    firstCommit: 10,
    tenCommits: 100,
    hundredCommits: 1000,
    oneCommitPerday: 1,
    fiveCommitsPerday: 10
}

exports.firstCommit = ({
    userName,
    repoName,
    time,
    sha
}) => {
    return {
        userName,
        repoName,
        name: 'First Commit',
        type: EventTypes.oneTime,
        points: Points.firstCommit,
        time,
        key: sha + '_' + repoName
    }
}

exports.tenCommits = ({
    userName,
    repoName,
    time,
    sha
}) => {
    return {
        userName,
        repoName,
        name: '10 Commits',
        type: EventTypes.oneTime,
        points: Points.tenCommits,
        time,
        key: sha + '_' + repoName
    }
}

exports.hundredCommits = ({
    userName,
    repoName,
    time,
    sha
}) => {
    return {
        userName,
        repoName,
        name: '100 Commits',
        type: EventTypes.oneTime,
        points: Points.hundredCommits,
        time,
        key: sha + '_' + repoName
    }
}

exports.oneCommitPerday = (userName, repoName, date) => {
    return {
        userName,
        repoName,
        name: 'First commit of the day',
        type: EventTypes.daily,
        points: Points.oneCommitPerday,
        time: new Date(date),
        key: date + '_' + 'First commit of the day'
    }
}

exports.fiveCommitsPerday = (userName, repoName, date) => {
    return {
        userName,
        repoName,
        name: '5 Commits today',
        type: EventTypes.daily,
        points: Points.oneCommitPerday,
        time: new Date(date),
        key: date + '_' + '5 Commits today'
    }
}