const LEVELS = [
    // Level 1: Easy (2 deliveries, 5-7 obstacles)
    {
        grid: [
            ['P', '.', '.', '.', '.', '.', 'D'],
            ['.', '#', '.', '.', '#', '.', '.'],
            ['.', '#', '.', '.', '#', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.'],
            ['.', '#', '.', '.', '#', '.', '.'],
            ['.', '.', '.', '.', '#', '.', '.'],
            ['D', '.', '.', '#', '.', '.', 'G'],
        ],
    },
    // Level 2: Medium (3 deliveries, 8-10 obstacles)
    {
        grid: [
            ['P', '.', '#', '.', '.', '.', 'D'],
            ['.', '#', '#', '.', '#', '.', '.'],
            ['.', '.', '.', '.', '#', '.', '.'],
            ['.', '#', '.', '#', '.', '#', '.'],
            ['.', '#', '.', '#', '.', '.', 'D'],
            ['.', '.', '.', '#', '.', '.', '.'],
            ['D', '.', '.', '#', '.', '.', 'G'],
        ],
    },
    // Level 3: Hard (4 deliveries, tighter maze)
    {
        grid: [
            ['P', '.', '#', '.', '#', '.', 'D'],
            ['.', '#', '#', '.', '#', '.', '.'],
            ['.', '.', '.', '.', '#', '.', '.'],
            ['#', '.', '#', '.', '.', '#', '.'],
            ['.', '.', '#', '#', '.', '.', 'D'],
            ['.', '#', '.', '.', '#', '.', '.'],
            ['D', '.', '.', '#', '.', 'D', 'G'],
        ],
    },
    // Level 4: Expert (5 deliveries, complex routing)
    {
        grid: [
            ['P', '#', '.', '#', '.', '.', 'D'],
            ['.', '#', '.', '#', '.', '#', '.'],
            ['.', '.', '.', '.', '.', '#', '.'],
            ['#', '.', '#', '#', '.', '#', '.'],
            ['D', '.', '#', '.', '.', '.', 'D'],
            ['.', '#', '.', '.', '#', '.', '.'],
            ['D', '.', '.', '#', '.', 'D', 'G'],
        ],
    },
];

const ROWS = 7, COLS = 7;
let gridData, player, deliveries = [], userSteps = 0, totalSteps = 0, currentLevel = 0;

function loadLevel(levelIndex = 0) {
    hideOverlay();
    currentLevel = Math.min(Math.max(levelIndex, 0), LEVELS.length - 1);
    const { grid } = LEVELS[currentLevel];

    gridData = grid.map(r => r.slice());
    deliveries = [];

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            if (gridData[i][j] === 'P') {
                player = [i, j];
                gridData[i][j] = '.'; // keep the grid clean; player is tracked separately
            }
            if (gridData[i][j] === 'D') deliveries.push([i, j]);
        }
    }

    userSteps = 0;
    ensureSolvable();
    render();
}

function ensureSolvable() {
    const goal = findGoal();
    if (!goal) return;

    const needsFix = () => {
        // All deliveries must be reachable from the player.
        for (const d of deliveries) {
            if (aStar(player, d).length <= 1) return true;
        }
        // Goal must be reachable after deliveries are done.
        if (aStar(player, goal).length <= 1) return true;
        return false;
    };

    let attempts = 0;
    while (needsFix() && attempts < 300) {
        attempts++;

        // Collect all tiles reachable from the player (ignoring obstacles)
        const reachable = new Set();
        const queue = [player];
        reachable.add(player.toString());

        while (queue.length) {
            const [r, c] = queue.shift();
            for (const [nr, nc] of neighbors(r, c)) {
                const key = [nr, nc].toString();
                if (reachable.has(key)) continue;
                reachable.add(key);
                queue.push([nr, nc]);
            }
        }

        // Find a wall adjacent to reachable area and open it.
        const wallCandidates = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (gridData[r][c] !== '#') continue;
                const adj = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
                for (const [ar, ac] of adj) {
                    if (ar < 0 || ac < 0 || ar >= ROWS || ac >= COLS) continue;
                    if (reachable.has([ar, ac].toString())) {
                        wallCandidates.push([r, c]);
                        break;
                    }
                }
            }
        }

        if (!wallCandidates.length) break;
        const [wr, wc] = wallCandidates[Math.floor(Math.random() * wallCandidates.length)];
        gridData[wr][wc] = '.';
    }
}

function manhattan(a, b) { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]); }

function neighbors(r, c) {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    return dirs.map(d => [r + d[0], c + d[1]])
        .filter(([nr, nc]) => nr >= 0 && nc >= 0 && nr < ROWS && nc < COLS && gridData[nr][nc] !== '#');
}

function aStar(start, goal) {
    const pq = [[0, start]];
    const cost = { [start]: 0 }, parent = { [start]: null };

    while (pq.length) {
        pq.sort((a, b) => a[0] - b[0]);
        const [_, cur] = pq.shift();
        if (cur.toString() === goal.toString()) break;

        for (const n of neighbors(cur[0], cur[1])) {
            const key = n.toString(), ckey = cur.toString();
            const newCost = cost[ckey] + 1;
            if (!(key in cost) || newCost < cost[key]) {
                cost[key] = newCost;
                pq.push([newCost + manhattan(n, goal), n]);
                parent[key] = cur;
            }
        }
    }

    const goalKey = goal.toString();
    if (!(goalKey in parent)) return [];

    const path = [];
    let cur = goal;
    while (cur) {
        path.push(cur);
        cur = parent[cur.toString()];
    }
    return path.reverse();
}

