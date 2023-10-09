const { sequelize } = require("../config/mssql");
const { DataTypes } = require("sequelize");

const Conjunto = sequelize.define(
  "Conjunto",
  {
    Conjunto_Id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    Nombre: {
      type: DataTypes.STRING,
    },
    NombreComercial: {
      type: DataTypes.STRING,
    },
    Logo: {
      type: DataTypes.STRING,
    },
    Activo: {
      type: DataTypes.BOOLEAN,
    },
  },
  { timestamps: false, hasTrigger: true }
);

module.exports = Conjunto;
