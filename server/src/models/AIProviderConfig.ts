import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';
import { encryptSecret, decryptSecret, maskSecret } from '../utils/crypto';
import { config } from '../config/env';

export type AIConnectionStatus = 'connected' | 'disconnected' | 'error' | 'not_configured';

export interface IAIProviderConfig {
  _id?: mongoose.Types.ObjectId;
  provider: 'gemini';
  model: string;
  encryptedApiKey?: string;
  keyMask?: string;
  hasApiKey: boolean;
  isEnabled: boolean;
  connectionStatus: AIConnectionStatus;
  lastVerifiedAt?: Date | null;
  lastVerificationError?: string;
  lastUpdatedBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;

  // Helper instance methods
  getPlaintextApiKey(): string;
  setPlaintextApiKey(plaintextKey: string): void;
}

export type IAIProviderConfigDocument = HydratedDocument<IAIProviderConfig>;

export interface IAIProviderConfigModel extends Model<IAIProviderConfig> {
  getEffectiveConfig(): Promise<IAIProviderConfigDocument>;
}

const AIProviderConfigSchema = new Schema<IAIProviderConfig, IAIProviderConfigModel>(
  {
    provider: {
      type: String,
      enum: ['gemini'],
      default: 'gemini',
      required: true,
    },
    model: {
      type: String,
      default: 'gemini-2.5-flash',
      required: true,
    },
    encryptedApiKey: {
      type: String,
      select: false, // Never return in default queries
    },
    keyMask: {
      type: String,
      default: '',
    },
    hasApiKey: {
      type: Boolean,
      default: false,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    connectionStatus: {
      type: String,
      enum: ['connected', 'disconnected', 'error', 'not_configured'],
      default: 'not_configured',
    },
    lastVerifiedAt: {
      type: Date,
      default: null,
    },
    lastVerificationError: {
      type: String,
      default: '',
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

/**
 * Decrypt and retrieve the active API key
 * Falls back to process.env.GEMINI_API_KEY if database has no stored key
 */
AIProviderConfigSchema.methods.getPlaintextApiKey = function (this: IAIProviderConfigDocument): string {
  if (this.encryptedApiKey) {
    const decrypted = decryptSecret(this.encryptedApiKey);
    if (decrypted && decrypted.trim() !== '') {
      return decrypted;
    }
  }
  // Environment variable fallback
  return config.geminiApiKey ? config.geminiApiKey.trim() : '';
};

/**
 * Securely encrypt and set the API key, updating mask and flags
 */
AIProviderConfigSchema.methods.setPlaintextApiKey = function (this: IAIProviderConfigDocument, plaintextKey: string): void {
  if (!plaintextKey || plaintextKey.trim() === '') {
    this.encryptedApiKey = undefined;
    this.keyMask = '';
    this.hasApiKey = false;
    this.connectionStatus = 'not_configured';
  } else {
    const trimmed = plaintextKey.trim();
    this.encryptedApiKey = encryptSecret(trimmed);
    this.keyMask = maskSecret(trimmed);
    this.hasApiKey = true;
  }
};

/**
 * Singleton getter: Retrieves the primary AI config or initializes default
 */
AIProviderConfigSchema.statics.getEffectiveConfig = async function (): Promise<IAIProviderConfigDocument> {
  let doc = await this.findOne().select('+encryptedApiKey');
  if (!doc) {
    const envKey = config.geminiApiKey?.trim();
    doc = new this({
      provider: 'gemini',
      model: config.geminiModel || 'gemini-2.5-flash',
      isEnabled: true,
      hasApiKey: Boolean(envKey),
      keyMask: envKey ? maskSecret(envKey) : '',
      connectionStatus: envKey ? 'not_configured' : 'not_configured',
      lastVerifiedAt: null,
    });
    if (envKey) {
      doc.encryptedApiKey = encryptSecret(envKey);
    }
    await doc.save();
  }
  return doc as IAIProviderConfigDocument;
};

export const AIProviderConfig = mongoose.model<IAIProviderConfig, IAIProviderConfigModel>(
  'AIProviderConfig',
  AIProviderConfigSchema
);
