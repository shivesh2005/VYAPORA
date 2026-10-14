import { Request, Response, NextFunction } from 'express';
import { ContactMessage } from '../models/ContactMessage';
import { NewsletterSubscriber } from '../models/NewsletterSubscriber';
import { AuthRequest } from '../middleware/auth';

export const submitContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    const record = await ContactMessage.create({
      name,
      email: email.toLowerCase().trim(),
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. Our support team will respond shortly.',
      record,
    });
  } catch (error) {
    next(error);
  }
};

export const subscribeNewsletter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existing = await NewsletterSubscriber.findOne({ email: cleanEmail });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      res.status(200).json({ success: true, message: 'You are already subscribed to Vyapora marketplace updates.' });
      return;
    }

    await NewsletterSubscriber.create({ email: cleanEmail });

    res.status(201).json({
      success: true,
      message: 'Subscribed successfully! Welcome to Vyapora deals and newsletter.',
    });
  } catch (error) {
    next(error);
  }
};

export const getContactMessagesAdmin = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};
