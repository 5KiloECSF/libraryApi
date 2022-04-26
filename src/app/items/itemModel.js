const mongoose = require('mongoose');
const slugify = require('slugify');
const {string} = require("sharp/lib/is");
// const User = require('./userModel');
// const validator = require('validator');

const bookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A book must have a name'],
      // unique: true,
      trim: true,
      maxlength: [60, 'A book name must have less or equal then 40 characters'],
      minlength: [2, 'A book name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain caracters']
    },
    slug: String,
    page: {
      type: Number,
    },
    genres:[String],
    type:String,  // spiritual, secular //-  ?? could this be a tag/ genre - what if both
    tags:[String], // curch history, selfHelp,
    authors:[String],
    language:String,  //amh, eng

    image: {
        id:String,
        imageCover:String,
        imagePath:String,
        suffix:String,
        images: [String],
      // type: String,
      // required: [true, 'A book must have a cover image']
    },
      summary: {
          type: String,
          trim: true,
          // required: [true, 'A book must have a description']
      },
      description: {
          type: String,
          trim: true,
      },
    publishedAt:Date,
    // ===================== library related properties
      booksAmount: {
          type: Number,
          default:1,
          // required: [true, 'A book must have a price']
      },
    currentHolder:{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
      queues:[
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ] ,
    borrowingHistory: [
      {
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
       fullName:String,
        isActive:Boolean,
        startDate: Date,
        endDate: Date,

      }
    ],
    donors: [
      {
          userId: {
              type: mongoose.Schema.ObjectId,
              ref: 'User'
          },
          fullName:String,          
          donationDate: Date,         
      }
    ],
      //-------------------- ratings ------------
      ratingsAverage: {
          type: Number,
          default: 4.5,
          min: [1, 'Rating must be above 1.0'],
          max: [5, 'Rating must be below 5.0'],
          set: val => Math.round(val * 10) / 10,

      },
      ratingsQuantity: {
          type: Number,
          default: 0
      },
      createdAt: {
          type: Date,
          default: Date.now(),
          select: false
      },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

bookSchema.index({ type: 1, tags: 1 });
bookSchema.index({ slug: 1 });


// Virtual populate
bookSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'book',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() !.update()
bookSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});



const Book = mongoose.model('Book', bookSchema);

module.exports = Book;

// QUERY MIDDLEWARE

// bookSchema.pre(/^find/, function(next) {
//   this.find({ secretTour: { $ne: true } });
//
//   this.start = Date.now();
//   next();
// });

// bookSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'guides',
//     select: '-__v -passwordChangedAt'
//   });
//
//   next();
// });


// bookSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
// bookSchema.pre('save', function(next) {
//   console.log('Document will save....');
//   next();
// });
// bookSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });
// bookSchema.post(/^find/, function(docs, next) {
//   console.log(`Query took ${Date.now() - this.start} millisecnds!`);
//   next();
// });
// AGGREGATION MIDDLEWARE
// bookSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // removing all the documents from the output which have secretTour set to true
//   console.log(this.pipeline());
//   next();
// });

