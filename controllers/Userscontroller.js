import User from "../models/user.js";
import bcrypt from "bcrypt";

const sendRes = (res, status, message, data) => {
  res.status(status === "success" ? 200 : 400).json({ status, message, data });
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    sendRes(res, "success", "Daftar semua user", users);
  } catch (e) {
    sendRes(res, "error", e.message);
  }
};

export const createUser = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    // Validasi input kosong
    if (!nama || !email || !password) {
      return res.status(400).json({ status: "fail", message: "Semua kolom harus diisi!" });
    }

    // Tentukan role secara otomatis berdasarkan email
    let ditentukanRole = "customer";
    if (email.endsWith("@grandceo.com")) {
      ditentukanRole = "admin";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const u = await User.create({
      nama: nama,
      email: email,
      password: hashedPassword,
      role: ditentukanRole, // Menjamin kolom role terisi otomatis di MySQL
    });

    sendRes(res, "success", "User terdaftar", u);
  } catch (error) {
    console.error("Error Register:", error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Tambahan Fungsi untuk mencari User berdasarkan ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ status: "fail", message: "User tidak ditemukan" });
    sendRes(res, "success", "Detail User ditemukan", user);
  } catch (e) {
    sendRes(res, "error", e.message);
  }
};

// Tambahan Fungsi untuk memperbarui data User
export const updateUser = async (req, res) => {
  try {
    const { nama, email, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ status: "fail", message: "User tidak ditemukan" });

    await user.update({ nama, email, role });
    sendRes(res, "success", "Data User berhasil diperbarui", user);
  } catch (e) {
    sendRes(res, "error", e.message);
  }
};

// Tambahan Fungsi untuk menghapus User (deleteUser)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ status: "fail", message: "User tidak ditemukan" });

    await user.destroy();
    sendRes(res, "success", "User berhasil dihapus", null);
  } catch (e) {
    sendRes(res, "error", e.message);
  }
};
