const board = document.getElementById('board');

const grid = Array.from({ length: 5 }, () => Array(4).fill(null));

const pieces = [
  { id: 1, size: '2x2', x: 1, y: 0, label: '曹操', initialX: 1, initialY: 0 },
  { id: 2, size: '1x2', x: 0, y: 0, label: '',  initialX: 0, initialY: 0 },
  { id: 3, size: '1x2', x: 3, y: 0, label: '',  initialX: 3, initialY: 0 },
  { id: 4, size: '2x1', x: 1, y: 2, label: '', initialX: 1, initialY: 2 },
  { id: 5, size: '2x1', x: 1, y: 3, label: '', initialX: 1, initialY: 3 },
  { id: 6, size: '1x1', x: 0, y: 3, label: '', initialX: 0, initialY: 3 },
  { id: 7, size: '1x1', x: 3, y: 3, label: '', initialX: 3, initialY: 3 },
  { id: 8, size: '1x1', x: 0, y: 4, label: '', initialX: 0, initialY: 4 },
  { id: 9, size: '1x1', x: 3, y: 4, label: '', initialX: 3, initialY: 4 },
  { id: 99, size: '2x2', x: 1, y: 3, label: '', isGhost: true },
];

function occupyGrid(id, x, y, w, h) {
  if (id === 99) return;
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      grid[y + dy][x + dx] = id;
    }
  }
}

function isFree(x, y, w, h, id) {
  if (x < 0 || y < 0 || x + w > 4 || y + h > 5) return false;
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const current = grid[y + dy][x + dx];
      if (current !== null && current !== id) return false;
    }
  }
  return true;
}

function clearGrid(id) {
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 4; x++) {
      if (grid[y][x] === id) grid[y][x] = null;
    }
  }
}

function createPiece(piece) {
  const el = document.createElement('div');
  if (piece.isGhost) {
    this.createGhostPiece(piece);
    return
  }
    el.classList.add('piece');
    el.dataset.id = piece.id;
    el.dataset.size = piece.size;
    el.innerText = piece.label;

  const [w, h] = piece.size.split('x').map(Number);
  el.style.width = w * 98 + (w - 1) * 2 + 'px';
  el.style.height = h * 98 + (h - 1) * 2 + 'px';

  let posX = piece.x;
  let posY = piece.y;
  occupyGrid(piece.id, posX, posY, w, h);

  const updatePos = () => {
    el.style.left = posX * 100 + 'px';
    el.style.top = posY * 100 + 'px';
  };
  updatePos();

  el.addEventListener('pointerdown', (e) => {
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
  
    let lastMovedX = 0;
    let lastMovedY = 0;
  
    const selectedPiece = piece;
    const [w, h] = piece.size.split('x').map(Number);
  
    function tryMove(dirX, dirY) {
      const newX = selectedPiece.x + dirX;
      const newY = selectedPiece.y + dirY;
  
      clearGrid(selectedPiece.id);
      if (isFree(newX, newY, w, h, selectedPiece.id)) {
        selectedPiece.x = newX;
        selectedPiece.y = newY;
        el.style.left = selectedPiece.x * 100 + 'px';
        el.style.top = selectedPiece.y * 100 + 'px';
        occupyGrid(selectedPiece.id, selectedPiece.x, selectedPiece.y, w, h);
        checkVictory();
        return true;
      } else {
        occupyGrid(selectedPiece.id, selectedPiece.x, selectedPiece.y, w, h);
        return false;
      }
    }
  
    function onPointerMove(ev) {
      const dx = ev.clientX - centerX;
      const dy = ev.clientY - centerY;
  
      if (Math.abs(dx) > Math.abs(dy)) {
        const thresholdX = 100 * (lastMovedX + Math.sign(dx));
        if (Math.abs(dx) >= Math.abs(thresholdX)) {
          const moved = tryMove(Math.sign(dx), 0);
          if (moved) lastMovedX += Math.sign(dx);
        }
      } else {
        const thresholdY = 100 * (lastMovedY + Math.sign(dy));
        if (Math.abs(dy) >= Math.abs(thresholdY)) {
          const moved = tryMove(0, Math.sign(dy));
          if (moved) lastMovedY += Math.sign(dy);
        }
      }
    }
  
    function onPointerUp() {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    }
  
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  });
  
  board.appendChild(el);
  el.addEventListener('mousedown', () => {
    document.querySelectorAll('.piece').forEach(p => p.classList.remove('selected'));
    el.classList.add('selected');
    selectedPieceId = piece.id;
  });
  
  
}

pieces.forEach(createPiece);

function checkVictory() {
  const caoCao = pieces.find(p => p.id === 1);
  if (caoCao.x === 1 && caoCao.y === 3) {
    document.querySelectorAll('.piece').forEach(p => p.style.pointerEvents = 'none');

    const el = document.querySelector(`.piece[data-id='1']`);
    el.style.transition = 'top 0.7s ease-in';
    el.style.top = '600px';

    setTimeout(() => {
      document.getElementById('victoryModal').classList.remove('hidden');
    }, 800);
  }
}

let selectedPieceId = null;


document.addEventListener('keydown', (e) => {
  if (!selectedPieceId) return;

  const piece = pieces.find(p => p.id === selectedPieceId);
  const el = document.querySelector(`.piece[data-id='${piece.id}']`);
  const [w, h] = piece.size.split('x').map(Number);
  let dx = 0, dy = 0;

  switch (e.key) {
    case 'ArrowUp': dy = -1; break;
    case 'ArrowDown': dy = 1; break;
    case 'ArrowLeft': dx = -1; break;
    case 'ArrowRight': dx = 1; break;
    default: return;
  }

  const newX = piece.x + dx;
  const newY = piece.y + dy;

  clearGrid(piece.id);
  if (isFree(newX, newY, w, h, piece.id)) {
    piece.x = newX;
    piece.y = newY;
    el.style.left = piece.x * 100 + 'px';
    el.style.top = piece.y * 100 + 'px';
  }
  occupyGrid(piece.id, piece.x, piece.y, w, h);
  checkVictory();
});

function createGhostPiece(piece) {
  const el = document.createElement('div');
  el.classList.add('piece', 'ghost');

  const [w, h] = piece.size.split('x').map(Number);
  el.style.width = w * 98 + (w - 1) * 2 + 'px';
  el.style.height = h * 98 + (h - 1) * 2 + 'px';

  el.style.left = piece.x * 100 + 'px';
  el.style.top = piece.y * 100 + 'px';

  board.appendChild(el);
}

function restartGame() {
  document.querySelectorAll('.piece').forEach(p => {
    p.classList.remove('selected');
    p.style.pointerEvents = 'auto';
  });
  selectedPieceId = null;
  document.getElementById('victoryModal').classList.add('hidden');
  document.getElementById('restartBtn').click();
  init();
}

function init() {
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 4; x++) {
      grid[y][x] = null;
    }
  }
  pieces.forEach(p => {
    p.x = p.initialX;
    p.y = p.initialY;

    const el = document.querySelector(`.piece[data-id='${p.id}']`);
    if (el) {
      el.style.left = (p.x * 100) + 'px';
      el.style.top = (p.y * 100) + 'px';
    }

    const [w, h] = p.size.split('x').map(Number);
    occupyGrid(p.id, p.x, p.y, w, h);
  });
}
