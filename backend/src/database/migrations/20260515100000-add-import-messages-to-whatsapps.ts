import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Whatsapps", "importMessages", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn("Whatsapps", "importOldMessages", {
      type: DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Whatsapps", "importRecentMessages", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Whatsapps", "importMessages");
    await queryInterface.removeColumn("Whatsapps", "importOldMessages");
    await queryInterface.removeColumn("Whatsapps", "importRecentMessages");
  },
};
