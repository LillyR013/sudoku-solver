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
                        possibleBoards[i][j] = [k];
                    }
                }
            }
            else {
                possibleBoards[i][j] = [1,2,3,4,5,6,7,8,9];
            }
        }
    }
    console.log(possibleBoards);
    // Further solving steps would go here
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