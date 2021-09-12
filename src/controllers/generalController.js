const { sendResponse } = require("../utils/success_response");
const catchAsync = require("../utils/catchAsyncError");
const AppError = require("../utils/app_error");
const ApiFilters = require("./apiFilters");

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
    const newDoc = await Model.create(req.body);
    sendResponse(200, newDoc, res);
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id).select("-__v");

    if (populateOptions) query.populate(populateOptions);

    const doc = await query;
    if (!doc) return next(new AppError("No document found with that id!", 404));

    sendResponse(200, doc, res);
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //allow nest routes
    let idFilter = {};
    if (req.params.house) idFilter = { house: req.params.house };

    // apply api features on given query
    const features = new ApiFilters(Model.find(idFilter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    // excute query
    const doc = await features.query;
    // send responce to client
    sendResponse(200, doc, res);
  });
