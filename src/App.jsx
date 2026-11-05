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
  useLocation,
} from "react-router-dom";
import "./App.css";

// Daftar jurusan (dipakai di form dan statistik)
const daftarJurusan = [
  "Teknik Informatika",
  "Sistem Informasi",
  "Manajemen Informatika",
  "Teknik Komputer",
];

/* =========================================================
   HOOK: useReducer
   Mengelola data pendaftar lewat "aksi" (TAMBAH, HAPUS, KOSONGKAN).
   Reducer menerima state lama + aksi, lalu mengembalikan state baru.
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

// Mengambil data yang tersimpan di browser (jika ada)
function ambilDataTersimpan() {
  try {
    return JSON.parse(localStorage.getItem("pendaftar")) || [];
  } catch {
    return [];
  }
}

/* =========================================================
   HOOK: useContext
   Context membuat data pendaftar bisa dipakai di halaman mana saja
   tanpa dikirim lewat props satu per satu.
   ========================================================= */
const PendaftarContext = createContext(null);

function PendaftarProvider({ children }) {
  const [data, dispatch] = useReducer(
    pendaftarReducer,
    [],
    ambilDataTersimpan
  );

  // HOOK: useEffect
  // Simpan data ke browser setiap kali "data" berubah.
  useEffect(() => {
    localStorage.setItem("pendaftar", JSON.stringify(data));
  }, [data]);

  // HOOK: useMemo (di sini agar value tidak dibuat ulang setiap render)
  const value = useMemo(() => ({ data, dispatch }), [data]);

  return (
    <PendaftarContext.Provider value={value}>
      {children}
    </PendaftarContext.Provider>
  );
}

/* =========================================================
   CUSTOM HOOKS
   Custom hook = fungsi biasa yang namanya diawali "use"
   dan di dalamnya memakai hook lain.
   ========================================================= */

// Custom hook 1: mengambil data dari context dengan lebih singkat
function usePendaftar() {
  return useContext(PendaftarContext);
}

// Custom hook 2: mengganti judul tab browser
function useJudulHalaman(judul) {
  useEffect(() => {
    document.title = judul + " | AMIK Bukittinggi";
  }, [judul]);
}

/* =========================================================
   KOMPONEN
   ========================================================= */
function Header({ judul, deskripsi }) {
  return (
    <div>
      <h2>{judul}</h2>
      <p className="deskripsi">{deskripsi}</p>
    </div>
  );
}

