
 const {userModel } = require ("../database/database");
 const auth = require ("../view/auth");
 const nodemailer = require ("nodemailer");
 const dotenv = require ("dotenv");

dotenv.config();

const signupController = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await auth.hashPassword(password);
    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const signinController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await auth.hashCompare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = await auth.createToken({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    let userData = await userModel.findOne(
      { email: req.body.email },
      { _id: 0, password: 0, status: 0, createdAt: 0, email: 0 }
    );
    res.status(200).json({ message: "Signin successful", token, userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     let user = await userModel.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const generateOTP = () => {
//       const characters = "0123456789";
//       return Array.from(
//         { length: 6 },
//         () => characters[Math.floor(Math.random() * characters.length)]
//       ).join("");
//     };

//     const OTP = generateOTP();
//     user.resetPasswordOtp = OTP;
//     user.resetPasswordExpires = Date.now() + 3600000;
//     await user.save();

//     const transporter = nodemailer.createTransport({
//       port:587,
//       service: "gmail",
//       auth: {
//         user: process.env.USER_MAILER,
//         pass: process.env.PASS_MAILER,
//       },
//     });

//     const mailOptions = {
//       from: "helloworld1234@gmail.com",
//       to: user.email,
//       subject: "Password Reset",
//       html: `
//         <p>Dear ${user.firstName} ${user.lastName},</p>
//         <p>We received a request to reset your password. Here is your One-Time Password (OTP): <strong>${OTP}</strong></p>
//         <p>Please click the following link to reset your password:</p>
//         <a href="http://localhost:3000/reset-password">Reset Password</a>
//         <p>If you did not make this request, please ignore this email.</p>
//         <p>Thank you,</p>
//         <p>From Validation</p>
//       `,
//     };

//   await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: "Password reset email sent successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const generateOTP = () => {
      const characters = "0123456789";
      return Array.from(
        { length: 6 },
        () => characters[Math.floor(Math.random() * characters.length)]
      ).join("");
    };

    const OTP = generateOTP();
    user.resetPasswordOtp = OTP;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_MAILER,
        pass: process.env.USER_PASS,
      },
    });
    console.log(user.email);
    const mailOptions = {
      from: "narutohinata101999@gmail.com",
      to: user.email,
      subject: "Password Reset",
      html: `
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>We received a request to reset your password. Here is your One-Time Password (OTP): <strong>${OTP}</strong></p>
        <p>Please click the following link to reset your password:</p>
        //<a href="https://main--chipper-conkies-c7774d.netlify.app/reset-password">Reset Password</a>
        <a href="https://password-reset-flows.netlify.app/reset-password">Reset Password</a>
        <p>If you did not make this request, please ignore this email.</p>
        <p>Thank you,</p>
        <p>From Validation</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { OTP, password } = req.body;

    const user = await userModel.findOne({
      resetPasswordOtp: OTP,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      const message = user ? "OTP has expired" : "Invalid OTP";
      return res.status(404).json({ message });
    }

    const hashedPassword = await auth.hashPassword(password);
    user.password = hashedPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports={signupController,signinController,resetPassword,forgotPassword};
