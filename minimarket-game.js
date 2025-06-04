// Mock data untuk game versi 2 dengan constraint kapasitas
const mockDataV2 = {
    // Posisi awal pekerja (tempat pengambilan barang)
    workerStartPosition: { x: 0, y: 0 },

    // Kapasitas maksimal trolley
    trolleyCapacity: 2,

    // Daftar kategori lemari dan posisinya
    shelves: [
        { id: 1, category: 'alat_dapur', position: { x: 3, y: 1 }, name: 'Alat Dapur' },
        { id: 2, category: 'alat_rumah_tangga', position: { x: 1, y: 3 }, name: 'Alat Rumah Tangga' },
        { id: 3, category: 'keperluan_kantor', position: { x: 5, y: 2 }, name: 'Keperluan Kantor' },
        { id: 4, category: 'mainan_anak', position: { x: 2, y: 4 }, name: 'Mainan Anak' },
        { id: 5, category: 'makanan_ringan', position: { x: 4, y: 3 }, name: 'Makanan Ringan' }
    ],

    // Daftar barang yang harus disortir
    items: [
        { id: 1, name: 'Panci', category: 'alat_dapur' },
        { id: 2, name: 'Pensil', category: 'keperluan_kantor' },
        { id: 3, name: 'Sapu', category: 'alat_rumah_tangga' },
        { id: 4, name: 'Lego', category: 'mainan_anak' },
        { id: 5, name: 'Spatula', category: 'alat_dapur' },
        { id: 6, name: 'Kertas A4', category: 'keperluan_kantor' },
        { id: 7, name: 'Keripik', category: 'makanan_ringan' },
        { id: 8, name: 'Boneka', category: 'mainan_anak' },
        { id: 9, name: 'Pel', category: 'alat_rumah_tangga' },
        { id: 10, name: 'Biskuit', category: 'makanan_ringan' },
        { id: 11, name: 'Wajan', category: 'alat_dapur' },
        { id: 12, name: 'Penghapus', category: 'keperluan_kantor' }
    ]
};

// Class untuk menangani optimasi pemilihan barang dan rute
class OptimalRouteCalculator {
    constructor(startPosition, shelves, trolleyCapacity) {
        this.startPosition = startPosition;
        this.shelves = shelves;
        this.trolleyCapacity = trolleyCapacity;
    }

    // Menghitung jarak Manhattan
    calculateDistance(pos1, pos2) {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    }

    // Mencari kombinasi barang terbaik untuk satu trip
    findOptimalItemCombination(remainingItems) {
        const combinations = this.generateItemCombinations(remainingItems);
        let bestCombination = null;
        let bestScore = Infinity;

        combinations.forEach(combination => {
            const score = this.calculateTripScore(combination);
            if (score < bestScore) {
                bestScore = score;
                bestCombination = combination;
            }
        });

        return { items: bestCombination, score: bestScore };
    }

    // Generate semua kombinasi barang yang mungkin (max trolleyCapacity)
    generateItemCombinations(items) {
        const combinations = [];

        // Single item combinations
        items.forEach(item => {
            combinations.push([item]);
        });

        // Two item combinations (jika kapasitas >= 2)
        if (this.trolleyCapacity >= 2) {
            for (let i = 0; i < items.length; i++) {
                for (let j = i + 1; j < items.length; j++) {
                    combinations.push([items[i], items[j]]);
                }
            }
        }

        return combinations;
    }

    // Menghitung score untuk satu trip (semakin rendah semakin baik)
    calculateTripScore(itemCombination) {
        // Kelompokkan berdasarkan kategori
        const categories = [...new Set(itemCombination.map(item => item.category))];
        const uniqueShelves = categories.map(cat =>
            this.shelves.find(shelf => shelf.category === cat)
        );

        // Hitung total jarak untuk trip ini
        let totalDistance = 0;
        let currentPos = { ...this.startPosition };

        // Gunakan nearest neighbor untuk urutan kunjungan rak
        let remainingShelves = [...uniqueShelves];

        while (remainingShelves.length > 0) {
            let nearestShelf = null;
            let minDistance = Infinity;

            remainingShelves.forEach(shelf => {
                const distance = this.calculateDistance(currentPos, shelf.position);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestShelf = shelf;
                }
            });

            totalDistance += minDistance;
            currentPos = nearestShelf.position;
            remainingShelves = remainingShelves.filter(shelf => shelf.id !== nearestShelf.id);
        }

        // Tambah jarak kembali ke start
        totalDistance += this.calculateDistance(currentPos, this.startPosition);

