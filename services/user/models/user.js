'use strict';
module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define('user', {
        name: DataTypes.STRING
    });

    User.associate = models => {

    }

    return User;
};