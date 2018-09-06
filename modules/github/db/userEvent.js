'use strict';
module.exports = (sequelize, DataTypes) => {
    var userEvent = sequelize.define('userEvent', {
        userName: {
            type: DataTypes.STRING,
            unique: 'uniqueKey'
        },
        name: DataTypes.STRING,
        type: DataTypes.ENUM("ONE_TIME", "DAILY", "MONTHLY"),
        points: DataTypes.INTEGER,
        time: DataTypes.DATE,
        key: {
            type: DataTypes.STRING,
            unique: 'uniqueKey'
        }
    });

    userEvent.associate = function (models) {
        userEvent.belongsTo(models.repository);
        models.repository.hasMany(userEvent);
    };

    return userEvent;
};