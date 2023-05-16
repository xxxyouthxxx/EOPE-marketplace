var express = require('express');
var router = express.Router();
var pool = require('../model/db');

router.get('/items/:id', (req, res) => {
  const id = req.params.id;
  pool.query(
    `SELECT c.collection_seq, c.collection_url, c.collection_name, u.createtime, c.user_id, u.username
       FROM collection AS c
       INNER JOIN user_info AS u ON c.user_id = u.user_id
       WHERE c.user_id = ?`,
    [id],
    (error, result) => {
      if (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      } else {
        console.log(result);
        res.json(result);
      }
    }
  );
});

module.exports = router;
