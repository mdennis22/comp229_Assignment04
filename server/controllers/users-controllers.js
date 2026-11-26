import UserModel from "../models/users-model.js";
import generateToken from "../utils/jwt.js";
import qrcode from "qrcode";
import otplib from "otplib";

export const getAllUsers = async (req, res) => {
  try {
    const Users = await UserModel.find();
    res.status(200).json(Users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// export const createUser = async (req, res) => {
//   try {
//     const newUser = new UserModel(req.body);
//     const savedUser = await newUser.save();
//     res.status(201).json(savedUser);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new UserModel({ username, email, password, role: "user" });
    const savedUser = await newUser.save();

    const token = generateToken(savedUser);

    res.status(201).json({ user: savedUser, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    } // is not null or undefined

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, authenticatorCode } = req.body;
    const user = await UserModel.findOne({ email }).select("+twoFactorSecret");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.twoFactorEnabled) {
      if (!/^\d{6}$/.test(authenticatorCode || "")) {
        return res.status(401).json({
          message: "Authenticator code required",
          twoFactorRequired: true,
        });
      }

      if (!otplib.authenticator.check(authenticatorCode, user.twoFactorSecret)) {
        return res.status(401).json({
          message: "Invalid authenticator code",
          twoFactorRequired: true,
        });
      }
    }

    const token = generateToken(user);

    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setupTwoFactor = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select(
      "+twoFactorSecret +twoFactorPendingSecret",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.twoFactorEnabled) {
      return res.status(409).json({ message: "Two-factor authentication is already enabled" });
    }

    const secret = otplib.authenticator.generateSecret(20);
    const otpauthUrl = otplib.authenticator.keyuri(user.email, "Portfolio", secret);
    const qrCode = await qrcode.toDataURL(otpauthUrl);

    user.twoFactorPendingSecret = secret;
    await user.save();

    res.status(200).json({ qrCode, secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyTwoFactorSetup = async (req, res) => {
  try {
    const { authenticatorCode } = req.body;
    if (!/^\d{6}$/.test(authenticatorCode || "")) {
      return res.status(400).json({ message: "A valid six-digit authenticator code is required" });
    }

    const user = await UserModel.findById(req.user.id).select(
      "+twoFactorSecret +twoFactorPendingSecret",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.twoFactorPendingSecret) {
      return res.status(400).json({ message: "Start two-factor setup before verifying a code" });
    }
    if (!otplib.authenticator.check(authenticatorCode, user.twoFactorPendingSecret)) {
      return res.status(401).json({ message: "Invalid authenticator code" });
    }

    user.twoFactorSecret = user.twoFactorPendingSecret;
    user.twoFactorPendingSecret = undefined;
    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({ message: "Two-factor authentication enabled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export default usersController;
