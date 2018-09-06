'use strict';
module.exports = (sequelize, DataTypes) => {
    var userEvent = sequelize.define('userEvent', {
        userName: {
            type: DataTypes.STRING,
            unique: 'uniqueKey'
        },
        repoName: DataTypes.STRING,
        name: DataTypes.STRING,
        type: DataTypes.ENUM("ONE_TIME", "DAILY", "MONTHLY"),
        points: DataTypes.INTEGER,
        time: DataTypes.DATE,
        key: {
            type: DataTypes.STRING,
            unique: 'uniqueKey'
        }
    });

    userEvent.associate = function (models) {};

    return userEvent;
};