import LandingPageModel from "../modules/landingPage/landingPage.model";

// Function to initialize the LandingPage document
const initializeLandingPage = async (): Promise<void> => {
  try {
    const existingLandingPage = await LandingPageModel.findOne({});
    if (!existingLandingPage) {
      const newLandingPage = new LandingPageModel({}); // Uses schema defaults
      await newLandingPage.save();
      console.log('LandingPage document created with default values');
    } else {
      console.log('LandingPage document already exists');
    }
  } catch (error) {
    console.error('Error initializing LandingPage:', error);
  }
};

export default initializeLandingPage;