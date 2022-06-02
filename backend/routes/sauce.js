const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');


router.get('/', (req,res,next)=>{
  console.log('coucou');
});

router.post('/', multer, (req, res,next)=>{
  console.log('Hello les sauces');
});

router.post('/:id/like', (req,res,next)=>{
});


module.exports = router;