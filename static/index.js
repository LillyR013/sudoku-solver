const inputElements = document.getElementsByClassName('input');
const possibleElements = document.getElementsByClassName('possible');
hidePossibles();
showInput();

board = [[],[],[],[],[],[],[],[],[]];
possibleBoards = [[],[],[],[],[],[],[],[],[]];

document.getElementById('submit').onclick = async function() {

    for (let i = 0; i < 9; i++) {
        document.getElementById("row" + (i+1)).style.backgroundColor = "transparent";
        for (let j = 0; j < 9; j++) {
            document.getElementById("cell" + (i+1) + (j+1)).style.backgroundColor = "transparent";
        }
    }

    updateBoardArray();
    var valid = await sanityCheckBoard();
    if (valid) {
        beginSolving();
    } else {
        alert("Board is invalid!");
        document.getElementById("stepDescripton").innerText = "Current Step: None";
    }
}

async function beginSolving() {
    document.getElementById("stepDescripton").innerText = "Current Step: Set All Values as Possible for Unknown Cells";
    await sleep(500);
    showPossibles();
    hideInput();
    for (let i=0; i<9; i++) {
        for (let j=0; j<9; j++) {
            if (board[i][j] != 0) {
                for(let k=1; k<=9; k++) {
                    let elem = document.getElementById("cell" + (i+1) + (j+1) + "possible" + k);
                    if(k != board[i][j]) {
                        elem.style.display = "none";
                    }
                    else {
                        possibleBoards[i][j] = new Set([k]);
                    }
                }
            }
            else {
                possibleBoards[i][j] = new Set([1,2,3,4,5,6,7,8,9]);
            }
        }
    }
    try {
        await pruneBoard();
    } catch (e) {
        return;
    }
}

function updateBoardArray() {
    for (let i = 0; i < inputElements.length; i++) {
        if(inputElements[i].value != "") {
            board[Math.floor(i/9)][i%9] = parseInt(inputElements[i].value);
        }
        else {
            board[Math.floor(i/9)][i%9] = 0;
        }
    }
}

async function sanityCheckBoard() { 

    // Check rows
    document.getElementById("stepDescripton").innerText = "Current Step: Checking Rows";
    for (let i = 0; i < 9; i++) {
        let seen = new Set();
        document.getElementById("row" + (i+1)).style.backgroundColor = "yellow";
        await sleep(200);
        for (let j = 0; j < 9; j++) {
            let num = board[i][j];
            if (num !== 0) {
                if (seen.has(num)) {
                    document.getElementById("row" + (i+1)).style.backgroundColor = "red";
                    return false;
                }
                seen.add(num);
            }
        }
        document.getElementById("row" + (i+1)).style.backgroundColor = "transparent";
    }

    // Check columns
    document.getElementById("stepDescripton").innerText = "Current Step: Checking Columns";
    for (let j = 0; j < 9; j++) {
        let seen = new Set();
        for (let i = 0; i < 9; i++) {
            document.getElementById("cell" + (i+1) + (j+1)).style.backgroundColor = "yellow";
        }
        await sleep(200);
        for (let i = 0; i < 9; i++) {        
            let num = board[i][j];
            if (num !== 0) {
                if (seen.has(num)) {
                    for (let k = 0; k < 9; k++) {
                        document.getElementById("cell" + (k+1) + (j+1)).style.backgroundColor = "red";
                    }
                    return false;
                }
                seen.add(num);
            }
        }
        for (let i = 0; i < 9; i++) {
            document.getElementById("cell" + (i+1) + (j+1)).style.backgroundColor = "transparent";
        }
    }

    // Check 3x3 subgrids
    document.getElementById("stepDescripton").innerText = "Current Step: Checking 3x3 Subgrids";
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    document.getElementById("cell" + (boxRow * 3 + i + 1) + (boxCol * 3 + j + 1)).style.backgroundColor = "yellow";
                }
            }
            await sleep(200);

            let seen = new Set();
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    let num = board[boxRow * 3 + i][boxCol * 3 + j];
                    if (num !== 0) {
                        if (seen.has(num)) {
                            for (let k = 0; k < 3; k++) {
                                for (let l = 0; l < 3; l++) {
                                    document.getElementById("cell" + (boxRow * 3 + k + 1) + (boxCol * 3 + l + 1)).style.backgroundColor = "red";
                                }
                            }
                            return false;
                        }
                        seen.add(num);
                    }
                }
            }

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    document.getElementById("cell" + (boxRow * 3 + i + 1) + (boxCol * 3 + j + 1)).style.backgroundColor = "transparent";
                }
            }
        }
    }

    return true;

}

