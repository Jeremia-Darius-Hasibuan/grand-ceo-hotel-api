const API_URL = "http://localhost:3000";

const swalLuxury = Swal.mixin({
  background: "#1e293b",
  color: "#fff",
  confirmButtonColor: "#d4af37",
  cancelButtonColor: "#dc3545",
  customClass: { popup: "border-radius-15" },
});

// ==========================================
// 1. RESERVASI & DASHBOARD
// ==========================================
async function loadSummary() {
  try {
    const res = await fetch(`${API_URL}/reservasi/dashboard/summary`);
    const result = await res.json();
    if (result.status === "success" && result.data) {
      document.getElementById("sumTotal").textContent = result.data.total || 0;
      document.getElementById("sumConfirmed").textContent = result.data.confirmed || 0;
      document.getElementById("sumPending").textContent = result.data.pending || 0;
      document.getElementById("sumCancelled").textContent = result.data.cancelled || 0;
    }
  } catch (e) {
    console.log("Gagal meload summary");
  }
}

async function loadReservasi() {
  try {
    const res = await fetch(`${API_URL}/reservasi`);
    const result = await res.json();
    const table = document.getElementById("tableReservasi");
    table.innerHTML = "";

    if (result.status === "success" && result.data) {
      result.data.forEach((r) => {
        let statusColor = r.status === "confirmed" ? "#28a745" : r.status === "cancelled" ? "#dc3545" : r.status === "completed" ? "#007bff" : "#ffc107"; // Biru untuk Completed, Kuning untuk Pending
        let textColor = r.status === "pending" ? "black" : "white";
        let statusBadge = `<span style="background-color: ${statusColor}; color: ${textColor}; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${r.status}</span>`;
        // --- 1. LOGIKA MENGHITUNG HARI MENGINAP ---
        let hargaPerMalam = r.Room ? r.Room.harga : 0;
        let checkInDate = new Date(r.check_in);
        let checkOutDate = new Date(r.check_out);

        // Hitung selisih hari (dalam milidetik) lalu ubah ke hari
        let selisihHari = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);

        // Kalau checkin & checkout di hari yang sama, hitung minimal 1 malam
        if (selisihHari <= 0 || isNaN(selisihHari)) selisihHari = 1;

        // Ini dia jurus rahasianya: Harga x Jumlah Malam!
        let totalTagihan = hargaPerMalam * selisihHari;
        // ------------------------------------------

        let actionBtns = "";

        // Logika Tombol Sesuai Status
        if (r.status === "pending") {
          // JIKA PENDING: Bisa Bayar, Cancel, atau Hapus
          // PERHATIKAN: Parameter ketiga di prosesBayar sekarang jadi ${totalTagihan}
          actionBtns = `
                        <button onclick="prosesBayar(${r.id}, ${r.userId}, ${totalTagihan})" 
                            style="background-color: #28a745; color: white; border: none; padding: 5px 8px; cursor: pointer; border-radius: 5px; font-size: 11px; margin-right:3px; margin-bottom: 3px;">Bayar
                        </button>
                        <button onclick="updateStatusReservasi(${r.id}, 'cancelled')" 
                            style="background-color: #6c757d; color: white; border: none; padding: 5px 8px; cursor: pointer; border-radius: 5px; font-size: 11px; margin-right:3px; margin-bottom: 3px;">Cancel
                        </button>
                        <button onclick="deleteReservasi(${r.id})" 
                            style="background-color: #dc3545; color: white; border: none; padding: 5px 8px; cursor: pointer; border-radius: 5px; font-size: 11px; margin-bottom: 3px;">Hapus
                        </button>
                    `;
        } else if (r.status === "confirmed") {
          // JIKA CONFIRMED: Waktunya Tamu Pulang (Check-Out)
          actionBtns = `
                        <button onclick="updateStatusReservasi(${r.id}, 'completed')" 
                            style="background-color: #00f2fe; color: black; border: none; padding: 5px 12px; cursor: pointer; border-radius: 5px; font-size: 11px; font-weight: bold;">✔ Check Out
                        </button>
                    `;
        } else {
          // JIKA CANCELLED ATAU COMPLETED: Tinggal Hapus Riwayat
          actionBtns = `
                        <button onclick="deleteReservasi(${r.id})" 
                            style="background-color: #dc3545; color: white; border: none; padding: 5px 12px; cursor: pointer; border-radius: 5px; font-size: 11px;">Hapus Riwayat
                        </button>
                    `;
        }

        let userName = r.User ? r.User.nama : '<span style="color:#dc3545;">User Dihapus</span>';
        let roomName = r.Room ? `No. ${r.Room.nomor_kamar} (${r.Room.tipe_kamar})` : '<span style="color:#dc3545;">Kamar Dihapus</span>';

        table.innerHTML += `
                    <tr>
                        <td><strong>${userName}</strong></td>
                        <td>${roomName}</td>
                        <td>${r.check_in}</td>
                        <td>${r.check_out}</td>
                        <td>${statusBadge}</td>
                        <td>${actionBtns}</td>
                    </tr>
                `;
      });
    }
  } catch (e) {
    console.error("Gagal load reservasi", e);
  }
}

