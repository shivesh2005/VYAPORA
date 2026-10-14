import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { Store } from '../models/Store';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { Subscription } from '../models/Subscription';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth';

const generateToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as any }
  );
};

const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(config.cookieName, token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Explicit security check: public registration must NEVER self-assign admin
    if (role === 'admin') {
      res.status(403).json({ success: false, message: 'Admin accounts cannot be self-assigned.' });
      return;
    }

    const assignedRole = role === 'seller' ? 'seller' : 'customer';

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: assignedRole,
    });

    // If registered as a seller, auto-provision their store and assign Starter SaaS subscription
    if (assignedRole === 'seller') {
      const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      const store = await Store.create({
        sellerId: user._id,
        storeName: `${name}'s Boutique`,
        slug: uniqueSlug,
        description: `Official marketplace storefront for ${name}.`,
        contactEmail: email.toLowerCase(),
      });

      const starterPlan = await SubscriptionPlan.findOne({ name: 'STARTER' });
      if (starterPlan) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        await Subscription.create({
          sellerId: user._id,
          storeId: store._id,
          planId: starterPlan._id,
          status: 'active',
          currentPeriodEnd: nextMonth,
        });
      }
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({ success: false, message: 'This account has been suspended by an administrator.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    let store = null;
    let subscription = null;
    if (user.role === 'seller') {
      store = await Store.findOne({ sellerId: user._id });
      subscription = await Subscription.findOne({ sellerId: user._id }).populate('planId');
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        preferences: user.preferences,
      },
      store,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(config.cookieName, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    let store = null;
    let subscription = null;
    if (req.user.role === 'seller') {
      store = await Store.findOne({ sellerId: req.user._id });
      subscription = await Subscription.findOne({ sellerId: req.user._id }).populate('planId');
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        phone: req.user.phone,
        preferences: req.user.preferences,
        createdAt: req.user.createdAt,
      },
      store,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};
