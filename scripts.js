let currentGame = null;
let isGameRunning = false;
let currentGameData = null;

// Step tracking variables
let gameSteps = [];
let currentStepIndex = 0;
let isPlaying = false;
let playInterval = null;

// Step tracking class
class GameStep {
    constructor(stepNumber, workerPosition, action, targetPosition, itemsCarrying, trolleyItems, remainingItems, description) {
        this.stepNumber = stepNumber;
        this.workerPosition = { ...workerPosition };
        this.action = action; // 'move', 'pickup', 'dropoff', 'start'
        this.targetPosition = targetPosition ? { ...targetPosition } : null;
        this.itemsCarrying = [...itemsCarrying];
        this.trolleyItems = [...trolleyItems];
        this.remainingItems = [...remainingItems];
        this.description = description;
        this.timestamp = new Date().toLocaleTimeString();
    }
}

// Random data generator (same as before)
const itemCategories = [
    'alat_dapur', 'alat_rumah_tangga', 'keperluan_kantor',
    'mainan_anak', 'makanan_ringan', 'elektronik',
    'pakaian', 'perawatan_tubuh', 'obat_obatan',
    'olahraga', 'buku_alat_tulis', 'dekorasi_rumah'
];

const itemNames = {
    'alat_dapur': ['Panci', 'Wajan', 'Spatula', 'Sendok', 'Garpu', 'Pisau', 'Talenan', 'Piring'],
    'alat_rumah_tangga': ['Sapu', 'Pel', 'Ember', 'Sikat', 'Lap', 'Deterjen', 'Pembersih'],
    'keperluan_kantor': ['Pensil', 'Penghapus', 'Kertas A4', 'Stapler', 'Klip', 'Spidol', 'Penggaris'],
    'mainan_anak': ['Lego', 'Boneka', 'Mobil-mobilan', 'Puzzle', 'Bola', 'Rubik', 'Origami'],
    'makanan_ringan': ['Keripik', 'Biskuit', 'Coklat', 'Permen', 'Kacang', 'Wafer', 'Crackers'],
    'elektronik': ['Baterai', 'Kabel USB', 'Charger', 'Headphone', 'Speaker', 'Lampu LED'],
    'pakaian': ['Kaos', 'Celana', 'Jaket', 'Topi', 'Sarung Tangan', 'Kaus Kaki'],
    'perawatan_tubuh': ['Sabun', 'Shampoo', 'Pasta Gigi', 'Sikat Gigi', 'Lotion', 'Deodorant'],
    'obat_obatan': ['Paracetamol', 'Vitamin C', 'Plaster', 'Betadine', 'Minyak Kayu Putih'],
    'olahraga': ['Raket', 'Bola Tenis', 'Matras Yoga', 'Dumbbell', 'Sepatu Lari'],
    'buku_alat_tulis': ['Novel', 'Komik', 'Buku Tulis', 'Ballpoint', 'Highlighter'],
    'dekorasi_rumah': ['Vas Bunga', 'Bingkai Foto', 'Lilin', 'Tanaman Hias', 'Gorden']
};

const categoryNames = {
    'alat_dapur': 'Alat Dapur',
    'alat_rumah_tangga': 'Alat Rumah Tangga',
    'keperluan_kantor': 'Keperluan Kantor',
    'mainan_anak': 'Mainan Anak',
    'makanan_ringan': 'Makanan Ringan',
    'elektronik': 'Elektronik',
    'pakaian': 'Pakaian',
    'perawatan_tubuh': 'Perawatan Tubuh',
    'obat_obatan': 'Obat-obatan',
    'olahraga': 'Olahraga',
    'buku_alat_tulis': 'Buku & Alat Tulis',
    'dekorasi_rumah': 'Dekorasi Rumah'
};

function addGameStep(stepNumber, workerPos, action, targetPos, itemsCarrying, trolleyItems, remainingItems, description) {
    const step = new GameStep(stepNumber, workerPos, action, targetPos, itemsCarrying, trolleyItems, remainingItems, description);
    gameSteps.push(step);
    updateStepDisplay();
}

function clearGameSteps() {
    gameSteps = [];
    currentStepIndex = 0;
    updateStepDisplay();
    clearPathHighlights();
}