document.getElementById("formReservasi").addEventListener("submit", async function (e) {
  e.preventDefault();
  const userId = document.getElementById("resUserId").value;
  const roomId = document.getElementById("resRoomId").value;
  const checkIn = document.getElementById("resCheckIn").value;
  const checkOut = document.getElementById("resCheckOut").value;

  try {
    const res = await fetch(`${API_URL}/reservasi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId, roomId: roomId, check_in: checkIn, check_out: checkOut }),
    });
    const result = await res.json();
    if (result.status === "success") {
      swalLuxury.fire({ icon: "success", title: "Berhasil!", text: "Pesanan kamar dibuat.", timer: 2000, showConfirmButton: false });
      this.reset();
      loadReservasi();
      loadSummary();
      loadRooms;
    } else {
      swalLuxury.fire({ icon: "error", title: "Gagal!", text: result.message });
    }
  } catch (err) {
    swalLuxury.fire({ icon: "error", title: "Error!" });
  }
});

async function updateStatusReservasi(id, status) {
  try {
    const res = await fetch(`${API_URL}/reservasi/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status }),
    });
    const result = await res.json();

    if (result.status === "success") {
      swalLuxury.fire({ icon: "success", title: "Diupdate!", timer: 1500, showConfirmButton: false });
      loadReservasi();
      loadSummary();
      loadRooms();
    } else {
      // <-- TAMBAHAN BARU BIAR KETAHUAN KALAU DATABASE ERROR
      swalLuxury.fire("Gagal Update!", result.message, "error");
    }
  } catch (e) {
    swalLuxury.fire("Error Server!", e.message, "error");
  }
}

function deleteReservasi(id) {
  swalLuxury
    .fire({
      title: "Hapus?",
      text: "Data dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        await fetch(`${API_URL}/reservasi/${id}`, { method: "DELETE" });
        swalLuxury.fire("Terhapus!", "", "success");
        loadReservasi();
        loadSummary();
      }
    });
}

// ==========================================
// 2. PEMBAYARAN & REVIEW (DJIBRAN)
// ==========================================

