const possibleElements = document.getElementsByClassName('possible');
for (let i = 0; i < possibleElements.length; i++) {
    possibleElements[i].style.display = "none";
}

setTimeout(() => {
    for (let i = 0; i < possibleElements.length; i++) {
        possibleElements[i].style.display = "inline-block";
    }
}, 1000);