// import { Express } from 'express';
// import { uploadImgToCloudinary } from '../../util/uploadImgToCludinary';
// import LandingPageModel from './landingPage.model';
// import { LandingPage, TBanner, TFeathers, TFeatherCard, TGuide, TAiCorner } from './landingPage.interface';

import { uploadImgToCloudinary, uploadMultipleImages } from "../../util/uploadImgToCludinary";
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


// const updateLandingPage = async (
//   data: Partial<LandingPage>,
//   companyListFiles?: Express.Multer.File[],
//   featureCardFiles?: Express.Multer.File[]
// ) => {
//   // 1. Fetch the existing landing page to preserve current data
//   const existingPage = await LandingPageModel.findOne({});

//   // 2. Upload companyList images and append to existing images
//   if (companyListFiles?.length) {
//     const uploadedCompanyList = await uploadMultipleImages(
//       companyListFiles.map((f) => f.path)
//     );
//     data.banner = {
//       ...data.banner,
//       companyList: [
//         ...(existingPage?.banner?.companyList || []),
//         ...uploadedCompanyList,
//       ],
//     };
//   } else {
//     // Preserve existing companyList if no new files are uploaded
//     data.banner = {
//       ...data.banner,
//       companyList: existingPage?.banner?.companyList || data.banner?.companyList || [],
//     };
//   }

//   // 3. Upload feature card images and attach to cards
//   //?  && data.features?.cards?.length

//   if (featureCardFiles?.length) {
//     const uploadedCardImages = await uploadMultipleImages(
//       featureCardFiles.map((f) => f.path)
//     );

//     // Match uploaded images to feature cards by index
//     if(data.features?.cards?.length) {
//       data.features.cards = data.features.cards.map((card, idx) => ({
//         ...card,
//         img: uploadedCardImages[idx] || card.img || "",
//       }));
//     }
//   }

//   // 4. Update or create landing page
//   const updated = await LandingPageModel.findOneAndUpdate({}, data, {
//     new: true,
//     upsert: true,
//   });

//   return updated;
// };

// const updateLandingPage = async (
//   data: Partial<LandingPage>,
//   companyListFiles?: Express.Multer.File[],
//   featureCardFiles?: Express.Multer.File[]
// ) => {
//   // 1. Fetch existing landing page to preserve data
//   const existingPage = await LandingPageModel.findOne({});

//   // 2. Upload companyList images and append to existing images
//   if (companyListFiles?.length) {
//     const uploadedCompanyList = await uploadMultipleImages(
//       companyListFiles.map((f) => f.path)
//     );
//     data.banner = {
//       ...data.banner,
//       companyList: [
//         ...(existingPage?.banner?.companyList || []),
//         ...uploadedCompanyList,
//       ],
//     };
//   } else {
//     data.banner = {
//       ...data.banner,
//       companyList:
//         existingPage?.banner?.companyList || data.banner?.companyList || [],
//     };
//   }

//   // 3. Upload feature card images and assign to corresponding cards
//   if (featureCardFiles?.length && data.features?.cards?.length) {
//     // Ensure the number of files doesn't exceed the number of cards
//     if (featureCardFiles.length > data.features.cards.length) {
//       throw new Error(
//         `Too many feature card images provided. Expected at most ${data.features.cards.length} images, but received ${featureCardFiles.length}.`
//       );
//     }

//     // Process each card and assign image if available
//     for (let i = 0; i < data.features.cards.length; i++) {
//       const card = data.features.cards[i];
//       const file = featureCardFiles[i];

//       if (file) {
//         const fileName = `feature-card-${i}-${Date.now()}`;
//         const uploadResult = await uploadImgToCloudinary(fileName, file.path);
//         card.img = uploadResult.secure_url; // Assign uploaded image URL
//       } else if (existingPage?.features?.cards?.[i]?.img) {
//         // Preserve existing image if no new file is provided
//         card.img = existingPage.features.cards[i].img;
//       } else {
//         // Default to empty string if no image exists
//         card.img = card.img || '';
//       }
//     }
//   } else if (data.features?.cards?.length) {
//     // If no new images but cards exist, preserve or set default images
//     data.features.cards.forEach((card, i) => {
//       card.img =
//         existingPage?.features?.cards?.[i]?.img || card.img || '';
//     });
//   }

//   // 4. Update or create landing page document
//   const updated = await LandingPageModel.findOneAndUpdate({}, data, {
//     new: true,
//     upsert: true,
//   });

//   return updated;
// };

const updateLandingPage = async (
  data: Partial<LandingPage>,
  companyListFiles?: Express.Multer.File[],
  featureCardFiles?: Express.Multer.File[]
) => {

  // 1. Fetch existing landing page to preserve data
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
    data.banner = {
      ...data.banner,
      companyList:
        existingPage?.banner?.companyList || data.banner?.companyList || [],
    };
  }

  // 3. Handle feature card images
  if (data.features?.cards?.length) {

    if (featureCardFiles?.length) {
      // Process each provided file based on its fieldname
      for (const file of featureCardFiles) {
        // Extract index from fieldname (e.g., 'card1Image' -> 1)
        const match = file.fieldname.match(/^card(\d+)Image$/);
        if (!match) {
          continue;
        }
        const index = parseInt(match[1], 10);

        if (index >= data.features.cards.length) {
          continue;
        }

        const card = data.features.cards[index];
        const fileName = `feature-card-${index}-${Date.now()}`;
        const uploadResult = await uploadImgToCloudinary(fileName, file.path);
        card.img = uploadResult.secure_url;
      }

      // Preserve images for cards without new uploads
      data.features.cards.forEach((card, i) => {
        if (!featureCardFiles.some(f => f.fieldname === `card${i}Image`)) {
          card.img = existingPage?.features?.cards?.[i]?.img || card.img || '';
        }
      });
    } else {
      // No new images provided, preserve all existing images
      data.features.cards.forEach((card, i) => {
        card.img = existingPage?.features?.cards?.[i]?.img || card.img || '';
      });
    }
  } else {
    throw new Error('No feature cards provided in data');
  }

  // 4. Update or create landing page document
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