function hidePossibles() {

    for (let i = 0; i < possibleElements.length; i++) {
        possibleElements[i].style.display = "none";
    }

}

function showPossibles() {

    for (let i = 0; i < possibleElements.length; i++) {
        possibleElements[i].style.display = "inline-block";
    }

}

function showInput() {

    for (let i = 0; i < inputElements.length; i++) {
        inputElements[i].style.display = "inline-block";
        inputElements[i].value = "";
    }

}

function hideInput() {

    for (let i = 0; i < inputElements.length; i++) {
        inputElements[i].style.display = "none";
    }

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function badBoardAlert() {
    document.getElementById("stepDescripton").innerText = "Current Step: None";
    alert("The board has been determined to be unsolvable!");
    throw new Error("Unsolvable Board");
}

async function pruneBoard() {

    document.getElementById("stepDescripton").innerText = "Current Step: Pruning Possibilities";

    /*
     * Assumptions for this method:
        * - possibleBoards is a 2D array of Sets, where each Set contains the possible values for that cell
        * - board is a 2D array of integers, where 0 represents an empty cell
        * - possibleBoards has been updated to reflect solved cells
        * - possibleBoards has not been updated to reflect the impacts of solved cells on their peers
        * - No solved cell contradicts with another solved cell in the same row, column, or 3x3 subgrid
        
     * Assumptions that are NOT made:
        * - The board is solvable
        * - The board has not already been fully solved
    
     * Goals of this method:
        * - For each solved cell, remove its value from the possible values of all its peers (same row, column, subgrid)
        * - Update the possibleBoards array accordingly
        * - Update the UI to reflect the changes in possible values
        * - If a cell is identified as having no possible values, alert the user that the board is unsolvable
        * - Otherwise, progress to the next solving step
    */

    var countSolved = 0;

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] != 0) {
                countSolved++;
                let solvedValue = board[i][j];

                // Remove solvedValue from the same column
                for (let k = 0; k < 9; k++) {
                    document.getElementById("cell" + (k+1) + (j+1)).style.backgroundColor = "yellow";
                }
                await sleep(200);
                for (let row = 0; row < 9; row++) {
                    if (row != i) {
                        possibleBoards[row][j].delete(solvedValue);
                        document.getElementById("cell" + (row+1) + (j+1) + "possible" + solvedValue).style.display = "none";
                        if(possibleBoards[row][j].size == 0) {
                            badBoardAlert();
                        }
                    }
                }
                for (let k = 0; k < 9; k++) {
                    document.getElementById("cell" + (k+1) + (j+1)).style.backgroundColor = "transparent";
                }

                // Remove solvedValue from the same row
                document.getElementById("row" + (i+1)).style.backgroundColor = "yellow";
                await sleep(200);
                for (let col = 0; col < 9; col++) {
                    if (col != j) {
                        possibleBoards[i][col].delete(solvedValue);
                        document.getElementById("cell" + (i+1) + (col+1) + "possible" + solvedValue).style.display = "none";
                        if(possibleBoards[i][col].size == 0) {
                            badBoardAlert();
                        }
                    }
                }
                document.getElementById("row" + (i+1)).style.backgroundColor = "transparent";

                // Remove solvedValue from the same 3x3 subgrid
                let boxRow = Math.floor(i / 3);
                let boxCol = Math.floor(j / 3);
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        document.getElementById("cell" + (boxRow * 3 + i + 1) + (boxCol * 3 + j + 1)).style.backgroundColor = "yellow";
                    }
                }
                await sleep(200);
                for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
                    for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
                        if (row != i && col != j) {
                            possibleBoards[row][col].delete(solvedValue);
                            document.getElementById("cell" + (row+1) + (col+1) + "possible" + solvedValue).style.display = "none";
                            if(possibleBoards[row][col].size == 0) {
                                badBoardAlert();
                            }
                        }
                    }
                }
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        document.getElementById("cell" + (boxRow * 3 + i + 1) + (boxCol * 3 + j + 1)).style.backgroundColor = "transparent";
                    }
                }
            }
        }
    }

    if (countSolved == 81) {
        document.getElementById("stepDescripton").innerText = "Current Step: Puzzle Solved!";
        alert("The puzzle has been solved!");
        return;
    }

    solveCellsWithSinglePossibility();

}

