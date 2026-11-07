import {
  useState,
  useEffect,
  useContext,
  useRef,
  useReducer,
  useCallback,
  useMemo,
  createContext,
  memo,
  lazy,
  Suspense,
} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
import "./App.css";

/* =========================================================
   KONFIGURASI SITUS
   Ubah bagian ini saja untuk menyesuaikan template.
   ========================================================= */
const SITE = {
  nama: "AMIK Bukittinggi",
  tagline: "Penerimaan Mahasiswa Baru",
  deskripsi:
    "Daftar online, pilih program studi, dan mulai perjalanan akademik Anda bersama kami.",
  email: "pmb@amik.ac.id",
  telepon: "(0752) 000-000",
  alamat: "Bukittinggi, Sumatera Barat",
  menu: [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/pmb", label: "PMB", badge: true },
    { to: "/contact", label: "Contact" },
  ],
};

const daftarJurusan = [
  { nama: "Teknik Informatika", desc: "Pemrograman, kecerdasan buatan, dan rekayasa perangkat lunak." },
  { nama: "Sistem Informasi", desc: "Analisis sistem, basis data, dan transformasi digital bisnis." },
  { nama: "Manajemen Informatika", desc: "Pengelolaan data, aplikasi bisnis, dan layanan teknologi informasi." },
  { nama: "Teknik Komputer", desc: "Perangkat keras, jaringan komputer, dan sistem tertanam." },
];

const daftarFitur = [
  { judul: "Daftar Online", desc: "Isi formulir kapan saja tanpa perlu datang ke kampus." },
  { judul: "Pilihan Jurusan", desc: "Tersedia empat program studi sesuai minat dan bakat Anda." },
  { judul: "Informasi Jelas", desc: "Semua informasi pendaftaran tersedia dalam satu tempat." },
];

const daftarAlur = [
  { judul: "Isi Formulir", desc: "Lengkapi nama, email, dan alamat pada halaman PMB." },
  { judul: "Pilih Jurusan", desc: "Tentukan program studi yang sesuai dengan minat Anda." },
  { judul: "Selesai", desc: "Data pendaftaran tersimpan dan langsung tampil di daftar." },
];

/* =========================================================
   KELAS TAILWIND YANG DIPAKAI BERULANG
   ========================================================= */
const kelasWrap = "mx-auto w-full max-w-5xl px-5";
const kelasPanel = "rounded-xl bg-white p-6 shadow-md";
const kelasKartu = "rounded-xl bg-white p-6 shadow-md";
const kelasLabel = "mt-3 block font-bold";
const kelasInput =
  "my-1.5 block w-full rounded-md border border-gray-300 bg-white p-2.5 " +
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const kelasTombol =
  "cursor-pointer rounded-md bg-blue-600 px-5 py-2.5 text-center font-bold text-white " +
  "hover:bg-blue-700";
const kelasTombolHapus =
  "cursor-pointer rounded-md bg-red-600 px-2.5 py-1 text-sm text-white hover:bg-red-700";
const kelasLink = "text-blue-600 hover:underline";

/* =========================================================
   HOOK: useReducer
   Mengelola data pendaftar lewat aksi TAMBAH, HAPUS, KOSONGKAN.
   ========================================================= */
function pendaftarReducer(state, action) {
  switch (action.type) {
    case "TAMBAH":
      return [...state, action.pendaftar];
    case "HAPUS":
      return state.filter((item) => item.id !== action.id);
    case "KOSONGKAN":
      return [];
    default:
      return state;
  }
}

function ambilDataTersimpan() {
  try {
    return JSON.parse(localStorage.getItem("pendaftar")) || [];
  } catch {
    return [];
  }
}

/* =========================================================
   HOOK: useContext
   ========================================================= */
const PendaftarContext = createContext(null);

function PendaftarProvider({ children }) {
  const [data, dispatch] = useReducer(
    pendaftarReducer,
    [],
    ambilDataTersimpan
  );

  // HOOK: useEffect - simpan data ke browser setiap kali berubah
  useEffect(() => {
    localStorage.setItem("pendaftar", JSON.stringify(data));
  }, [data]);

  // HOOK: useMemo
  const value = useMemo(() => ({ data, dispatch }), [data]);

  return (
    <PendaftarContext.Provider value={value}>
      {children}
    </PendaftarContext.Provider>
  );
}

/* =========================================================
   CUSTOM HOOKS
   ========================================================= */
function usePendaftar() {
  return useContext(PendaftarContext);
}

