const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');
const sauceCtrl = require('./../controllers/sauce');


router.get('/', auth, sauceCtrl.getAllSauce);

router.get('/:id', auth, sauceCtrl.getOneSauce);

router.put('/:id', auth, multer, sauceCtrl.modifySauce);

router.post('/', auth, multer, sauceCtrl.createSauce);

// router.post('/:id/like', auth, sauceCtrl.);

router.delete('/:id', auth, sauceCtrl.deleteSauce);


module.exports = router;