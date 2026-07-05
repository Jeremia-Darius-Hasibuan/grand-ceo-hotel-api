import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './user.js';
import Room from './room.js';

const Review = sequelize.define('Review', {
    rating: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: true }
}, { timestamps: true });

User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

Room.hasMany(Review, { foreignKey: 'room_id' });
Review.belongsTo(Room, { foreignKey: 'room_id' });

export default Review;