function updateStepDisplay() {
    document.getElementById('stepNumber').textContent = currentStepIndex;
    document.getElementById('totalSteps').textContent = gameSteps.length;

    if (gameSteps.length > 0 && currentStepIndex < gameSteps.length) {
        const step = gameSteps[currentStepIndex];
        document.getElementById('stepDescription').innerHTML = `
                    <strong>${step.action.toUpperCase()}</strong><br>
                    ${step.description}<br>
                    <small>Time: ${step.timestamp}</small>
                `;
    } else {
        document.getElementById('stepDescription').textContent = 'No steps recorded';
    }

    // Update navigation buttons
    document.getElementById('prevBtn').disabled = currentStepIndex <= 0;
    document.getElementById('nextBtn').disabled = currentStepIndex >= gameSteps.length - 1;
}

function displayStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= gameSteps.length) return;

    const step = gameSteps[stepIndex];

    // Clear previous highlights
    clearPathHighlights();

    // Update worker position
    updateWorkerPosition(step.workerPosition.x, step.workerPosition.y);

    // Update worker info
    document.getElementById('workerX').textContent = step.workerPosition.x;
    document.getElementById('workerY').textContent = step.workerPosition.y;
    document.getElementById('currentStep').textContent = step.stepNumber;

    // Update target info
    if (step.targetPosition) {
        document.getElementById('currentTarget').textContent = `(${step.targetPosition.x}, ${step.targetPosition.y})`;
    } else {
        document.getElementById('currentTarget').textContent = 'None';
    }

    // Update worker items
    updateWorkerItems(step.itemsCarrying);

    // Update trolley and remaining items
    updateTrolleyDisplay(step.trolleyItems);
    updateRemainingItems(step.remainingItems);

    // Highlight path from previous steps
    highlightPath(stepIndex);

    // Add step indicator
    addStepIndicator(step.workerPosition.x, step.workerPosition.y, step.stepNumber);

    logMessage(`📍 Step ${step.stepNumber}: ${step.description}`);
}

function highlightPath(currentIndex) {
    // Highlight previous steps with yellow
    for (let i = 0; i < currentIndex; i++) {
        const step = gameSteps[i];
        const cell = document.getElementById(`cell-${step.workerPosition.x}-${step.workerPosition.y}`);
        if (cell && !cell.classList.contains('worker')) {
            cell.classList.add('path-step-previous');
        }
    }

    // Highlight current step with bright yellow
    if (currentIndex < gameSteps.length) {
        const currentStep = gameSteps[currentIndex];
        const cell = document.getElementById(`cell-${currentStep.workerPosition.x}-${currentStep.workerPosition.y}`);
        if (cell) {
            cell.classList.add('path-step');
        }
    }
}

function clearPathHighlights() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('path-step', 'path-step-previous');

        // Remove step indicators
        const stepIndicator = cell.querySelector('.step-indicator');
        if (stepIndicator) {
            stepIndicator.remove();
        }
    });
}

function addStepIndicator(x, y, stepNumber) {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (cell) {
        const indicator = document.createElement('div');
        indicator.className = 'step-indicator';
        indicator.textContent = `S${stepNumber}`;
        cell.appendChild(indicator);
    }
}

function updateWorkerItems(items) {
    const workerItemsDiv = document.getElementById('workerItems');
    if (items.length === 0) {
        workerItemsDiv.innerHTML = '<em>No items</em>';
    } else {
        workerItemsDiv.innerHTML = items.map(item =>
            `<span class="worker-item">${item.name}<br><small>${item.category}</small></span>`
        ).join('');
    }
}

function nextStep() {
    if (currentStepIndex < gameSteps.length - 1) {
        currentStepIndex++;
        displayStep(currentStepIndex);
        updateStepDisplay();
    }
}

function previousStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        displayStep(currentStepIndex);
        updateStepDisplay();
    }
}