async function solveCellsWithSinglePossibility() {
    document.getElementById("stepDescripton").innerText = "Current Step: Solving Cells with Single Possibility";
    var cellsSolvedThisRound = 0;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (possibleBoards[i][j].size == 1 && board[i][j] == 0) {
                cellsSolvedThisRound++;
                let val = Array.from(possibleBoards[i][j])[0];
                board[i][j] = val;
                document.getElementById("cell" + (i+1) + (j+1)).style.backgroundColor = "lightgreen";
                await sleep(500);
                document.getElementById("cell" + (i+1) + (j+1)).style.backgroundColor = "transparent";
            }
        }
    }
    if (cellsSolvedThisRound != 0) {
        pruneBoard();
    }
    else {
        placeNumbersWithSinglePossibility();
    }
}

async function placeNumbersWithSinglePossibility() {
    document.getElementById("stepDescripton").innerText = "Current Step: Placing Numbers with Single Possibility in Rows, Columns, and Subgrids";
    
    var cellsSolvedThisRound = 0;

    //Check each row for numbers that can only go in one cell
    for (let i = 0; i < 9; i++) {
        document.getElementById("row" + (i+1)).style.backgroundColor = "yellow";
        await sleep(200);
        let possiblePosition = new Map();
        for (let j = 0; j < 9; j++) {
            for (let val of possibleBoards[i][j]) {
                if (!possiblePosition.has(val)) {
                    possiblePosition.set(val, []);
                }
                possiblePosition.get(val).push([i, j]);
            }
        }

        if(possiblePosition.size < 9) {
            // There is a number that does not have any possible positions
            badBoardAlert();
        }

        for (let [val, positions] of possiblePosition.entries()) {
            if (positions.length == 1 && board[positions[0][0]][positions[0][1]] == 0) {
                cellsSolvedThisRound++;
                let row = positions[0][0];
                let col = positions[0][1];
                board[row][col] = val;
                possibleBoards[row][col] = new Set([val]);
                for(let k=1; k<=9; k++) {
                    let elem = document.getElementById("cell" + (row+1) + (col+1) + "possible" + k);
                    if(k != val) {
                        elem.style.display = "none";
                    }
                }
                document.getElementById("cell" + (row+1) + (col+1)).style.backgroundColor = "lightgreen";
                await sleep(500);
                document.getElementById("cell" + (row+1) + (col+1)).style.backgroundColor = "transparent";
            }
        }

        document.getElementById("row" + (i+1)).style.backgroundColor = "transparent";

    }

    //Check each column for numbers that can only go in one cell
    for (let i = 0; i < 9; i++) {
        for (let k = 0; k < 9; k++) {
            document.getElementById("cell" + (k+1) + (i+1)).style.backgroundColor = "yellow";
        }
        await sleep(200);
        let possiblePosition = new Map();
        for (let j = 0; j < 9; j++) {
            for (let val of possibleBoards[j][i]) {
                if (!possiblePosition.has(val)) {
                    possiblePosition.set(val, []);
                }
                possiblePosition.get(val).push([j, i]);
            }
        }

        if(possiblePosition.size < 9) {
            // There is a number that does not have any possible positions
            badBoardAlert();
        }

        for (let [val, positions] of possiblePosition.entries()) {
            if (positions.length == 1 && board[positions[0][0]][positions[0][1]] == 0) {
                cellsSolvedThisRound++;
                let row = positions[0][0];
                let col = positions[0][1];
                board[row][col] = val;
                possibleBoards[row][col] = new Set([val]);
                for(let k=1; k<=9; k++) {
                    let elem = document.getElementById("cell" + (row+1) + (col+1) + "possible" + k);
                    if(k != val) {
                        elem.style.display = "none";
                    }
                }
                document.getElementById("cell" + (row+1) + (col+1)).style.backgroundColor = "lightgreen";
                await sleep(500);
                document.getElementById("cell" + (row+1) + (col+1)).style.backgroundColor = "yellow";
            }
        }

        for (let k = 0; k < 9; k++) {
            document.getElementById("cell" + (k+1) + (i+1)).style.backgroundColor = "transparent";
        }

    }

    //Check each 3x3 subgrid for numbers that can only go in one cell
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    document.getElementById("cell" + (boxRow * 3 + i + 1) + (boxCol * 3 + j + 1)).style.backgroundColor = "yellow";
                }
            }
            await sleep(200);
            let possiblePosition = new Map();
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    for (let val of possibleBoards[boxRow * 3 + i][boxCol * 3 + j]) {
                        if (!possiblePosition.has(val)) {
                            possiblePosition.set(val, []);
                        }
                        possiblePosition.get(val).push([boxRow * 3 + i, boxCol * 3 + j]);
                    }
                }
            }

            if(possiblePosition.size < 9) {
                // There is a number that does not have any possible positions
                badBoardAlert();
            }

            for (let [val, positions] of possiblePosition.entries()) {
                if (positions.length == 1 && board[positions[0][0]][positions[0][1]] == 0) {
                    cellsSolvedThisRound++;
                    let row = positions[0][0];
                    let col = positions[0][1];
                    board[row][col] = val;
                    possibleBoards[row][col] = new Set([val]);
                    for(let k=1; k<=9; k++) {
                        let elem = document.getElementById("cell" + (row+1) + (col+1) + "possible" + k);
                        if(k != val) {
                            elem.style.display = "none";
                        } 
                    }
                    document.getElementById("cell" + (row+1) + (col+1)).style.backgroundColor = "lightgreen";
                    await sleep(500);
                    document.getElementById("cell" + (row+1) + (col+1)).style.backgroundColor = "transparent";
                }
            }
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    document.getElementById("cell" + (boxRow * 3 + i + 1) + (boxCol * 3 + j + 1)).style.backgroundColor = "transparent";
                }   
            }
        }
    }

    if (cellsSolvedThisRound != 0) {
        pruneBoard();
    }
    else {
        checkForCellLockedValues();
    }

}

