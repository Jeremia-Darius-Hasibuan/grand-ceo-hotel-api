import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './user.js';
import Reservasi from './reservasi.js';

const Payment = sequelize.define('Payment', {
    amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    payment_method: { type: DataTypes.STRING(50), allowNull: false },
    status: { type: DataTypes.STRING(20), defaultValue: 'success' }
}, { timestamps: true });

User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });

Reservasi.hasOne(Payment, { foreignKey: 'booking_id' });
Payment.belongsTo(Reservasi, { foreignKey: 'booking_id' });

export default Payment;