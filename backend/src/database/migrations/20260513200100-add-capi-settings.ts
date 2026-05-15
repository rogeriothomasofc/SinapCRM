import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Settings já usa INSERT — só documenta as novas chaves
    // metaPixelId, metaAccessToken, metaCAPIEnabled são inseridas via upsert no código
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("Settings", {
      key: ["metaPixelId", "metaAccessToken", "metaCAPIEnabled"]
    } as any);
  }
};
