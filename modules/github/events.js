const EventTypes = {
    oneTime: 'ONE_TIME',
    daily: 'DAILY',
    monthly: 'MONTHLY'
}

class Event {
    constructor(type, points, name, time) {
        this.type = type;
        this.points = points;
        this.name = name;
        this.time = time;
    }
}

exports.firstCommit = () => {
    return new Event(EventTypes.oneTime, 10, 'First Commit')
}