        // Bonus untuk mengambil lebih banyak barang dalam satu trip
        const efficiencyBonus = itemCombination.length * 5; // Lebih banyak barang = score lebih baik

        // Bonus untuk mengurangi jumlah kategori unik (mengurangi rak yang dikunjungi)
        const categoryEfficiencyBonus = (this.trolleyCapacity - categories.length) * 3;

        return totalDistance - efficiencyBonus - categoryEfficiencyBonus;
    }

    // Mencari rute optimal untuk kombinasi barang tertentu
    findOptimalRouteForItems(items) {
        const categories = [...new Set(items.map(item => item.category))];
        const targetShelves = categories.map(cat =>
            this.shelves.find(shelf => shelf.category === cat)
        );

        // Gunakan nearest neighbor algorithm
        let route = [];
        let currentPos = { ...this.startPosition };
        let remainingShelves = [...targetShelves];

        while (remainingShelves.length > 0) {
            let nearestShelf = null;
            let minDistance = Infinity;

            remainingShelves.forEach(shelf => {
                const distance = this.calculateDistance(currentPos, shelf.position);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestShelf = shelf;
                }
            });

            route.push(nearestShelf);
            currentPos = nearestShelf.position;
            remainingShelves = remainingShelves.filter(shelf => shelf.id !== nearestShelf.id);
        }

        return route;
    }
}

// Class utama untuk game versi 2
class MinimartWorkerGameV2 {
    constructor() {
        this.workerPosition = { ...mockDataV2.workerStartPosition };
        this.trolley = [];
        this.shelves = mockDataV2.shelves;
        this.remainingItems = [...mockDataV2.items];
        this.stepCount = 0;
        this.tripCount = 0;
        this.gameCompleted = false;
        this.trolleyCapacity = mockDataV2.trolleyCapacity;
        this.routeCalculator = new OptimalRouteCalculator(
            this.workerPosition,
            this.shelves,
            this.trolleyCapacity
        );
        this.gameLog = [];
    }

    // Menghitung jarak Manhattan
    calculateDistance(pos1, pos2) {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    }

    // Memindahkan pekerja ke posisi tertentu
    moveWorkerTo(targetPosition) {
        const distance = this.calculateDistance(this.workerPosition, targetPosition);
        this.stepCount += distance;
        this.workerPosition = { ...targetPosition };

        const logMsg = `🚶 Trip ${this.tripCount}: Berpindah ke (${targetPosition.x}, ${targetPosition.y}) | Steps: +${distance} | Total: ${this.stepCount}`;
        console.log(logMsg);
        this.gameLog.push(logMsg);

        return distance;
    }

    // Kembali ke posisi start untuk mengambil barang lagi
    returnToStart() {
        if (this.workerPosition.x !== this.routeCalculator.startPosition.x ||
            this.workerPosition.y !== this.routeCalculator.startPosition.y) {
            const logMsg = `🔄 Kembali ke start untuk trip berikutnya`;
            console.log(logMsg);
            this.gameLog.push(logMsg);
            return this.moveWorkerTo(this.routeCalculator.startPosition);
        }
        return 0;
    }

    // Memilih barang optimal untuk trip berikutnya
    selectOptimalItems() {
        if (this.remainingItems.length === 0) {
            return [];
        }

        const optimization = this.routeCalculator.findOptimalItemCombination(this.remainingItems);
        const selectedItems = optimization.items;

        // Pindahkan barang yang dipilih ke trolley
        this.trolley = [...selectedItems];
        this.remainingItems = this.remainingItems.filter(item =>
            !selectedItems.some(selected => selected.id === item.id)
        );

        const logMsg = `🛒 Trip ${this.tripCount + 1}: Memilih ${selectedItems.length} barang (Score: ${optimization.score.toFixed(1)})`;
        console.log(logMsg);
        this.gameLog.push(logMsg);

        selectedItems.forEach(item => {
            const itemMsg = `   - ${item.name} (${item.category})`;
            console.log(itemMsg);
            this.gameLog.push(itemMsg);
        });

        return selectedItems;
    }