function playAllSteps() {
    if (isPlaying) return;

    isPlaying = true;
    document.getElementById('playBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;

    playInterval = setInterval(() => {
        if (currentStepIndex < gameSteps.length - 1) {
            nextStep();
        } else {
            pauseSteps();
        }
    }, 1500); // 1.5 second interval
}

function pauseSteps() {
    isPlaying = false;
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
    }

    document.getElementById('playBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
}

function resetSteps() {
    pauseSteps();
    currentStepIndex = 0;
    if (gameSteps.length > 0) {
        displayStep(0);
    }
    updateStepDisplay();
}

// Enhanced game functions with step tracking
function generateRandomShelves(difficulty) {
    let shelfCount;
    switch (difficulty) {
        case 'easy': shelfCount = Math.floor(Math.random() * 4) + 5; break;
        case 'medium': shelfCount = Math.floor(Math.random() * 6) + 5; break;
        case 'hard': shelfCount = Math.floor(Math.random() * 5) + 8; break;
        default: shelfCount = 7;
    }

    const selectedCategories = [...itemCategories]
        .sort(() => Math.random() - 0.5)
        .slice(0, shelfCount);

    const shelves = [];
    const usedPositions = new Set();
    usedPositions.add('0,0');

    selectedCategories.forEach((category, index) => {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * 6),
                y: Math.floor(Math.random() * 5)
            };
        } while (usedPositions.has(`${position.x},${position.y}`));

        usedPositions.add(`${position.x},${position.y}`);

        shelves.push({
            id: index + 1,
            category: category,
            position: position,
            name: categoryNames[category]
        });
    });

    return shelves;
}

function generateRandomItems(itemCount, shelves) {
    const items = [];
    const availableCategories = shelves.map(shelf => shelf.category);

    for (let i = 1; i <= itemCount; i++) {
        const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        const categoryItems = itemNames[randomCategory];
        const randomItemName = categoryItems[Math.floor(Math.random() * categoryItems.length)];

        items.push({
            id: i,
            name: `${randomItemName} ${Math.floor(Math.random() * 100) + 1}`,
            category: randomCategory
        });
    }

    return items;
}

function generateRandomData() {
    if (isGameRunning) {
        showAlert('⚠️ Tidak bisa generate data saat game sedang berjalan!', 'warning');
        return;
    }

    const trolleyCapacity = parseInt(document.getElementById('trolleyCapacity').value);
    const itemCount = parseInt(document.getElementById('itemCount').value);
    const difficulty = document.getElementById('difficulty').value;

    if (trolleyCapacity < 1 || trolleyCapacity > 10) {
        showAlert('❌ Kapasitas trolley harus antara 1-10!', 'error');
        return;
    }

    if (itemCount < 5 || itemCount > 50) {
        showAlert('❌ Jumlah barang harus antara 5-50!', 'error');
        return;
    }

    showAlert('🎲 Generating random data...', 'info');

    const shelves = generateRandomShelves(difficulty);
    const items = generateRandomItems(itemCount, shelves);

    currentGameData = {
        workerStartPosition: { x: 0, y: 0 },
        trolleyCapacity: trolleyCapacity,
        shelves: shelves,
        items: items
    };

    Object.assign(mockDataV2, currentGameData);
    updateDataPreview();
    initializeDisplay();
    clearGameSteps();

    showAlert(`✅ Random data generated! ${shelves.length} rak, ${items.length} barang, kapasitas ${trolleyCapacity}`, 'success');
    logMessage(`🎲 Data random berhasil dibuat!`);
}

