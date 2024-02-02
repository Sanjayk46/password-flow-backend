
const mongoose =require ("mongoose");

const validateEmail = (e) => {
  var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(e);
};
const dbConnection = async ()=>{
  try {
      await mongoose.connect(
          "mongodb+srv://sanjayks8046:Iahdd45uAymNkIEM@zendb.kv2hnw1.mongodb.net/");
      console.log("DB Connected successfully");
      
  } catch (error) {
      console.log(error.message," error in connecting db");
  }
}

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "First Name is required"] },
    lastName: { type: String, required: [true, "Last Name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: validateEmail,
    },
    password: { type: String, required: [true, "Password is required"] },
    status: { type: Boolean, default: true },
    role: { type: String, default: "customer" },
    createdAt: { type: Date, default: Date.now() },
    resetPasswordOtp: { type: Number },
    resetPasswordExpires: { type: Date },
  },
  {
    collection: "Users",
    versionKey: false,
  }
);

const userModel = mongoose.model("User", userSchema);
module.exports = {dbConnection,userModel};