    // Menjalankan satu trip lengkap
    async executeTrip() {
        this.tripCount++;

        console.log(`\n🚀 === TRIP ${this.tripCount} ===`);
        this.gameLog.push(`\n🚀 === TRIP ${this.tripCount} ===`);

        // Pilih barang optimal
        const selectedItems = this.selectOptimalItems();

        if (selectedItems.length === 0) {
            this.gameCompleted = true;
            return;
        }

        // Cari rute optimal untuk barang yang dipilih
        const optimalRoute = this.routeCalculator.findOptimalRouteForItems(selectedItems);

        const routeMsg = `📍 Rute optimal: ${optimalRoute.map(shelf => shelf.name).join(' → ')}`;
        console.log(routeMsg);
        this.gameLog.push(routeMsg);

        // Eksekusi rute
        for (const shelf of optimalRoute) {
            // Pindah ke rak
            await this.moveWorkerTo(shelf.position);

            // Ambil barang yang sesuai kategori dari trolley
            const itemsForShelf = this.trolley.filter(item => item.category === shelf.category);

            const deliveryMsg = `📦 Menempatkan ${itemsForShelf.length} barang di ${shelf.name}:`;
            console.log(deliveryMsg);
            this.gameLog.push(deliveryMsg);

            itemsForShelf.forEach(item => {
                const itemMsg = `   ✓ ${item.name}`;
                console.log(itemMsg);
                this.gameLog.push(itemMsg);
            });

            // Hapus dari trolley
            this.trolley = this.trolley.filter(item => item.category !== shelf.category);
        }

        // Kembali ke start jika masih ada barang tersisa
        if (this.remainingItems.length > 0) {
            await this.returnToStart();
        }

        const tripSummaryMsg = `✅ Trip ${this.tripCount} selesai | Sisa barang: ${this.remainingItems.length}`;
        console.log(tripSummaryMsg);
        this.gameLog.push(tripSummaryMsg);
    }

    // Menjalankan game lengkap dengan strategi optimal
    async playOptimalGameV2() {
        console.log('🎮 MINIMART WORKER GAME V2 - OPTIMAL STRATEGY');
        console.log('============================================');
        console.log(`📋 Kapasitas trolley: ${this.trolleyCapacity} barang`);
        console.log(`📦 Total barang: ${this.remainingItems.length}`);
        console.log(`🏪 Total rak: ${this.shelves.length}`);

        this.gameLog.push('🎮 MINIMART WORKER GAME V2 - OPTIMAL STRATEGY');
        this.gameLog.push(`📋 Kapasitas trolley: ${this.trolleyCapacity} barang`);
        this.gameLog.push(`📦 Total barang: ${this.remainingItems.length}`);

        while (this.remainingItems.length > 0 && !this.gameCompleted) {
            await this.executeTrip();
        }

        this.gameCompleted = true;

        console.log('\n🎉 GAME COMPLETED!');
        console.log(`🏆 Total trips: ${this.tripCount}`);
        console.log(`🏆 Total steps: ${this.stepCount}`);
        console.log(`📊 Average steps per trip: ${(this.stepCount / this.tripCount).toFixed(1)}`);

        this.gameLog.push('\n🎉 GAME COMPLETED!');
        this.gameLog.push(`🏆 Total trips: ${this.tripCount}`);
        this.gameLog.push(`🏆 Total steps: ${this.stepCount}`);

        return {
            trips: this.tripCount,
            steps: this.stepCount,
            efficiency: this.stepCount / this.tripCount
        };
    }

    // Menjalankan game dengan strategi greedy (ambil barang pertama yang tersedia)
    async playGreedyGameV2() {
        // Reset game state
        this.workerPosition = { ...mockDataV2.workerStartPosition };
        this.trolley = [];
        this.remainingItems = [...mockDataV2.items];
        this.stepCount = 0;
        this.tripCount = 0;
        this.gameCompleted = false;
        this.gameLog = [];

        console.log('🎮 MINIMART WORKER GAME V2 - GREEDY STRATEGY');
        console.log('==========================================');

        while (this.remainingItems.length > 0 && !this.gameCompleted) {
            this.tripCount++;
            console.log(`\n🚀 === TRIP ${this.tripCount} (GREEDY) ===`);

            // Ambil 2 barang pertama yang tersedia (greedy)
            const selectedItems = this.remainingItems.slice(0, this.trolleyCapacity);
            this.trolley = [...selectedItems];
            this.remainingItems = this.remainingItems.slice(this.trolleyCapacity);

            console.log(`🛒 Mengambil ${selectedItems.length} barang pertama:`);
            selectedItems.forEach(item => {
                console.log(`   - ${item.name} (${item.category})`);
            });

            // Cari rute dengan nearest neighbor
            const categories = [...new Set(selectedItems.map(item => item.category))];
            const targetShelves = categories.map(cat =>
                this.shelves.find(shelf => shelf.category === cat)
            );

            let currentPos = { ...this.workerPosition };
            let remainingShelves = [...targetShelves];

            while (remainingShelves.length > 0) {
                let nearestShelf = null;
                let minDistance = Infinity;

                remainingShelves.forEach(shelf => {
                    const distance = this.calculateDistance(currentPos, shelf.position);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestShelf = shelf;
                    }
                });

                await this.moveWorkerTo(nearestShelf.position);

                const itemsForShelf = this.trolley.filter(item => item.category === nearestShelf.category);
                console.log(`📦 Menempatkan ${itemsForShelf.length} barang di ${nearestShelf.name}`);

                this.trolley = this.trolley.filter(item => item.category !== nearestShelf.category);
                remainingShelves = remainingShelves.filter(shelf => shelf.id !== nearestShelf.id);
                currentPos = nearestShelf.position;
            }

            if (this.remainingItems.length > 0) {
                await this.returnToStart();
            }

            console.log(`✅ Trip ${this.tripCount} selesai | Sisa barang: ${this.remainingItems.length}`);
        }

