import { DataTypes } from "sequelize";

/**
 * Initialize and return the User model.
 * Usage:
 *   import initUser from './models/user.model.js';
 *   const User = initUser(sequelize);
 */
export default function initUser(sequelize) {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      hashed_password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      salt: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      underscored: true,
    }
  );

  return User;
}
