const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const bookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A book must have a name'],

      trim: true,
      maxlength: [60, 'A book name must have less or equal then 40 characters'],
      minlength: [2, 'A book name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Book name must only contain characters']
    },
    slug: String,
    pageNo: {
      type: Number,
    },
    genres:{
        type: mongoose.Schema.ObjectId,
        ref: 'Genre'
    },
    tags:[String], // curch history, selfHelp,
      authors:[String],
      type:String,  // spiritual, secular //-  ?? could this be a tag/ genre - what if both
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
          // required: [true, 'A book must have an amount']
      },
    currentHolders:{
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

      hiddenBook: {
          type: Boolean,
          default: false,
          select: false
      },

  },
  {
      timestamps:true,
      autoIndex:true,
      autoCreate:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

bookSchema.index({ type: 1, tags: 1 });
bookSchema.index({ slug: 1 });
bookSchema.index({name: 'text' , description:'text'});
// bookSchema.ensureIndexes()
// bookSchema.on('index', function(err) {
//     if (err) {
//         console.error('User index error: %s', err);
//     } else {
//         console.info('User indexing complete');
//     }
// });
//
bookSchema.virtual('poster').get(function() {
    return this.image.imagePath +this.image.imageCover+this.image.suffix;
});
bookSchema.virtual('images').get(function() {
    return this.image.images.map(img => {
        return this.image.imagePath + img + this.image.suffix
    })
});

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

bookSchema.pre(/^find/, function(next) {
  this.find({ hiddenBook: { $ne: true } });
  this.start = Date.now();
  next();
});

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
// AGGREGATION MIDDLEWARE
// bookSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { hiddenBook: { $ne: true } } }); // removing all the documents from the output which have hiddenBook set to true
//   console.log(this.pipeline());
//   next();
// });
//---------------------------------------------- trial
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


