const possibleElements = document.getElementsByClassName('possible');

for (let i = 0; i < possibleElements.length; i++) {
    possibleElements[i].style.display = "none";
}

const inputElements = document.getElementsByClassName('input');

for (let i = 0; i < inputElements.length; i++) {
    inputElements[i].style.display = "inline-block";
    inputElements[i].value = "";
}

/*
setTimeout(() => {
    for (let i = 0; i < possibleElements.length; i++) {
        possibleElements[i].style.display = "inline-block";
    }
}, 1000);*/