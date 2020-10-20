let boardTypes = [
    {
        rows: 3,
        cols: 3,
        bombCount: 3,
    },
    {
        rows: 10,
        cols: 10,
        bombCount: 15,
    },
    {
        rows: 10,
        cols: 10,
        bombCount: 50,
    },
    {
        rows: 16,
        cols: 16,
        bombCount: 40,
    },
    {
        rows: 20,
        cols: 20,
        bombCount: 50,
    },
    {
        rows: 16,
        cols: 30,
        bombCount: 99,
    },
    {
        rows: 32,
        cols: 32,
        bombCount: 160,
    },
    {
        rows: 50,
        cols: 50,
        bombCount: 700,
    },
    {
        rows: 70,
        cols: 70,
        bombCount: 1000
    }
]

let selectedTypeIndex = 1;
let selectedType = boardTypes[selectedTypeIndex];

let board;

let rows;
let cols;
let clickCount = 0;

let width;
let endOfGame = false;

let checkingBoard = false;

let timer;


function init() {
    let boardContainer = document.getElementById("board-container");

    if (window.innerWidth < window.innerHeight) {
        boardContainer.style.width = boardContainer.parentElement.clientWidth + 'px';
        boardContainer.style.height = boardContainer.parentElement.clientWidth + 'px';
    }

    let container = document.querySelector("#cells-container");

    let child = container.lastChild;

    while (child) {
        container.removeChild(child);
        child = container.lastChild;
    }

    container.style.height = window.innerHeight - 1 - container.offsetTop + "px";
    if (rows < cols) {
        width = parseInt(container.style.height) / cols;
    }
    else {
        width = parseInt(container.style.height) / rows;
    }
    container.style.width = width * cols + 'px';


    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');

            cell.classList.add('cell');
            cell.style.width = width + "px";
            cell.style.height = width + "px";

            cell.addEventListener('click', e => {
                clickCount++;
                if (clickCount === 1) {
                    singleClickTimer = setTimeout(function () {
                        clickCount = 0;
                        singleClick(i, j);
                    }, 200);
                } else if (clickCount === 2) {
                    doubleClick(i, j);
                    clearTimeout(singleClickTimer);
                    clickCount = 0;
                }
                setTimeout(() => {
                    if (board.checkWinning()) {
                        stopGame(true);
                    }
                }, 200);
            });
            container.appendChild(cell);
        }
    }
}


function singleClick(i, j) {
    board.revealCell(i, j);
    board.revealedCells.forEach(cell => {
        let [row, col] = cell.getIndexes();
        let curCellDom = document.getElementsByClassName('cell')[row * cols + col];

        curCellDom.classList.add('revealed');

        if (cell.isBomb()) {
            curCellDom.classList.add("bombCell");
            stopGame(false);
        }
        else if (cell.isEmpty()) {
            curCellDom.classList.add('emptyCell');
        }
        else {
            let numberHolder = document.createElement('p');
            let dangerCount = cell.getDangerCount();
            numberHolder.textContent = dangerCount
            numberHolder.style.fontSize = width + "px";

            numberHolder.classList.add("numberHolder");
            curCellDom.classList.add("numberedCell");

            if (dangerCount == 1) {
                numberHolder.classList.add('one');
            } else if (dangerCount == 2) {
                numberHolder.classList.add('two');
            }
            else if (dangerCount == 3) {
                numberHolder.classList.add('three');
            }
            else {
                numberHolder.classList.add('four');
            }

            curCellDom.appendChild(numberHolder)
        }
    }
    )
    board.emptyRevealedCells();
}

function doubleClick(i, j) {
    let curCellDom = document.getElementsByClassName('cell')[i * cols + j];

    if (board.isCellFlaged(i, j)) {
        curCellDom.classList.remove('flaged');
    }
    else {
        if (board.getFlagCount() == 0) {
            return false;
        }
        curCellDom.classList.add('flaged');
    }
    board.toggleFlagCell(i, j);
    updateFlagCount();
}

function stopGame(won) {
    endOfGame = true;
    stopTimer();

    if (won) {
        document.getElementById('modal-page-info').textContent = "Victory!";
        document.getElementById('modal-page-container').style.display = 'flex';
    }
    else {
        document.getElementById('modal-page-info').textContent = "You Lost!";
        document.getElementById('modal-page-container').style.display = 'flex';
    }

}

document.getElementById('restart').addEventListener('click', e => newGame())


document.addEventListener('click', e => {

    if (endOfGame && checkingBoard) {
        document.getElementById('modal-page-container').classList.remove('hidden');
        checkingBoard = false;
    }
})

document.getElementById('see-board').addEventListener('click', e => {
    setTimeout(function () {
        document.getElementById('modal-page-container').classList.add('hidden');
        checkingBoard = true
    }, 1);

})

document.getElementById('types').addEventListener('change', function (e) { selectedTypeIndex = this.selectedIndex; selectedType = boardTypes[selectedTypeIndex]; });
document.getElementById('confirm-type-selection').addEventListener('click', e => newGame());


function updateFlagCount() {
    document.getElementById("flag-count").textContent = "Flags: " + board.getFlagCount();
}

function newGame() {
    document.getElementById('modal-page-container').style.display = 'none';
    board = new Board(selectedType);
    rows = board.getRows();
    cols = board.getCols();

    init();
    resetTimer();
    stopTimer();
    startTimer();
    removeTypesOptions()
    addTypeOptions();
    updateFlagCount();
}

function startTimer() {
    let counter = 1;
    timer = setInterval(e => {
        document.getElementById('timer').textContent = timeConverter(counter++);
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function resetTimer() {
    document.getElementById('timer').textContent = "00 : 00";
}

function timeConverter(time) {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    minutes = checkingDigits(minutes);
    seconds = checkingDigits(seconds);
    return `${minutes} : ${seconds}`
}

function checkingDigits(number) {
    return (number < 10 ? '0' : "") + number
}

function removeTypesOptions() {
    let select = document.getElementById('types')
    let length = select.options.length;
    for (i = length - 1; i >= 0; i--) {
        select.options[i] = null;
    }
}

function addTypeOptions() {
    boardTypes.forEach(type => {
        let option = document.createElement('option');
        option.textContent = `Rows: ${type.rows} Cols: ${type.cols} Bombs: ${type.bombCount}`;
        document.getElementById("types").add(option);
    })
    document.getElementById("types").selectedIndex = selectedTypeIndex;
}



newGame();


