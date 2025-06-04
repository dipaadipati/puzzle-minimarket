# 🏪 Puzzle Minimarket

> **🤖 AI Generated**: 99% of this project was generated using AI assistance (GitHub Copilot & Claude AI)

## 🎯 Tujuan Game

Game ini mensimulasikan tantangan optimasi yang dihadapi pekerja minimarket dalam kehidupan nyata. Pemain berperan sebagai pekerja yang harus menyortir berbagai barang ke rak-rak yang sesuai dengan kapasitas trolley yang terbatas, sambil mencari jalur paling efisien untuk meminimalkan jumlah langkah.

**Konsep Utama**: Bagaimana mengoptimalkan pemilihan barang dan rute perjalanan ketika memiliki keterbatasan kapasitas, mirip dengan masalah optimasi kombinatorial dalam computer science.

## 🎮 Cara Bermain

1. **Setup**: Atur kapasitas trolley (1-10 barang) dan generate data random
2. **Strategi**: Pilih antara algoritma optimal atau greedy
3. **Analisis**: Lihat step-by-step bagaimana pekerja bergerak dan membuat keputusan
4. **Perbandingan**: Bandingkan efisiensi kedua strategi

## ⚙️ Function Utama

### 🎲 **Data Generation**
- **`generateRandomShelves(difficulty)`** - Membuat layout rak dengan tingkat kesulitan berbeda
- **`generateRandomItems(itemCount, shelves)`** - Generate barang random sesuai kategori rak
- **Tujuan**: Menciptakan skenario baru untuk testing algoritma

### 🧮 **Algoritma Optimasi**
- **`OptimalRouteCalculator`** - Class untuk menghitung kombinasi barang dan rute terbaik
- **`findOptimalItemCombination()`** - Memilih barang terbaik berdasarkan scoring system
- **`calculateTripScore()`** - Menilai efisiensi kombinasi barang (jarak + kategori)
- **Tujuan**: Implementasi algoritma nearest neighbor dengan constraint capacity

### 🎯 **Strategy Comparison**
- **`playOptimalGameV2()`** - Menjalankan strategi dengan optimasi pemilihan barang
- **`playGreedyGameV2()`** - Menjalankan strategi sederhana (ambil barang pertama)
- **Tujuan**: Membandingkan performa algoritma optimal vs greedy approach

### 📊 **Step Tracking**
- **`GameStep` Class** - Merekam setiap langkah pekerja dengan detail lengkap
- **`displayStep(stepIndex)`** - Visualisasi step-by-step dengan path highlighting
- **`highlightPath(currentIndex)`** - Menampilkan jejak perjalanan dengan warna kuning
- **Tujuan**: Analisis mendalam terhadap decision-making process

### 🎨 **Interactive Visualization**
- **Path highlighting** - Step sebelumnya berwarna kuning (opacity 0.5)
- **Worker status tracking** - Real-time info posisi dan barang yang dibawa
- **Manual navigation** - Click cell untuk eksplorasi manual
- **Auto-play mode** - Otomatis memutar semua steps
- **Tujuan**: Memudahkan understanding dan debugging algoritma

### 🛠️ **Game Controls**
- **`nextStep()` / `previousStep()`** - Navigasi manual antar steps
- **`playAllSteps()`** - Auto-play dengan interval 1.5 detik
- **`manualMoveWorker(x, y)`** - Pergerakan manual untuk testing
- **Tujuan**: Memberikan kontrol penuh untuk analisis

## 🎓 Manfaat Edukatif

- **Pathfinding Algorithms**: Implementasi Manhattan distance dan nearest neighbor
- **Combinatorial Optimization**: Optimasi pemilihan dengan constraint
- **Algorithm Analysis**: Perbandingan kompleksitas optimal vs greedy
- **Resource Management**: Simulasi keterbatasan kapasitas dalam dunia nyata
- **Visual Learning**: Step-by-step understanding algoritma

## 🚀 Live Demo

Mainkan langsung di: [https://dipaadipati.github.io/puzzle-minimarket/](https://dipaadipati.github.io/puzzle-minimarket/)

## 🤖 AI Development

Project ini dibuat sebagai demonstrasi kemampuan AI-assisted development, di mana 99% kode digenerate menggunakan AI tools untuk menunjukkan efisiensi dan kualitas yang bisa dicapai.

---

*Built with ❤️ and 🤖 AI assistance by dipaadipati*