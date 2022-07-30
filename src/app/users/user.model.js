

const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypo = require('crypto');
const paginate = require("../../controllers/paginate");

/**
 * User Schema
 */

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "first name is required"],
      minlength: [2, "first name should contain atleast 2 characters!"],
      maxlength: [24, "first name should contain at maximum 24 characters!"],
    },
    lastName: {
      type: String,
      required: [true, "last name is required"],
      minlength: [2, "last name should contain atleast 2 characters!"],
      maxlength: [24, "last name should contain at maximum 24 characters!"],
    },
    phone: {
      type: String,
      unique: true,
      required: [true, "phone number is required"],
      minlength: [10, "invalid phone number format, too short"],
      maxlength: [14, "invalid phone number format, too long"],
    },
  email: {
      type: String,
      lowercase: true,
      trim:true,
      sparse:true,
      unique:true,
      // index:{
      //     unique:true,
      //     sparse:true,
      //     partialFilterExpression:{email: {$type: "string"}}
      // },
      validate: [validator.isEmail, "Invalid email. Please use valid email!"],
  },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "{VALUE} role is not supported",
      },
      default: "user",
    },
    image: {
      id:String,
      imageCover:String,
      images: [String],
      imagePath:String,
      suffix:String,
    },
    password: {
      type: String,
      required: [true, "user should have password!"],
      minlength: 6,
      maxlength: 64,
      select: false,
    },
      active: {
          type: Boolean,
          default: false,
          select: false,
      },
    donatedCount:Number,
      team:{
          type: String,
          enum: {
              values: ["Action", "Art", "BibleStudy", "Choir", "Holistic", "Prayer", "Shepherd", "None"],
              message: "{VALUE} team is not supported",
          },
          default: "None",
      },
      batch:{
          type:Number
      },


      favorites: [{ type: Schema.Types.ObjectId, ref: "Book" }],
      tempPwd:String,
      passwordChangedAt: Date,
      passwordResetToken: String,
      passwordResetExpires: Date,


  },
  {
      timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
userSchema.plugin(paginate);



userSchema.virtual('fullName').get(function() {
    return this.firstName+" " +this.lastName;
});
userSchema.virtual('userImages').get(function() {
    return {
        id:this.image.imageCover !==undefined? this.image.imagePath + this.image.imageCover + this.image.suffix:"",
        profile:this.image.images[0]!==undefined?this.image.imagePath + this.image.images[0] + this.image.suffix:"",
    }
});
/**
 * Check if phone is taken
 * @param {string} phone - The user's phone
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isPhoneTaken = async function (phone, excludeUserId) {
    const user = await this.findOne({ phone, _id: { $ne: excludeUserId } });
    return !!user;
};
/**
 * Pre database save operations
 */
userSchema.pre("save", async function (next) {
  //don't hash if not modified password
  if (!this.isModified("password")) return next();

  //set password change date is password is not set for first time
  if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;

  this.password = await bcrypt.hash(this.password, 12);
  next();
});


/**
 * @method
 * Custom method for password comparision
 */
userSchema.methods.comparePassword = async (inputPassword, storedPassword) => {
  return bcrypt.compare(inputPassword, storedPassword);
};

userSchema.methods.checkPasswordChange = (jwtTimeStamp) => {
  if (this.passwordChangedAt) {
    const passChangeTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,10);
    return jwtTimeStamp < passChangeTime;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypo.randomBytes(32).toString('hex');
    this.passwordResetToken = crypo
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    // console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


/**
 * Get only active user accounts
 */
// userSchema.pre(/^find/, function (next) {
//   this.find({ active: { $ne: false } });
//   next();
// });

const User = model("User", userSchema);

module.exports = User;
