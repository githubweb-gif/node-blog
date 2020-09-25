const express = require('express');
const { User, pwdHash, token } = require('../model/user/user');
const normal = express.Router();

module.exports = normal;