async function checkForCellLockedValues() {
    // If all of the candidate locations for a number in a row or column are confined to a single 3x3 subgrid,
    // then that number cannot appear in any other cell of that subgrid outside of that row or column.

    document.getElementById("stepDescripton").innerText = "Current Step: Checking for Locked Candidates";
    var changed = 0;

    //Check rows for locked candidates
    for (let i = 0; i < 9; i++) {
        document.getElementById("row" + (i+1)).style.backgroundColor = "yellow";
        await sleep(200);
        let possiblePosition = new Map();
        for (let j = 0; j < 9; j++) {
            for (let val of possibleBoards[i][j]) {
                if (!possiblePosition.has(val)) {
                    possiblePosition.set(val, []);
                }
                possiblePosition.get(val).push([i, j]);
            }
        }

        for (let [val, positions] of possiblePosition.entries()) {
            let boxCols = new Set();
            for (let pos of positions) {
                let boxCol = Math.floor(pos[1] / 3);
                boxCols.add(boxCol);
            }
            if (boxCols.size == 1 && positions.length > 1) {
                let boxCol = Array.from(boxCols)[0];
                // Remove val from other cells in the same 3x3 subgrid but different row
                for (let row = Math.floor(i / 3) * 3; row < Math.floor(i / 3) * 3 + 3; row++) {
                    for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
                        if (row != i) {
                            if(possibleBoards[row][col].has(val)) {
                                changed++;
                            }
                            possibleBoards[row][col].delete(val);
                            document.getElementById("cell" + (row+1) + (col+1) + "possible" + val).style.display = "none";
                            if(possibleBoards[row][col].size == 0) {
                                badBoardAlert();
                            }
                        }
                    }
                }
            }
        }
        document.getElementById("row" + (i+1)).style.backgroundColor = "transparent";
    }

    //Check columns for locked candidates
    for (let j = 0; j < 9; j++) {
        for (let k = 0; k < 9; k++) {
            document.getElementById("cell" + (k+1) + (j+1)).style.backgroundColor = "yellow";
        }
        await sleep(200);
        let possiblePosition = new Map();
        for (let i = 0; i < 9; i++) {
            for (let val of possibleBoards[i][j]) {
                if (!possiblePosition.has(val)) {
                    possiblePosition.set(val, []);
                }
                possiblePosition.get(val).push([i, j]);
            }
        }

        for (let [val, positions] of possiblePosition.entries()) {
            let boxRows = new Set();
            for (let pos of positions) {
                let boxRow = Math.floor(pos[0] / 3);
                boxRows.add(boxRow);
            }
            if (boxRows.size == 1 && positions.length > 1) {
                let boxRow = Array.from(boxRows)[0];
                // Remove val from other cells in the same 3x3 subgrid but different column
                for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
                    for (let col = Math.floor(j / 3) * 3; col < Math.floor(j / 3) * 3 + 3; col++) {
                        if (col != j) {
                            if(possibleBoards[row][col].has(val)) {
                                changed++;
                            }
                            possibleBoards[row][col].delete(val);
                            document.getElementById("cell" + (row+1) + (col+1) + "possible" + val).style.display = "none";
                            if(possibleBoards[row][col].size == 0) {
                                badBoardAlert();
                            }
                        }
                    }
                }
            }
        }
        for (let k = 0; k < 9; k++) {
            document.getElementById("cell" + (k+1) + (j+1)).style.backgroundColor = "transparent";
        }
    }

    if (changed != 0) {
        pruneBoard();
    } else {
        alert("No further solving techniques implemented. The puzzle may require guessing or is unsolvable with current methods.");
        document.getElementById("stepDescripton").innerText = "Current Step: None";
        return;
    }

}