import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './user.js';
import Room from './room.js';

const Reservasi = sequelize.define('Reservasi', {
    check_in: { type: DataTypes.DATEONLY, allowNull: false },
    check_out: { type: DataTypes.DATEONLY, allowNull: false },
    // TAMBAHKAN 'completed' DI DALAM ENUM DI BAWAH INI
    status: { type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'), defaultValue: 'pending' }
}, { timestamps: true });

User.hasMany(Reservasi, { foreignKey: 'userId' });
Reservasi.belongsTo(User, { foreignKey: 'userId' });

Room.hasMany(Reservasi, { foreignKey: 'roomId' });
Reservasi.belongsTo(Room, { foreignKey: 'roomId' });

export default Reservasi;