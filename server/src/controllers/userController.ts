import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Address } from '../models/Address';
import { AuthRequest } from '../middleware/auth';

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, avatar, phone, preferences } = req.body;
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (phone !== undefined) user.phone = phone;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password does not match.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

// Address Management
export const getAddresses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const addresses = await Address.find({ userId: req.user!._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, phone, street, city, state, zipCode, country, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ userId: req.user!._id }, { isDefault: false });
    }

    // Check if this is the first address, if so make it default
    const count = await Address.countDocuments({ userId: req.user!._id });
    const shouldBeDefault = isDefault || count === 0;

    const address = await Address.create({
      userId: req.user!._id,
      fullName,
      phone,
      street,
      city,
      state,
      zipCode,
      country: country || 'India',
      isDefault: shouldBeDefault,
    });

    res.status(201).json({ success: true, message: 'Address saved.', address });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!address) {
      res.status(404).json({ success: false, message: 'Address not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Address removed.' });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Address.updateMany({ userId: req.user!._id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      { isDefault: true },
      { new: true }
    );
    if (!address) {
      res.status(404).json({ success: false, message: 'Address not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Default address updated.', address });
  } catch (error) {
    next(error);
  }
};
