export type TBanner = {
  title?: string;
  detail?: string;
  companyList: string[];
};

export type TFeatureCard = {
  title: string;
  detail: string;
  img: string;
};

export type TFeatures = {
  title: string;
  detail: string;
  cards: TFeatureCard[];
};

export type TGuideCard = {
  title: string;
  detail: string;
};

export type TGuide = {
  title: string;
  detail: string;
  guideCards: TGuideCard[];
};

export type TAiCorner = {
  title: string;
  detail: string;
};

export type LandingPage = {
  banner?: TBanner;
  features?: TFeatures;
  guide?: TGuide;
  aiCorner?: TAiCorner;
};