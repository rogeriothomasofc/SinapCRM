import WhitelabelConfig from "../../models/WhitelabelConfig";

const GetWhitelabelService = async (): Promise<WhitelabelConfig> => {
  let config = await WhitelabelConfig.findOne();
  if (!config) {
    config = await WhitelabelConfig.create({
      name: "AtendecChat",
      primaryColor: "#682ee2",
      secondaryColor: "#ff5722",
    });
  }
  return config;
};

export default GetWhitelabelService;
