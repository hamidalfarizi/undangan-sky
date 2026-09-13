// ================================================
//  KONFIGURASI UNDANGAN PERNIKAHAN ✨
//  Edit file ini sesuai data pernikahan Anda!
// ================================================

const WEDDING = {

  // ── MEMPELAI ────────────────────────────────
  groom: {
    name: "Nama Pengantin Pria",           // ← Ganti
    nickname: "Pria",                       // ← Nama panggilan
    parents: "Putra dari Bapak X & Ibu Y"  // ← Ganti
  },
  bride: {
    name: "Nama Pengantin Wanita",          // ← Ganti
    nickname: "Wanita",                     // ← Nama panggilan
    parents: "Putri dari Bapak A & Ibu B"  // ← Ganti
  },

  // ── TANGGAL (untuk countdown) ───────────────
  // Format: "YYYY-MM-DDTHH:MM:SS"
  targetDate: new Date("2025-06-15T08:00:00"),

  // ── AKAD NIKAH ──────────────────────────────
  akad: {
    date:     "Minggu, 15 Juni 2025",       // ← Ganti
    time:     "08.00 WIB",                  // ← Ganti
    location: "Masjid Al-Kautsar",          // ← Ganti
    address:  "Jl. Contoh No. 1, Jakarta",  // ← Ganti
    mapsUrl:  ""                            // ← Isi link Google Maps (opsional)
  },

  // ── RESEPSI ─────────────────────────────────
  reception: {
    date:     "Minggu, 15 Juni 2025",       // ← Ganti
    time:     "11.00 – 15.00 WIB",         // ← Ganti
    location: "Gedung Pernikahan Bintang",  // ← Ganti
    address:  "Jl. Contoh No. 2, Jakarta",  // ← Ganti
    mapsUrl:  ""                            // ← Isi link Google Maps (opsional)
  },

  // ── KISAH CINTA ─────────────────────────────
  story: {
    howWeMet:
      "Kami pertama kali bertemu di sebuah tempat yang tak terduga, seperti dua bintang yang ditakdirkan bersilangan di langit yang sama.",
    journey:
      "Perjalanan kami dimulai dari percakapan sederhana yang perlahan tumbuh menjadi sebuah cerita yang ingin kami tulis selamanya.",
    proposal:
      "Di bawah langit berbintang, dengan sepenuh hati ia memintaku untuk menjadi cahayanya selamanya — dan aku berkata ya.",
    quote:
      "\"Dua cahaya yang terpisah di langit yang luas, akhirnya menemukan satu sama lain — dan bersama, mereka menerangi seluruh dunia.\""
  },

  // ── KONTAK (untuk WhatsApp RSVP) ────────────
  // Format nomor: 62xxxxxxxxxx (tanpa + atau 0 di depan)
  contact: {
    phone: "6281234567890"  // ← Ganti dengan nomor WhatsApp penyelenggara
  }
};
