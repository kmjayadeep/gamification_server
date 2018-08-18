const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

class Framework {
  constructor(app) {
    this.app = app;
    this.configureExpress(app);
    app.use(this.route404Handler);
    app.use(this.errorHandler);
  }

  getApp() {
    return this.app;
  }

  configureExpress(app) {
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: false
    }));
  }

  // catch 404 and forward to error handler
  route404Handler(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  }

  // error handler
  errorHandler(err, req, res, next) {
    // set locals, only providing error in development
    const error = {
      message: err.message,
      error: req.app.get('env') === 'development' ? err : {}
    }
    res.status(err.status || 500);
    res.json(error);
  }
}

const app = express();
module.exports = new Framework(app);