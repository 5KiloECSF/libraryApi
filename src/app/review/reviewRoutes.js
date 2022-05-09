const express = require('express');
const reviewController = require('./../controllers/reviewController');

const {  protectRoute,  restrictRole } = require('../../middlewares/authorizeRoute');

const router = express.Router({ mergeParams: true });

// POST /book/32434fs35/reviews
// GET /book/32434fs35/reviews
// POST /reviews

router.use(protectRoute);

// user review routes
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
      restrictRole('user'),
    reviewController.setBookUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getlReview)
  .patch(restrictRole('user', 'admin'), reviewController.updateReview)
  .delete(restrictRole('user', 'admin'), reviewController.deleteReview);

module.exports = router;
