var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var wsRouter = require('./routes/ws')
var initPixelRouter = require('./routes/initPixel')
var menberRouter = require('./routes/member')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin:['http://localhost:8080','http://172.21.1.71:8080','http://localhost:8081','http://172.21.1.71:8080'],
  methods:['GET','POST'],
  allowedHeaders: ["Content-Type", "Authorization"], // 允许的http请求头部
  credentials: true, // 允许发送凭证信息
  exposeHeaders: ["Authorization"], // 允许请求响应的头部包含Authorization信息
}))

app.use('/initPixel', initPixelRouter)
app.use('/ws', wsRouter)
app.use('/api/members', menberRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