// --- FITUR PEMBAYARAN (CRUD) ---
async function loadPayments() {
  try {
    const res = await fetch(`${API_URL}/payments`);
    const result = await res.json();
    const table = document.getElementById("tablePayment");
    table.innerHTML = "";

    if (result.status === "success" && result.data) {
      result.data.forEach((p) => {
        const nominal = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(p.amount);
        const roomId = p.Reservasi ? p.Reservasi.roomId : null;

        // Warna Badge Status
        let statusColor = p.status === "success" ? "#28a745" : p.status === "failed" ? "#dc3545" : "#ffc107";
        let badge = `<span style="background: ${statusColor}; color: white; padding: 3px 8px; border-radius: 5px; font-size: 10px; text-transform:uppercase;">${p.status || "success"}</span>`;

        table.innerHTML += `
                    <tr>
                        <td>#PAY-${p.id}</td>
                        <td>${p.User ? p.User.nama : "Unknown"}</td>
                        <td><strong>${nominal}</strong></td>
                        <td>${p.payment_method}</td>
                        <td>${badge}</td>
                        <td>
                            <div style="display: flex; flex-direction: column; gap: 5px; max-width: 130px;">
                                ${roomId ? `<button onclick="beriUlasan(${roomId}, ${p.user_id})" style="background-color: #00f2fe; color: black; border: none; padding: 6px 8px; cursor: pointer; border-radius: 5px; font-size: 10px; font-weight:bold; width: 100%;">⭐ Beri Ulasan</button>` : ""}
                                <div style="display: flex; gap: 5px;">
                                    <button onclick="siapkanEditPayment(${p.id}, '${p.payment_method}', '${p.status || "success"}')" style="background-color: #ffc107; color: black; border: none; padding: 6px 8px; cursor: pointer; border-radius: 5px; font-size: 10px; flex: 1;">Edit</button>
                                    <button onclick="deletePayment(${p.id})" style="background-color: #dc3545; color: white; border: none; padding: 6px 8px; cursor: pointer; border-radius: 5px; font-size: 10px; flex: 1;">Hapus</button>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
      });
    }
  } catch (e) {
    console.log("Gagal load payment");
  }
}

async function prosesBayar(reservasiId, userId, totalTagihan) {
  // Ubah angka jadi format Rupiah (Contoh: Rp 21.000.000,00)
  const nominalFormat = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(totalTagihan);

  const { value: metode } = await swalLuxury.fire({
    title: "Proses Pembayaran",
    // Tambahkan tulisan Total Tagihan di atas kotak pilihan
    html: `<p style="font-size: 14px; color: #94a3b8; margin-bottom: 15px;">Total Tagihan:<br><strong style="color: #d4af37; font-size: 22px;">${nominalFormat}</strong></p>`,
    input: "select",
    inputOptions: { "Transfer Bank": "Transfer Bank", "E-Wallet": "E-Wallet", Tunai: "Tunai" },
    showCancelButton: true,
    confirmButtonColor: "#28a745",
  });

  if (metode) {
    try {
      const res = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pastikan parameter amount disi dengan totalTagihan
        body: JSON.stringify({ user_id: userId, booking_id: reservasiId, amount: totalTagihan, payment_method: metode, status: "success" }),
      });
      const result = await res.json();
      if (result.status === "success") {
        swalLuxury.fire({ icon: "success", title: "Berhasil Dibayar!", text: `Pembayaran ${nominalFormat} diterima.`, timer: 2000 });
        jalankanSemuaData();
      }
      tambahNotif(`💰 Pembayaran berhasil! Tagihan ${nominalFormat} telah lunas.`);
    } catch (e) {}
  }
}

// Logic Edit & Delete Payment
function siapkanEditPayment(id, metode, status) {
  document.getElementById("sectionEditPayment").style.display = "block";
  document.getElementById("editIdPayment").value = id;
  document.getElementById("editMetodePayment").value = metode;
  document.getElementById("editStatusPayment").value = status;
}

function batalEditPayment() {
  document.getElementById("sectionEditPayment").style.display = "none";
  document.getElementById("formEditPayment").reset();
}

document.getElementById("formEditPayment").addEventListener("submit", async function (e) {
  e.preventDefault();
  const id = document.getElementById("editIdPayment").value;
  try {
    const res = await fetch(`${API_URL}/payments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payment_method: document.getElementById("editMetodePayment").value,
        status: document.getElementById("editStatusPayment").value,
      }),
    });
    const result = await res.json();
    if (result.status === "success") {
      swalLuxury.fire({ icon: "success", title: "Update Berhasil!", timer: 1500, showConfirmButton: false });
      batalEditPayment();
      loadPayments();
    }
  } catch (err) {}
});

function deletePayment(id) {
  swalLuxury.fire({ title: "Hapus Transaksi?", icon: "warning", showCancelButton: true, confirmButtonText: "Ya, Hapus!" }).then(async (result) => {
    if (result.isConfirmed) {
      const res = await fetch(`${API_URL}/payments/${id}`, { method: "DELETE" });
      const jsonRes = await res.json();
      if (jsonRes.status === "success") {
        swalLuxury.fire("Terhapus!", "", "success");
        loadPayments();
      }
    }
  });
}

// --- FITUR REVIEW (CRUD) ---
async function beriUlasan(roomId, userId) {
  // UBAH Swal.fire MENJADI swalLuxury.fire
  const { value: formValues } = await swalLuxury.fire({
    title: "Beri Ulasan Kamar",
    html: `
            <select id="swal-rating" style="width:80%; padding:10px; margin-bottom:10px; background-color:#0f172a; color:white; border-radius:8px; border:1px solid #334155;">
                <option value="" disabled selected>-- Pilih Bintang --</option>
                <option value="5">⭐⭐⭐⭐⭐ (Sangat Puas)</option>
                <option value="4">⭐⭐⭐⭐ (Puas)</option>
                <option value="3">⭐⭐⭐ (Cukup)</option>
                <option value="2">⭐⭐ (Kurang)</option>
                <option value="1">⭐ (Kecewa)</option>
            </select>
            <textarea id="swal-comment" placeholder="Tulis komentar..." style="width:80%; padding:10px; min-height:80px; background-color:#0f172a; color:white; border-radius:8px; border:1px solid #334155; font-family:'Poppins', sans-serif;"></textarea>`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: "#d4af37",
    preConfirm: () => {
      const rating = document.getElementById("swal-rating").value;
      if (!rating) {
        Swal.showValidationMessage("Tolong pilih bintangnya dulu!");
        return false;
      }
      return { rating: rating, comment: document.getElementById("swal-comment").value };
    },
  });

  if (formValues) {
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, room_id: roomId, rating: formValues.rating, comment: formValues.comment }),
      });
      const result = await res.json();
      if (result.status === "success") {
        swalLuxury.fire({ icon: "success", title: "Terima Kasih!", timer: 1500 });
        loadReviews();
      } else {
        swalLuxury.fire("Gagal Menyimpan!", result.message, "error");
      }
    } catch (e) {}
  }
}

