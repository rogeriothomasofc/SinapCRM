import WhitelabelConfig from "../../models/WhitelabelConfig";

interface WhitelabelData {
  name?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

const UpdateWhitelabelService = async (data: WhitelabelData): Promise<WhitelabelConfig> => {
  let config = await WhitelabelConfig.findOne();
  if (!config) {
    config = await WhitelabelConfig.create({
      name: "AtendecChat",
      primaryColor: "#682ee2",
      secondaryColor: "#ff5722",
      ...data,
    });
    return config;
  }
  await config.update(data);
  return config;
};

export default UpdateWhitelabelService;
