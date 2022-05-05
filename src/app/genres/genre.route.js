const express = require("express");
const genreRouter = express.Router({ mergeParams: true });
const genreController = require("./genreController");


const multerSt = require('../../utils/image/multers');
const {protectRoute, restrictRole} = require("../../middlewares/authorizeRoute");


// genreRouter.use(protectRoute)

// genres access


// genreRouter.use(restrictRole("admin"));
genreRouter.route("/")
    // .post(genreSignupInputRule(),protectRoute, validateInput,restrictRole("admin"), genresController.createGenre)
    .post(multerSt.uploadSingleToMemory, genreController.createGenre)
    .get(genreController.getAllGenres);
genreRouter
  .route("/:id")
  .get(genreController.getGenre)
  .patch(
      multerSt.uploadSingleToMemory,
      genreController.updateGenre)
    // .patch(genreUpdateRule(), validateInput,protectRoute,restrictRole("admin"), genresController.updateGenre)
  .delete(genreController.deleteGenre);

module.exports = genreRouter;
