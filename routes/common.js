const express = require('express');
const { User, pwdHash, token } = require('../model/user/user');
const common = express.Router();

module.exports = common;
