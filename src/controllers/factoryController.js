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
      log_func("-== finding one", req.params.id, "BgCyan")
    let query = Model.findById(req.params.id).select("-__v -password");

    if (populateOptions) query.populate(populateOptions);

    const doc = await query;
    if (!doc) return next(new AppError("No document found with that id!", 404));

    sendResponse(200, doc, res);
  });

exports.getAll = (Model,  allowedQuery=[]) =>
  catchAsync(async (req, res, next) => {
      console.log("querying all")

      // To allow for nested GET reviews an art (hack)
    let idFilter = {};


    if (req.query.search) idFilter = { $text: { $search: req.query.search } };
    // if (req.query.search) idFilter = { name: { $regex: '.*' + req.query.search + '.*' } }
      //if it is requesting for reviews with this bookId ----- reviews will have bookId
      // if (req.params.bookId) idFilter['bookId'] =  req.params.bookId
      //if it is requesting for books with this categoryID---- items will have category id
      if (req.query.ctgId) idFilter = { ctgId: req.params.ctgId };


    log_func("query", req.query, "BgGreen")
    log_func("params", req.params, "BgGreen")
    const filter = pick(req.query, allowedQuery)
      log_func("filter", filter, "BgYellow")
    // apply api features on given query
      log_func("idFIlter=", idFilter, "BgMagenta")
    const queryBuilder = new ApiFilters(Model.find(idFilter), filter)
      .filter()
      .sort()
      .limitFields()
      .pagination()

    // excute query
      // const doc = await features.query.explain();
    const doc = await queryBuilder.query;
    log_func("QueryRes==<>", doc.length, "BgCyan")
    // send responce to client
    sendResponse(200, doc, res);
  });