async function loadReviews() {
  try {
    const res = await fetch(`${API_URL}/reviews`);
    const result = await res.json();
    const table = document.getElementById("tableReview");
    if (table) {
      table.innerHTML = "";
      if (result.status === "success" && result.data) {
        if (result.data.length === 0) {
          table.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Belum ada ulasan.</td></tr>";
        }
        result.data.forEach((r) => {
          let stars = "⭐".repeat(r.rating);
          table.innerHTML += `
                        <tr>
                            <td>${r.User ? r.User.nama : "Unknown"}</td>
                            <td>Kamar ${r.Room ? r.Room.nomor_kamar : "-"}</td>
                            <td>${stars}</td>
                            <td>${r.comment || "-"}</td>
                            <td>
                                <button onclick="siapkanEditReview(${r.id}, ${r.rating}, '${r.comment || ""}')" style="background-color: #ffc107; color: black; border: none; padding: 4px 8px; cursor: pointer; border-radius: 5px; font-size: 10px; margin-right:3px;">Edit</button>
                                <button onclick="deleteReview(${r.id})" style="background-color: #dc3545; color: white; border: none; padding: 4px 8px; cursor: pointer; border-radius: 5px; font-size: 10px;">Hapus</button>
                            </td>
                        </tr>
                    `;
        });
      }
    }
  } catch (e) {}
}

// Logic Edit & Delete Review
function siapkanEditReview(id, rating, comment) {
  document.getElementById("sectionEditReview").style.display = "block";
  document.getElementById("editIdReview").value = id;
  document.getElementById("editRatingReview").value = rating;
  document.getElementById("editCommentReview").value = comment;
}

function batalEditReview() {
  document.getElementById("sectionEditReview").style.display = "none";
  document.getElementById("formEditReview").reset();
}

