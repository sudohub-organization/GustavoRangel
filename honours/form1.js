function openInstructionsPopup() {
    document.getElementById('instructionsPopup').style.display = 'block';
}

function openPrivacyPopup() {
    document.getElementById('privacyPopup').style.display = 'block';
}

function openVideoPopup() {
    document.getElementById('videoPopup').style.display = 'block';
}

function closePopup(popupId) {
    document.getElementById(popupId).style.display = 'none';
}

const textSizeSlider = document.getElementById('textSizeSlider');
const textSizeDisplay = document.getElementById('textSize');
const sampleText = document.getElementById('sampleText');

textSizeSlider.addEventListener('input', () => {
    const newSize = textSizeSlider.value;
    textSizeDisplay.textContent = newSize;
    sampleText.style.fontSize = newSize + 'px';
});

function adjustText(change) {
    let fontSize = parseInt(textSizeDisplay.textContent);
    fontSize += change;
    fontSize = Math.max(10, Math.min(50, fontSize));
    textSizeDisplay.textContent = fontSize;
    sampleText.style.fontSize = fontSize + 'px';
    textSizeSlider.value = fontSize;
}

let imageScale = 100;
const imageSizeSlider = document.getElementById('imageSizeSlider');
const imageScaleDisplay = document.getElementById('imageScale');
// Change the display to show pixels instead of percentage
    imageSizeSlider.addEventListener('input', () => {
    const newScale = imageSizeSlider.value;
    const pixelSize = Math.round((250 * newScale) / 100);
    imageScaleDisplay.textContent = pixelSize + 'px';
    sampleImage.style.width = pixelSize + 'px';
});

function adjustImage(change) {
    imageScale += change;
    imageScale = Math.max(50, Math.min(200, imageScale)); // Ensure bounds
    const newWidth = Math.round((250 * imageScale) / 100); // Calculate width in pixels
    imageScaleDisplay.textContent = `${newWidth}px`; // Display pixels
    sampleImage.style.width = `${newWidth}px`; // Set width in pixels
    imageSizeSlider.value = imageScale; // Reflect scale in slider
}
    
const goToFormButton = document.getElementById('goToFormButton'); // Make sure this ID matches your button's ID
const formIframe = document.getElementById('formIframe'); // Make sure this ID matches your iframe's ID

goToFormButton.addEventListener('click', () => {
formIframe.scrollIntoView({ behavior: 'smooth' });
});


const sizePopup = document.getElementById('sizePopup');
const popupTextSize = document.getElementById("popupTextSize");
const popupImageScale = document.getElementById("popupImageScale");

goToFormButton.addEventListener('click', () => {
    formIframe.scrollIntoView({ behavior: 'smooth' });
    popupTextSize.textContent = textSizeDisplay.textContent;
    popupImageScale.textContent = imageScaleDisplay.textContent;
    sizePopup.style.display = 'block';
});