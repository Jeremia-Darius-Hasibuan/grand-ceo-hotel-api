import Reservasi from "../models/reservasi.js";
import User from "../models/user.js";
import Room from "../models/room.js";

const sendRes = (res, status, message, data) => {
  res.status(status === "success" ? 200 : 400).json({ status, message, data });
};

// =========================================================================
// FITUR 10: TAMBAHAN LOGIKA RTC SAAT BOOKING BERHASIL (Dipicu dari Fitur Djibran)
// =========================================================================
export const createReservasi = async (req, res) => {
  try {
    const { userId, roomId, checkIn, checkOut } = req.body;

    const room = await Room.findByPk(roomId);
    if (!room) return sendRes(res, "error", "Kamar tidak ditemukan");

    // Membuat reservasi baru dengan properti database sesuai models/reservasi.js
    const booking = await Reservasi.create({
      userId,
      roomId,
      check_in: checkIn,
      check_out: checkOut,
      status: "pending", // Status awal pesanan baru
    });

    // Update status kamar menjadi terisi
    await room.update({ status: "terisi" });

    // MEMANCARKAN EMIT SOCKET.IO SECARA REAL-TIME KE DASHBOARD ADMIN
    const io = req.app.get("io");
    if (io) {
      io.emit("pesananBaru", {
        message: "Ada Pesanan Kamar Baru!",
        bookingId: booking.id,
        userId: userId,
        checkIn: checkIn,
        checkOut: checkOut,
      });
    }

    sendRes(res, "success", "Booking berhasil dibuat", booking);
  } catch (error) {
    sendRes(res, "error", error.message);
  }
};

// =========================================================================
// FITUR 9: RIWAYAT PEMESANAN TAMU (History Dashboard)
// =========================================================================
export const getRiwayatTamu = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return sendRes(res, "error", "User ID harus disertakan untuk melihat riwayat");
    }

    const riwayat = await Reservasi.findAll({
      where: { userId: userId },
      include: [{ model: Room, attributes: ["nomor_kamar", "tipe_kamar", "harga"] }],
      order: [["createdAt", "DESC"]], // Menampilkan riwayat pemesanan dari yang paling baru
    });

    sendRes(res, "success", "Berhasil memuat riwayat pemesanan tamu", riwayat);
  } catch (error) {
    sendRes(res, "error", error.message);
  }
};

// =========================================================================
// FITUR 8: MANAJEMEN STATUS PEMBAYARAN (Pending -> Paid/Confirmed atau Canceled)
// =========================================================================
export const updateStatusPembayaranAdmin = async (req, res) => {
  try {
    const { id } = req.params; // ID Reservasi
    const { status } = req.body; // Mengambil status baru dari request body

    // Validasi input status agar sesuai dengan ENUM di models/reservasi.js ('confirmed' = Lunas/Paid, 'cancelled' = Batal)
    if (!["confirmed", "cancelled", "completed", "pending"].includes(status)) {
      return sendRes(res, "error", "Status tidak valid. Gunakan 'confirmed', 'cancelled', atau 'completed'");
    }

    const booking = await Reservasi.findByPk(id);
    if (!booking) return sendRes(res, "error", "Data reservasi tidak ditemukan");

    // Perbarui status reservasi
    await booking.update({ status: status });

    // Aturan Tambahan: Jika status diubah menjadi 'cancelled' (Batal), kembalikan status kamar menjadi 'tersedia'
    if (status === "cancelled") {
      await Room.update({ status: "tersedia" }, { where: { id: booking.roomId } });
    }

    sendRes(res, "success", `Status reservasi berhasil diperbarui menjadi ${status}`);
  } catch (error) {
    sendRes(res, "error", error.message);
  }
};

// Fungsi bawaan awal (dipertahankan penuh agar tidak merusak fitur admin/fitur Avril lainnya)
export const getAllReservasi = async (req, res) => {
  try {
    const { role, userId } = req.query;
    let kondisi = {};

    if (role === "customer") {
      kondisi.userId = userId;
    }

    const list = await Reservasi.findAll({
      where: kondisi,
      include: [
        { model: User, attributes: ["nama", "email"] },
        { model: Room, attributes: ["nomor_kamar", "tipe_kamar", "harga"] },
      ],
    });

    sendRes(res, "success", "Berhasil memuat data", list);
  } catch (error) {
    sendRes(res, "error", error.message);
  }
};

// Fungsi update bawaan lama dipertahankan sebagai fallback atau dialihkan ke updateStatusPembayaranAdmin jika diperlukan
export const updateStatusReservasi = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Reservasi.findByPk(id);
    if (!booking) return sendRes(res, "error", "Data tidak ditemukan");

    await booking.update({ status });

    if (status === "cancelled") {
      await Room.update({ status: "tersedia" }, { where: { id: booking.roomId } });
    }

    sendRes(res, "success", "Status berhasil diupdate", booking);
  } catch (error) {
    sendRes(res, "error", error.message);
  }
};
