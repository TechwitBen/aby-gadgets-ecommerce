import { DataTypes } from "sequelize";

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
      username: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      hashed_password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      salt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      provider: {
        type: DataTypes.ENUM("local", "google"),
        allowNull: false,
        defaultValue: "local",
      },
      google_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      underscored: true,
      validate: {
        hasAuthMethod() {
          if (
            this.provider === "local" &&
            (!this.hashed_password || !this.salt || !this.username)
          ) {
            throw new Error(
              "Local users must have username, hashed_password, and salt"
            );
          }
          if (this.provider === "google" && !this.google_id) {
            throw new Error("Google users must have google_id");
          }
        },
      },
    }
  );

  return User;
}
