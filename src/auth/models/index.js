'use strict';

const userModel = require('./users');
const { Sequelize, DataTypes } = require('sequelize');

const DATABASE_URL = process.env.NODE_ENV === 'test'?'sqlite:memory;':process.env.DATABASE_URL
// process.env.DATABASE_URL || 'sqlite:memory;';

const sequelize = new Sequelize(DATABASE_URL);

module.exports = {
    db: sequelize,
    users: userModel(sequelize, DataTypes),
}