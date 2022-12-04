const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

/**
 * Genre Schema
 */

const instanceSchema = new Schema(
    {
        // auto increament, the number posted on each book: good for tracking duplicate books
        number: {     
            type: Number,
        },
        bookId:{
            type: mongoose.Schema.ObjectId,
            ref: 'Book'
        },
        donorId:{
            type: mongoose.Schema.ObjectId,
            ref: 'Book'
        },
        donorName:String,
        donatedDate:String,

        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps:true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);
instanceSchema.virtual('poster').get(function() {
    return this.image.imagePath +this.image.imageCover+this.image.suffix;
});
const Instance = model("Instance", instanceSchema);

module.exports = Instance;
