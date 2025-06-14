export type TBanner = {
  title: string;
  detail: string;
  companyList: string[];
};

export type TFeatherCard = {
  title: string;
  detail: string;
  img: string;
};

export type TFeathers = {
  title: string;
  detail: string;
  cards: TFeatherCard[];
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
  feathers?: TFeathers;
  guide?: TGuide;
  aiCorner?: TAiCorner;
};