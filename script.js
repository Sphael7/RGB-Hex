// Menginisialisasi variabel global untuk elemen DOM dan status aplikasi
const hexInput = document.getElementById('hexInput');
const rSlider = document.getElementById('rSlider');
const gSlider = document.getElementById('gSlider');
const bSlider = document.getElementById('bSlider');
const aSlider = document.getElementById('aSlider');

// Menampilkan nilai slider secara real-time
const rValue = document.getElementById('rValue');
const gValue = document.getElementById('gValue');
const bValue = document.getElementById('bValue');
const aValue = document.getElementById('aValue');

const colorPicker = document.getElementById('colorPicker');
const colorPreviewBox = document.getElementById('colorPreviewBox');
const rgbaCombinedOutput = document.getElementById('rgbaCombinedOutput'); // Untuk clipboard.js
const colorMeaningText = document.getElementById('colorMeaning');

// randomizerBtn dan randomizerBtnSlider dihapus

const copyHexBtn = document.getElementById('copyHexBtn');
const copyRgbaBtn = document.getElementById('copyRgbaBtn');
const savePresetBtn = document.getElementById('savePresetBtn');
const rainbowModeBtn = document.getElementById('rainbowModeBtn');

// Tombol dan elemen untuk Input View Modes
const showHexPickerBtn = document.getElementById('showHexPickerBtn');
const showRgbaSlidersBtn = document.getElementById('showRgbaSlidersBtn');
const hexPickerInputSection = document.getElementById('hexPickerInputSection');
const rgbaSlidersInputSection = document.getElementById('rgbaSlidersInputSection');

// Tombol dan elemen Hamburger Menu
const hamburgerMenuBtn = document.getElementById('hamburgerMenuBtn');
const sideMenu = document.getElementById('sideMenu');
const closeSideMenuBtn = document.getElementById('closeSideMenuBtn');
const sideMenuOverlay = document.getElementById('sideMenuOverlay'); // Ambil elemen overlay
const viewPresetsBtnSide = document.getElementById('viewPresetsBtnSide');
const moodBoardBtnSide = document.getElementById('moodBoardBtnSide');
const exportPresetsBtnSide = document.getElementById('exportPresetsBtnSide');
// Tombol ekspor di footer (untuk desktop)
const exportPresetsBtnFooter = document.getElementById('exportPresetsBtnFooter');


// Modals
const messageModal = document.getElementById('messageModal');
const messageText = document.getElementById('messageText');
const closeMessageModal = document.getElementById('closeMessageModal');

const presetsModal = document.getElementById('presetsModal');
const savedPresetsContainer = document.getElementById('savedPresetsContainer');
const closePresetsModal = document.getElementById('closePresetsModal');

const moodBoardModal = document.getElementById('moodBoardModal');
const moodBoardColors = document.getElementById('moodBoardColors');
const closeMoodBoardModal = document.getElementById('closeMoodBoardModal');

const fullScreenPreviewModal = document.getElementById('fullScreenPreviewModal');
const closeFullScreenPreviewModal = document.getElementById('closeFullScreenPreviewModal');

// Elemen untuk Modal Konfirmasi Kustom
const confirmModal = document.getElementById('confirmModal');
const confirmMessageText = document.getElementById('confirmMessageText');
const closeConfirmModal = document.getElementById('closeConfirmModal');
const confirmYesBtn = document.getElementById('confirmYesBtn');
const confirmNoBtn = document.getElementById('confirmNoBtn');


// Variabel state aplikasi
let currentColor = { r: 106, g: 13, b: 173, a: 1, format: 'rgba' }; // Default color: #6a0dad
let savedColors = []; // Array untuk menyimpan preset warna
let rainbowInterval = null; // Untuk mengontrol mode pelangi
let isRainbowModeActive = false; // Status mode pelangi
let isDarkMode = false; // Status tema gelap/terang

// --- PENTING: BASE_PATH Disesuaikan untuk domain root (rgb-hex-bay.vercel.app) ---
// Karena URL Anda adalah rgb-hex-bay.vercel.app, BASE_PATH harus '/'
const BASE_PATH = '/';
// PASTIKAN ADA GARIS MIRING (/) DI AWAL DAN AKHIR JALUR!


