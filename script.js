// Menginisialisasi variabel global untuk elemen DOM dan status aplikasi
const hexInput = document.getElementById('hexInput');
const rInput = document.getElementById('rInput');
const gInput = document.getElementById('gInput');
const bInput = document.getElementById('bInput');
const aInput = document.getElementById('aInput');
const colorPicker = document.getElementById('colorPicker');
const colorPreviewBox = document.getElementById('colorPreviewBox');
const rgbaCombinedOutput = document.getElementById('rgbaCombinedOutput'); // Untuk clipboard.js
const colorMeaningText = document.getElementById('colorMeaning');

const randomizerBtn = document.getElementById('randomizerBtn');
const copyHexBtn = document.getElementById('copyHexBtn');
const copyRgbaBtn = document.getElementById('copyRgbaBtn');
const savePresetBtn = document.getElementById('savePresetBtn');
const viewPresetsBtn = document.getElementById('viewPresetsBtn');
const moodBoardBtn = document.getElementById('moodBoardBtn');
const rainbowModeBtn = document.getElementById('rainbowModeBtn');
const exportPresetsBtn = document.getElementById('exportPresetsBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');

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


// Variabel state aplikasi
let currentColor = { r: 106, g: 13, b: 173, a: 1, format: 'rgba' }; // Default color: #6a0dad
let savedColors = []; // Array untuk menyimpan preset warna
let rainbowInterval = null; // Untuk mengontrol mode pelangi
let isRainbowModeActive = false; // Status mode pelangi
let isDarkMode = false; // Status tema gelap/terang

