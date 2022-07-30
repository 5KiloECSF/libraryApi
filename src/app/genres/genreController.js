const Genre = require("./genreModel");
const controller = require("../../controllers/factoryController");
const controllerWithImage = require("../../controllers/factory.file.controller")




exports.updateGenre = controllerWithImage.updateOneWithImage(Genre, ["name",  "image", "description"])
exports.deleteGenre = controllerWithImage.deleteWithImages(Genre);
exports.createGenre = controllerWithImage.createOneWithOneImage(Genre, "genres")
exports.getAllGenres = controller.getAll(Genre, ["name"]);
exports.getGenre = controller.getOne(Genre);
