
const Item = require('./itemModel');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../../controllers/factoryController');
const AppError = require('../../utils/appError');


exports.getAllItems = factory.getAll(Item);
// exports.getItem = factory.getOne(Item, { path: 'reviews' });
exports.getItem = factory.getOne(Item );
exports.createItem = factory.createOne(Item);
exports.updateItem = factory.updateOne(Item);
exports.deleteItem = factory.deleteOne(Item);

exports.aliasTopItems = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

//======================== ----------- un needed ----------- =========
// exports.getItemStats = catchAsync(async (req, res, next) => {
//   const stats = await Item.aggregate([
//     {
//       $match: { ratingsAverage: { $gte: 4.5 } }
//     },
//     {
//       $group: {
//         _id: { $toUpper: '$difficulty' },
//         numItems: { $sum: 1 },
//         numRatings: { $sum: '$ratingsQuantity' },
//         avgRating: { $avg: '$ratingsAverage' },
//         avgPrice: { $avg: '$price' },
//         minPrice: { $min: '$price' },
//         maxPrice: { $max: '$price' }
//       }
//     },
//     {
//       $sort: { avgPrice: 1 }
//     }
//     // {
//     //   $match: { _id: { $ne: 'EASY' } }
//     // }
//   ]);
//
//   res.status(200).json({
//     status: 'success',
//     data: {
//       stats
//     }
//   });
// });
//
// exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
//   const year = req.params.year * 1;
//
//   const plan = await Item.aggregate([
//     {
//       $unwind: '$startDates'
//     },
//     {
//       $match: {
//         startDates: {
//           $gte: new Date(`${year}-01-01`),
//           $lte: new Date(`${year}-12-31`)
//         }
//       }
//     },
//     {
//       $group: {
//         _id: { $month: '$startDates' },
//         numItemStarts: { $sum: 1 },
//         items: { $push: '$name' }
//       }
//     },
//     {
//       $addFields: { month: '$_id' }
//     },
//     {
//       $project: { _id: 0 }
//     },
//     {
//       $sort: { numItemStarts: -1 }
//     },
//     {
//       $limit: 12
//     }
//   ]);
//
//   res.status(200).json({
//     status: 'success',
//     results: plan.length,
//     data: {
//       plan
//     }
//   });
// });

// '/items-within/:distance/center/:latlng/unit/:unit'
// /items-within?distance=233&center=-40,45&unit=mi
// /items-within/233/center/33.420755, -95.781260/unit/mi
//
// exports.getItemsWithin = catchAsync(async (req, res, next) => {
//   const { distance, latlng, unit } = req.params;
//   const [lat, lng] = latlng.split(',');
//
//   // const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
//   const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
//
//   if (!lat || !lng) {
//     next(new AppError('Please provide latitutr and longitude in the format lat,lng.', 400));
//   }
//
//   // console.log(distance, lat, lng, unit);
//
//   const items = await Item.find({
//     startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
//   });
//
//   res.status(200).json({
//     status: 'success',
//     results: items.length,
//     data: {
//       data: items
//     }
//   });
// });
//
// exports.getDistances = catchAsync(async (req, res, next) => {
//   const { latlng, unit } = req.params;
//   const [lat, lng] = latlng.split(',');
//
//   const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
//
//   if (!lat || !lng) {
//     next(new AppError('Please provide latitutr and longitude in the format lat,lng.', 400));
//   }
//
//   const distances = await Item.aggregate([
//     {
//       $geoNear: {
//         near: {
//           type: 'Point',
//           coordinates: [lng * 1, lat * 1]
//         },
//         distanceField: 'distance',
//         distanceMultiplier: multiplier
//       }
//     },
//     {
//       $project: {
//         distance: 1,
//         name: 1
//       }
//     }
//   ]);
//
//   res.status(200).json({
//     status: 'success',
//     data: {
//       data: distances
//     }
//   });
// });