// Inisialisasi suara menggunakan howler.js
// Base64 encoded WAV file for a simple beep sound
const BEEP_SOUND_BASE64 = 'data:audio/wav;base64,UklGRmUAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAEcAAFAAEAABEAQAEAEAEAEAEAAAEAAAEAABAAAAEAAAQAAAAAAAQABA' +
                         'AAAAAQABAFAAEAABAAABAAAAQAAAFAAEAAEAAAEAAAAAAABAAAEAAABAAAAAAAgAAAAAAAAAAAAAAAUAAAACAAAAAQAAABQAABAFAAEAAEAAAEAAAgAAAAA' +
                         'AAAAABQAAAAIAAAABAAAAFAAAEAEAAAEAAAEAAAEAAAAAAABAAAAAQAAAAAAAABAAAAAAACAAAAAAQABAFAAEAABAAABAAAAAQAAAEAAAgAAAAAABQABAAAA' +
                         'AQAAABAAAAAQAAABQABAAAAAQAAABAAAEAAAgAAAAAABAAAAAQAAAAAAAABAAAAAAACAAAAAAQABAFAAEAABAAABAAAAAQAAAEAAAgAAAAAABQABAAAAAQAA' +
                         'ABAAAAAQAAABQABAAAAAQAAABAAAEAAAgAAAAAABAAAAAQAAAAAAAABAAAAAAACAAAAAAQABAFAAEAABAAABAAAAAQAAAEAAAgAAAAAABQABAAAAAQAAABAA' +
                         'AAQAAABQABAAAAAQAAABAAAEAAAgAAAAAABAAAAAQAAAAAAAABAAAAAAACAAAAAAQABAFAAEAABAAABAAAAAQAAAEAAAgAAAAAABQABAAAAAQAAABAAAAAQAAAB' +
                         'QABAAAAAQAAABAAAEAAAgAAAAAABAAAAAQAAAAAAAABAAAAAAACAAAAAAQABAFAAEAABAAABAAAAAQAAAEAAAgAAAAAABQABAAAAAQAAABAAAAAQAAABQABAAAA' +
                         'AQAAABAAAEAAAgAAAAAABAAAAAQAAAAAAAABAAAAAAACAAAAAAQABAFAAEAABAAABAAAAAQAAAEAAAgAAAAAABQABA';

const colorSound = new Howl({
    src: [BEEP_SOUND_BASE64],
    format: ['wav'],
    html5: true,
    volume: 0.1
});

// --- Fungsi Utilitas Warna Tanpa tinycolor ---

/**
 * Mengonversi komponen RGB menjadi nilai HEX (misal: 255, 0, 128 -> FF0080).
 * @param {number} c - Komponen warna (R, G, atau B).
 * @returns {string} - Nilai HEX dua digit.
 */
