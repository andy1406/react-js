import { useState, lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  Outlet,
} from "react-router-dom";
import "./App.css";

/* =========================================================
   KONFIGURASI SITUS
   Ubah bagian ini saja untuk menyesuaikan template.
   ========================================================= */
const SITE = {
  name: "PMB Kampus",
  tagline: "Penerimaan Mahasiswa Baru",
  description:
    "Daftar online, pilih program studi, dan mulai perjalanan akademik Anda bersama kami.",
  email: "pmb@kampus.ac.id",
  phone: "(0751) 000-000",
  address: "Jl. Contoh No. 1, Padang, Sumatera Barat",
  menu: [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/pmb", label: "PMB" },
    { to: "/contact", label: "Contact" },
  ],
};

const JURUSAN = [
  { nama: "Informatika", desc: "Pemrograman, kecerdasan buatan, dan rekayasa perangkat lunak." },
  { nama: "Sistem Informasi", desc: "Analisis sistem, basis data, dan transformasi digital bisnis." },
  { nama: "Manajemen", desc: "Pengelolaan organisasi, keuangan, dan pemasaran." },
];

const FITUR = [
  { judul: "Daftar Online", desc: "Isi formulir kapan saja tanpa perlu datang ke kampus." },
  { judul: "Pilihan Jurusan", desc: "Tersedia tiga program studi sesuai minat dan bakat Anda." },
  { judul: "Informasi Jelas", desc: "Semua informasi pendaftaran tersedia dalam satu tempat." },
];

const GENDER = ["Laki-laki", "Perempuan"];
const HOBI = ["Membaca", "Olahraga", "Musik"];

const INITIAL_FORM = { nama: "", email: "", jurusan: "", gender: "", hobi: [] };
const INITIAL_PESAN = { nama: "", email: "", isi: "" };

/* =========================================================
   KOMPONEN UMUM
   ========================================================= */
