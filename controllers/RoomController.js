import Room from '../models/room.js';
import { Op } from 'sequelize';

const sendRes = (res, status, message, data) => {
    res.status(status === "success" ? 200 : 400).json({ status, message, data });
};

export const getAllRooms = async (req, res) => {
    try {
        const { search, tipe } = req.query;
        let kondisi = {};

        if (search) {
            kondisi.nomor_kamar = { [Op.like]: `%${search}%` };
        }
        if (tipe && tipe !== 'Semua') {
            kondisi.tipe_kamar = tipe;
        }

        const rooms = await Room.findAll({ where: kondisi });
        sendRes(res, "success", "Berhasil mengambil data kamar", rooms);
    } catch (error) {
        sendRes(res, "error", error.message, null);
    }
};

export const createRoom = async (req, res) => {
    try {
        // Menerima tambahan data foto_kamar
        const { nomor_kamar, tipe_kamar, harga, foto_kamar } = req.body; 
        const newRoom = await Room.create({ 
            nomor_kamar, 
            tipe_kamar, 
            harga,
            foto_kamar, // Disimpan ke database Avril
            status: 'tersedia' 
        });
        sendRes(res, "success", "Kamar berhasil ditambahkan", newRoom);
    } catch (error) {
        sendRes(res, "error", error.message, null);
    }
};

export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { nomor_kamar, tipe_kamar, harga, status, foto_kamar } = req.body; 

        const room = await Room.findByPk(id);
        if (!room) return sendRes(res, "error", "Kamar tidak ditemukan", null);

        await room.update({ nomor_kamar, tipe_kamar, harga, status, foto_kamar });
        sendRes(res, "success", "Data kamar berhasil diupdate", room);
    } catch (error) {
        sendRes(res, "error", error.message, null);
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findByPk(id);
        
        if (!room) return sendRes(res, "error", "Kamar tidak ditemukan", null);

        await room.destroy();
        sendRes(res, "success", "Kamar berhasil dihapus", null);
    } catch (error) {
        sendRes(res, "error", error.message, null);
    }
};