function resetToDefault() {
    if (isGameRunning) {
        showAlert('⚠️ Tidak bisa reset saat game sedang berjalan!', 'warning');
        return;
    }

    document.getElementById('trolleyCapacity').value = 2;
    document.getElementById('itemCount').value = 12;
    document.getElementById('difficulty').value = 'medium';

    currentGameData = {
        workerStartPosition: { x: 0, y: 0 },
        trolleyCapacity: 2,
        shelves: [
            { id: 1, category: 'alat_dapur', position: { x: 3, y: 1 }, name: 'Alat Dapur' },
            { id: 2, category: 'alat_rumah_tangga', position: { x: 1, y: 3 }, name: 'Alat Rumah Tangga' },
            { id: 3, category: 'keperluan_kantor', position: { x: 5, y: 2 }, name: 'Keperluan Kantor' },
            { id: 4, category: 'mainan_anak', position: { x: 2, y: 4 }, name: 'Mainan Anak' },
            { id: 5, category: 'makanan_ringan', position: { x: 4, y: 3 }, name: 'Makanan Ringan' }
        ],
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

    Object.assign(mockDataV2, currentGameData);
    updateDataPreview();
    initializeDisplay();
    clearGameSteps();
    showAlert('🔄 Data telah direset ke default!', 'success');
}

function applySettings() {
    if (isGameRunning) {
        showAlert('⚠️ Tidak bisa mengubah settings saat game sedang berjalan!', 'warning');
        return;
    }

    const trolleyCapacity = parseInt(document.getElementById('trolleyCapacity').value);

    if (currentGameData) {
        currentGameData.trolleyCapacity = trolleyCapacity;
        mockDataV2.trolleyCapacity = trolleyCapacity;

        updateDataPreview();
        initializeDisplay();
        showAlert(`⚙️ Settings applied! Kapasitas trolley: ${trolleyCapacity}`, 'success');
    } else {
        showAlert('❌ Generate atau reset data terlebih dahulu!', 'error');
    }
}

function updateDataPreview() {
    const data = currentGameData || mockDataV2;
    const previewDiv = document.getElementById('currentDataInfo');

    let html = `
                <div class="preview-item">🛒 Kapasitas Trolley: ${data.trolleyCapacity}</div>
                <div class="preview-item">🏪 Jumlah Rak: ${data.shelves.length}</div>
                <div class="preview-item">📦 Jumlah Barang: ${data.items.length}</div>
                <div class="preview-item">📍 Kategori Rak: ${data.shelves.map(s => s.name).join(', ')}</div>
            `;

    previewDiv.innerHTML = html;
}

function showAlert(message, type = 'info') {
    const alertArea = document.getElementById('alertArea');
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert';
    alertDiv.innerHTML = message;

    switch (type) {
        case 'success':
            alertDiv.style.backgroundColor = '#004400';
            alertDiv.style.color = '#00ff00';
            alertDiv.style.borderColor = '#00ff00';
            break;
        case 'warning':
            alertDiv.style.backgroundColor = '#664400';
            alertDiv.style.color = '#ffaa00';
            alertDiv.style.borderColor = '#ffaa00';
            break;
        case 'error':
            alertDiv.style.backgroundColor = '#440000';
            alertDiv.style.color = '#ff4444';
            alertDiv.style.borderColor = '#ff4444';
            break;
        default:
            alertDiv.style.backgroundColor = '#003366';
            alertDiv.style.color = '#66aaff';
            alertDiv.style.borderColor = '#66aaff';
    }

    alertArea.innerHTML = '';
    alertArea.appendChild(alertDiv);

    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 3000);
}

function initializeDisplay() {
    const data = currentGameData || mockDataV2;

    document.getElementById('maxCapacity').textContent = data.trolleyCapacity;
    document.getElementById('remainingCount').textContent = data.items.length;

    initializeGrid();
    updateRemainingItems(data.items);
    updateWorkerPosition(0, 0);
    updateWorkerItems([]);
    clearLog();
    clearGameSteps();

    // Reset worker status
    document.getElementById('workerX').textContent = '0';
    document.getElementById('workerY').textContent = '0';
    document.getElementById('currentStep').textContent = '0';
    document.getElementById('currentTarget').textContent = 'Start';

    logMessage('🏪 Minimart Worker Game V2 siap dimulai!');
    logMessage('Pilih strategi untuk memulai permainan.');
    logMessage(`📊 Current Setup: ${data.shelves.length} rak, ${data.items.length} barang, kapasitas ${data.trolleyCapacity}`);

    // Add initial step
    addGameStep(0, { x: 0, y: 0 }, 'start', null, [], [], data.items, 'Game started at position (0,0)');
}

