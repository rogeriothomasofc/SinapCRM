import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.addColumn("Plans", "isPublic", {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn("Plans", "isPublic");
  },
};
