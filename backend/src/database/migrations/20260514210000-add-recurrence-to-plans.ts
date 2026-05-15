import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.addColumn("Plans", "recurrence", {
      type: DataTypes.STRING,
      defaultValue: "MENSAL",
      allowNull: false,
    });
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn("Plans", "recurrence");
  },
};
