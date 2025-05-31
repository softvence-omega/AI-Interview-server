import mongoose, { Schema, Document } from 'mongoose';

export interface IWebsiteConfig extends Document {
  title: string;
  logoUrl?: string;
  triggerText: string;
}

const websiteConfigSchema: Schema = new Schema<IWebsiteConfig>({
  title: { type: String, required: true },
  logoUrl: { type: String, required: false },
  triggerText: { type: String, required: true }
}, { timestamps: true });

export const WebsiteConfig = mongoose.model<IWebsiteConfig>('WebsiteConfig', websiteConfigSchema);
