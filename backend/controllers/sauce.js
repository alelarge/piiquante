const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req,res,next)=>{
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject ._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes : 0,
      usersLiked : [],
      usersDisliked :[]
    });
  sauce.save()
    .then(() => res.status(201).json({message : 'Sauce enregistré!'}))
    .catch(error => res.status(400).json({error}));
};
  
exports.modifySauce = (req,res,next)=>{
    const sauceObject = JSON.parse(req.body.sauce);
    console.log('req.file', req.file);
    
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
        if (!sauce) {
            res.status(404).json({
              error: new Error('No such sauce!')
            });
        }
        console.log('sauce', sauce);
        if (sauce.userId !== req.auth.userId) {
            res.status(400).json({
              error: new Error('Unauthorized request!')
            });
        }



        Sauce.updateOne(
            { _id : req.params.id }, 
            { 
             ...sauceObject,
             imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            }
        )
        .then(() => {
            if (req.file) {
                let splitedUrl = sauce.imageUrl.split('/');
                let filename = splitedUrl[splitedUrl.length-1];
                fs.unlink(__dirname+'/../images/'+filename, (err) => {
                    if(err) {
                        console.log(err);
                    }
                });
            }
            res.status(200).json({message: 'Sauce modifié!'});
        })
        .catch(error => res.status(400).json({error }));
    });
};
  
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }).then(
        (sauce) => {
          if (!sauce) {
            res.status(404).json({
              error: new Error('No such sauce!')
            });
          }
          if (sauce.userId !== req.auth.userId) {
            res.status(400).json({
              error: new Error('Unauthorized request!')
            });
          }
          Sauce.deleteOne({ _id: req.params.id }).then(
            () => {
                let splitedUrl = sauce.imageUrl.split('/');
                let filename = splitedUrl[splitedUrl.length-1];
                fs.unlink(__dirname+'/../images/'+filename, (err) => {
                    if(err) {
                        console.log(err);
                    }
                });
                res.status(200).json({
                    message: 'Deleted!'
                });
            }
          ).catch(
            (error) => {
              res.status(400).json({
                error: error
              });
            }
          );
        }
    )
};
  
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce =>res.status(200).json(sauce))
        .catch(error =>res.status(404).json({ error }));
};
  
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
      .then(sauces=> res.status(200).json(sauces))
      .catch(error=> res.status(400).json({error}));
};