// memo: baris tabel hanya dirender ulang jika datanya berubah
const TabelBaris = memo(function TabelBaris({ item, onHapus }) {
  return (
    <tr>
      <td>{item.nama}</td>
      <td>{item.email}</td>
      <td>{item.jurusan}</td>
      <td>{item.alamat}</td>
      <td>
        <button
          type="button"
          className="hapus"
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
  useJudulHalaman("Home"); // custom hook
  const { data } = usePendaftar(); // custom hook + useContext

  return (
    <div>
      <Header judul="Beranda" deskripsi="AMIK BUKITTINGGI" />
      <p>Selamat datang di website Penerimaan Mahasiswa Baru (PMB).</p>
      <p>
        Jumlah pendaftar saat ini: <strong>{data.length}</strong>
      </p>
      <p>
        Silakan buka halaman <Link to="/pmb">PMB</Link> untuk mendaftar.
      </p>
    </div>
  );
}

function About() {
  useJudulHalaman("About");

  return (
    <div>
      <Header judul="Tentang Kami" deskripsi="AMIK BUKITTINGGI" />
      <p>Program studi yang tersedia:</p>
      <ul>
        {daftarJurusan.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function PMB() {
  useJudulHalaman("PMB");
  const { data, dispatch } = usePendaftar();

  // HOOK: useState - menyimpan isi form, pesan, dan kata pencarian
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [alamat, setAlamat] = useState("");
  const [pesan, setPesan] = useState("");
  const [cari, setCari] = useState("");

  // HOOK: useRef - mengakses elemen input secara langsung
  const namaRef = useRef(null);

  // HOOK: useEffect - pesan sukses hilang otomatis setelah 3 detik
  useEffect(() => {
    if (!pesan) return;
    const timer = setTimeout(() => setPesan(""), 3000);
    return () => clearTimeout(timer); // dibersihkan jika komponen berubah
  }, [pesan]);

  // HOOK: useMemo - hasil pencarian dihitung ulang hanya jika data/cari berubah
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
        jurusan: j,
        jumlah: data.filter((item) => item.jurusan === j).length,
      })),
    [data]
  );

  // Saat tombol Daftar ditekan
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

    namaRef.current.focus(); // kursor kembali ke kolom nama
  }

  // HOOK: useCallback - fungsi hapus dibuat sekali saja,
  // sehingga TabelBaris (memo) tidak dirender ulang tanpa perlu
  const handleHapus = useCallback(
    (id) => dispatch({ type: "HAPUS", id }),
    [dispatch]
  );

  return (
    <div>
      <Header judul="Form Pendaftaran" deskripsi="AMIK BUKITTINGGI" />

      <form onSubmit={handleSubmit}>
        <label>Nama Lengkap</label>
        <input
          ref={namaRef}
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Masukkan nama"
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Masukkan email"
          required
        />

        <label>Pilih Jurusan</label>
        <select
          value={jurusan}
          onChange={(e) => setJurusan(e.target.value)}
          required
        >
          <option value="">-- Pilih Jurusan --</option>
          {daftarJurusan.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label>Alamat</label>
        <textarea
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          placeholder="Masukkan alamat"
          required
        />

        <button type="submit">DAFTAR</button>
      </form>

      {pesan && <p className="sukses">{pesan}</p>}

      <h3>Statistik per Jurusan</h3>
      <ul>
        {statistik.map((s) => (
          <li key={s.jurusan}>
            {s.jurusan}: {s.jumlah}
          </li>
        ))}
      </ul>

      <h3>Data Pendaftar</h3>

      {data.length === 0 ? (
        <p>Belum ada data pendaftar.</p>
      ) : (
        <>
          <input
            type="text"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama pendaftar..."
          />

          {hasilCari.length === 0 ? (
            <p>Nama tidak ditemukan.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Jurusan</th>
                  <th>Alamat</th>
                  <th>Aksi</th>
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
          )}

          <button
            type="button"
            className="hapus kosongkan"
            onClick={() => dispatch({ type: "KOSONGKAN" })}
          >
            Hapus Semua Data
          </button>
        </>
      )}
    </div>
  );
}

function Contact() {
  useJudulHalaman("Contact");

  return (
    <div>
      <Header judul="Kontak" deskripsi="AMIK BUKITTINGGI" />
      <p>Email: pmb@amik.ac.id</p>
      <p>Telepon: (0752) 000-000</p>
      <p>Alamat: Bukittinggi, Sumatera Barat</p>
    </div>
  );
}

function NotFound() {
  useJudulHalaman("Tidak ditemukan");

  return (
    <div>
      <Header judul="Halaman tidak ditemukan" deskripsi="Error 404" />
      <p>
        Alamat yang Anda buka tidak ada. <Link to="/">Kembali ke Home</Link>
      </p>
    </div>
  );
}

/* =========================================================
   NAVBAR
   Fitur: menempel di atas (sticky), menu aktif ter-highlight,
   badge jumlah pendaftar, responsif (hamburger di HP),
   menu menutup otomatis (klik menu, tombol Esc, klik di luar),
   dan link "Lewati ke konten" untuk aksesibilitas.
   ========================================================= */
const menu = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/pmb", label: "PMB", badge: true },
  { to: "/contact", label: "Contact" },
];

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

  return (
    <header className="navbar" ref={navRef}>
      <a href="#konten" className="skip-link">
        Lewati ke konten
      </a>

      <div className="navbar-inner">
        <Link to="/" className="brand">
          AMIK Bukittinggi
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label={terbuka ? "Tutup menu" : "Buka menu"}
          aria-expanded={terbuka}
          aria-controls="menu-utama"
          onClick={() => setTerbuka(!terbuka)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="menu-utama"
          aria-label="Menu utama"
          className={terbuka ? "menu terbuka" : "menu"}
        >
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.to === "/"}
              className={({ isActive }) =>
                isActive ? "menu-link aktif" : "menu-link"
              }
            >
              {m.label}
              {m.badge && data.length > 0 && (
                <span className="badge">{data.length}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
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
   APP: Provider + Router
   ========================================================= */
function App() {
  return (
    <PendaftarProvider>
      <BrowserRouter>
        <Navbar />

        <main id="konten" className="container">
          <Suspense fallback={<p>Memuat halaman...</p>}>
            <Routes>
              <Route path="/" element={<LazyHome />} />
              <Route path="/about" element={<LazyAbout />} />
              <Route path="/pmb" element={<LazyPMB />} />
              <Route path="/contact" element={<LazyContact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </BrowserRouter>
    </PendaftarProvider>
  );
}

export default App;