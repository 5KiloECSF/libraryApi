const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypo = require('crypto');
/**
 * User Schema
 */

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: [true, "first name is required"],
      minlength: [2, "first name should contain atleast 2 characters!"],
      maxlength: [24, "first name should contain at maximum 24 characters!"],
    },
    lastname: {
      type: String,
      required: [true, "last name is required"],
      minlength: [2, "last name should contain atleast 2 characters!"],
      maxlength: [24, "last name should contain at maximum 24 characters!"],
    },
    email: {
      type: String,
      // required: [true, "user should have email!"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email. Please use valid email!"],
    },
    phone: {
      type: String,
      // required: [true, "phone number is required"],
      minlength: [10, "invalid phone number format, too short"],
      maxlength: [14, "invalid phone number format, too long"],
    },
    firebaseId:{
        type: String,
    },
    role: {
      type: String,
      enum: {
        values: ["user", "owner", "admin"],
        message: "{VALUE} role is not supported",
      },
      default: "user",
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "user should have password!"],
      minlength: 6,
      maxlength: 64,
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    createdAt: {
      type: Date,
      default: Date.now(),
      validate: [validator.isDate, "wrong date format"],
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
      following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
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
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = model("User", userSchema);

module.exports = User;
