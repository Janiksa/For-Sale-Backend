'use strict'

/*
 * Controller handling everything regarding the listing functionality that requires authentication via the bearer token
 */

const {controllerError, httpError} = require("../utils/errors");
const {makeThumbnail} = require("../utils/thumbnail");
const listingModel = require("../models/listingModel");

// POST
const insertListing = async (req, res, next) => {
  if (controllerError('listing_post validation', req, next)) return;
  try {
    const filename = req.file.filename;
    const thumb = await makeThumbnail(req.file.path, filename);
    const listing = {
      user_id: req.user.user_id,
      title: req.body.title,
      filename: req.file.filename,
      description: req.body.description,
      price: req.body.price,
      listing_date: req.body.listing_date,
      location: req.body.location
    };
    console.log(listing);
    const result = await (listingModel.insertListing(listing, next));
    if (thumb) {
      res.json({message: 'listing added', id: result.insertId});
    }
  } catch (e) {
    const err = httpError('failed to add listing', 400);
    next(err);
  }
}

// PUT
const modifyListing = async (req, res, next) => {
  try {
    // If a file sent, modify profile pic
    if (req.file) {
      await modifyListingPic(req, res, next);
    }
    if (controllerError('listing_put validation', req, next)) return;
    const response = await listingModel.modifyListing(req.params.id, req.body, req.user, next);
    if (response.affectedRows !== 0) {
      res.json({message: "listing modified"});
      return;
    } else {
      res.json({message: "listing modifying failed!"});
      return;
    }
  } catch (e) {
    const err = httpError("Failed to modify listing", 400);
    next(err);
  }
}

// PUT for only listing pic filename
const modifyListingPic = async (req, res, next) => {
  try {
    const filename = req.file.filename;
    const thumb = await makeThumbnail(req.file.path, filename);
    if (!thumb){
      res.json({ message: "Failed to create thumbnail for image, try again!" });
      return;
    }
    const response = await listingModel.modifyListingPic(req.params.id, filename, req.user, next);
    if (response.affectedRows === 0) {
      res.json({message: "listing pic change failed"});
      return;
    }
  } catch (e) {
    const err = httpError("failed to change listing pic", 400);
    next(err);
  }
}

// DELETE
const deleteListing = async (req, res, next) => {
  try {
    const response = await listingModel.deleteListing(req.params.id, req.user, next);
    if (response.affectedRows !== 0) {
      res.json({message: "Listing deleted"});
      return;
    } else {
      res.json({message: "Deletion failed, unauthorized user?"});
      return;
    }
  } catch (e) {
    const err = httpError("Failed to delete listing", 400);
    next(err);
  }
}

module.exports = {
  insertListing,
  modifyListing,
  deleteListing,
}