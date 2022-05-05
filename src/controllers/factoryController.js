const { sendResponse } = require("../utils/response/success_response");
const catchAsync = require("../utils/response/catchAsync");
const AppError = require("../utils/response/appError");
const ApiFilters = require("./apiFeatures");
const pick = require("../app/filterFiles");
const log_func=require("../utils/logger")

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
      console.log("aboutTODel=", req.params.id)
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc)
      return next(new AppError("No document found with given id!", 404));
    console.log("objDeleted=",doc)
    sendResponse(204, null, res);
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc)
      return next(new AppError("No document found with given id!", 404));

    sendResponse(202, doc, res);
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log("creating")
    const newDoc = await Model.create(req.body);
      console.log("creating a user==+>", req.body, "doc==++>", newDoc.id)
    sendResponse(201, newDoc, res);
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
      // console.log("-== finding one")
    let query = Model.findById(req.params.id).select("-__v -password");

    if (populateOptions) query.populate(populateOptions);

    const doc = await query;
    if (!doc) return next(new AppError("No document found with that id!", 404));

    sendResponse(200, doc, res);
  });

exports.getAll = (Model,  query=[]) =>
  catchAsync(async (req, res, next) => {
      console.log("querying all")

      // To allow for nested GET reviews an art (hack)
    let idFilter = {};

    //if it is requesting for reviews with this tourId ----- reviews will have tourId
    if (req.params.tourId) idFilter = { tourId: req.params.tourId };
    //if it is requesting for tours with this categoryID---- items will have category id
    if (req.params.ctgId) idFilter = { ctgId: req.params.ctgId };
    log_func("query", req.query, "BgGreen")
    const filter = pick(req.query, query)
      log_func("filter", filter, "BgYellow")
    // apply api features on given query
    const features = new ApiFilters(Model.find(idFilter), filter)
      .filter()
      .sort()
      .limitFields()
      .pagination()

    // excute query
      // const doc = await features.query.explain();
    const doc = await features.query;
    // console.log("QueryRes==<>", doc)
    // send responce to client
    sendResponse(200, doc, res);
  });
