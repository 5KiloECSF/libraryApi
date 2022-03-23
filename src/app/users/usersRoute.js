const express = require("express");
const userRouter = express.Router({ mergeParams: true });
const usersController = require("./adminController");

const meController = require("./meController")

const {protectRoute, restrictRole} = require("../../middlewares/authorizeRoute");

// const {userSignupInputRule} = require("../auth/validationAuth");
// const {updatePasswordRule, userUpdateRule} = require("./validate_user");
// const {validateInput } = require('../../utils/validate_input');


// userRouter.use(protectRoute)

// users access


// userRouter.post("/follow", meController.getMe, meController.follow);
// userRouter.delete("/follow", meController.getMe, meController.unFollow);

userRouter.get("/me", meController.getMe, usersController.getUser);
userRouter.patch("/me/update/:id", meController.updateMe);

userRouter.delete("/me/delete", meController.deleteMe);

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
