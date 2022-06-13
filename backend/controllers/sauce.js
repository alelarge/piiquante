const Sauce = require("../models/sauce");
// Module of Node 'file system' (image uploads and modifications) in this case
const fs = require("fs");

// Create a sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    // We modify the URL of the image, we want to make it dynamic thanks to the segments of the URL
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    // Saving the sauce in the database
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistré!" }))
    .catch((error) => res.status(400).json({ error }));
};

// Modify a sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.body;

  // Find the sauce in the database by its id
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (!sauce) {
      res.status(404).json({
        error: new Error("No such sauce!"),
      });
    }
    // Check if the user editing the sauce is different than the one who created it
    if (sauce.userId !== req.auth.userId) {
      res.status(403).json({
        error: new Error("Unauthorized request!"),
      });
    }

    // update the sauce
    Sauce.updateOne(
      { _id: req.params.id },
      {
        ...sauceObject,
        // Using a ternary operator to update the image if it has been updated
        imageUrl: req.file
          ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
          : undefined,
      }
    )
      .then(() => {
        if (req.file) {
          // Split the image url on "/"
          let splitedUrl = sauce.imageUrl.split("/");
          // Get the last segment (image name)
          let filename = splitedUrl[splitedUrl.length - 1];
          // Delete the old image from the server
          fs.unlink(__dirname + "/../images/" + filename, (err) => {
            if (err) {
              console.log(err);
            }
          });
        }
        res.status(200).json({ message: " Modified sauce!" });
      })
      .catch((error) => res.status(400).json({ error }));
  });
};

// Delete several sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (!sauce) {
      res.status(404).json({
        error: new Error("No such sauce!"),
      });
    }
    if (sauce.userId !== req.auth.userId) {
      res.status(403).json({
        error: new Error("Unauthorized request!"),
      });
    }
    // delete one sauce
    Sauce.deleteOne({ _id: req.params.id })
      .then(() => {
        // Split the image url on "/"
        let splitedUrl = sauce.imageUrl.split("/");
        // Get the last segment (image name)
        let filename = splitedUrl[splitedUrl.length - 1];
        // Delete the old image from the server
        fs.unlink(__dirname + "/../images/" + filename, (err) => {
          if (err) {
            console.log(err);
          }
        });
        res.status(200).json({
          message: "Deleted!",
        });
      })
      .catch((error) => {
        res.status(400).json({
          error: error,
        });
      });
  });
};

// Get a single sauce
exports.getOneSauce = (req, res, next) => {
  // returns a single sauce based on the comparison function passed to it (by its unique id)
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

// Returns an array of all the base sauces of data
exports.getAllSauce = (req, res, next) => {
  // Return all the sauces
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// Allows you to "like" or "dislake" a sauce
exports.likeorDislike = (req, res, next) => {
  // Like present in the body
  let like = req.body.like;
  // Get userID
  let userId = req.body.userId;

  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      // If it's a like
      if (like === 1) {
        // Check that the user didn't already liked or disliked the sauce
        if (
          !sauce.usersLiked.includes(userId) &&
          !sauce.usersDisliked.includes(userId)
        ) {
          Sauce.updateOne(
            {
              _id: req.params.id,
            },
            {
              // We push the user id to the like array and we increment the counter by 1
              $push: {
                usersLiked: userId,
              },
              $inc: {
                likes: +1,
              },
            }
          )
            .then(() =>
              res.status(200).json({
                message: "Like added !",
              })
            )
            .catch((error) =>
              res.status(400).json({
                error,
              })
            );
        } else {
          // It is not possible to like twice the same sauce
          res.status(400).json({
            message: "Cannot Like!",
          });
        }
      }
      //  If it's a dislike
      if (like === -1) {
        // Check that the user didn't already liked or disliked the sauce
        if (
          !sauce.usersDisliked.includes(userId) &&
          !sauce.usersLiked.includes(userId)
        ) {
          Sauce.updateOne(
            {
              _id: req.params.id,
            },
            // We push the user id to the dislike array and we increment dislike counter by 1
            {
              $push: {
                usersDisliked: userId,
              },
              $inc: {
                dislikes: +1,
              },
            }
          )
            .then(() => {
              res.status(200).json({
                message: "Dislike added !",
              });
            })
            .catch((error) =>
              res.status(400).json({
                error,
              })
            );
        } else {
          res.status(400).json({
            // It is not possible to dislike twice the same sauce
            message: "Cannot disliked!",
          });
        }
      }
      
      // cancel a like or dislike
      if (like === 0) {
        if (sauce.usersLiked.includes(userId)) {
          // If it's about canceling a like
          Sauce.updateOne(
            {
              _id: req.params.id,
            },
            // Remove the user id from the like array
            {
              $pull: {
                usersLiked: userId,
              },
              $inc: {
                likes: -1,
              }, // We increment by -1
            }
          )
            .then(() =>
              res.status(200).json({
                message: "Like removed !",
              })
            )
            .catch((error) =>
              res.status(400).json({
                error,
              })
            );
        }

        if (sauce.usersDisliked.includes(userId)) {
          // If it's about canceling a dislike
          Sauce.updateOne(
            {
              _id: req.params.id,
            },
            {
              // Remove the user id from the dislike array
              $pull: {
                usersDisliked: userId,
              },
              $inc: {
                dislikes: -1,
              }, // We increment by -1
            }
          )
            .then(() =>
              res.status(200).json({
                message: "Dislike remove !",
              })
            )
            .catch((error) =>
              res.status(400).json({
                error,
              })
            );
        }

        if (
          !sauce.usersDisliked.includes(userId) &&
          !sauce.usersLiked.includes(userId)
        ) {
          res.status(400).json({
            message: "No like or dislike to cancel!",
          });
        }
      }
    })
    .catch((error) =>
      res.status(404).json({
        error,
      })
    );
};
