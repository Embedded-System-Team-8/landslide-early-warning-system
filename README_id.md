# 🏔️ Sistem Peringatan Dini Tanah Longsor

<div align="center">

**Bahasa:** [🇺🇸 English](README.md) | [🇮🇩 Bahasa Indonesia](README_id.md)

</div>

<div align="center">

![Landslide Warning System Banner](https://via.placeholder.com/800x200/2563eb/ffffff?text=Sistem+Peringatan+Dini+Tanah+Longsor)

**Sistem peringatan dini berbasis IoT untuk mendeteksi dan memprediksi risiko tanah longsor menggunakan pemantauan sensor canggih dan analisis data real-time.**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PlatformIO](https://img.shields.io/badge/platform-ESP32-brightgreen.svg)](https://platformio.org/)
[![Firebase](https://img.shields.io/badge/database-Firebase-orange.svg)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/frontend-React-61dafb.svg)](https://reactjs.org/)

</div>

## 📖 Deskripsi

Sistem Peringatan Dini Tanah Longsor adalah solusi IoT komprehensif yang dirancang untuk memantau kondisi lingkungan yang dapat menyebabkan tanah longsor. Sistem ini menggunakan berbagai sensor untuk mengumpulkan data real-time tentang getaran tanah, kelembaban tanah, dan tingkat curah hujan. Data ini diproses menggunakan algoritma canggih untuk menilai risiko tanah longsor dan secara otomatis mengingatkan otoritas dan penduduk melalui berbagai saluran komunikasi.

**Dikembangkan oleh mahasiswa Teknik Informatika dari Institut Teknologi Sumatera (ITERA) sebagai bagian dari proyek akhir Embedded System pada tahun 2025.**

### Fitur Utama

-   🔍 **Pemantauan Real-time**: Pengumpulan dan analisis data sensor berkelanjutan
-   ⚡ **Integrasi Multi-sensor**: MPU6050 accelerometer/gyroscope, sensor getaran SW-420, sensor kelembaban tanah, dan sensor hujan
-   🌐 **Dashboard Web**: Interface modern berbasis React untuk visualisasi data
-   📱 **Peringatan Telegram**: Notifikasi instan untuk situasi darurat
-   📊 **Analitik Data**: Penyimpanan data historis dan analisis tren
-   🤖 **Machine Learning**: Algoritma penilaian risiko cerdas
-   🔔 **Peringatan Multi-level**: Status Aman (Safe), Awas (Watch), Waspada (Alert)

## 🛠️ Kebutuhan Hardware

### Komponen Utama

| Komponen                    | Model/Tipe            | Jumlah | Tujuan                             |
| --------------------------- | --------------------- | ------ | ---------------------------------- |
| **Microcontroller**         | ESP32 DevKit v1       | 1      | Unit pemrosesan utama              |
| **Expansion Board**         | ESP32 Expansion Board | 1      | Memudahkan prototyping dan koneksi |
| **Accelerometer/Gyroscope** | MPU6050               | 1      | Deteksi pergerakan tanah           |
| **Sensor Getaran**          | SW-420                | 1      | Deteksi getaran dan guncangan      |
| **Sensor Kelembaban Tanah** | Kapasitif/Resistif    | 1      | Pemantauan saturasi tanah          |
| **Sensor Hujan**            | YL-83 atau serupa     | 1      | Deteksi curah hujan                |
| **LCD Display**             | 16x2 I2C LCD          | 1      | Tampilan status lokal              |
| **Motor Servo**             | SG90                  | 2      | Aktuator mekanisme peringatan      |
| **Buzzer**                  | Active buzzer         | 1      | Alarm audio                        |

### Komponen Ekspansi yang Direkomendasikan

| Komponen               | Model/Tipe     | Tujuan                 |
| ---------------------- | -------------- | ---------------------- |
| **Modul GSM**          | SIM800L        | Backup peringatan SMS  |
| **Panel Surya**        | Panel Surya 5V | Backup daya            |
| **Baterai**            | 18650 Li-ion   | Operasi tanpa gangguan |
| **Casing Tahan Cuaca** | IP65 rated     | Perlindungan outdoor   |
| **Sensor Suhu**        | DS18B20        | Pemantauan lingkungan  |

### Koneksi Kabel

```
Layout Pin ESP32 (menggunakan Expansion Board):
├── GPIO 21 (SDA) → MPU6050 SDA, LCD SDA
├── GPIO 22 (SCL) → MPU6050 SCL, LCD SCL
├── GPIO 35 → Sensor Hujan (Analog)
├── GPIO 33 → Sensor Kelembaban Tanah (Analog)
├── GPIO 32 → Sensor Getaran SW-420 (Digital)
├── GPIO 18 → Sinyal Motor Servo 1
├── GPIO 19 → Sinyal Motor Servo 2
├── GPIO 23 → Buzzer
├── 3.3V → VCC Sensor (MPU6050, SW-420)
├── 5V   → Motor Servo, LCD VCC
└── GND  → Ground Bersama (Semua komponen)
```

## 💻 Kebutuhan Software

### Lingkungan Pengembangan

-   **PlatformIO**: Platform pengembangan IoT
-   **Visual Studio Code**: IDE yang direkomendasikan
-   **Git**: Version control

### Kebutuhan Backend

-   **Python**: 3.8 atau lebih tinggi
-   **Firebase Admin SDK**: Database cloud
-   **APScheduler**: Penjadwalan tugas
-   **python-telegram-bot**: Integrasi Telegram

### Kebutuhan Frontend

-   **Bun**: JavaScript runtime dan package manager
-   **React**: 18.x
-   **TypeScript**: 5.x
-   **Vite**: Build tool
-   **Tailwind CSS**: Framework styling
-   **Radix UI**: Library komponen

### Layanan Cloud

-   **Firebase Realtime Database**: Penyimpanan data real-time
-   **Firebase Firestore**: Penyimpanan data historis
-   **Telegram Bot API**: Notifikasi peringatan

## 🔧 Instalasi Hardware

### 1. Perakitan Sirkuit

1. **Persiapkan ESP32**: Pastikan ESP32 DevKit v1 Anda berfungsi
2. **Hubungkan Sensor**:
    ```
    MPU6050:  VCC→3.3V, GND→GND, SDA→GPIO21, SCL→GPIO22
    SW-420:   VCC→3.3V, GND→GND, DO→GPIO32
    Hujan:    VCC→3.3V, GND→GND, AO→GPIO35
    Tanah:    VCC→3.3V, GND→GND, AO→GPIO33
    LCD:      VCC→5V,   GND→GND, SDA→GPIO21, SCL→GPIO22
    ```
3. **Hubungkan Aktuator**:
    ```
    Servo 1:  VCC→5V, GND→GND, Signal→GPIO18
    Servo 2:  VCC→5V, GND→GND, Signal→GPIO19
    Buzzer:   VCC→3.3V, GND→GND, Signal→GPIO23
    ```

### 2. Kalibrasi Sensor

1. **Kelembaban Tanah**: Tempatkan di tanah kering, catat pembacaan; tempatkan di tanah basah, catat pembacaan
2. **Sensor Hujan**: Tes dengan tetes air untuk memverifikasi sensitivitas
3. **MPU6050**: Pastikan pemasangan datar dan stabil untuk pembacaan akurat
4. **SW-420**: Tes sensitivitas getaran dan sesuaikan potensiometer jika diperlukan

### 3. Setup Casing

1. Pasang semua komponen dalam casing tahan cuaca
2. Pastikan sensor dapat mengakses kondisi lingkungan
3. Sediakan ventilasi yang memadai untuk elektronik
4. Amankan semua koneksi untuk mencegah masuknya kelembaban

## 💾 Instalasi Software

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/landslide-early-warning-system.git
cd landslide-early-warning-system
```

### 2. Setup Firmware ESP32

#### Prasyarat

```bash
# Install PlatformIO CLI
pip install platformio

# Atau install ekstensi PlatformIO IDE di VS Code
```

#### Konfigurasi

1. **Copy template konfigurasi**:

    ```bash
    cd esp32/include
    cp config.h.example config.h
    ```

2. **Update kredensial** di `esp32/include/config.h`:

    ```cpp
    // Konfigurasi WiFi
    const char* WIFI_SSID = "NAMA_WIFI_ANDA";
    const char* WIFI_PASSWORD = "PASSWORD_WIFI_ANDA";

    // Konfigurasi Firebase
    const char* FIREBASE_HOST = "https://proyek-anda-default-rtdb.region.firebasedatabase.app";
    const char* FIREBASE_AUTH = "token_auth_firebase_anda";

    // Konfigurasi Telegram
    const char* TELEGRAM_BOT_TOKEN = "token_bot_telegram_anda";
    const char* TELEGRAM_CHAT_ID = "id_chat_telegram_anda";
    ```

#### Build dan Upload

```bash
cd esp32
pio run --target upload
pio device monitor
```

### 3. Setup Backend

#### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Konfigurasi Firebase

1. Buat proyek Firebase di [Firebase Console](https://console.firebase.google.com/)
2. Download `serviceAccountKey.json` dan tempatkan di direktori `backend/`
3. **Copy dan konfigurasi environment variables**:
    ```bash
    cp .env.example .env
    # Edit .env dengan kredensial Firebase Anda yang sebenarnya
    ```

#### Jalankan Backend

```bash
python index.py
```

Atau gunakan file batch yang disediakan:

```bash
start_backend.bat
```

### 4. Setup Frontend

#### Install Bun (jika belum terinstall)

```bash
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Atau download dari https://bun.sh/
```

#### Install Dependencies dan Jalankan

```bash
cd website
bun install
bun run dev
```

Atau gunakan file batch yang disediakan:

```bash
start_frontend.bat
```

### 5. Konfigurasi Telegram Bot (Opsional)

1. Buat bot via [@BotFather](https://t.me/botfather)
2. Dapatkan token bot dan update `backend/telegram_bot.py`
3. Tambahkan ID chat yang diotorisasi untuk penerima peringatan

## 🚀 Penggunaan

### Startup Sistem

1. **Nyalakan ESP32**: Perangkat akan terhubung ke WiFi dan menginisialisasi sensor
2. **Jalankan Backend**: Jalankan backend Python untuk menangani pemrosesan data
3. **Luncurkan Dashboard**: Akses interface web di `http://localhost:5173`

### Interface Pemantauan

-   **Dashboard Real-time**: Lihat pembacaan sensor langsung dan status sistem
-   **Level Peringatan**:
    -   🟢 **Aman (Safe)**: Kondisi normal
    -   🟡 **Awas (Watch)**: Risiko meningkat, pantau dengan seksama
    -   🔴 **Waspada (Alert)**: Risiko tinggi, tindakan segera diperlukan

### Simulasi Data (Testing)

```bash
cd scripts
pip install -r requirements.txt

# Test semua level risiko
python simulate_data.py --mode test

# Simulasi peringatan berkelanjutan
python simulate_data.py --risk waspada --mode continuous --duration 300
```

## 🤝 Kontributor

**Mahasiswa Teknik Informatika - Angkatan 2022**  
**Institut Teknologi Sumatera (ITERA)**

| NIM           | Nama                           | Peran                             | Spesialisasi                         |
| ------------- | ------------------------------ | --------------------------------- | ------------------------------------ |
| **122140122** | **Alfajar**                    | Project Lead & System Integration | Integrasi Hardware-Software          |
| **122140155** | **Rustian Afencius Marbun**    | Hardware Engineer                 | Implementasi Sensor & Desain Sirkuit |
| **122140141** | **Joshua Palti Sinaga**        | Frontend Developer                | Dashboard React & UI/UX              |
| **122140137** | **Ikhsannudin Lathief**        | Backend Developer                 | Integrasi Firebase & Pemrosesan Data |
| **122140189** | **Muhammad Ghiffari Iskandar** | Firmware Developer                | Pemrograman ESP32 & Komunikasi IoT   |

## 📁 Struktur Proyek

```
landslide-early-warning-system/
├── 📁 esp32/                    # Firmware ESP32
│   ├── 📁 src/                  # Source code
│   ├── 📁 include/              # Header files
│   ├── 📁 lib/                  # Custom libraries
│   └── platformio.ini           # Konfigurasi PlatformIO
├── 📁 backend/                  # Backend Python
│   ├── index.py                 # Server utama
│   ├── firebase_config.py       # Konfigurasi database
│   ├── telegram_bot.py          # Integrasi Telegram
│   └── requirements.txt         # Dependencies Python
├── 📁 website/                  # Frontend React
│   ├── 📁 src/                  # Source code
│   ├── 📁 components/           # Komponen React
│   └── package.json             # Dependencies Node.js
├── 📁 scripts/                  # Utility scripts
│   └── simulate_data.py         # Simulasi data
├── start_backend.bat            # Script startup backend
├── start_frontend.bat           # Script startup frontend
└── README.md                    # File ini
```

## 🔧 Konfigurasi

### Setup Environment Variables

**⚠️ PENTING: Semua kredensial sekarang disimpan dalam environment variables untuk keamanan. Jangan pernah commit kredensial asli ke version control.**

#### 1. Konfigurasi Backend

1. **Copy template environment**:

    ```bash
    cd backend
    cp .env.example .env
    ```

2. **Edit file `.env`** dengan kredensial Anda yang sebenarnya:

    ```env
    # Konfigurasi Firebase
    FIREBASE_API_KEY=api_key_anda_yang_sebenarnya
    FIREBASE_AUTH_DOMAIN=proyek-anda.firebaseapp.com
    FIREBASE_DATABASE_URL=https://proyek-anda-default-rtdb.region.firebasedatabase.app
    FIREBASE_PROJECT_ID=id-proyek-anda
    FIREBASE_STORAGE_BUCKET=proyek-anda.firebasestorage.app
    FIREBASE_MESSAGING_SENDER_ID=sender_id_anda
    FIREBASE_APP_ID=app_id_anda
    FIREBASE_MEASUREMENT_ID=measurement_id_anda

    # Konfigurasi Telegram Bot
    TELEGRAM_BOT_TOKEN=token_bot_telegram_anda
    TELEGRAM_CHAT_ID=id_chat_telegram_anda
    ```

#### 2. Konfigurasi Frontend

1. **Copy template environment**:

    ```bash
    cd website
    cp .env.example .env
    ```

2. **Edit file `.env`** dengan kredensial Firebase Anda:
    ```env
    # Semua variabel harus memiliki prefix VITE_ untuk Vite
    VITE_FIREBASE_API_KEY=api_key_anda_yang_sebenarnya
    VITE_FIREBASE_AUTH_DOMAIN=proyek-anda.firebaseapp.com
    VITE_FIREBASE_DATABASE_URL=https://proyek-anda-default-rtdb.region.firebasedatabase.app
    VITE_FIREBASE_PROJECT_ID=id-proyek-anda
    VITE_FIREBASE_STORAGE_BUCKET=proyek-anda.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=sender_id_anda
    VITE_FIREBASE_APP_ID=app_id_anda
    VITE_FIREBASE_MEASUREMENT_ID=measurement_id_anda
    ```

#### 3. Konfigurasi ESP32

1. **Copy template konfigurasi**:

    ```bash
    cd esp32/include
    cp config.h.example config.h
    ```

2. **Edit file `config.h`** dengan kredensial Anda:

    ```cpp
    // Konfigurasi WiFi
    const char* WIFI_SSID = "Nama_WiFi_Anda";
    const char* WIFI_PASSWORD = "Password_WiFi_Anda";

    // Konfigurasi Firebase
    const char* FIREBASE_HOST = "https://proyek-anda-default-rtdb.region.firebasedatabase.app";
    const char* FIREBASE_AUTH = "token_auth_firebase_anda";

    // Konfigurasi Telegram
    const char* TELEGRAM_BOT_TOKEN = "token_bot_telegram_anda";
    const char* TELEGRAM_CHAT_ID = "id_chat_telegram_anda";
    ```

### Mendapatkan Kredensial Anda

#### Setup Firebase

1. Kunjungi [Firebase Console](https://console.firebase.google.com/)
2. Buat proyek baru atau pilih yang sudah ada
3. Pergi ke **Project Settings** → **General** → **Your apps**
4. Tambahkan web app dan copy nilai konfigurasi
5. Pergi ke **Project Settings** → **Service accounts**
6. Generate private key baru dan download `serviceAccountKey.json`
7. Tempatkan `serviceAccountKey.json` di direktori `backend/`

#### Setup Telegram Bot

1. Kirim pesan ke [@BotFather](https://t.me/botfather) di Telegram
2. Buat bot baru dengan perintah `/newbot`
3. Simpan token bot yang diberikan
4. Dapatkan chat ID Anda dengan mengirim pesan ke [@userinfobot](https://t.me/userinfobot)

### Threshold Sensor

Modifikasi threshold di `esp32/src/logic.cpp`:

```cpp
// Threshold penilaian risiko
#define VIBRATION_THRESHOLD_LOW 0.5
#define VIBRATION_THRESHOLD_HIGH 1.0
#define SOIL_MOISTURE_THRESHOLD 70
#define RAIN_THRESHOLD 500
```

## 🐛 Pemecahan Masalah

### Masalah Umum

1. **ESP32 tidak dapat terhubung ke WiFi**

    - Periksa kredensial WiFi dalam kode
    - Pastikan jaringan 2.4GHz (ESP32 tidak mendukung 5GHz)
    - Verifikasi kekuatan sinyal

2. **Pembacaan sensor tidak akurat**

    - Periksa koneksi kabel
    - Verifikasi supply daya (persyaratan 3.3V/5V)
    - Kalibrasi ulang sensor

3. **Masalah koneksi Firebase**

    - Verifikasi service account key
    - Periksa pengaturan proyek Firebase
    - Pastikan konektivitas jaringan yang tepat
    - **Periksa environment variables dimuat dengan benar**

4. **Frontend tidak memuat**

    - Periksa apakah backend berjalan
    - Verifikasi instalasi Bun
    - Hapus cache browser
    - **Pastikan file `.env` ada dengan prefix VITE\_**

5. **Masalah environment variable**
    - Verifikasi file `.env` ada di direktori yang benar
    - Periksa typo dalam nama variabel
    - Pastikan tidak ada spasi di sekitar `=` dalam file `.env`
    - Restart aplikasi setelah mengubah file `.env`
    - **Backend**: Variabel dimuat dengan `python-dotenv`
    - **Frontend**: Variabel harus memiliki prefix `VITE_`
    - **ESP32**: Copy `config.h.example` ke `config.h`

## 📊 Dokumentasi API

### Endpoint ESP32

-   **Data Real-time**: Path Firebase Realtime Database `/sensor_data`
-   **Data Historis**: Koleksi Firestore `sensor_history`
-   **Status Peringatan**: Path Firebase `/alert_status`

### Format Data

```json
{
    "timestamp": "2025-06-24T10:30:00Z",
    "sensors": {
        "vibration": 0.3,
        "soil_moisture": 45.2,
        "rain": 123.4,
        "temperature": 25.6
    },
    "risk_level": "aman",
    "location": {
        "latitude": -6.2088,
        "longitude": 106.8456
    }
}
```

## 🔒 Pertimbangan Keamanan

-   **Environment Variables**: Semua kredensial sensitif disimpan dalam file `.env` (jangan pernah commit ini ke git)
-   **Firebase Rules**: Implementasikan izin baca/tulis yang tepat di Firebase Console
-   **API Keys**: Jaga keamanan API key dan rotasi secara berkala
-   **Keamanan Jaringan**: Gunakan HTTPS untuk semua komunikasi
-   **Autentikasi Perangkat**: Implementasikan token khusus perangkat untuk ESP32
-   **Gitignore**: Pastikan semua file kredensial ada di `.gitignore`
-   **Kontrol Akses**: Batasi akses Telegram bot hanya untuk pengguna yang diotorisasi

### Checklist Keamanan File

-   [ ] File `.env` ada di `.gitignore`
-   [ ] `config.h` ada di `.gitignore`
-   [ ] `serviceAccountKey.json` ada di `.gitignore`
-   [ ] File contoh (`.env.example`, `config.h.example`) tidak berisi kredensial asli

## 📈 Pengembangan Masa Depan

-   [ ] Model machine learning untuk analitik prediktif
-   [ ] Aplikasi mobile untuk iOS dan Android
-   [ ] Integrasi dengan sistem peringatan pemerintah
-   [ ] Dukungan multi-bahasa
-   [ ] Visualisasi dan pelaporan data lanjutan
-   [ ] Integrasi stasiun cuaca
-   [ ] Analisis citra satelit

## 📜 Lisensi

Proyek ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 🙏 Ucapan Terima Kasih

-   Terima kasih kepada komunitas Arduino dan ESP32 atas dokumentasi yang luar biasa
-   Tim Firebase untuk infrastruktur cloud yang robust
-   Kontributor open source untuk library sensor
-   Otoritas lokal untuk panduan manajemen bencana

## 📞 Dukungan

Untuk dukungan dan pertanyaan:

-   📧 Email: support@landslide-warning.com
-   💬 Discord: [Bergabung dengan komunitas kami](https://discord.gg/landslide-warning)
-   📖 Wiki: [Project Wiki](https://github.com/yourusername/landslide-early-warning-system/wiki)
-   🐛 Issues: [GitHub Issues](https://github.com/yourusername/landslide-early-warning-system/issues)

---

<div align="center">

**Dibuat dengan ❤️ untuk komunitas yang lebih aman**

[⭐ Star repository ini](https://github.com/yourusername/landslide-early-warning-system) jika Anda merasa terbantu!

</div>
