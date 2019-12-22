// body-parser 기본 모듈 불러오기 및 설정 (POST req 해석)
var bodyParser = require('body-parser'); // POST 방식 전송을 위해서 필요함
// Express 기본 모듈 불러오기
var express = require('express');
var session = require('express-session');
// Express 객체 생성
var app = express();
var http = require('http');
var server = http.createServer(app);
var cookieParser = require('cookie-parser');
var router = express.Router();
var path = require('path');
// ejs view와 렌더링 설정
app.use(express.static('views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
// body-parser 기본 모듈 불러오기 및 설정 (POST req 해석)
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}));

//db 오류 났는지 확인
var mysql = require('mysql');
app.use(cookieParser());

// resave 세션아이디를 접속할때마다 발급하지 않는다
app.use(session({
  key: 'sid',
  secret: 'my key',
  resave: true,
  saveUninitialized: true
}));
// connection 객체 생성
var connection = mysql.createConnection({
  // DB 연결 설정
  host: 'dbteam.cgkc5bv4txxd.us-east-1.rds.amazonaws.com',
  user: 'root',
  password: '12121212',
  database: 'open'
});
connection.connect(function (err) {
  if (err) {
    console.error('error connection: ' + err.stack);
    return;
  }
  // Connection 이 성공하면 로그 출력
  console.log('Success DB connection');
});

// Express 서버 시작
server.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
app.get('/', function(req, res) {
  var sql = `SELECT *FROM user`;

  connection.query(sql, function(error, results, fields){
    console.log(results);
    if (req.session.user) {
      res.render('index.ejs', {
        logined : req.session.user.logined,
        user_id : req.session.user.user_id,
        results
      });
    } else {
      res.render('index.ejs', {
        logined : false,
        user_id : null,
        results

      });
    }
  });
});
app.get('/sign_up',function(req,res){
  res.render('sign_up.ejs');
});
app.post('/sign_up',function(req,res){
  var id = req.body.id;
  var pw = req.body.password;
  var conpw = req.body.conpw;

  if(pw == conpw){
    var sql = 'INSERT INTO user(id,pw,conpw)values(?,?,?)';
    connection.query(sql,[id,pw,conpw],function(error,results,fiedls){
      console.log(error);
    });
    
      res.send(`
        <script>
         alert("회원가입이 완료되었습니다.");
        location.href='/login';
       </script>
      `);
  }else{
    res.send(`
    <script>
     alert("다시 한번 확인해주세요.");
    location.href='/sign_up';
   </script>
  `);

  }
});
app.get('/start',function(req,res){
  res.render('start.ejs');
});
app.get('/login',function(req,res){
  res.render('login.ejs');
});

//login
app.post('/login',function(req,res){
  var id = req.body.id;
  var pwd = req.body.password;
  var sql= 'SELECT * FROM user where id = ?';
  connection.query(sql,[id],function(error,results,fiedls){
    if(results.length == 0){
      var session = req.session;
      res.send(`
      <script>
       alert("로그인 정보를 다시 확인해주세요");
      location.href='/login';
     </script>
    `);


		} else{
			var db_id = results[0].id;
			var db_pwd = results[0].pw;

			if(pwd == db_pwd){
        req.session.user = {
          logined: true,
          user_id: db_id

        }       
          res.send(`
            <script>
             alert("로그인 되었습니다.");
            location.href='/';
           </script>
          `);
          connection.query(sql, function(error, results, fields){
            res.render('index.ejs', {
              logined: req.session.user.logined,
              user_id: req.session.user.user_id,
              results
            });
            });
			}
			else{
				res.send(`
          <script>
           alert("로그인 정보를 다시 확인해주세요");
          location.href='/login';
         </script>
        `);
			}
		}
	});
});
app.get('/end',function(req,res){
  res.render('end.ejs');
});

module.exports = app;