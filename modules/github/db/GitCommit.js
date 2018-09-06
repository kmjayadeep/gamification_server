'use strict';
module.exports = (mongoose, Schema) => {
    const GitCommit = mongoose.model('GitCommit', {
        userName: String,
        repoName: String,
        repoOwner: String,
        sha: {
            type: String,
            unique: true
        },
        time: Date,
        message: String,
        raw: Schema.Types.Mixed
    })
    return GitCommit;
};