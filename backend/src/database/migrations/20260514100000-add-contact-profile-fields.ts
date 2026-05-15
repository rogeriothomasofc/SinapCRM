import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Contacts", "cpf", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn("Contacts", "birthDate", {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn("Contacts", "businessName", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn("Contacts", "cep", {
      type: DataTypes.STRING(9),
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn("Contacts", "cidade", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn("Contacts", "estado", {
      type: DataTypes.STRING(2),
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Contacts", "cpf");
    await queryInterface.removeColumn("Contacts", "birthDate");
    await queryInterface.removeColumn("Contacts", "businessName");
    await queryInterface.removeColumn("Contacts", "cep");
    await queryInterface.removeColumn("Contacts", "cidade");
    await queryInterface.removeColumn("Contacts", "estado");
  }
};