function toHex(c) {
    const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Mengonversi objek RGBA menjadi string HEX.
 * @param {object} rgba - Objek {r, g, b, a}.
 * @returns {string} - String HEX (#RRGGBB).
 */
function rgbaToHex({ r, g, b }) {
    return "#" + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Mengonversi string HEX menjadi objek RGBA.
 * @param {string} hex - String HEX (#RRGGBB atau RRGGBB).
 * @returns {object|null} - Objek {r, g, b, a} atau null jika tidak valid.
 */
function hexToRgba(hex) {
    if (!hex || typeof hex !== 'string') return null;
    hex = hex.startsWith('#') ? hex.slice(1) : hex;

    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return null;

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const a = 1; // Alpha default ke 1

    return { r, g, b, a };
}

/**
 * Mengonversi objek RGBA menjadi string RGBA.
 * @param {object} rgba - Objek {r, g, b, a}.
 * @returns {string} - String RGBA (rgba(r, g, b, a)).
 */
function rgbaToString({ r, g, b, a }) {
    // Memastikan alpha hanya memiliki 2 angka di belakang koma untuk konsistensi
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(2)})`;
}

/**
 * Mengonversi RGB ke HSL.
 * @param {number} r, g, b - Nilai komponen warna (0-255).
 * @returns {object} - Objek {h, s, l} (h: 0-360, s,l: 0-1).
 */
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s, l: l };
}

/**
 * Mengonversi HSL ke RGB.
 * @param {number} h, s, l - Nilai komponen HSL (h: 0-360, s,l: 0-1).
 * @returns {object} - Objek {r, g, b} (0-255).
 */
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        h /= 360; // Ubah h dari 0-360 ke 0-1
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

/**
 * Menghitung luminance (kecerahan) warna.
 * Digunakan untuk menentukan apakah warna terang atau gelap.
 * @param {object} rgba - Objek {r, g, b, a}.
 * @returns {number} - Nilai luminance (0-255).
 */
function getLuminance({ r, g, b }) {
    // Rumus luminance (perceived brightness)
    return (0.299 * r + 0.587 * g + 0.114 * b);
}

/**
 * Mendapatkan nilai hue dari objek RGBA.
 * @param {object} rgba - Objek {r, g, b, a}.
 * @returns {number} - Nilai hue (0-360).
 */
function getHueFromRgba({ r, g, b }) {
    const hsl = rgbToHsl(r, g, b);
    return hsl.h;
}

// --- Akhir Fungsi Utilitas Warna ---


/**
 * Memperbarui tampilan UI (input HEX, RGBA, color picker, preview box)
 * berdasarkan warna baru yang diberikan.
 * @param {string|object} colorInput - Warna dalam format HEX string (#RRGGBB) atau objek RGBA {r, g, b, a}.
 * @param {boolean} [silent=false] - Jika true, tidak akan memutar suara atau menampilkan pesan.
 */
function updateColor(colorInput, silent = false) {
    let rgbaObj = {};
    let hexString = '';

    if (typeof colorInput === 'string') { // Jika input adalah string (HEX atau RGBA string)
        if (colorInput.startsWith('#')) { // Jika HEX
            rgbaObj = hexToRgba(colorInput);
            if (!rgbaObj) { // Jika HEX tidak valid
                if (!silent) showMessage('Format HEX tidak valid. Gunakan #RRGGBB.', 'error');
                return;
            }
            hexString = colorInput;
        } else if (colorInput.startsWith('rgba')) { // Jika RGBA string
            const parts = colorInput.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
            if (!parts) {
                if (!silent) showMessage('Format RGBA tidak valid. Gunakan rgba(r,g,b,a).', 'error');
                return;
            }
            rgbaObj = {
                r: parseInt(parts[1]),
                g: parseInt(parts[2]),
                b: parseInt(parts[3]),
                a: parts[4] ? parseFloat(parts[4]) : 1
            };
            // Pastikan nilai di rentang yang benar
            rgbaObj.r = Math.max(0, Math.min(255, rgbaObj.r));
            rgbaObj.g = Math.max(0, Math.min(255, rgbaObj.g));
            rgbaObj.b = Math.max(0, Math.min(255, rgbaObj.b));
            rgbaObj.a = Math.max(0, Math.min(1, rgbaObj.a));
            hexString = rgbaToHex(rgbaObj);
        } else { // Coba sebagai HEX tanpa #
            rgbaObj = hexToRgba('#' + colorInput);
            if (!rgbaObj) {
                if (!silent) showMessage('Warna tidak valid. Masukkan format HEX (#RRGGBB) atau RGBA (0-255) yang benar.', 'error');
                return;
            }
            hexString = '#' + colorInput;
        }
    } else if (typeof colorInput === 'object' && colorInput.r !== undefined) { // Jika input adalah objek RGBA
        rgbaObj = { ...colorInput };
        // Pastikan nilai di rentang yang benar
        rgbaObj.r = Math.max(0, Math.min(255, rgbaObj.r));
        rgbaObj.g = Math.max(0, Math.min(255, rgbaObj.g));
        rgbaObj.b = Math.max(0, Math.min(255, rgbaObj.b));
        rgbaObj.a = Math.max(0, Math.min(1, rgbaObj.a));
        hexString = rgbaToHex(rgbaObj);
    } else {
        if (!silent) showMessage('Input warna tidak dikenali.', 'error');
        return;
    }

    currentColor = rgbaObj; // Perbarui variabel warna saat ini
    const rgbaString = rgbaToString(currentColor);

    // Perbarui input HEX, RGBA slider, dan color picker
    hexInput.value = hexString;
    colorPicker.value = hexString; // Color picker hanya menerima HEX

    rSlider.value = currentColor.r;
    gSlider.value = currentColor.g;
    bSlider.value = currentColor.b;
    aSlider.value = currentColor.a.toFixed(2); // Bulatkan alpha ke 2 desimal

    rValue.textContent = Math.round(currentColor.r);
    gValue.textContent = Math.round(currentColor.g);
    bValue.textContent = Math.round(currentColor.b);
    aValue.textContent = currentColor.a.toFixed(2);

    // Perbarui kotak preview warna
    colorPreviewBox.style.backgroundColor = rgbaString;
    rgbaCombinedOutput.value = rgbaString; // Update nilai tersembunyi untuk copy RGBA

    // Panggil fitur tambahan
    updateAutoMode();
    updateColorMeaning();
    if (!silent) playColorSound();
}

/**
 * Menampilkan pesan singkat di modal notifikasi.
 * @param {string} message - Teks pesan.
 * @param {string} type - Tipe pesan (misal: 'success', 'error', 'info').
 */
function showMessage(message, type = 'info') {
    messageText.textContent = message;
    messageText.className = ''; // Hapus kelas sebelumnya
    messageText.classList.add(type); // Tambahkan kelas untuk styling
    messageModal.classList.add('show');

    // Sembunyikan pesan setelah beberapa detik
    setTimeout(() => {
        messageModal.classList.remove('show');
    }, 3000);
}

/**
 * Memutar suara efek warna.
 */
function playColorSound() {
    // Hanya mainkan jika howler sudah dimuat dan objek suara sudah siap
    if (typeof Howl !== 'undefined' && colorSound && colorSound.state() === 'loaded' && !colorSound.playing()) {
        colorSound.play();
    } else if (typeof Howl !== 'undefined' && colorSound && colorSound.state() === 'unloaded') {
        colorSound.load();
        colorSound.once('load', () => colorSound.play());
    }
}

/**
 * Mengubah mode terang/gelap otomatis berdasarkan warna preview.
 */
function updateAutoMode() {
    if (currentColor) {
        // Jika luminance di atas ambang batas (misal: 180 dari 255), anggap terang
        if (getLuminance(currentColor) > 180) { // Ambang batas bisa disesuaikan
            document.body.classList.remove('dark-mode');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i> Mode Gelap';
            isDarkMode = false;
        } else {
            document.body.classList.add('dark-mode');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Mode Terang';
            isDarkMode = true;
        }
    }
}

/**
 * Mengubah tema secara manual (toggle dark/light mode).
 */
const themeToggleBtn = document.getElementById('themeToggleBtn'); // Deklarasi ini tetap di sini
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    isDarkMode = document.body.classList.contains('dark-mode');
    // Tidak perlu 'const' lagi di sini
    themeToggleBtn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i> Mode Terang' : '<i class="fas fa-moon"></i> Mode Gelap';
}


/**
 * Memperbarui makna filosofis warna yang ditampilkan.
 */
function updateColorMeaning() {
    if (!currentColor) {
        colorMeaningText.textContent = "Oops! Ada masalah dengan makna warna.";
        return;
    }

    const hue = getHueFromRgba(currentColor);
    const hex = rgbaToHex(currentColor);
    let meaning = "Eksplorasi warna tanpa batas!";

    if (hex === "#000000") {
        meaning = "Hitam: Keanggunan, kekuatan, misteri. Dalam desain, hitam sering digunakan untuk menciptakan kesan mewah atau modern.";
    } else if (hex === "#ffffff") {
        meaning = "Putih: Kemurnian, kesederhanaan, kedamaian. Memberikan kesan ruang terbuka dan kejelasan.";
    } else if (currentColor.a < 0.2) {
        meaning = "Transparan: Ringan, tidak terlihat, kosong. Digunakan untuk efek lapisan atau 'ghosting'.";
    } else if (hue >= 345 || hue < 15) { // Merah
        meaning = "Merah: Energi, semangat, cinta, bahaya. Warna yang menarik perhatian, sering digunakan untuk tombol aksi atau peringatan.";
    } else if (hue >= 15 && hue < 45) { // Oranye
        meaning = "Oranye: Kreativitas, antusiasme, keceriaan. Menggabungkan energi merah dengan kebahagiaan kuning, sering digunakan untuk branding yang ramah.";
    } else if (hue >= 45 && hue < 75) { // Kuning
        meaning = "Kuning: Optimisme, kebahagiaan, kecerdasan. Warna cerah yang dapat meningkatkan mood, namun berhati-hatilah agar tidak terlalu terang.";
    } else if (hue >= 75 && hue < 165) { // Hijau
        meaning = "Hijau: Alam, pertumbuhan, kesegaran, ketenangan. Sering dikaitkan dengan kesehatan, keberlanjutan, dan relaksasi.";
    } else if (hue >= 165 && hue < 255) { // Biru
        meaning = "Biru: Ketenangan, kepercayaan, stabilitas, kebijaksanaan. Populer untuk bisnis dan teknologi karena memberikan kesan profesional dan dapat diandalkan.";
    } else if (hue >= 255 && hue < 285) { // Ungu
        meaning = "Ungu: Kemewahan, spiritualitas, misteri, kebijaksanaan. Sering diasosiasikan dengan royalti dan kreativitas.";
    } else if (hue >= 285 && hue < 345) { // Magenta/Pink
        meaning = "Magenta/Pink: Romansa, feminin, kelembutan, keceriaan. Memiliki spektrum yang luas dari yang lembut hingga yang berani.";
    }

    colorMeaningText.textContent = meaning;
}

/**
 * Menginisialisasi aplikasi saat dimuat.
 */
function initializeApp() {
    // Muat preset dari localStorage
    const storedColors = localStorage.getItem('colorForgePresets');
    if (storedColors) {
        try {
            savedColors = JSON.parse(storedColors);
        } catch (e) {
            console.error("Gagal memuat preset dari localStorage:", e);
            savedColors = []; // Reset jika ada error parsing
        }
    }

    // Set warna awal dan perbarui UI
    updateColor(rgbaToHex(currentColor), true); // Inisialisasi dengan warna default, silent untuk menghindari suara awal
}

// --- Event Listeners ---

/**
 * Menangani input HEX.
 */
hexInput.addEventListener('keyup', (e) => {
    const hex = e.target.value;
    // Hanya perbarui jika input HEX memiliki panjang yang valid untuk konversi
    if (hex.length === 7 || hex.length === 6) { // #RRGGBB atau RRGGBB
        updateColor(hex);
    }
});

/**
 * Menangani input dari color picker.
 */
colorPicker.addEventListener('input', (e) => {
    updateColor(e.target.value); // Color picker mengembalikan HEX
});

/**
 * Menangani input dari RGBA sliders.
 */
function handleRgbaSliderInput() {
    const r = parseInt(rSlider.value);
    const g = parseInt(gSlider.value);
    const b = parseInt(bSlider.value);
    const a = parseFloat(aSlider.value);

    // Perbarui tampilan nilai angka
    rValue.textContent = r;
    gValue.textContent = g;
    bValue.textContent = b;
    aValue.textContent = a.toFixed(2);

    updateColor({ r, g, b, a });
}

rSlider.addEventListener('input', handleRgbaSliderInput);
gSlider.addEventListener('input', handleRgbaSliderInput);
bSlider.addEventListener('input', handleRgbaSliderInput);
aSlider.addEventListener('input', handleRgbaSliderInput);

// Tombol penyesuaian slider +/-
document.querySelectorAll('.slider-adjust-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const target = e.target.dataset.target; // r, g, b, atau a
        const adjust = parseFloat(e.target.dataset.adjust); // +1, -1, +0.01, -0.01
        let currentValue;
        let sliderElement;

        if (target === 'r') { currentValue = parseInt(rSlider.value); sliderElement = rSlider; }
        else if (target === 'g') { currentValue = parseInt(gSlider.value); sliderElement = gSlider; }
        else if (target === 'b') { currentValue = parseInt(bSlider.value); sliderElement = bSlider; }
        else if (target === 'a') { currentValue = parseFloat(aSlider.value); sliderElement = aSlider; }

        let newValue = currentValue + adjust;

        // Batasi nilai sesuai min/max slider
        if (target === 'a') {
            newValue = Math.max(0, Math.min(1, newValue));
        } else {
            newValue = Math.max(0, Math.min(255, newValue));
        }

        sliderElement.value = newValue;
        handleRgbaSliderInput(); // Perbarui warna berdasarkan nilai baru
    });
});


// Fungsi generateRandomColor dan event listener-nya dihapus di sini


/**
 * Mengatur ClipboardJS untuk tombol salin.
 */
const clipboardHex = new ClipboardJS(copyHexBtn);
clipboardHex.on('success', (e) => {
    showMessage(`HEX: ${e.text} disalin!`, 'success');
    e.clearSelection();
});
clipboardHex.on('error', (e) => {
    showMessage('Gagal menyalin HEX. Browser mungkin tidak mendukung.', 'error');
});

const clipboardRgba = new ClipboardJS(copyRgbaBtn);
clipboardRgba.on('success', (e) => {
    showMessage(`RGBA: ${e.text} disalin!`, 'success');
    e.clearSelection();
});
clipboardRgba.on('error', (e) => {
    showMessage('Gagal menyalin RGBA. Browser mungkin tidak mendukung.', 'error');
});

/**
 * Menyimpan preset warna ke localStorage.
 */
savePresetBtn.addEventListener('click', () => {
    const hex = rgbaToHex(currentColor);
    if (!savedColors.includes(hex)) { // Hindari duplikasi
        savedColors.push(hex);
        localStorage.setItem('colorForgePresets', JSON.stringify(savedColors));
        showMessage(`Warna ${hex} disimpan ke preset!`, 'success');
    } else {
        showMessage(`Warna ${hex} sudah ada di preset.`, 'info');
    }
});

/**
 * Menampilkan preset warna yang tersimpan di modal.
 */
viewPresetsBtnSide.addEventListener('click', () => {
    displayPresets(); // Pastikan tampilan diperbarui setiap kali dibuka
    presetsModal.classList.add('show');
    closeSideMenu(); // Tutup side menu setelah membuka modal
});

/**
 * Merender daftar preset warna di dalam modal.
 */
function displayPresets() {
    savedPresetsContainer.innerHTML = ''; // Kosongkan kontainer
    if (savedColors.length === 0) {
        savedPresetsContainer.innerHTML = '<p>Belum ada preset yang disimpan.</p>';
        return;
    }

    savedColors.forEach((colorHex, index) => {
        const presetItem = document.createElement('div');
        presetItem.classList.add('preset-item');

        const colorBox = document.createElement('div');
        colorBox.classList.add('preset-color-box');
        colorBox.style.backgroundColor = colorHex;
        colorBox.addEventListener('click', () => {
            updateColor(colorHex);
            presetsModal.classList.remove('show'); // Tutup modal setelah memilih
            showMessage(`Warna ${colorHex} diterapkan dari preset.`, 'info');
        });

        const colorText = document.createElement('span');
        colorText.classList.add('preset-color-text');
        colorText.textContent = colorHex;

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-preset-btn');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Hapus preset ini';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Mencegah klik pada colorBox
            deletePreset(index);
        });

        presetItem.appendChild(colorBox);
        presetItem.appendChild(colorText);
        presetItem.appendChild(deleteBtn);
        savedPresetsContainer.appendChild(presetItem);
    });
}

// Global variable for confirm callback
let confirmCallback = null;

/**
 * Menampilkan modal konfirmasi kustom.
 * @param {string} message - Pesan yang akan ditampilkan.
 * @param {function} callback - Fungsi yang akan dipanggil dengan true/false berdasarkan pilihan pengguna.
 */
function showConfirmModal(message, callback) {
    confirmMessageText.textContent = message;
    confirmCallback = callback;
    confirmModal.classList.add('show');
}

/**
 * Menghapus preset warna berdasarkan indeks.
 * @param {number} index - Indeks preset yang akan dihapus.
 */
function deletePreset(index) {
    showConfirmModal('Apakah Anda yakin ingin menghapus preset ini?', (confirmed) => {
        if (confirmed) {
            savedColors.splice(index, 1);
            localStorage.setItem('colorForgePresets', JSON.stringify(savedColors));
            showMessage('Preset berhasil dihapus.', 'success');
            displayPresets(); // Perbarui tampilan
        } else {
            showMessage('Penghapusan preset dibatalkan.', 'info');
        }
    });
}

/**
 * Mengaktifkan atau menonaktifkan mode pelangi.
 */
rainbowModeBtn.addEventListener('click', () => {
    if (isRainbowModeActive) {
        clearInterval(rainbowInterval);
        isRainbowModeActive = false;
        rainbowModeBtn.classList.remove('active');
        rainbowModeBtn.innerHTML = '<i class="fas fa-rainbow"></i> Mode Pelangi';
        showMessage('Mode Pelangi Dinonaktifkan.', 'info');
    } else {
        let { h, s, l } = rgbToHsl(currentColor.r, currentColor.g, currentColor.b);
        rainbowInterval = setInterval(() => {
            h = (h + 1) % 360; // Siklus hue dari 0 ke 359
            const newRgb = hslToRgb(h, s, l);
            updateColor({ r: newRgb.r, g: newRgb.g, b: newRgb.b, a: currentColor.a }, true); // Silent update
        }, 50); // Ubah setiap 50ms
        isRainbowModeActive = true;
        rainbowModeBtn.classList.add('active');
        rainbowModeBtn.innerHTML = '<i class="fas fa-pause"></i> Hentikan Pelangi';
        showMessage('Mode Pelangi Diaktifkan! 🌈', 'info');
    }
});

/**
 * Menghasilkan dan menampilkan palet mood board.
 */
moodBoardBtnSide.addEventListener('click', () => {
    moodBoardColors.innerHTML = ''; // Kosongkan kontainer

    const currentHsl = rgbToHsl(currentColor.r, currentColor.g, currentColor.b);

    // Fungsi pembantu untuk membuat variasi warna berdasarkan HSL
    function generateScheme(baseHsl, type) {
        const colors = [];
        let h = baseHsl.h;
        let s = baseHsl.s;
        let l = baseHsl.l;

        switch (type) {
            case 'main':
                colors.push(hslToRgb(h, s, l));
                break;
            case 'analogous':
                colors.push(hslToRgb((h - 30 + 360) % 360, s, l));
                colors.push(hslToRgb(h, s, l));
                colors.push(hslToRgb((h + 30) % 360, s, l));
                break;
            case 'complementary':
                colors.push(hslToRgb(h, s, l));
                colors.push(hslToRgb((h + 180) % 360, s, l));
                break;
            case 'triad':
                colors.push(hslToRgb(h, s, l));
                colors.push(hslToRgb((h + 120) % 360, s, l));
                colors.push(hslToRgb((h + 240) % 360, s, l));
                break;
            case 'monochromatic':
                // Variasi lightness/saturation
                colors.push(hslToRgb(h, s, l * 0.7)); // Lebih gelap
                colors.push(hslToRgb(h, s, l));
                colors.push(hslToRgb(h, s, Math.min(1, l * 1.3))); // Lebih terang
                break;
            case 'split-complementary':
                colors.push(hslToRgb(h, s, l));
                colors.push(hslToRgb((h + 180 - 30 + 360) % 360, s, l));
                colors.push(hslToHsl((h + 180 + 30) % 360, s, l));
                break;
        }
        return colors.map(rgb => rgbaToHex({ ...rgb, a: 1 })); // Convert all to HEX for display
    }

    const colorSchemes = [
        { name: "Warna Utama", colors: generateScheme(currentHsl, 'main') },
        { name: "Analog", colors: generateScheme(currentHsl, 'analogous') },
        { name: "Komplementer", colors: generateScheme(currentHsl, 'complementary') },
        { name: "Triad", colors: generateScheme(currentHsl, 'triad') },
        { name: "Monokromatik", colors: generateScheme(currentHsl, 'monochromatic') },
        { name: "Split-Komplementer", colors: generateScheme(currentHsl, 'split-complementary') }
    ];

    colorSchemes.forEach(scheme => {
        const schemeHeader = document.createElement('h3');
        schemeHeader.textContent = scheme.name;
        schemeHeader.style.width = '100%';
        schemeHeader.style.marginTop = '15px';
        schemeHeader.style.color = 'var(--primary-color)';
        schemeHeader.style.textAlign = 'center';
        moodBoardColors.appendChild(schemeHeader);

        const schemeContainer = document.createElement('div');
        schemeContainer.style.display = 'flex';
        schemeContainer.style.flexWrap = 'wrap';
        schemeContainer.style.gap = '10px';
        schemeContainer.style.justifyContent = 'center';
        schemeContainer.style.width = '100%';

        scheme.colors.forEach(hex => {
            const moodItem = document.createElement('div');
            moodItem.classList.add('mood-color-item');

            const colorBox = document.createElement('div');
            colorBox.classList.add('mood-color-box');
            colorBox.style.backgroundColor = hex;
            colorBox.addEventListener('click', () => {
                updateColor(hex);
                moodBoardModal.classList.remove('show'); // Tutup modal
                showMessage(`Warna ${hex} diterapkan dari Mood Board.`, 'info');
            });

            const colorText = document.createElement('span');
            colorText.classList.add('mood-color-text');
            colorText.textContent = hex;

            moodItem.appendChild(colorBox);
            moodItem.appendChild(colorText);
            schemeContainer.appendChild(moodItem);
        });
        moodBoardColors.appendChild(schemeContainer);
    });

    moodBoardModal.classList.add('show');
    closeSideMenu(); // Tutup side menu setelah membuka modal
});

/**
 * Mengekspor preset yang tersimpan ke file JSON.
 */
const exportPresets = () => {
    if (savedColors.length === 0) {
        showMessage('Tidak ada preset untuk diekspor.', 'info');
        return;
    }

    const dataStr = JSON.stringify(savedColors, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'colorforge_presets.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage('Preset berhasil diekspor ke colorforge_presets.json!', 'success');
};

exportPresetsBtnSide.addEventListener('click', () => {
    exportPresets();
    closeSideMenu(); // Tutup side menu setelah aksi
});
exportPresetsBtnFooter.addEventListener('click', exportPresets); // Untuk tombol di footer desktop

/**
 * Toggle tema gelap/terang secara manual.
 */
themeToggleBtn.addEventListener('click', toggleTheme);

// --- Mode Tampilan Input ---
showHexPickerBtn.addEventListener('click', () => {
    hexPickerInputSection.classList.add('active');
    hexPickerInputSection.classList.remove('hidden');
    rgbaSlidersInputSection.classList.remove('active');
    rgbaSlidersInputSection.classList.add('hidden');

    showHexPickerBtn.classList.add('active');
    showRgbaSlidersBtn.classList.remove('active');
});

showRgbaSlidersBtn.addEventListener('click', () => {
    hexPickerInputSection.classList.remove('active');
    hexPickerInputSection.classList.add('hidden');
    rgbaSlidersInputSection.classList.add('active');
    rgbaSlidersInputSection.classList.remove('hidden');

    showHexPickerBtn.classList.remove('active');
    showRgbaSlidersBtn.classList.add('active');
});

// --- Full Screen Color Preview ---
colorPreviewBox.addEventListener('click', () => {
    fullScreenPreviewModal.classList.add('show');
    // Set warna latar belakang modal sesuai currentColor
    fullScreenPreviewModal.querySelector('.modal-content').style.backgroundColor = rgbaToString(currentColor);
});

closeFullScreenPreviewModal.addEventListener('click', () => {
    fullScreenPreviewModal.classList.remove('show');
});

// --- Hamburger Menu ---
hamburgerMenuBtn.addEventListener('click', () => {
    sideMenu.classList.add('open');
    sideMenuOverlay.classList.add('active');
});

closeSideMenuBtn.addEventListener('click', closeSideMenu);
sideMenuOverlay.addEventListener('click', closeSideMenu);

function closeSideMenu() {
    sideMenu.classList.remove('open');
    sideMenuOverlay.classList.remove('active');
}


// Listener untuk menutup modal
closeMessageModal.addEventListener('click', () => messageModal.classList.remove('show'));
closePresetsModal.addEventListener('click', () => presetsModal.classList.remove('show'));
closeMoodBoardModal.addEventListener('click', () => moodBoardModal.classList.remove('show'));

// Tutup modal jika mengklik di luar konten modal
window.addEventListener('click', (event) => {
    if (event.target === messageModal) {
        messageModal.classList.remove('show');
    }
    if (event.target === presetsModal) {
        presetsModal.classList.remove('show');
    }
    if (event.target === moodBoardModal) {
        moodBoardModal.classList.remove('show');
    }
    if (event.target === fullScreenPreviewModal) { // Menangani klik di luar modal preview
        fullScreenPreviewModal.classList.remove('show');
    }
    // Tambahkan listener untuk modal konfirmasi
    if (event.target === confirmModal) {
        confirmModal.classList.remove('show');
        if (confirmCallback) {
            confirmCallback(false); // Asumsikan "Tidak" jika ditutup dengan mengklik di luar
        }
        confirmCallback = null;
    }
});

// Event Listeners for confirm modal buttons
confirmYesBtn.addEventListener('click', () => {
    confirmModal.classList.remove('show');
    if (confirmCallback) {
        confirmCallback(true);
    }
    confirmCallback = null; // Reset callback
});

confirmNoBtn.addEventListener('click', () => {
    confirmModal.classList.remove('show');
    if (confirmCallback) {
        confirmCallback(false);
    }
    confirmCallback = null; // Reset callback
});

closeConfirmModal.addEventListener('click', () => {
    confirmModal.classList.remove('show');
    if (confirmCallback) {
        confirmCallback(false); // Assume "No" if closed via X button
    }
    confirmCallback = null;
});


// Panggil fungsi inisialisasi aplikasi saat DOM sudah sepenuhnya dimuat.
// Ini adalah pendekatan terbaik karena semua elemen DOM sudah ada
// dan kita tidak bergantung pada library eksternal yang mungkin memakan waktu.
window.addEventListener('DOMContentLoaded', initializeApp);


// --- PWA Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Gunakan BASE_PATH untuk mendaftarkan service worker
        navigator.serviceWorker.register(`${BASE_PATH}service-worker.js`)
            .then((registration) => {
                console.log('Service Worker terdaftar dengan scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Pendaftaran Service Worker gagal:', error);
            });
    });
}