document.getElementById("formEditReview").addEventListener("submit", async function (e) {
  e.preventDefault();
  const id = document.getElementById("editIdReview").value;
  try {
    const res = await fetch(`${API_URL}/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: document.getElementById("editRatingReview").value,
        comment: document.getElementById("editCommentReview").value,
      }),
    });
    const result = await res.json();
    if (result.status === "success") {
      swalLuxury.fire({ icon: "success", title: "Update Berhasil!", timer: 1500, showConfirmButton: false });
      batalEditReview();
      loadReviews();
    }
  } catch (err) {}
});

function deleteReview(id) {
  swalLuxury.fire({ title: "Hapus Ulasan?", icon: "warning", showCancelButton: true, confirmButtonText: "Ya, Hapus!" }).then(async (result) => {
    if (result.isConfirmed) {
      const res = await fetch(`${API_URL}/reviews/${id}`, { method: "DELETE" });
      const jsonRes = await res.json();
      if (jsonRes.status === "success") {
        swalLuxury.fire("Terhapus!", "", "success");
        loadReviews();
      }
    }
  });
}

// ==========================================
// 3. KAMAR (JEREMIA) & USERS (AVRIL)
// ==========================================
async function loadRooms() {
  try {
    const res = await fetch(`${API_URL}/rooms`);
    const result = await res.json();
    const table = document.getElementById("tableRoom");
    const selectRoom = document.getElementById("resRoomId");
    table.innerHTML = "";
    selectRoom.innerHTML = '<option value="">-- Pilih Kamar --</option>';

    if (result.status === "success" && result.data) {
      result.data.forEach((room) => {
        const hargaRp = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(room.harga);
        const statusColor = room.status === "tersedia" ? "#28a745" : "#dc3545";
        const statusBadge = `<span style="background-color: ${statusColor}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">${room.status}</span>`;
        const urlFoto = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

        table.innerHTML += `
                    <tr>
                        <td><img src="${urlFoto}" style="width: 80px; height: 55px; object-fit: cover; border-radius: 8px; border: 1px solid #d4af37;"></td>
                        <td><strong>${room.nomor_kamar}</strong></td>
                        <td>${room.tipe_kamar}</td>
                        <td>${hargaRp}</td>
                        <td>${statusBadge}</td>
                        <td>
                            <button onclick="siapkanEditRoom('${room.id}', '${room.nomor_kamar}', '${room.tipe_kamar}', '${room.harga}')" style="background-color: #ffc107; color: black; border: none; padding: 5px 10px; cursor: pointer; border-radius: 5px; margin-bottom: 5px; font-size: 11px;">Edit</button>
                            <button onclick="deleteRoom(${room.id})" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 5px; font-size: 11px;">Hapus</button>
                        </td>
                    </tr>
                `;
        selectRoom.innerHTML += `<option value="${room.id}">Kamar ${room.nomor_kamar} - ${room.tipe_kamar} (${hargaRp})</option>`;
      });
    }
  } catch (err) {}
}

document.getElementById("formRoom").addEventListener("submit", async function (e) {
  e.preventDefault();
  const noKamar = document.getElementById("noKamar").value;
  const tipeKamar = document.getElementById("tipeKamar").value;
  const harga = document.getElementById("hargaKamar").value;
  try {
    const res = await fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomor_kamar: noKamar, tipe_kamar: tipeKamar, harga: harga }),
    });
    const result = await res.json();
    if (result.status === "success") {
      swalLuxury.fire({ icon: "success", title: "Berhasil!", timer: 1500, showConfirmButton: false });
      this.reset();
      loadRooms();
    }
  } catch (err) {}
});

function deleteRoom(id) {
  swalLuxury
    .fire({
      title: "Hapus Kamar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`${API_URL}/rooms/${id}`, { method: "DELETE" });
        const jsonRes = await res.json();
        if (jsonRes.status === "success") {
          swalLuxury.fire("Terhapus!", "", "success");
          loadRooms();
        }
      }
    });
}

function siapkanEditRoom(id, noKamar, tipeKamar, harga) {
  document.getElementById("sectionEditRoom").style.display = "block";
  document.getElementById("editIdKamar").value = id;
  document.getElementById("editNoKamar").value = noKamar;
  document.getElementById("editTipeKamar").value = tipeKamar;
  document.getElementById("editHargaKamar").value = harga;
}

function batalEditRoom() {
  document.getElementById("sectionEditRoom").style.display = "none";
  document.getElementById("formEditRoom").reset();
}

document.getElementById("formEditRoom").addEventListener("submit", async function (e) {
  e.preventDefault();
  const id = document.getElementById("editIdKamar").value;
  try {
    const res = await fetch(`${API_URL}/rooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomor_kamar: document.getElementById("editNoKamar").value,
        tipe_kamar: document.getElementById("editTipeKamar").value,
        harga: document.getElementById("editHargaKamar").value,
      }),
    });
    const result = await res.json();
    if (result.status === "success") {
      swalLuxury.fire({ icon: "success", title: "Update Berhasil!", timer: 1500, showConfirmButton: false });
      batalEditRoom();
      loadRooms();
    }
  } catch (err) {}
});

async function loadUser() {
  try {
    const res = await fetch(`${API_URL}/users`);
    const result = await res.json();
    const table = document.getElementById("tableUser");
    const selectUser = document.getElementById("resUserId");
    table.innerHTML = "";
    selectUser.innerHTML = '<option value="">-- Pilih Customer --</option>';

    if (result.status === "success" && result.data) {
      result.data.forEach((user) => {
        table.innerHTML += `
                    <tr>
                        <td>${user.nama}</td>
                        <td>${user.email}</td>
                        <td><span style="background-color: #6c757d; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; text-transform: uppercase;">${user.role || "customer"}</span></td>
                        <td>
                            <button onclick="siapkanEdit('${user.id}', '${user.nama}', '${user.email}')" style="background-color: white; color: black; border: none; padding: 5px 10px; cursor: pointer; border-radius: 5px; margin-bottom: 5px; font-size: 11px;">Edit</button>
                            <button onclick="deleteUser(${user.id})" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 5px; font-size: 11px;">Hapus</button>
                        </td>
                    </tr>
                `;
        selectUser.innerHTML += `<option value="${user.id}">${user.nama} (${user.email})</option>`;
      });
    }
  } catch (err) {}
}

