var express = require('express');
var router = express.Router();
var db = require('../model/db');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');


router.post('/register', function(req, res) {
    const { memberId, memberPassword, memberBio, memberEmail } = req.body;
    const saltRounds = 10
    console.log(req.body);
    // console.log('memberId: ' + memberId, 'memberPassword: ' + memberPassword, 'memberBio: ' + memberBio, 'memberEmail: ' + memberEmail);
    // 对密码进行加密，saltRounds表示加密强度
    bcrypt.hash(memberPassword, saltRounds, (err, hash) => {
        if (err) {
            console.log('Failed to encrypt password');
            throw err;
        }
        // 构造会员信息对象
        const member = {
            username: memberId,
            password: hash,
            email: memberEmail,
            bio: memberBio,
            createtime: new Date()
        };
        const sql = 'INSERT INTO user_info SET ?';
        db.query(sql, member, (err, result) => {
            if (err) {
                console.log('Failed to insert member');
                throw err;
            }
            console.log('Register successfully');
            res.json({ status: 0, msg: 'Register successfully' });
        })
    })
});
router.post('/login', function(req, res) {
    const { memberId, memberPassword } = req.body;
    const sql = 'SELECT * FROM user_info WHERE username = ?';
    db.query(sql, [memberId], (err, results) => {
        if (err) {
            console.log('Failed to query user_info table');
            throw err;
        }
        // 判断用户是否存在
        if (results.length === 0) {
            console.log(`User ${memberId} doesn't exist`);
            res.json({ status: 1, msg: `User ${memberId} doesn't exist` });
        } else {
            // 用户存在，验证密码是否正确
            bcrypt.compare(memberPassword, results[0].password, (err, isMatch) => {
                if (err) {
                    console.log(`Failed to compare password for user ${memberId}`);
                    throw err;
                }
                if (isMatch) {
                    console.log(`User ${memberId} login successfully`);
                    // 在数据库中获取该menberID的user_id
                    const sql = 'SELECT user_id FROM user_info WHERE username = ?';
                    db.query(sql, [memberId], (err, results) => {
                    if (err) {
                        console.log("Query Error: " + err.message);
                        res.status(500).json({ status: 500, msg: 'Internal server error' });  // 发送服务器错误响应
                    } else {
                        console.log(results[0].user_id);
                        // 生成JWT令牌
                        const token = jwt.sign({ username: memberId }, "jimenmensheidonga", { expiresIn: '1h' });
                        console.log(token);
                        // 添加 user_id 到一个 JSON 对象中
                        const responseData = { 
                        status: 0, 
                        msg: 'Login successfully',
                        user_id: results[0].user_id ,
                        Authorization: token
                        };
                        
                        // 将 JSON 对象作为响应发回客户端
                        res.json(responseData);
                    }
                });
                } else {
                    console.log(`Invalid password for user ${memberId}`);
                    res.json({ status: 2, msg: 'Invalid password' });
                }
            });
        }
    });
});
router.get('/profile/:id', function(req,res){
    const user_id = req.params.id
    const sql = 'SELECT * FROM user_info WHERE user_id = ?';
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.log('Failed to query user_info table');
            throw err;
        } else{
            res.json(results[0]);
        }
    })
})
module.exports = router;

