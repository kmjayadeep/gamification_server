'use strict';
module.exports = (sequelize, DataTypes) => {
    var UserModule = sequelize.define('UserModule', {
        userId: {
            type: DataTypes.INTEGER,
            unique: 'uniqueMap'
        },
        module: {
            type: DataTypes.STRING,
            unique: 'uniqueMap'
        }
    });

    UserModule.associate = function (models) {
       
    };

    return UserModule;
};