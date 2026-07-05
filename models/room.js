import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Room = sequelize.define('Room', {
  nomor_kamar: { type: DataTypes.STRING, allowNull: false },
  tipe_kamar: { type: DataTypes.STRING, allowNull: false },
  harga: { type: DataTypes.INTEGER, allowNull: false },
  foto_kamar: { type: DataTypes.STRING }, 
  status: { type: DataTypes.ENUM('tersedia', 'terisi'), defaultValue: 'tersedia' }
}, { timestamps: true });

export default Room;