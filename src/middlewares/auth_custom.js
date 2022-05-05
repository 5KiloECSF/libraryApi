// const Review = require("../app/review/reviewModel");
const Art = require("../app/zlegacy/tour/artModel");
const AppError = require("../utils/response/appError");

const {isAdminInWhiteList} = require("./check_admin_white_list");

const isArtOwner= (access) => {
    return async (req, res, next) => {
        const artId = req.params.id;
        const art = await Art.findById(artId).select("isSold _id postedBy");

        let isAllowed = req.user.id === art.postedBy.id;
        let isAdminRole = isAdminInWhiteList(req.user) && access && access.admin;
        if (!(isAllowed || isAdminRole))
            //and if not already sold
            next(new AppError("You don't have permission to modify this documnet!", 403)
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

exports.isArtOwner =isArtOwner
// exports.isReviewOwner = isReviewOwner
