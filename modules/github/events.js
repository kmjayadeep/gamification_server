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
    time,
    sha
}, { id: repositoryId }) => {
    return {
        userName,
        name: 'First Commit',
        type: EventTypes.oneTime,
        points: Points.firstCommit,
        time,
        key: sha + '_' + repositoryId,
        repositoryId
    }
}

exports.tenCommits = ({
    userName,
    time,
    sha
}, { id: repositoryId }) => {
    return {
        userName,
        name: '10 Commits',
        type: EventTypes.oneTime,
        points: Points.tenCommits,
        time,
        key: sha + '_' + repositoryId,
        repositoryId
    }
}

exports.hundredCommits = ({
    userName,
    time,
    sha
}, { id: repositoryId }) => {
    return {
        userName,
        name: '100 Commits',
        type: EventTypes.oneTime,
        points: Points.hundredCommits,
        time,
        key: sha + '_' + repositoryId,
        repositoryId
    }
}

exports.oneCommitPerday = (userName, date, {
    id: repositoryId
}) => {
    return {
        userName,
        name: 'First commit of the day',
        type: EventTypes.daily,
        points: Points.oneCommitPerday,
        time: new Date(date),
        key: date + '_' + 'First commit of the day',
        repositoryId
    }
}

exports.fiveCommitsPerday = (userName, date, {
    id: repositoryId
}) => {
    return {
        userName,
        name: '5 Commits today',
        type: EventTypes.daily,
        points: Points.oneCommitPerday,
        time: new Date(date),
        key: date + '_' + '5 Commits today',
        repositoryId
    }
}