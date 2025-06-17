import { model, Schema } from 'mongoose';
import { LandingPage, TAiCorner, TBanner, TFeatureCard, TFeatures, TGuide, TGuideCard } from './landingPage.interface';

// Mongoose schema for TBanner
const BannerSchema = new Schema<TBanner>({
  title: { type: String, required: true, default: 'Default Banner Title' },
  detail: { type: String, required: true, default: 'Default Banner Detail' },
  companyList: { type: [String], required: true, default: [] },
});

// Mongoose schema for TFeatherCard
const FeatureCardSchema = new Schema<TFeatureCard>({
  title: { type: String, required: true, default: 'Default Card Title' },
  detail: { type: String, required: true, default: 'Default Card Detail' },
  img: { type: String, required: false, default: '' },
});

// Mongoose schema for TFeathers
const FeaturesSchema = new Schema<TFeatures>({
  title: { type: String, required: true, default: 'Default Features Title' },
  detail: { type: String, required: true, default: 'Default Features Detail' },
  cards: { type: [FeatureCardSchema], required: true, default: [] },
});

// Mongoose schema for TGuideCard
const GuideCardSchema = new Schema<TGuideCard>({
  title: { type: String, required: true, default: 'Default Guide Card Title' },
  detail: { type: String, required: true, default: 'Default Guide Card Detail' },
});

// Mongoose schema for TGuide
const GuideSchema = new Schema<TGuide>({
  title: { type: String, required: true, default: 'Default Guide Title' },
  detail: { type: String, required: true, default: 'Default Guide Detail' },
  guideCards: { type: [GuideCardSchema], required: true, default: [] },
});

// Mongoose schema for TAiCorner
const AiCornerSchema = new Schema<TAiCorner>({
  title: { type: String, required: true, default: 'Default AI Corner Title' },
  detail: { type: String, required: true, default: 'Default AI Corner Detail' },
});

// Mongoose schema for LandingPage
const LandingPageSchema = new Schema<LandingPage>({
  banner: { type: BannerSchema, required: false, default: {} },
  features: { type: FeaturesSchema, required: false, default: {} },
  guide: { type: GuideSchema, required: false, default: {} },
  aiCorner: { type: AiCornerSchema, required: false, default: {} },
});

// Mongoose model
const LandingPageModel = model<LandingPage>('LandingPage', LandingPageSchema);

export default LandingPageModel;