document.getElementById("formUser").addEventListener("submit", async function (e) {
  e.preventDefault();
  try {
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        role: "customer",
      }),
    });
    const result = await res.json();
    if (result.status === "success") {
      swalLuxury.fire({ icon: "success", title: "Akun Berhasil Didaftar!", timer: 1500 });
      tambahNotif("🎉 Selamat! Akun Anda berhasil didaftarkan.");
      this.reset();
      loadUser();
    }
  } catch (err) {}
});

function deleteUser(id) {
  swalLuxury
    .fire({
      title: "Hapus Customer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
        const jsonRes = await res.json();
        if (jsonRes.status === "success") {
          swalLuxury.fire("Terhapus!", "", "success");
          loadUser();
        }
      }
    });
}

function siapkanEdit(id, namaLama, emailLama) {
  document.getElementById("sectionEditUser").style.display = "block";
  document.getElementById("editId").value = id;
  document.getElementById("editNama").value = namaLama;
  document.getElementById("editEmail").value = emailLama;
}

function batalEdit() {
  document.getElementById("sectionEditUser").style.display = "none";
  document.getElementById("formEditUser").reset();
}

document.getElementById("formEditUser").addEventListener("submit", async function (e) {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  try {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama: document.getElementById("editNama").value, email: document.getElementById("editEmail").value }),
    });
    const result = await res.json();
    if (result.status === "success") {
      swalLuxury.fire({ icon: "success", title: "Update Berhasil!", timer: 1500, showConfirmButton: false });
      batalEdit();
      loadUser();
    }
  } catch (err) {}
});

// ==========================================
// 4. AUTHENTICATION & GLOBAL CALLS
// ==========================================
const signUpBtn = document.getElementById("signUpBtn");
const signInBtn = document.getElementById("signInBtn");
const authContainer = document.getElementById("authContainer");

if (signUpBtn && signInBtn && authContainer) {
  signUpBtn.addEventListener("click", () => {
    authContainer.classList.add("right-panel-active");
  });
  signInBtn.addEventListener("click", () => {
    authContainer.classList.remove("right-panel-active");
  });
}

document.getElementById("formLogin").addEventListener("submit", async function (e) {
  e.preventDefault();
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: document.getElementById("loginEmail").value, password: document.getElementById("loginPassword").value }),
    });
    const result = await res.json();
    if (result.status === "success") {
      swalLuxury
        .fire({
          icon: "success",
          title: "Login Berhasil!",
          text: "Selamat datang, " + result.data.nama,
          timer: 1500,
          showConfirmButton: false,
        })
        .then(() => {
          localStorage.setItem("loggedInUser", JSON.stringify(result.data));
          this.reset();
          document.getElementById("authWrapper").style.display = "none";
          document.getElementById("dashboardWrapper").style.display = "block";
          jalankanSemuaData();
        });
    } else {
      swalLuxury.fire({ icon: "error", title: "Gagal Login!", text: result.message });
    }
  } catch (err) {}
});

document.getElementById("btnLogout").addEventListener("click", () => {
  swalLuxury
    .fire({
      title: "Logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Keluar!",
    })
    .then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("loggedInUser");
        document.getElementById("dashboardWrapper").style.display = "none";
        document.getElementById("authWrapper").style.display = "flex";
        if (authContainer) authContainer.classList.remove("right-panel-active");
      }
    });
});

document.getElementById("togglePassword")?.addEventListener("click", function () {
  const pwdInput = document.getElementById("password");
  if (pwdInput.type === "password") {
    pwdInput.type = "text";
    this.textContent = "visibility";
  } else {
    pwdInput.type = "password";
    this.textContent = "visibility_off";
  }
});
document.getElementById("toggleLoginPassword")?.addEventListener("click", function () {
  const pwdInput = document.getElementById("loginPassword");
  if (pwdInput.type === "password") {
    pwdInput.type = "text";
    this.textContent = "visibility";
  } else {
    pwdInput.type = "password";
    this.textContent = "visibility_off";
  }
});

function jalankanSemuaData() {
  loadUser();
  loadRooms();
  loadReservasi();
  loadSummary();
  loadPayments();
  loadReviews();
}

document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("loggedInUser");
  if (user) {
    document.getElementById("authWrapper").style.display = "none";
    document.getElementById("dashboardWrapper").style.display = "block";
    jalankanSemuaData();
  }
});

