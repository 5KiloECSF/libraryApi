// const Review = require("../app/review/reviewModel");

const AppError = require("../utils/response/appError");

const {isAdminInWhiteList} = require("./check_admin_white_list");



// const isReviewOwner = (access) => {
//     return async (req, res, next) => {
//         const ReviewId = req.params.id;
//         const review = await Review.findById(ReviewId).select("user");

//         let isAllowed = req.user.id.valueOf() === review.user.valueOf();
//         let isAdminRole = isAdminInWhiteList(req.user) && access && access.admin;
//         if (!(isAllowed || isAdminRole))
//             //and if not already sold
//             next(
//                 new AppError("You don't have permission to modify this Review!", 403)
//             );
//         next();
//     };

// };


// exports.isReviewOwner = isReviewOwner
