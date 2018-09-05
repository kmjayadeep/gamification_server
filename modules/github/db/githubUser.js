'use strict';
module.exports = (sequelize, DataTypes) => {
    var githubUser = sequelize.define('githubUser', {
        userId: {
            type: DataTypes.INTEGER,
            unique: true
        },
        userName: {
            type: DataTypes.STRING
        }
    });

    githubUser.associate = function (models) {
        githubUser.hasMany(models.repository);
        models.repository.belongsTo(githubUser);
    };

    return githubUser;
};