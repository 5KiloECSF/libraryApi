// const Review = require("../app/review/reviewModel");
const House = require("../app/house/houseModel");
const AppError = require("../utils/app_error");

const {isAdminInWhiteList} = require("./check_admin_white_list");

const isHouseOwner = (access) => {
    return async (req, res, next) => {
        const houseId = req.params.id;
        const house = await House.findById(houseId).select("isSold _id postedBy");

        let isAllowed = req.user.id === house.postedBy.id;
        let isAdminRole = isAdminInWhiteList(req.user) && access && access.admin;
        if (!(isAllowed || isAdminRole))
            //and if not already sold
            next(
                new AppError("You don't have permission to modify this documnet!", 403)
            );
        next();
    };
};

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

exports.isHouseOwner =isHouseOwner
// exports.isReviewOwner = isReviewOwner