function PageHeader({ title, subtitle }) {
  return (
    <div className="page-head">
      <div className="wrap">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}

function DataPreview({ data }) {
  return (
    <>
      <h3>Pratinjau Data</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}

/* =========================================================
   HALAMAN
   ========================================================= */
function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>{SITE.tagline}</h1>
          <p>{SITE.description}</p>
          <div className="hero-actions">
            <Link to="/pmb" className="btn">
              Daftar sekarang
            </Link>
            <Link to="/about" className="btn btn-outline">
              Pelajari lebih lanjut
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="section-title">Mengapa memilih kami</h2>
          <div className="grid-3">
            {FITUR.map((f) => (
              <article key={f.judul} className="item-card">
                <h3>{f.judul}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="wrap cta">
          <h2>Siap bergabung?</h2>
          <p>Pendaftaran hanya membutuhkan beberapa menit.</p>
          <Link to="/pmb" className="btn">
            Mulai pendaftaran
          </Link>
        </div>
      </section>
    </>
  );
}

function About() {
  return (
    <>
      <PageHeader
        title="Tentang Kami"
        subtitle="Mengenal kampus dan program studi yang tersedia."
      />

      <section className="section">
        <div className="wrap">
          <p className="lead">
            Kami berkomitmen menyediakan pendidikan yang berkualitas dan
            relevan dengan kebutuhan dunia kerja. Berikut program studi yang
            dapat Anda pilih saat mendaftar.
          </p>

          <div className="grid-3">
            {JURUSAN.map((j) => (
              <article key={j.nama} className="item-card">
                <h3>{j.nama}</h3>
                <p>{j.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function PMB() {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleHobi = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      hobi: checked
        ? [...prev.hobi, value]
        : prev.hobi.filter((item) => item !== value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Data Pendaftaran:", form);
    alert("Pendaftaran berhasil!");
    setForm(INITIAL_FORM);
  };

  return (
    <>
      <PageHeader
        title="Pendaftaran PMB"
        subtitle="Lengkapi data berikut untuk mendaftar."
      />

      <section className="section">
        <div className="wrap two-col">
          <form className="panel" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="nama">Nama</label>
              <input
                id="nama"
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="jurusan">Jurusan</label>
              <select
                id="jurusan"
                name="jurusan"
                value={form.jurusan}
                onChange={handleChange}
                required
              >
                <option value="">Pilih jurusan</option>
                {JURUSAN.map((j) => (
                  <option key={j.nama} value={j.nama}>
                    {j.nama}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="field">
              <legend>Jenis Kelamin</legend>
              <div className="options">
                {GENDER.map((g) => (
                  <label key={g} className="option">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={form.gender === g}
                      onChange={handleChange}
                      required
                    />
                    {g}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="field">
              <legend>Hobi</legend>
              <div className="options">
                {HOBI.map((h) => (
                  <label key={h} className="option">
                    <input
                      type="checkbox"
                      value={h}
                      checked={form.hobi.includes(h)}
                      onChange={handleHobi}
                    />
                    {h}
                  </label>
                ))}
              </div>
            </fieldset>

            <button type="submit" className="btn btn-block">
              Daftar
            </button>
          </form>

          <aside className="panel">
            <Suspense fallback={<p className="loading">Memuat data...</p>}>
              <LazyDataPreview data={form} />
            </Suspense>
          </aside>
        </div>
      </section>
    </>
  );
}

function Contact() {
  const [pesan, setPesan] = useState(INITIAL_PESAN);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPesan((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Pesan:", pesan);
    alert("Pesan terkirim!");
    setPesan(INITIAL_PESAN);
  };

  return (
    <>
      <PageHeader
        title="Hubungi Kami"
        subtitle="Ada pertanyaan? Kirim pesan atau hubungi kontak di bawah."
      />

      <section className="section">
        <div className="wrap two-col">
          <form className="panel" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="c-nama">Nama</label>
              <input
                id="c-nama"
                type="text"
                name="nama"
                value={pesan.nama}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="c-email">Email</label>
              <input
                id="c-email"
                type="email"
                name="email"
                value={pesan.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="c-isi">Pesan</label>
              <textarea
                id="c-isi"
                name="isi"
                value={pesan.isi}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-block">
              Kirim pesan
            </button>
          </form>

          <aside className="panel">
            <h3>Informasi Kontak</h3>
            <dl className="contact-list">
              <dt>Email</dt>
              <dd>{SITE.email}</dd>
              <dt>Telepon</dt>
              <dd>{SITE.phone}</dd>
              <dt>Alamat</dt>
              <dd>{SITE.address}</dd>
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}

function NotFound() {
  return (
    <>
      <PageHeader title="Halaman tidak ditemukan" />
      <section className="section">
        <div className="wrap">
          <p>
            Alamat yang Anda buka tidak ada.{" "}
            <Link to="/">Kembali ke Home</Link>
          </p>
        </div>
      </section>
    </>
  );
}

/* =========================================================
   LAZY (komponen berada di file yang sama)
   ========================================================= */
const LazyDataPreview = lazy(() => Promise.resolve({ default: DataPreview }));
const LazyHome = lazy(() => Promise.resolve({ default: Home }));
const LazyAbout = lazy(() => Promise.resolve({ default: About }));
const LazyPMB = lazy(() => Promise.resolve({ default: PMB }));
const LazyContact = lazy(() => Promise.resolve({ default: Contact }));

/* =========================================================
   LAYOUT: NAVBAR + KONTEN + FOOTER
   ========================================================= */
function Navbar() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="wrap nav-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          {SITE.name}
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Buka menu"
          aria-expanded={open}
          aria-controls="menu-utama"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="menu-utama"
          className={open ? "nav-menu open" : "nav-menu"}
          aria-label="Menu utama"
        >
          {SITE.menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.to === "/"}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <strong>{SITE.name}</strong>
          <p>{SITE.tagline}</p>
        </div>

        <div>
          <strong>Menu</strong>
          <ul>
            {SITE.menu.map((m) => (
              <li key={m.to}>
                <Link to={m.to}>{m.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <strong>Kontak</strong>
          <ul>
            <li>{SITE.email}</li>
            <li>{SITE.phone}</li>
          </ul>
        </div>
      </div>

      <div className="wrap copyright">
        &copy; {new Date().getFullYear()} {SITE.name}. Semua hak dilindungi.
      </div>
    </footer>
  );
}

function Layout() {
  return (
    <div className="site">
      <Navbar />
      <main className="site-main">
        <Suspense fallback={<p className="loading">Memuat halaman...</p>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

/* =========================================================
   APP (ROUTER)
   ========================================================= */
function App() {
  return (
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
  );
}

export default App;