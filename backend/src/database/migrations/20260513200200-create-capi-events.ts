import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("CAPIEvents", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      ticketId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Tickets", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ctwaClid: {
        type: DataTypes.STRING,
        allowNull: true
      },
      eventName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM("sent", "failed"),
        allowNull: false,
        defaultValue: "sent"
      },
      responsePayload: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex("CAPIEvents", ["ticketId"]);
    await queryInterface.addIndex("CAPIEvents", ["companyId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("CAPIEvents");
  }
};
