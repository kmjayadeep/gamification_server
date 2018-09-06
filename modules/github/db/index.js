const path = require('path');
const Sequelize = require('sequelize');
const mongoose = require('mongoose');
const dbConfig = require('../../../config/config').database;
const mongoConfig = require('../../../config/config').mongo;
const db = {};
const mongoModels = {};
const sequelize = new Sequelize(dbConfig.name, dbConfig.username, dbConfig.password, {
    dialect: 'mysql',
    host: dbConfig.host,
    operatorsAliases: false,
    logging: false
});

const models = ['githubUser', 'repository', 'userEvent'];

models.forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file + '.js'));
    db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});


mongoose.connect(mongoConfig.url);
const mongoModelNames = ['GitCommit'];

for (let mongoModel of mongoModelNames) {
    mongoModels[mongoModel] = require('./'+mongoModel)(mongoose, mongoose.Schema);
}

module.exports = {
    sequelize: sequelize,
    models: db,
    mongoModels
}