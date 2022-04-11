const express = require('express');
const itemController = require('./itemController');
const {  protectRoute,  restrictRole } = require('../../middlewares/authorizeRoute');
// const reviewRouter = require('../review/reviewRoutes');


const router = express.Router();

// POST /item/32434fs35/reviews
// GET /item/32434fs35/reviews
// GET /item/32434fs35/reviews/97987dssad8
// router.route('/:itemId/reviews').post(protect, restrictTo('user'), reviewController.createReview);
// router.use('/:itemId/reviews', reviewRouter);
const multerSt = require('../../utils/image/multers');

router
  .route('/')
  .get(itemController.getAllItems)
  .post(
      multerSt.uploadImagesToMemory,
      // protectRoute, restrictRole('admin', 'lead-guide'),
      itemController.createItem
  ).delete(
      itemController.deleteAllItem
);

router
  .route('/:id')
  .get(itemController.getItem)
  .patch(
    // protectRoute,
    // restrictRole('admin', 'lead-guide'),

    // imageUploads.resizeManyImages("books"),
    itemController.updateItem
  )
  .delete(
      // protectRoute,
      // restrictRole('admin', 'lead-guide'),
      itemController.deleteItem);


//============ un needed --------===================
// router.route('/top-5-cheap').get(itemController.aliasTopItems, itemController.getAllItems);
// router.route('/item-stats').get(itemController.getItemStats);
// router
//     .route('/monthly-plan/:year')
//     .get(protectRoute, restrictRole('admin', 'lead-guide', 'guide'), itemController.getMonthlyPlan);
// router
//     .route('/items-within/:distance/center/:latlng/unit/:unit')
//     .get(itemController.getItemsWithin);
// /items-within?distance=233&center=-40,45&unit=mi
// /items-within/233/center/-40,45/unit/mi
// router.route('/distances/:latlng/unit/:unit').get(itemController.getDistances);

module.exports = router;
