'use strict';
module.exports = (sequelize, DataTypes) => {
    var Task = sequelize.define('Task', {
        title: DataTypes.STRING
    });

    Task.associate = function (models) {
       
    };

    return Task;
};