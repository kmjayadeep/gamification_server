'use strict';
module.exports = (sequelize, DataTypes) => {
    var repository = sequelize.define('repository', {
        userId: {
            type: DataTypes.INTEGER
        },
        repoName: {
            type: DataTypes.STRING
        },
        repoOwner: {
            type: DataTypes.STRING
        }
    });

    repository.associate = function (models) {

    };

    return repository;
};