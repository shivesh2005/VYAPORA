import mongoose, { Document, Schema } from 'mongoose';

export interface IAIMessage {
  role: 'user' | 'assistant';
  content: string;
  productsRecommended?: mongoose.Types.ObjectId[];
  timestamp: Date;
}

export interface IAIConversation extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  messages: IAIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const AIMessageSchema = new Schema<IAIMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    productsRecommended: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AIConversationSchema = new Schema<IAIConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, required: true, index: true },
    messages: [AIMessageSchema],
  },
  { timestamps: true }
);

export const AIConversation = mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);
