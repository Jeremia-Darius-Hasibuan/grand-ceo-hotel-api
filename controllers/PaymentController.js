import Payment from '../models/payment.js';
import Reservasi from '../models/reservasi.js';
import Room from '../models/room.js';
import User from '../models/user.js';

export const createPayment = async (req, res) => {
    try {
        const { user_id, booking_id, amount, payment_method } = req.body;

        const newPayment = await Payment.create({
            user_id, booking_id, amount, payment_method, status: 'success'
        });

        const reservasi = await Reservasi.findByPk(booking_id);
        if (reservasi) {
            await Reservasi.update({ status: 'confirmed' }, { where: { id: booking_id } });
            await Room.update({ status: 'terisi' }, { where: { id: reservasi.roomId } });
        }

        res.json({ status: "success", message: 'Pembayaran berhasil diproses!', id: newPayment.id });
    } catch (err) { res.status(500).json({ status: "error", message: err.message }); }
};

export const getPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({ include: [User, Reservasi] });
        res.json({ status: "success", data: payments });
    } catch (err) { res.status(500).json({ status: "error", message: err.message }); }
};

export const updatePayment = async (req, res) => {
    try {
        await Payment.update(req.body, { where: { id: req.params.id } });
        res.json({ status: "success", message: 'Data pembayaran diupdate!' });
    } catch (err) { res.status(500).json({ status: "error", message: err.message }); }
};

export const deletePayment = async (req, res) => {
    try {
        await Payment.destroy({ where: { id: req.params.id } });
        res.json({ status: "success", message: 'Data pembayaran dihapus!' });
    } catch (err) { res.status(500).json({ status: "error", message: err.message }); }
};