        this.gameCompleted = true;
        console.log('\n🎉 GREEDY GAME COMPLETED!');
        console.log(`🏆 Total trips: ${this.tripCount}`);
        console.log(`🏆 Total steps: ${this.stepCount}`);

        return {
            trips: this.tripCount,
            steps: this.stepCount,
            efficiency: this.stepCount / this.tripCount
        };
    }

    // Method untuk mendapatkan status game
    getGameStatus() {
        return {
            workerPosition: this.workerPosition,
            trolleyItems: this.trolley.length,
            trolleyCapacity: this.trolleyCapacity,
            remainingItems: this.remainingItems.length,
            stepCount: this.stepCount,
            tripCount: this.tripCount,
            completed: this.gameCompleted,
            gameLog: this.gameLog
        };
    }
}

// Fungsi untuk menjalankan perbandingan strategi
async function runStrategyComparison() {
    console.log('🔄 PERBANDINGAN STRATEGI V2');
    console.log('===========================\n');

    const optimalGame = new MinimartWorkerGameV2();
    const greedyGame = new MinimartWorkerGameV2();

    console.log('🎯 Menjalankan strategi OPTIMAL...');
    const optimalResult = await optimalGame.playOptimalGameV2();

    console.log('\n' + '='.repeat(60) + '\n');

    console.log('🔥 Menjalankan strategi GREEDY...');
    const greedyResult = await greedyGame.playGreedyGameV2();

    console.log('\n📊 HASIL PERBANDINGAN:');
    console.log('======================');
    console.log(`🎯 Optimal Strategy:`);
    console.log(`   Trips: ${optimalResult.trips}`);
    console.log(`   Steps: ${optimalResult.steps}`);
    console.log(`   Avg steps/trip: ${optimalResult.efficiency.toFixed(1)}`);
    console.log('');
    console.log(`🔥 Greedy Strategy:`);
    console.log(`   Trips: ${greedyResult.trips}`);
    console.log(`   Steps: ${greedyResult.steps}`);
    console.log(`   Avg steps/trip: ${greedyResult.efficiency.toFixed(1)}`);
    console.log('');

    const stepImprovement = ((greedyResult.steps - optimalResult.steps) / greedyResult.steps * 100);
    const tripComparison = greedyResult.trips - optimalResult.trips;

    console.log(`💡 Analisis:`);
    console.log(`   Step Efficiency: ${stepImprovement.toFixed(1)}% lebih baik`);
    console.log(`   Trip Difference: ${tripComparison} trip`);

    if (optimalResult.steps < greedyResult.steps) {
        console.log(`   🏆 Optimal strategy lebih efisien!`);
    } else {
        console.log(`   🤔 Perlu optimasi lebih lanjut...`);
    }
}

// Menjalankan demo
console.log('🏪 MINIMART WORKER GAME V2 DEMO');
console.log('===============================');
console.log(`📋 Fitur baru:`);
console.log(`   - Kapasitas trolley terbatas: ${mockDataV2.trolleyCapacity} barang`);
console.log(`   - Optimasi pemilihan barang per trip`);
console.log(`   - Multiple trips dengan strategi optimal`);
console.log(`   - Perbandingan dengan strategi greedy`);
console.log('\n');

// Jalankan perbandingan
runStrategyComparison();

// Export untuk penggunaan di module lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MinimartWorkerGameV2, mockDataV2, OptimalRouteCalculator };
}