// ==========================================
// FITUR NOTIFIKASI (TUGAS AVRIL)
// ==========================================
let notifikasiLokal = JSON.parse(localStorage.getItem("notifikasi_hotel")) || [];

function tambahNotif(pesan) {
  // Masukkan notif baru di urutan paling atas
  notifikasiLokal.unshift({ pesan: pesan, waktu: new Date().toLocaleString("id-ID") });
  localStorage.setItem("notifikasi_hotel", JSON.stringify(notifikasiLokal));
  updateBadgeNotif();
}

function updateBadgeNotif() {
  let badge = document.getElementById("badgeNotif");
  if (badge) {
    if (notifikasiLokal.length > 0) {
      badge.style.display = "inline-block";
      badge.innerText = notifikasiLokal.length;
    } else {
      badge.style.display = "none";
    }
  }
}

function lihatNotifikasi() {
  if (notifikasiLokal.length === 0) {
    swalLuxury.fire({ icon: "info", title: "Kosong", text: "Belum ada notifikasi baru." });
    return;
  }

  // Bikin desain list notifikasi yang elegan
  let listHtml = '<div style="text-align: left; max-height: 250px; overflow-y: auto;">';
  notifikasiLokal.forEach((n) => {
    listHtml += `
            <div style="padding: 10px; border-bottom: 1px solid #444; color: #fff;">
                <div style="font-size: 14px; font-weight: bold; color: #d4af37;">${n.pesan}</div>
                <div style="font-size: 11px; color: #aaa; margin-top: 3px;">🕒 ${n.waktu}</div>
            </div>`;
  });
  listHtml += "</div>";

  swalLuxury
    .fire({
      title: "Notifikasi Anda",
      html: listHtml,
      showCancelButton: true,
      confirmButtonText: "Tutup",
      cancelButtonText: "Bersihkan Semua",
      cancelButtonColor: "#dc3545",
      confirmButtonColor: "#28a745",
    })
    .then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        notifikasiLokal = [];
        localStorage.removeItem("notifikasi_hotel");
        updateBadgeNotif();
        swalLuxury.fire({ icon: "success", title: "Dibersihkan!", timer: 1500, showConfirmButton: false });
      }
    });
}

