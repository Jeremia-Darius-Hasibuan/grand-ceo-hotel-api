import Review from '../models/review.js';
import User from '../models/user.js';
import Room from '../models/room.js';

export const addReview = async (req, res) => {
    try {
        const { user_id, room_id, rating, comment } = req.body;
        await Review.create({ user_id, room_id, rating, comment });
        res.json({ status: "success", message: 'Review berhasil ditambahkan' });
    } catch (err) { res.status(500).json({ status: "error", message: err.message }); }
};

export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({ include: [User, Room] });
        res.json({ status: "success", data: reviews });
    } catch (err) { res.status(500).json({ status: "error", message: err.message }); }
};

export const updateReview = async (req, res) => {
    try {
        await Review.update(req.body, { where: { id: req.params.id } });
        res.json({ status: "success", message: 'Ulasan diupdate!' });
    } catch (err) { res.status(500).json({ status: "error", message: err.message }); }
};

export const deleteReview = async (req, res) => {
    try {
        await Review.destroy({ where: { id: req.params.id } });
        res.json({ status: "success", message: 'Ulasan dihapus!' });
    } catch (err) { res.status(500).json({ status: "error", message: err.message }); }
};