function initializeGrid() {
    const data = currentGameData || mockDataV2;
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = '';

    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 6; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${x}-${y}`;
            cell.title = `Position (${x}, ${y})`;

            const shelf = data.shelves.find(s => s.position.x === x && s.position.y === y);
            if (shelf) {
                cell.classList.add('shelf');
                cell.title = `${shelf.name} - Position (${x}, ${y})`;
                cell.textContent = shelf.category.charAt(0).toUpperCase();
            }

            if (x === 0 && y === 0) {
                cell.classList.add('start');
                cell.textContent = '🏠';
                cell.title = 'Start Position (0, 0)';
            }

            // Add click handler for manual navigation
            cell.addEventListener('click', () => {
                if (!isGameRunning) {
                    manualMoveWorker(x, y);
                }
            });

            grid.appendChild(cell);
        }
    }
}

function manualMoveWorker(x, y) {
    if (gameSteps.length === 0) return;

    const currentPos = gameSteps[currentStepIndex].workerPosition;
    const distance = Math.abs(currentPos.x - x) + Math.abs(currentPos.y - y);

    if (distance > 0) {
        addGameStep(
            gameSteps.length,
            { x, y },
            'move',
            { x, y },
            gameSteps[currentStepIndex].itemsCarrying,
            gameSteps[currentStepIndex].trolleyItems,
            gameSteps[currentStepIndex].remainingItems,
            `Manual move to position (${x}, ${y})`
        );

        currentStepIndex = gameSteps.length - 1;
        displayStep(currentStepIndex);
        updateStepDisplay();
    }
}

function updateWorkerPosition(x, y, tripNumber = null) {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('worker');
        const indicator = cell.querySelector('.trip-indicator');
        if (indicator) indicator.remove();
    });

    const currentCell = document.getElementById(`cell-${x}-${y}`);
    if (currentCell) {
        currentCell.classList.add('worker');
        if (!currentCell.textContent || currentCell.textContent === '🏠') {
            currentCell.textContent = '👤';
        }

        if (tripNumber) {
            const indicator = document.createElement('div');
            indicator.className = 'trip-indicator';
            indicator.textContent = `T${tripNumber}`;
            currentCell.appendChild(indicator);
        }
    }
}

function updateStats(game) {
    const status = game.getGameStatus();
    document.getElementById('tripCount').textContent = status.tripCount;
    document.getElementById('stepCount').textContent = status.stepCount;
    document.getElementById('trolleyCount').textContent = status.trolleyItems;
    document.getElementById('remainingCount').textContent = status.remainingItems;
}

function updateTrolleyDisplay(items) {
    const trolleyDiv = document.getElementById('trolleyItems');
    if (items.length === 0) {
        trolleyDiv.innerHTML = 'Empty';
    } else {
        trolleyDiv.innerHTML = items.map(item =>
            `<span class="trolley-item">${item.name} (${item.category})</span>`
        ).join('');
    }
}

function updateRemainingItems(items) {
    const remainingDiv = document.getElementById('remainingItems');
    if (items.length === 0) {
        remainingDiv.innerHTML = '<em>All items sorted!</em>';
    } else {
        remainingDiv.innerHTML = items.map(item =>
            `<div style="font-size: 12px; margin: 2px 0;">• ${item.name} (${item.category})</div>`
        ).join('');
    }
}

function logMessage(message) {
    const log = document.getElementById('gameLog');
    log.innerHTML += message + '<br/>';
    log.scrollTop = log.scrollHeight;
}

function clearLog() {
    document.getElementById('gameLog').innerHTML = '';
}

function disableButtons(disabled = true) {
    document.getElementById('optimalBtn').disabled = disabled;
    document.getElementById('greedyBtn').disabled = disabled;
    document.getElementById('compareBtn').disabled = disabled;
    isGameRunning = disabled;
}

// Enhanced game execution with step tracking
async function startOptimalGame() {
    if (isGameRunning) return;

    disableButtons(true);
    clearGameSteps();
    currentGame = new MinimartWorkerGameV2();

    const data = currentGameData || mockDataV2;
    Object.assign(currentGame, {
        shelves: [...data.shelves],
        remainingItems: [...data.items],
        trolleyCapacity: data.trolleyCapacity
    });

    currentGame.routeCalculator = new OptimalRouteCalculator(
        currentGame.workerPosition,
        currentGame.shelves,
        currentGame.trolleyCapacity
    );

    clearLog();
    logMessage('🎯 Memulai strategi OPTIMAL dengan step tracking...');

    // Add initial step
    addGameStep(0, { x: 0, y: 0 }, 'start', null, [], [], data.items, 'Game started - Optimal Strategy');

    let stepCounter = 1;

    // Override methods to track steps
    const originalMove = currentGame.moveWorkerTo;
    currentGame.moveWorkerTo = function (targetPosition) {
        const distance = this.calculateDistance(this.workerPosition, targetPosition);
        this.stepCount += distance;
        this.workerPosition = { ...targetPosition };

        // Add step for each unit of movement
        for (let i = 1; i <= distance; i++) {
            addGameStep(
                stepCounter++,
                { ...targetPosition },
                'move',
                targetPosition,
                [...this.trolley],
                [...this.trolley],
                [...this.remainingItems],
                `Moving to ${targetPosition.x}, ${targetPosition.y} (step ${i}/${distance})`
            );
        }

        return Promise.resolve(distance);
    };

    // Execute optimal strategy
    while (currentGame.remainingItems.length > 0 && !currentGame.gameCompleted) {
        await currentGame.executeTrip();

        // Add step for trip completion
        addGameStep(
            stepCounter++,
            { ...currentGame.workerPosition },
            'trip_complete',
            null,
            [],
            [...currentGame.trolley],
            [...currentGame.remainingItems],
            `Trip ${currentGame.tripCount} completed`
        );
    }

    currentGame.gameCompleted = true;
    logMessage('\n🎉 OPTIMAL STRATEGY COMPLETED!');
    logMessage(`🏆 Total trips: ${currentGame.tripCount}`);
    logMessage(`🏆 Total steps: ${currentGame.stepCount}`);
    logMessage(`📊 Step tracking: ${gameSteps.length} steps recorded`);

    // Start from first step
    currentStepIndex = 0;
    displayStep(0);
    updateStepDisplay();

    disableButtons(false);
}

async function startGreedyGame() {
    if (isGameRunning) return;

    disableButtons(true);
    clearGameSteps();
    currentGame = new MinimartWorkerGameV2();

    const data = currentGameData || mockDataV2;
    Object.assign(currentGame, {
        shelves: [...data.shelves],
        remainingItems: [...data.items],
        trolleyCapacity: data.trolleyCapacity
    });

    clearLog();
    logMessage('🔥 Memulai strategi GREEDY dengan step tracking...');

    addGameStep(0, { x: 0, y: 0 }, 'start', null, [], [], data.items, 'Game started - Greedy Strategy');

    let stepCounter = 1;

    // Override moveWorkerTo for step tracking
    const originalMove = currentGame.moveWorkerTo;
    currentGame.moveWorkerTo = function (targetPosition) {
        const distance = this.calculateDistance(this.workerPosition, targetPosition);
        this.stepCount += distance;
        this.workerPosition = { ...targetPosition };

        for (let i = 1; i <= distance; i++) {
            addGameStep(
                stepCounter++,
                { ...targetPosition },
                'move',
                targetPosition,
                [...this.trolley],
                [...this.trolley],
                [...this.remainingItems],
                `Moving to ${targetPosition.x}, ${targetPosition.y} (step ${i}/${distance})`
            );
        }

        return Promise.resolve(distance);
    };

    // Execute greedy strategy
    while (currentGame.remainingItems.length > 0 && !currentGame.gameCompleted) {
        await currentGame.executeTrip();

        addGameStep(
            stepCounter++,
            { ...currentGame.workerPosition },
            'trip_complete',
            null,
            [],
            [...currentGame.trolley],
            [...currentGame.remainingItems],
            `Trip ${currentGame.tripCount} completed`
        );
    }

    currentGame.gameCompleted = true;
    logMessage('\n🎉 GREEDY STRATEGY COMPLETED!');
    logMessage(`🏆 Total trips: ${currentGame.tripCount}`);
    logMessage(`🏆 Total steps: ${currentGame.stepCount}`);
    logMessage(`📊 Step tracking: ${gameSteps.length} steps recorded`);

    currentStepIndex = 0;
    displayStep(0);
    updateStepDisplay();

    disableButtons(false);
}

async function runComparison() {
    showAlert('📊 Comparison mode doesn\'t support step tracking. Use individual strategies for step-by-step analysis.', 'info');
}

function resetGame() {
    if (isGameRunning) return;

    pauseSteps();
    currentGame = null;
    clearGameSteps();
    initializeDisplay();
}

// Initialize on page load
window.onload = function () {
    currentGameData = { ...mockDataV2 };
    updateDataPreview();
    initializeDisplay();
};