function nearestDelivery() {
    let best = null, bestDist = Infinity, bestPath = [];
    for (const d of deliveries) {
        const path = aStar(player, d);
        if (path.length > 1 && path.length < bestDist) {
            bestDist = path.length; best = d; bestPath = path;
        }
    }

    if (!best) {
        const g = findGoal();
        const path = aStar(player, g);
        return { best: g, bestPath: path };
    }
    return { best, bestPath };
}

function findGoal() {
    for (let i = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++)
        if (gridData[i][j] === 'G') return [i, j];
}

function nextLevel() {
    if (currentLevel < LEVELS.length - 1) {
        loadLevel(currentLevel + 1);
    } else {
        showOverlay('All Deliveries Completed', 'You finished every level! Great job!', () => {
            hideOverlay();
            loadLevel(0);
        });
    }
}

function showLevelCompleteOverlay() {
    const nextLevelNum = currentLevel + 2;
    const isLast = currentLevel >= LEVELS.length - 1;
    const title = isLast ? 'All Deliveries Completed!' : `Level ${currentLevel + 1} Complete`;
    const message = isLast
        ? 'You finished all levels! Press continue to restart.'
        : `Ready for Level ${nextLevelNum}?`;

    showOverlay(title, message, () => {
        hideOverlay();
        if (isLast) {
            loadLevel(0);
        } else {
            loadLevel(currentLevel + 1);
        }
    });
}

function showOverlay(title, text, onContinue) {
    const overlay = document.getElementById('overlay');
    document.getElementById('overlay-title').innerText = title;
    document.getElementById('overlay-text').innerText = text;
    const btn = document.getElementById('overlay-btn');

    btn.onclick = () => {
        onContinue?.();
    };

    overlay.classList.remove('hidden');
}

function hideOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.classList.add('hidden');
}

function render(path = []) {
    const grid = document.getElementById('grid'); grid.innerHTML = '';
    for (let i = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++) {
        const cell = document.createElement('div'); cell.classList.add('cell');
        const v = gridData[i][j];
        const isPlayer = player[0] === i && player[1] === j;

        if (v == '.') cell.classList.add('road');
        if (v == '#') cell.classList.add('block');
        if (v == 'D') cell.classList.add('delivery');
        if (v == 'X') cell.classList.add('done');
        if (v == 'G') cell.classList.add('goal');

        if (isPlayer) {
            cell.classList.add('player');
            cell.classList.add('bump');
            cell.textContent = '🚴';
        } else {
            if (v == 'D') cell.textContent = '📦';
            if (v == 'G') cell.textContent = '🏁';
            if (v == '#') cell.textContent = '🚧';
        }

        if (path.some(p => p[0] == i && p[1] == j)) cell.classList.add('path');
        grid.appendChild(cell);
    }

    const { best, bestPath } = nearestDelivery();
    document.getElementById('aiSteps').innerText = bestPath.length ? bestPath.length - 1 : '-';
    document.getElementById('distance').innerText = best ? manhattan(player, best) : '-';
    document.getElementById('userSteps').innerText = userSteps;
    document.getElementById('totalSteps').innerText = totalSteps;
    document.getElementById('level').innerText = currentLevel + 1;
}

function move(dir) {
    const moves = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
    const [dr, dc] = moves[dir]; const [r, c] = player;
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS || gridData[nr][nc] == '#') return;

    // deliver if stepping on D
    if (gridData[nr][nc] == 'D') {
        gridData[nr][nc] = 'X';
        deliveries = deliveries.filter(d => !(d[0] == nr && d[1] == nc));
        alert('📦 Delivered!');
    }

    // enforce delivery-before-goal rule
    if (gridData[nr][nc] == 'G' && deliveries.length > 0) {
        alert('Deliver all parcels first!');
        return;
    }

    player = [nr, nc];
    userSteps++;
    totalSteps++;

    if (deliveries.length === 0 && gridData[nr][nc] === 'G') {
        showLevelCompleteOverlay();
        return;
    }

    render();
}

function hint() {
    const { bestPath } = nearestDelivery();
    if (bestPath.length > 1) alert(`AI suggests next move to: [${bestPath[1][0]}, ${bestPath[1][1]}]`);
}

function showAIPlan() {
    if (deliveries.length > 0) {
        alert('Finish all deliveries first to preview the final route.');
        return;
    }

    const { bestPath } = nearestDelivery();
    if (bestPath.length <= 1) return;

    let i = 0;
    const timer = setInterval(() => {
        render(bestPath.slice(0, i + 1));
        i++;
        if (i >= bestPath.length) clearInterval(timer);
    }, 120);
}

function getDir(from, to) {
    const dr = to[0] - from[0];
    const dc = to[1] - from[1];
    if (dr === -1) return 'up';
    if (dr === 1) return 'down';
    if (dc === -1) return 'left';
    if (dc === 1) return 'right';
}

function autoMove() {
    const { bestPath } = nearestDelivery();
    if (bestPath.length <= 1) return;
    let step = 1;
    const timer = setInterval(() => {
        if (step >= bestPath.length) {
            clearInterval(timer);
            return;
        }
        const next = bestPath[step];
        const dir = getDir(player, next);
        move(dir);
        step++;
    }, 500);
}

function resetGame() {
    totalSteps = 0;
    loadLevel(0);
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        move('up');
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        move('down');
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        move('left');
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        move('right');
    }
});

loadLevel(0);