function useJudulHalaman(judul) {
  useEffect(() => {
    document.title = judul + " | " + SITE.nama;
  }, [judul]);
}

/* =========================================================
   KOMPONEN UMUM
   ========================================================= */
// Judul di bagian atas halaman dalam (menerima props)
function PageHeader({ judul, deskripsi }) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className={kelasWrap + " py-9"}>
        <h1 className="mb-1 text-3xl font-bold">{judul}</h1>
        {deskripsi && <p className="text-gray-500">{deskripsi}</p>}
      </div>
    </div>
  );
}

// Judul seksi yang seragam (dipakai di halaman Home)
function SectionTitle({ judul, deskripsi }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <h2 className="mb-2 text-2xl font-bold sm:text-3xl">{judul}</h2>
      {deskripsi && <p className="text-gray-600">{deskripsi}</p>}
    </div>
  );
}

// memo: baris tabel hanya dirender ulang jika datanya berubah
const TabelBaris = memo(function TabelBaris({ item, onHapus }) {
  const kelasSel = "border border-gray-300 p-2 align-top";

  return (
    <tr>
      <td className={kelasSel}>{item.nama}</td>
      <td className={kelasSel}>{item.email}</td>
      <td className={kelasSel}>{item.jurusan}</td>
      <td className={kelasSel}>{item.alamat}</td>
      <td className={kelasSel}>
        <button
          type="button"
          className={kelasTombolHapus}
          onClick={() => onHapus(item.id)}
        >
          Hapus
        </button>
      </td>
    </tr>
  );
});

/* =========================================================
   HALAMAN
   ========================================================= */
