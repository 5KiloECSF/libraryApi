const { Schema, model } = require("mongoose");

/**
 * Genre Schema
 */

const genreSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
        unique: true,
      minlength: [2, "name should contain atleast 2 characters!"],
      maxlength: [24, "name should contain at maximum 24 characters!"],
    },
  image: {
      id:String,
      imageCover:String,
      imagePath:String,
      suffix:String,
  },

  description: {
      type: String,
      trim: true,
  },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
genreSchema.virtual('poster').get(function() {
    return this.image.imagePath +this.image.imageCover+this.image.suffix;
});
const Genre = model("Genre", genreSchema);

module.exports = Genre;
