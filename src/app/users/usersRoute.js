const express = require("express");
const userRouter = express.Router({ mergeParams: true });
const usersController = require("./usersController");

const {protectRoute, restrictRole} = require("../../middlewares/authorizeRoute");

// const {userSignupInputRule} = require("../auth/validationAuth");
// const {updatePasswordRule, userUpdateRule} = require("./validate_user");
// const {validateInput } = require('../../utils/validate_input');


// userRouter.use(protectRoute);

// users access


userRouter.post("/follow", usersController.getMe, usersController.follow);
userRouter.delete("/follow", usersController.getMe, usersController.unFollow);

userRouter.get("/me", usersController.getMe, usersController.getUser);
userRouter.patch("/me/update/:id", usersController.updateMe);

userRouter.delete("/me/delete", usersController.deleteMe);

// userRouter.use(restrictRole("admin"));
userRouter.route("/")
    // .post(userSignupInputRule(),validateInput, usersController.createUser)
    .post(usersController.createUser)
    .get(usersController.getAllUsers); //only admin can view all users
userRouter
  .route("/:id")
  .get(usersController.getUser)
  .patch( usersController.updateUser)
  // .patch(userUpdateRule(), validateInput, usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = userRouter;
