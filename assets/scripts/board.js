class Board {
    constructor({ rows, cols, bombCount }) {
        this.rows = rows;
        this.cols = cols;
        this.bombCount = bombCount;
        this.flagCount = bombCount;
        this.bombsIndexes = [];
        this.flagedIndexes = [];
        this.revealedCells = [];
        this.array = new Array(rows);

        for (let i = 0; i < this.rows; i++) {
            this.array[i] = new Array(this.cols);
        }
        this.init();
    }

    init() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {

                this.array[i][j] = new Cell(i, j, findNeighbourCells(i, j, this.rows, this.cols));
            }
        }
        let count = 0;
        while (count < this.bombCount) {
            let i = Math.floor(Math.random() * this.rows);
            let j = Math.floor(Math.random() * this.cols);

            if (!this.array[i][j].isBomb()) {
                this.array[i][j].setToBomb();
                this.bombsIndexes.push({ row: i, col: j });
                count++;

                let neighbours = this.array[i][j].getNeighbours();

                for (let j = 0; j < neighbours.length; j++) {
                    let { row, col } = neighbours[j];

                    this.array[row][col].increaseDanger();
                }
            }
        }
    }
    show() {
        let str = "";

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.array[i][j].isBomb()) {
                    str += "x ";
                }
                else {
                    let danger = this.array[i][j].getDangerCount();
                    if (danger == 0) {
                        str += "0 "
                    }
                    else {
                        str += danger + " ";
                    }
                }
            }
            str += "\n";
        }
        console.log(str);
    }
    getRows() {
        return this.rows;
    }
    getCols() {
        return this.cols;
    }
    getGrid() {
        return this.array
    }
    revealAllBombs() {
        for (let i = 0; i < this.bombsIndexes.length; i++) {
            let { row, col } = this.bombsIndexes[i];
            this.array[row][col].reveal();
            this.revealedCells.push(this.array[row][col]);
        }
    }
    revealCell(i, j) {
        if (!this.array[i][j].isRevealed() && !this.array[i][j].isFlaged()) {
            this.array[i][j].reveal();
            this.revealedCells.push(this.array[i][j]);

            if (this.array[i][j].isBomb()) {
                this.revealAllBombs();
                return false;
            }
            else if (this.array[i][j].isEmpty()) {
                let neighbours = this.array[i][j].getNeighbours();

                for (let i = 0; i < neighbours.length; i++) {
                    let { row, col } = neighbours[i];
                    this.revealCell(row, col);
                }
            }
        }
    }
    emptyRevealedCells() {
        this.revealedCells = [];
    }
    toggleFlagCell(row, col) {
        if (this.array[row][col].isFlaged()) {
            let i = this.flagedIndexes.indexOf({ row: row, col: col });

            this.flagedIndexes.splice(i, 1);
            this.flagCount++;
        }
        else {
            if (!this.flagCount) {
                return false;
            }
            this.flagedIndexes.push({ row: row, col: col });
            this.flagCount--;
        }
        this.array[row][col].setFlaged();
    }
    isCellRevealed(row, col) {
        return this.array[row][col].isRevealed();
    }
    isCellFlaged(row, col) {
        return this.array[row][col].isFlaged();
    }
    getFlagCount() {
        return this.flagCount;
    }
    checkWinning() {
        for (let i = 0; i < this.rows; i++) {
            if (!this.array[i].every(cell => (cell.isBomb() || cell.isRevealed()))) {
                return false;
            }
        }

        return true;
    }
}


class Cell {
    constructor(row, col, neighbours) {
        this.row = row;
        this.col = col;
        this.revealed = false;
        this.bomb = false;
        this.neighbours = neighbours;
        this.dangerCount = 0;
        this.flaged = false;
    }

    isBomb() {
        return this.bomb;
    }

    setToBomb() {
        this.bomb = true;
    }

    isRevealed() {
        return this.revealed;
    }

    reveal() {
        this.revealed = true;
    }

    increaseDanger() {
        this.dangerCount++;
    }

    getNeighbours() {
        return [...this.neighbours];
    }

    getDangerCount() {
        return this.dangerCount;
    }
    setFlaged() {
        this.flaged = !this.flaged;
    }
    isFlaged() {
        return this.flaged;
    }
    getIndexes() {
        return [this.row, this.col]
    }
    isEmpty() {
        return this.dangerCount == 0;
    }
}

function findNeighbourCells(row, col, rows, cols) {
    let neighbours = [];

    neighbours.push({ row: row - 1, col: col - 1 })
    neighbours.push({ row: row - 1, col: col })
    neighbours.push({ row: row - 1, col: col + 1 })
    neighbours.push({ row: row, col: col + 1 })
    neighbours.push({ row: row + 1, col: col + 1 })
    neighbours.push({ row: row + 1, col: col })
    neighbours.push({ row: row + 1, col: col - 1 })
    neighbours.push({ row: row, col: col - 1 })

    return neighbours.filter(cell => cell.col >= 0 && cell.col < cols && cell.row >= 0 && cell.row < rows);
}



