// import { Express } from 'express';
// import { uploadImgToCloudinary } from '../../util/uploadImgToCludinary';
// import LandingPageModel from './landingPage.model';
// import { LandingPage, TBanner, TFeathers, TFeatherCard, TGuide, TAiCorner } from './landingPage.interface';

import { uploadMultipleImages } from "../../util/uploadImgToCludinary";
import { LandingPage } from "./landingPage.interface";
import LandingPageModel from "./landingPage.model";

// // Service to update the banner section
// const updateBannerSection = async (
//   file: Express.Multer.File | undefined,
//   data: Partial<TBanner>
// ): Promise<LandingPage> => {
//   const existingLandingPage = await LandingPageModel.findOne({});

//   // Construct complete TBanner
//   const bannerData = {
//     title: data.title || existingLandingPage?.banner?.title || 'Default Banner Title',
//     detail: data.detail || existingLandingPage?.banner?.detail || 'Default Banner Detail',
//     companyList: data.companyList || existingLandingPage?.banner?.companyList || [],
//   };

//   if (file) {
//     const uploadImg = await uploadImgToCloudinary(file.originalname, file.path);
//     if (!uploadImg) {
//       throw new Error('Image link creation failed');
//     }
//     console.log(uploadImg);

//     bannerData.companyList = [...bannerData.companyList, uploadImg.secure_url];
//   }

//   const updateData: Partial<LandingPage> = { banner: bannerData };

//   const result = await LandingPageModel.findOneAndUpdate(
//     {},
//     { $set: updateData },
//     { new: true, runValidators: true, upsert: true }
//   );

//   return result;
// };

// // Service to update the feathers section
// const updateFeathersSection = async (
//   file: Express.Multer.File | undefined,
//   data: Partial<TFeathers>,
//   newCardData?: Partial<TFeatherCard>
// ): Promise<LandingPage> => {
//   const existingLandingPage = await LandingPageModel.findOne({});

//   // Construct complete TFeathers
//   const feathersData = {
//     title: data.title || existingLandingPage?.feathers?.title || 'Default Feathers Title',
//     detail: data.detail || existingLandingPage?.feathers?.detail || 'Default Feathers Detail',
//     cards: data.cards || existingLandingPage?.feathers?.cards || [],
//   };

//   if (file) {
//     const uploadImg = await uploadImgToCloudinary(file.originalname, file.path);
//     if (!uploadImg) {
//       throw new Error('Image link creation failed');
//     }
//     console.log(uploadImg);

//     const newCard: TFeatherCard = {
//       title: newCardData?.title || 'Default Card Title',
//       detail: newCardData?.detail || 'Default Card Detail',
//       img: uploadImg.secure_url,
//     };

//     feathersData.cards = [...feathersData.cards, newCard];
//   }

//   const updateData: Partial<LandingPage> = { feathers: feathersData };

//   const result = await LandingPageModel.findOneAndUpdate(
//     {},
//     { $set: updateData },
//     { new: true, runValidators: true, upsert: true }
//   );

//   return result;
// };

// // Service to update the guide section
// const updateGuideSection = async (
//   data: Partial<TGuide>
// ): Promise<LandingPage> => {
//   const existingLandingPage = await LandingPageModel.findOne({});

//   // Construct complete TGuide
//   const guideData: TGuide = {
//     title: data.title || existingLandingPage?.guide?.title || 'Default Guide Title',
//     detail: data.detail || existingLandingPage?.guide?.detail || 'Default Guide Detail',
//     guideCards: data.guideCards || existingLandingPage?.guide?.guideCards || [],
//   };

//   const updateData: Partial<LandingPage> = { guide: guideData };

//   const result = await LandingPageModel.findOneAndUpdate(
//     {},
//     { $set: updateData },
//     { new: true, runValidators: true, upsert: true }
//   );

//   return result;
// };

// // Service to update the aiCorner section
// const updateAiCornerSection = async (
//   data: Partial<TAiCorner>
// ): Promise<LandingPage> => {
//   const existingLandingPage = await LandingPageModel.findOne({});

//   // Construct complete TAiCorner
//   const aiCornerData: TAiCorner = {
//     title: data.title || existingLandingPage?.aiCorner?.title || 'Default AI Corner Title',
//     detail: data.detail || existingLandingPage?.aiCorner?.detail || 'Default AI Corner Detail',
//   };

//   const updateData: Partial<LandingPage> = { aiCorner: aiCornerData };

//   const result = await LandingPageModel.findOneAndUpdate(
//     {},
//     { $set: updateData },
//     { new: true, runValidators: true, upsert: true }
//   );

//   return result;
// };

// export {
//   updateBannerSection,
//   updateFeathersSection,
//   updateGuideSection,
//   updateAiCornerSection,
// };


// services/landingPage.service.ts


const updateLandingPage = async (
  data: Partial<LandingPage>,
  companyListFiles?: Express.Multer.File[],
  featureCardFiles?: Express.Multer.File[]
) => {
  // 1. Fetch the existing landing page to preserve current data
  const existingPage = await LandingPageModel.findOne({});

  // 2. Upload companyList images and append to existing images
  if (companyListFiles?.length) {
    const uploadedCompanyList = await uploadMultipleImages(
      companyListFiles.map((f) => f.path)
    );
    data.banner = {
      ...data.banner,
      companyList: [
        ...(existingPage?.banner?.companyList || []),
        ...uploadedCompanyList,
      ],
    };
  } else {
    // Preserve existing companyList if no new files are uploaded
    data.banner = {
      ...data.banner,
      companyList: existingPage?.banner?.companyList || data.banner?.companyList || [],
    };
  }

  // 3. Upload feature card images and attach to cards
  if (featureCardFiles?.length && data.features?.cards?.length) {
    const uploadedCardImages = await uploadMultipleImages(
      featureCardFiles.map((f) => f.path)
    );

    // Match uploaded images to feature cards by index
    data.features.cards = data.features.cards.map((card, idx) => ({
      ...card,
      img: uploadedCardImages[idx] || card.img,
    }));
  }

  // 4. Update or create landing page
  const updated = await LandingPageModel.findOneAndUpdate({}, data, {
    new: true,
    upsert: true,
  });

  return updated;
};

const getLandingPageData = async () => {
  return await LandingPageModel.find({});
}

const deleteCompanyLogoByIndex = async (index: number) => {
  // 1. Fetch the existing landing page
  const existingPage = await LandingPageModel.findOne({});

  if (!existingPage?.banner?.companyList) {
    throw new Error('No company logos found to delete');
  }

  if (index < 0 || index >= existingPage.banner.companyList.length) {
    throw new Error('Invalid index provided');
  }

  // 2. Remove the image at the specified index
  const updatedCompanyList = existingPage.banner.companyList.filter(
    (_, idx) => idx !== index
  );

  // 3. Update the landing page with the new companyList
  const updated = await LandingPageModel.findOneAndUpdate(
    {},
    {
      $set: {
        'banner.companyList': updatedCompanyList,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  return updated;
};

const landingPageService = {
  updateLandingPage,
  getLandingPageData,
  deleteCompanyLogoByIndex
};

export default landingPageService;