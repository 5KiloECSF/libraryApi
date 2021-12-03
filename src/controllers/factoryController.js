const { sendResponse } = require("../utils/success_response");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiFilters = require("./apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc)
      return next(new AppError("No document found with given id!", 404));

    sendResponse(200, null, res);
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc)
      return next(new AppError("No document found with given id!", 404));

    sendResponse(200, doc, res);
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
      console.log("creating a user", req.body)
    const newDoc = await Model.create(req.body);

    sendResponse(200, newDoc, res);
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
      console.log("-== finding one")
    let query = Model.findById(req.params.id).select("-__v");

    if (populateOptions) query.populate(populateOptions);

    const doc = await query;
    if (!doc) return next(new AppError("No document found with that id!", 404));

    sendResponse(200, doc, res);
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
      console.log("querying all")

      // To allow for nested GET reviews an art (hack)
    let idFilter = {};
    //if it is requesting for reviews with this tourId
    if (req.params.tourId) idFilter = { tourId: req.params.tourId };
    //if it is requesting for tours with this categoryID
    if (req.params.ctgId) idFilter = { ctgId: req.params.ctgId };

    // apply api features on given query
    const features = new ApiFilters(Model.find(idFilter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    // excute query
      // const doc = await features.query.explain();
    const doc = await features.query;
    console.log("QueryRes==<>", doc)
    // send responce to client
    sendResponse(200, doc, res);
  });