// ==========================================
// FITUR SEARCH & FILTER KAMAR (TUGAS JEREMIA)
// ==========================================
function eksekusiFilterKamar() {
  // Ambil input pencarian, hapus spasi berlebih, jadikan huruf kecil
  let inputSearch = document.getElementById("searchKamar").value.trim().toLowerCase();
  let filterTipe = document.getElementById("filterTipeKamar").value.toLowerCase();

  let table = document.getElementById("tableRoom");
  let tr = table.getElementsByTagName("tr");

  for (let i = 0; i < tr.length; i++) {
    let tdNoKamar = tr[i].getElementsByTagName("td")[1];
    let tdTipeKamar = tr[i].getElementsByTagName("td")[2];
    let tdHarga = tr[i].getElementsByTagName("td")[3];

    if (tdNoKamar && tdTipeKamar && tdHarga) {
      let textNoKamar = (tdNoKamar.textContent || tdNoKamar.innerText).toLowerCase();
      let textTipeKamar = (tdTipeKamar.textContent || tdTipeKamar.innerText).toLowerCase();
      let textHargaRaw = (tdHarga.textContent || tdHarga.innerText).toLowerCase();

      // Bersihkan format harga (misal "Rp 500.000,00" jadi "500000") untuk pencocokan angka
      let angkaHarga = textHargaRaw.replace(/[^0-9]/g, "");
      // Hapus 2 digit terakhir jika formatnya mengandung koma (sen)
      if (textHargaRaw.includes(",")) {
        angkaHarga = angkaHarga.slice(0, -2);
      }

      // OTOMATIS CERDAS: Cek apakah yang diketik user ada di Nomor, Tipe, ATAU Harga murni
      let matchSearch = textNoKamar.includes(inputSearch) || textTipeKamar.includes(inputSearch) || angkaHarga.includes(inputSearch);

      // Cek apakah tipe kamar cocok dengan dropdown filter
      let matchFilter = filterTipe === "semua" || textTipeKamar.includes(filterTipe);

      // Tampilkan jika cocok dengan kotak pencarian DAN dropdown
      if (matchSearch && matchFilter) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

// ==========================================
// FITUR DASHBOARD ADMIN / CEO (TUGAS MARTUNAS)
// ==========================================
function updateDashboardAdmin() {
  let tabelRes = document.getElementById("tableReservasi");
  if (!tabelRes) return;

  let barisRes = tabelRes.getElementsByTagName("tr");
  let totalRes = barisRes.length;
  let totalConfirmed = 0;
  let totalPending = 0;

  for (let i = 0; i < barisRes.length; i++) {
    let textStatus = barisRes[i].innerText.toLowerCase();
    if (textStatus.includes("confirmed") || textStatus.includes("completed")) totalConfirmed++;
    if (textStatus.includes("pending")) totalPending++;
  }

  let tabelPay = document.getElementById("tablePayment");
  let barisPay = tabelPay.getElementsByTagName("tr");
  let totalPendapatan = 0;

  for (let i = 0; i < barisPay.length; i++) {
    let tdNominal = barisPay[i].getElementsByTagName("td")[2];
    let tdStatus = barisPay[i].getElementsByTagName("td")[4];

    if (tdNominal && tdStatus) {
      let statusPay = tdStatus.innerText.toLowerCase();
      if (statusPay.includes("success")) {
        let textHargaRaw = tdNominal.textContent || tdNominal.innerText;
        let nominal = parseInt(textHargaRaw.replace(/[^0-9]/g, ""));

        if (textHargaRaw.includes(",")) nominal = Math.floor(nominal / 100);
        if (!isNaN(nominal)) totalPendapatan += nominal;
      }
    }
  }

  document.getElementById("sumTotal").innerText = totalRes;
  document.getElementById("sumConfirmed").innerText = totalConfirmed;
  document.getElementById("sumPending").innerText = totalPending;
  document.getElementById("sumPendapatan").innerText = "Rp " + totalPendapatan.toLocaleString("id-ID");
}

// ==========================================
// FITUR LUPA PASSWORD
// ==========================================
async function lupaPassword(e) {
  e.preventDefault();

  const { value: email } = await swalLuxury.fire({
    title: "Reset Password",
    input: "email",
    inputLabel: "Masukkan alamat email akun Anda",
    inputPlaceholder: "admin@grandceohotel.com",
    showCancelButton: true,
    confirmButtonText: "Verifikasi Email",
    cancelButtonText: "Batal",
    validationMessage: "Format email tidak valid!", // Otomatis ngecek kalau yg diketik bukan email
  });

  if (email) {
    // Langkah 2: Simulasi Loading (Seolah-olah request ke Backend)
    swalLuxury.fire({
      title: "Memverifikasi Data...",
      html: "Mencocokkan email dengan database kami.",
      allowOutsideClick: false,
      didOpen: () => {
        swalLuxury.showLoading(); // Munculin animasi muter-muter
      },
    });

    // Langkah 3: Tampilkan hasil setelah loading 1.5 detik
    setTimeout(() => {
      // Generate angka acak biar kelihatan kayak PIN beneran
      let randomPin = Math.floor(1000 + Math.random() * 9000);

      swalLuxury.fire({
        icon: "success",
        title: "Verifikasi Berhasil",
        html: `Akun untuk <b>${email}</b> ditemukan.<br><br>
                       Sesuai protokol keamanan <i>Grand CEO Hotel</i>, sebutkan PIN Darurat <b style="color:#d4af37; font-size:20px;">#${randomPin}</b> ini kepada IT Support (Ext. 101) untuk mereset sandi Anda.`,
        confirmButtonText: "Selesai",
      });
    }, 1500); // 1500 milidetik = 1.5 detik
  }
}

setInterval(updateDashboardAdmin, 1500);

document.getElementById("searchKamar").addEventListener("keyup", eksekusiFilterKamar);
document.getElementById("filterTipeKamar").addEventListener("change", eksekusiFilterKamar);

document.addEventListener("DOMContentLoaded", updateBadgeNotif);

const socket = io();

socket.on("pesananBaru", (data) => {
  const currentRole = localStorage.getItem("userRole") || "admin";

  if (currentRole === "admin") {
    swalLuxury.fire({
      icon: "info",
      title: "Ada Pesanan Kamar Baru!",
      html: `Notifikasi Real-time: Booking baru dengan <b>ID #${data.bookingId}</b> baru saja masuk ke sistem.<br>Silakan periksa daftar untuk memproses konfirmasi pembayaran.`,
      confirmButtonText: "Periksa Sekarang",
    });

    if (typeof loadReservasi === "function") {
      loadReservasi();
    }
    if (typeof loadSummary === "function") {
      loadSummary();
    }
  }
});