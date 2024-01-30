import { Sequelize } from "sequelize";
const db_general = new Sequelize(
  "amazonFlex",
  "backendAmzr1",
  "amazonBk2023!main",
  {
    host: "159.223.142.105",
    dialect: "mysql",
    define: {
      freezeTableName: true,
    },
    pool: {
      max: 11,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);
export default db_general;
