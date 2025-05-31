import { WebsiteConfig } from "./websiteconfig.model";

const getWebsiteConfig = async () => {
  return await WebsiteConfig.findOne();
};

const createOrUpdateWebsiteConfig = async (data: {
  title: string;
  logoUrl: string;
  triggerText: string;
}) => {
  const config = await WebsiteConfig.findOne();

  if (config) {
    config.title = data.title;
    config.logoUrl = data.logoUrl;
    config.triggerText = data.triggerText;
    return await config.save();
  } else {
    return await WebsiteConfig.create(data);
  }
};

const updateWebsiteConfigById = async (
    id: string,
    data: { title: string; logoUrl: string; triggerText: string }
  ) => {
    return await WebsiteConfig.findByIdAndUpdate(id, data, { new: true });
  };

const websiteConfigService = {
    getWebsiteConfig,
    createOrUpdateWebsiteConfig,
    updateWebsiteConfigById
}

export default websiteConfigService;