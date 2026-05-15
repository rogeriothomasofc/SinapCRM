import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableDesc = await queryInterface.describeTable("Tickets") as Record<string, unknown>;

    if (!tableDesc["ctwaClid"]) {
      await queryInterface.addColumn("Tickets", "ctwaClid", {
        type: DataTypes.STRING,
        allowNull: true
      });
    }
    if (!tableDesc["adSourceId"]) {
      await queryInterface.addColumn("Tickets", "adSourceId", {
        type: DataTypes.STRING,
        allowNull: true
      });
    }
    if (!tableDesc["adSourceUrl"]) {
      await queryInterface.addColumn("Tickets", "adSourceUrl", {
        type: DataTypes.TEXT,
        allowNull: true
      });
    }
    if (!tableDesc["adTitle"]) {
      await queryInterface.addColumn("Tickets", "adTitle", {
        type: DataTypes.STRING,
        allowNull: true
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Tickets", "ctwaClid");
    await queryInterface.removeColumn("Tickets", "adSourceId");
    await queryInterface.removeColumn("Tickets", "adSourceUrl");
    await queryInterface.removeColumn("Tickets", "adTitle");
  }
};
