import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    no_telepon: { type: DataTypes.STRING, defaultValue: "" },
    alamat: { type: DataTypes.TEXT, defaultValue: "" },
    role: { type: DataTypes.ENUM('customer', 'admin'), defaultValue: 'customer' }
}, {
    tableName: 'users',
    timestamps: true
});

export default User;