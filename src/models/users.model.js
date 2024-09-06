import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
   firstName: {
     type: String,
     required: true
   },
   lastName: {
     type: String,
     required: true
   },
   email: {
    type: String,
    required: true,
    unique: true,
   },
   password: {
    type: String,
    required: true,
    minlength: 3,
   },
   emailStatus: {
    type: Boolean,
    default: false,
   },
   role: {
    type: Number,
    enum: [1, 2], // 1 = user, 2 = admin
    default: 1,
  },
   companyName: {
    type: String,
    required: true,
   },
   expertise: {
    type: String,
    required: true,
   },
   phoneNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
        validator: (value) => {
            return /^\+\d{1,3}-\d{1,14}$/.test(value);
        },
        message: 'Invalid phone number format, should start with + followed by country code and then 1-14 digits.'
    }
   },
   address: {
    type: String,
    required: true,
   },
   city: {
    type: String,
    required: true,
   },
   state: {
    type: String,
    required: true,
   },
   zipCode: {
    type: String,
    required: true,
    validate: {
        validator: (value) => {
            return /\d{5}(?:[-\s]\d{4})?/.test(value);
        },
        message: 'Invalid zip code format.'
    }
   },
   country: {
    type: String,
    required: true,
   },
   registrationDate: {
    type: Date,
    default: Date.now,
   },
},
{
    timestamps: true,
    versionKey: false,
}
);
userSchema.pre('save', async function (next) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
  
      next();
    } catch (error) {
      next(error);
    }
  });
  userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
      { _id: this._id, role: this.role },
      process.env.SECRET_KEY,
      {
        expiresIn: process.env.EXPIRES_IN, // You can adjust the expiration time
      }
    );
    return token;
  };
  
  const User = mongoose.model('User', userSchema);
  export default User;