// Inisialisasi suara menggunakan howler.js
// Base64 encoded WAV file for a simple beep sound
const BEEP_SOUND_BASE64 = 'data:audio/wav;base64,UklGRmUAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAEcAAFAAEAABEAQAEAEAEAEAEAAAEAAAEAABAAAAEAAAQAAAAAAAQABA' +
                         'AAAAAQABAFAAEAABAAABAAAAQAAAFAAEAAEAAAEAAAAAAABAAAEAAABAAAAAAAgAAAAAAAAAAAAAAAUAAAACAAAAAQAAABQAABAFAAEAAEAAAEAAAgAAAAA' +
                         'AAAAABQAAAAIAAAABAAAAFAAAEAEAAAEAAAEAAAEAAAAAAABAAAAAQAAAAAAAABAAAAAAACAAAAAAQABAFAAEAABAAABAAAAAQAAAEAAAgAAAAAABQABAAAA' +
                         'AQAAABAAAAAQAAABQABAAAAAQAAABAAAEAAAgAAAAAABAAAAAQAAAAAAAABAAAAAAACAAAAAAQABAFAAEAABAAABAAAAAQAAAEAAAgAAAAAABQABAAAAAQAA' +
                         'ABAAAAAQAAABQABAAAAAQAAABAAAEAAAgAAAAAABAAAAAQAAAAAAAABAAAAAAACAAAAAAQABAFAAEAABAAABAAAAAQAAAEAAAgAAAAAABQABAAAAAQAAABAA' +
                         'AAQAAABQABAAAAAQAAABAAAEAAAgAAAAAABAAAAAQAAAAAAAABAAAAAAACAAAAAAQABAFAAEAABAAABAAAAAQAAAEAAAgAAAAAABQABAAAAAQAAABAAAAAQAAAB' +
                         'QABAAAAAQAAABAAAEAAAgAAAAAABAAAAAQAAAAAAAABAAAAAAACAAAAAAQABAFAAEAABAAABAAAAAQAAAEAAAgAAAAAABQABAAAAAQAAABAAAAAQAAABQABAAAA' +
                         'AQAAABAAAEAAAgAAAAAABAAAAAQAAAAAAAABAAAAAAACAAAAAAQABAFAAEAABAAABAAAAAQAAAEAAAgAAAAAABQABAAAAAQAAABAAAAAQAAABQABAAAAAQAAAB' +
                         'AAAEAAAgAAAAAABAAAAAQAAAAAAAABAAAAAAACAAAAAAQABAFAAEAABAAABAAAAAQAAAEAAAgAAAAAABQABAAAAAQAAABAAAAAQAAABQABAAAAAQAAABAAAEAA' +
                         'AgAAAAAABAAAAAQAAAAAAAABAAAAAAACAAAAAAQABAFAAEAABAAABAAAAAQAAAEAAAgAAAAAABQABA';

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
    // Perbaikan: Menghapus kelebihan tanda kurung di parseFloat(a.toFixed(2)))
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${parseFloat(a.toFixed(2))})`;
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
 */
function updateColor(colorInput) {
    let rgbaObj = {};
    let hexString = '';

    if (typeof colorInput === 'string') { // Jika input adalah string (HEX atau RGBA string)
        if (colorInput.startsWith('#')) { // Jika HEX
            rgbaObj = hexToRgba(colorInput);
            if (!rgbaObj) { // Jika HEX tidak valid
                showMessage('Format HEX tidak valid. Gunakan #RRGGBB.', 'error');
                return;
            }
            hexString = colorInput;
        } else if (colorInput.startsWith('rgba')) { // Jika RGBA string
            const parts = colorInput.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
            if (!parts) {
                showMessage('Format RGBA tidak valid. Gunakan rgba(r,g,b,a).', 'error');
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
                showMessage('Warna tidak valid. Masukkan format HEX (#RRGGBB) atau RGBA (0-255) yang benar.', 'error');
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
        showMessage('Input warna tidak dikenali.', 'error');
        return;
    }

    currentColor = rgbaObj; // Perbarui variabel warna saat ini
    const rgbaString = rgbaToString(currentColor);

    // Perbarui input HEX, RGBA, dan color picker
    hexInput.value = hexString;
    rInput.value = currentColor.r;
    gInput.value = currentColor.g;
    bInput.value = currentColor.b;
    aInput.value = currentColor.a.toFixed(2); // Bulatkan alpha ke 2 desimal
    colorPicker.value = hexString; // Color picker hanya menerima HEX

    // Perbarui kotak preview warna
    colorPreviewBox.style.backgroundColor = rgbaString;
    rgbaCombinedOutput.value = rgbaString; // Update nilai tersembunyi untuk copy RGBA

    // Panggil fitur tambahan
    updateAutoMode();
    updateColorMeaning();
    playColorSound();
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
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    isDarkMode = document.body.classList.contains('dark-mode');
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
        meaning = "Hitam: Keanggunan, kekuatan, misteri.";
    } else if (hex === "#ffffff") {
        meaning = "Putih: Kemurnian, kesederhanaan, kedamaian.";
    } else if (currentColor.a < 0.2) {
        meaning = "Transparan: Ringan, tidak terlihat, kosong.";
    } else if (hue >= 345 || hue < 15) { // Merah
        meaning = "Merah: Energi, semangat, cinta, bahaya.";
    } else if (hue >= 15 && hue < 45) { // Oranye
        meaning = "Oranye: Kreativitas, antusiasme, keceriaan.";
    } else if (hue >= 45 && hue < 75) { // Kuning
        meaning = "Kuning: Optimisme, kebahagiaan, kecerdasan.";
    } else if (hue >= 75 && hue < 165) { // Hijau
        meaning = "Hijau: Alam, pertumbuhan, kesegaran, ketenangan.";
    } else if (hue >= 165 && hue < 255) { // Biru
        meaning = "Biru: Ketenangan, kepercayaan, stabilitas, kebijaksanaan.";
    } else if (hue >= 255 && hue < 285) { // Ungu
        meaning = "Kemewahan, spiritualitas, misteri, kebijaksanaan.";
    } else if (hue >= 285 && hue < 345) { // Magenta/Pink
        meaning = "Romansa, feminin, kelembutan, keceriaan.";
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
    updateColor(rgbaToHex(currentColor)); // Inisialisasi dengan warna default
}

/**
 * Menangani input HEX.
 */
hexInput.addEventListener('keyup', (e) => {
    const hex = e.target.value;
    const rgba = hexToRgba(hex);
    if (rgba) { // Cek apakah HEX valid
        updateColor(rgba);
    }
});

/**
 * Menangani input RGBA.
 */
function handleRgbaInput() {
    const r = parseInt(rInput.value || 0);
    const g = parseInt(gInput.value || 0);
    const b = parseInt(bInput.value || 0);
    const a = parseFloat(aInput.value || 1);

    const newRgba = {
        r: Math.max(0, Math.min(255, r)),
        g: Math.max(0, Math.min(255, g)),
        b: Math.max(0, Math.min(255, b)),
        a: Math.max(0, Math.min(1, a))
    };
    updateColor(newRgba);
}

rInput.addEventListener('input', handleRgbaInput);
gInput.addEventListener('input', handleRgbaInput);
bInput.addEventListener('input', handleRgbaInput);
aInput.addEventListener('input', handleRgbaInput);

/**
 * Menangani input dari color picker.
 */
colorPicker.addEventListener('input', (e) => {
    updateColor(e.target.value); // Color picker mengembalikan HEX
});

/**
 * Menghasilkan warna acak.
 */
randomizerBtn.addEventListener('click', () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const a = 1; // Alpha penuh
    updateColor({ r, g, b, a });
    showMessage('Warna acak baru tercipta! ✨', 'info');
});

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
        displayPresets(); // Perbarui tampilan preset
    } else {
        showMessage(`Warna ${hex} sudah ada di preset.`, 'info');
    }
});

/**
 * Menampilkan preset warna yang tersimpan di modal.
 */
viewPresetsBtn.addEventListener('click', () => {
    displayPresets(); // Pastikan tampilan diperbarui setiap kali dibuka
    presetsModal.classList.add('show');
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
        deleteBtn.addEventListener('click', () => deletePreset(index));

        presetItem.appendChild(colorBox);
        presetItem.appendChild(colorText);
        presetItem.appendChild(deleteBtn);
        savedPresetsContainer.appendChild(presetItem);
    });
}

/**
 * Menghapus preset warna berdasarkan indeks.
 * @param {number} index - Indeks preset yang akan dihapus.
 */
function deletePreset(index) {
    if (confirm('Apakah Anda yakin ingin menghapus preset ini?')) {
        savedColors.splice(index, 1);
        localStorage.setItem('colorForgePresets', JSON.stringify(savedColors));
        showMessage('Preset berhasil dihapus.', 'success');
        displayPresets(); // Perbarui tampilan
    }
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
            updateColor({ r: newRgb.r, g: newRgb.g, b: newRgb.b, a: currentColor.a });
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
moodBoardBtn.addEventListener('click', () => {
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
                colors.push(hslToRgb((h + 180 + 30) % 360, s, l));
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
});

/**
 * Mengekspor preset yang tersimpan ke file JSON.
 */
exportPresetsBtn.addEventListener('click', () => {
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
});

/**
 * Toggle tema gelap/terang secara manual.
 */
themeToggleBtn.addEventListener('click', toggleTheme);

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
});

// Panggil fungsi inisialisasi aplikasi saat DOM sudah sepenuhnya dimuat.
// Ini adalah pendekatan terbaik karena semua elemen DOM sudah ada
// dan kita tidak bergantung pada library eksternal yang mungkin memakan waktu.
window.addEventListener('DOMContentLoaded', initializeApp);
