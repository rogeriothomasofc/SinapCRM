import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "avatarUrl", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "avatarUrl");
  },
};