function Home() {
  useJudulHalaman("Home");
  const { data } = usePendaftar();

  return (
    <>
      {/* 1. HERO: teks di kiri, ringkasan di kanan */}
      <section className="bg-blue-600 text-white">
        <div
          className={
            kelasWrap + " grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2"
          }
        >
          <div>
            <span className="mb-4 inline-block rounded-full bg-white/15 px-3.5 py-1 text-sm font-bold">
              Pendaftaran dibuka
            </span>
            <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-5xl">
              {SITE.tagline}
            </h1>
            <p className="mb-8 max-w-lg text-lg text-blue-50">
              {SITE.deskripsi}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/pmb"
                className="rounded-md bg-white px-6 py-3 font-bold text-blue-600 hover:bg-blue-50"
              >
                Daftar sekarang
              </Link>
              <Link
                to="/about"
                className="rounded-md border-2 border-white px-6 py-3 font-bold text-white hover:bg-white/15"
              >
                Pelajari lebih lanjut
              </Link>
            </div>
          </div>

          {/* Kartu ringkasan */}
          <div className="rounded-xl bg-white/10 p-6 ring-1 ring-white/25">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-white/10 p-5">
                <p className="text-4xl font-bold">{data.length}</p>
                <p className="mt-1 text-sm text-blue-50">Total pendaftar</p>
              </div>
              <div className="rounded-lg bg-white/10 p-5">
                <p className="text-4xl font-bold">{daftarJurusan.length}</p>
                <p className="mt-1 text-sm text-blue-50">Program studi</p>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-blue-50">
              Daftar online kapan saja, tanpa perlu datang ke kampus.
            </p>
          </div>
        </div>
      </section>

      {/* 2. KEUNGGULAN */}
      <section className="bg-white py-14">
        <div className={kelasWrap}>
          <SectionTitle
            judul="Mengapa memilih kami"
            deskripsi="Proses pendaftaran dibuat sederhana agar Anda bisa fokus pada pilihan terbaik."
          />

          <div className="grid gap-5 md:grid-cols-3">
            {daftarFitur.map((f, i) => (
              <article
                key={f.judul}
                className="rounded-xl border border-gray-200 p-6"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                  {i + 1}
                </span>
                <h3 className="mb-2 text-lg font-bold">{f.judul}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROGRAM STUDI */}
      <section className="py-14">
        <div className={kelasWrap}>
          <SectionTitle
            judul="Program studi"
            deskripsi="Pilih salah satu dari empat program studi yang tersedia."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {daftarJurusan.map((j) => (
              <article key={j.nama} className={kelasKartu}>
                <h3 className="mb-2 font-bold text-blue-600">{j.nama}</h3>
                <p className="text-sm text-gray-600">{j.desc}</p>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center">
            <Link to="/about" className={kelasLink}>
              Lihat selengkapnya &rarr;
            </Link>
          </p>
        </div>
      </section>

      {/* 4. ALUR PENDAFTARAN */}
      <section className="bg-white py-14">
        <div className={kelasWrap}>
          <SectionTitle
            judul="Alur pendaftaran"
            deskripsi="Hanya tiga langkah mudah."
          />

          <ol className="grid gap-6 md:grid-cols-3">
            {daftarAlur.map((a, i) => (
              <li key={a.judul} className="text-center">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mb-1 font-bold">{a.judul}</h3>
                <p className="text-sm text-gray-600">{a.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. AJAKAN MENDAFTAR */}
      <section className="bg-blue-600 py-14 text-center text-white">
        <div className={kelasWrap}>
          <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
            Siap bergabung?
          </h2>
          <p className="mb-6 text-blue-50">
            Pendaftaran hanya membutuhkan beberapa menit.
          </p>
          <Link
            to="/pmb"
            className="inline-block rounded-md bg-white px-6 py-3 font-bold text-blue-600 hover:bg-blue-50"
          >
            Mulai pendaftaran
          </Link>
        </div>
      </section>
    </>
  );
}

function About() {
  useJudulHalaman("About");

  return (
    <>
      <PageHeader
        judul="Tentang Kami"
        deskripsi="Mengenal kampus dan program studi yang tersedia."
      />

      <section className={kelasWrap + " py-10"}>
        <p className="mb-7 max-w-2xl text-lg text-gray-600">
          Kami berkomitmen menyediakan pendidikan yang berkualitas dan relevan
          dengan kebutuhan dunia kerja. Berikut program studi yang dapat Anda
          pilih saat mendaftar.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {daftarJurusan.map((j) => (
            <article key={j.nama} className={kelasKartu}>
              <h3 className="mb-2 text-lg font-bold text-blue-600">
                {j.nama}
              </h3>
              <p className="text-gray-600">{j.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function PMB() {
  useJudulHalaman("PMB");
  const { data, dispatch } = usePendaftar();

  // HOOK: useState
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [alamat, setAlamat] = useState("");
  const [pesan, setPesan] = useState("");
  const [cari, setCari] = useState("");

  // HOOK: useRef
  const namaRef = useRef(null);

  // HOOK: useEffect - pesan sukses hilang setelah 3 detik
  useEffect(() => {
    if (!pesan) return;
    const timer = setTimeout(() => setPesan(""), 3000);
    return () => clearTimeout(timer);
  }, [pesan]);

  // HOOK: useMemo - hasil pencarian
  const hasilCari = useMemo(
    () =>
      data.filter((item) =>
        item.nama.toLowerCase().includes(cari.toLowerCase())
      ),
    [data, cari]
  );

  // HOOK: useMemo - jumlah pendaftar per jurusan
  const statistik = useMemo(
    () =>
      daftarJurusan.map((j) => ({
        jurusan: j.nama,
        jumlah: data.filter((item) => item.jurusan === j.nama).length,
      })),
    [data]
  );

  function handleSubmit(e) {
    e.preventDefault();

    dispatch({
      type: "TAMBAH",
      pendaftar: { id: Date.now(), nama, email, jurusan, alamat },
    });

    setPesan("Pendaftaran berhasil!");
    setNama("");
    setEmail("");
    setJurusan("");
    setAlamat("");

    namaRef.current.focus();
  }

  // HOOK: useCallback
  const handleHapus = useCallback(
    (id) => dispatch({ type: "HAPUS", id }),
    [dispatch]
  );

  const kelasHeadTabel = "border border-gray-300 bg-gray-100 p-2";

  return (
    <>
      <PageHeader
        judul="Form Pendaftaran Mahasiswa"
        deskripsi={SITE.nama}
      />

      <section className={kelasWrap + " py-10"}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <form onSubmit={handleSubmit} className={kelasPanel + " lg:col-span-2"}>
            <label className={kelasLabel + " !mt-0"}>Nama Lengkap</label>
            <input
              ref={namaRef}
              type="text"
              className={kelasInput}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama"
              required
            />

            <label className={kelasLabel}>Email</label>
            <input
              type="email"
              className={kelasInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              required
            />

            <label className={kelasLabel}>Pilih Jurusan</label>
            <select
              className={kelasInput}
              value={jurusan}
              onChange={(e) => setJurusan(e.target.value)}
              required
            >
              <option value="">-- Pilih Jurusan --</option>
              {daftarJurusan.map((j) => (
                <option key={j.nama} value={j.nama}>
                  {j.nama}
                </option>
              ))}
            </select>

            <label className={kelasLabel}>Alamat</label>
            <textarea
              className={kelasInput + " min-h-24 resize-y"}
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Masukkan alamat"
              required
            />

            <button type="submit" className={kelasTombol + " mt-4 w-full"}>
              DAFTAR
            </button>

            {pesan && (
              <p
                role="status"
                className="mt-4 rounded-md bg-green-100 px-3.5 py-2.5 text-sm font-bold text-green-800"
              >
                {pesan}
              </p>
            )}
          </form>

          {/* Statistik */}
          <aside className={kelasPanel}>
            <h3 className="mb-3 text-lg font-bold">Statistik per Jurusan</h3>
            <ul className="space-y-2">
              {statistik.map((s) => (
                <li
                  key={s.jurusan}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span>{s.jurusan}</span>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-bold text-blue-700">
                    {s.jumlah}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-600">
              Total pendaftar: <strong>{data.length}</strong>
            </p>
          </aside>
        </div>

        {/* Tabel data */}
        <div className={kelasPanel + " mt-6"}>
          <h3 className="mb-3 text-lg font-bold">Data Pendaftar</h3>

          {data.length === 0 ? (
            <p className="text-gray-600">Belum ada data pendaftar.</p>
          ) : (
            <>
              <input
                type="text"
                className={kelasInput}
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Cari nama pendaftar..."
              />

              {hasilCari.length === 0 ? (
                <p className="text-gray-600">Nama tidak ditemukan.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr>
                        <th className={kelasHeadTabel}>Nama</th>
                        <th className={kelasHeadTabel}>Email</th>
                        <th className={kelasHeadTabel}>Jurusan</th>
                        <th className={kelasHeadTabel}>Alamat</th>
                        <th className={kelasHeadTabel}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hasilCari.map((item) => (
                        <TabelBaris
                          key={item.id}
                          item={item}
                          onHapus={handleHapus}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                type="button"
                className={kelasTombolHapus + " mt-4 px-3.5 py-2"}
                onClick={() => dispatch({ type: "KOSONGKAN" })}
              >
                Hapus Semua Data
              </button>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function Contact() {
  useJudulHalaman("Contact");

  const [pesan, setPesan] = useState({ nama: "", email: "", isi: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setPesan((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Pesan:", pesan);
    alert("Pesan terkirim!");
    setPesan({ nama: "", email: "", isi: "" });
  }

  return (
    <>
      <PageHeader
        judul="Hubungi Kami"
        deskripsi="Ada pertanyaan? Kirim pesan atau hubungi kontak di samping."
      />

      <section className={kelasWrap + " py-10"}>
        <div className="grid gap-6 lg:grid-cols-3">
          <form onSubmit={handleSubmit} className={kelasPanel + " lg:col-span-2"}>
            <label className={kelasLabel + " !mt-0"}>Nama</label>
            <input
              type="text"
              name="nama"
              className={kelasInput}
              value={pesan.nama}
              onChange={handleChange}
              required
            />

            <label className={kelasLabel}>Email</label>
            <input
              type="email"
              name="email"
              className={kelasInput}
              value={pesan.email}
              onChange={handleChange}
              required
            />

            <label className={kelasLabel}>Pesan</label>
            <textarea
              name="isi"
              className={kelasInput + " min-h-28 resize-y"}
              value={pesan.isi}
              onChange={handleChange}
              required
            />

            <button type="submit" className={kelasTombol + " mt-4 w-full"}>
              Kirim pesan
            </button>
          </form>

          <aside className={kelasPanel}>
            <h3 className="mb-3 text-lg font-bold">Informasi Kontak</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-bold text-gray-500">Email</dt>
                <dd>{SITE.email}</dd>
              </div>
              <div>
                <dt className="font-bold text-gray-500">Telepon</dt>
                <dd>{SITE.telepon}</dd>
              </div>
              <div>
                <dt className="font-bold text-gray-500">Alamat</dt>
                <dd>{SITE.alamat}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}

function NotFound() {
  useJudulHalaman("Tidak ditemukan");

  return (
    <>
      <PageHeader judul="Halaman tidak ditemukan" deskripsi="Error 404" />
      <section className={kelasWrap + " py-10"}>
        <p>
          Alamat yang Anda buka tidak ada.{" "}
          <Link to="/" className={kelasLink}>
            Kembali ke Home
          </Link>
        </p>
      </section>
    </>
  );
}

/* =========================================================
   LAZY + SUSPENSE
   ========================================================= */
const LazyHome = lazy(() => Promise.resolve({ default: Home }));
const LazyAbout = lazy(() => Promise.resolve({ default: About }));
const LazyPMB = lazy(() => Promise.resolve({ default: PMB }));
const LazyContact = lazy(() => Promise.resolve({ default: Contact }));

/* =========================================================
   LAYOUT: NAVBAR + KONTEN + FOOTER
   ========================================================= */
function Navbar() {
  const [terbuka, setTerbuka] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();
  const { data } = usePendaftar();

  // Tutup menu saat pindah halaman
  useEffect(() => {
    setTerbuka(false);
  }, [location.pathname]);

  // Tutup menu saat tekan Esc atau klik di luar navbar
  useEffect(() => {
    if (!terbuka) return;

    function handleEsc(e) {
      if (e.key === "Escape") setTerbuka(false);
    }
    function handleKlikLuar(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setTerbuka(false);
      }
    }

    document.addEventListener("keydown", handleEsc);
    document.addEventListener("mousedown", handleKlikLuar);
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleKlikLuar);
    };
  }, [terbuka]);

  const kelasMenu =
    (terbuka ? "flex " : "hidden ") +
    "absolute left-0 right-0 top-full flex-col gap-0.5 bg-white px-3 pb-3 pt-2 shadow-lg " +
    "sm:static sm:flex sm:flex-row sm:items-center sm:gap-1 sm:bg-transparent sm:p-0 sm:shadow-none";

  return (
    <header ref={navRef} className="sticky top-0 z-50 bg-white shadow-md">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-0 focus:rounded-b-md focus:bg-blue-600 focus:px-3 focus:py-2 focus:text-white"
      >
        Lewati ke konten
      </a>

      <div className={kelasWrap + " flex min-h-15 items-center justify-between"}>
        <Link to="/" className="text-xl font-bold text-blue-600">
          {SITE.nama}
        </Link>

        <button
          type="button"
          className="flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md hover:bg-blue-50 sm:hidden"
          aria-label={terbuka ? "Tutup menu" : "Buka menu"}
          aria-expanded={terbuka}
          aria-controls="menu-utama"
          onClick={() => setTerbuka(!terbuka)}
        >
          <span className="block h-0.5 w-6 rounded bg-gray-800" />
          <span className="block h-0.5 w-6 rounded bg-gray-800" />
          <span className="block h-0.5 w-6 rounded bg-gray-800" />
        </button>

        <nav id="menu-utama" aria-label="Menu utama" className={kelasMenu}>
          {SITE.menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.to === "/"}
              className={({ isActive }) =>
                "flex items-center gap-1.5 rounded-md px-3.5 py-3 transition-colors sm:py-2 " +
                (isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-800 hover:bg-blue-50")
              }
            >
              {m.label}
              {m.badge && data.length > 0 && (
                <span className="min-w-5 rounded-full bg-red-600 px-1.5 text-center text-xs font-bold leading-5 text-white">
                  {data.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className={kelasWrap + " grid gap-6 py-9 md:grid-cols-3"}>
        <div>
          <strong className="mb-2 block text-white">{SITE.nama}</strong>
          <p>{SITE.tagline}</p>
        </div>

        <div>
          <strong className="mb-2 block text-white">Menu</strong>
          <ul className="space-y-1">
            {SITE.menu.map((m) => (
              <li key={m.to}>
                <Link to={m.to} className="hover:text-white hover:underline">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <strong className="mb-2 block text-white">Kontak</strong>
          <ul className="space-y-1">
            <li>{SITE.email}</li>
            <li>{SITE.telepon}</li>
            <li>{SITE.alamat}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 py-4 text-center text-sm">
        &copy; {new Date().getFullYear()} {SITE.nama}. Semua hak dilindungi.
      </div>
    </footer>
  );
}

function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100 font-sans text-gray-900">
      <Navbar />

      <main id="konten" className="flex-1">
        <Suspense
          fallback={<p className="p-10 text-center text-gray-500">Memuat halaman...</p>}
        >
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

/* =========================================================
   APP: Provider + Router
   ========================================================= */
function App() {
  return (
    <PendaftarProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<LazyHome />} />
            <Route path="about" element={<LazyAbout />} />
            <Route path="pmb" element={<LazyPMB />} />
            <Route path="contact" element={<LazyContact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PendaftarProvider>
  );
}

export default App;