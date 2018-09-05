const path = require('path');
const Sequelize = require('sequelize');
const dbConfig = require('../../../config/config').database;
const db = {};

const sequelize = new Sequelize(dbConfig.name, dbConfig.username, dbConfig.password, {
    dialect: 'mysql',
    host: dbConfig.host,
    operatorsAliases: false,
    logging: false
});

const models = ['githubUser', 'repository'];

models.forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file + '.js'));
    db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = {
    sequelize: sequelize,
    models: db
}