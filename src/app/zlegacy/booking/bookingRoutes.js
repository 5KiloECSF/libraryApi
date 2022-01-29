const express = require('express');

const bookingController = require('./bookingController');

const {  protectRoute,  restrictRole } = require('../../../middlewares/authorizeRoute');
const router = express.Router();

router.use(protectRoute);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(restrictRole('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

// user booking routes
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
