document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.getElementById('navbar');
    const banner = document.getElementById('banner');
    const vocabularySection = document.getElementById('vocabulary');
    const faqSection = document.getElementById('faq');
    const footerContainer = document.getElementById('footer-container');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Hide sections initially
    navbar.classList.add('hidden');
    vocabularySection.classList.add('hidden');
    faqSection.classList.add('hidden');
    footerContainer.classList.add('hidden');

    // Login functionality
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username && password === "123456") {
            Swal.fire({
                icon: 'success',
                title: 'Login Successful!',
                text: 'Done',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                // Hide the banner and show other sections
                banner.classList.add('hidden');
                navbar.classList.remove('hidden');
                vocabularySection.classList.remove('hidden');
                faqSection.classList.remove('hidden');
                footerContainer.classList.remove('hidden');
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'Invalid username or password'
            });
        }
    });

    // Logout functionality
    logoutBtn.addEventListener('click', function () {
        Swal.fire({
            icon: 'success',
            title: 'Logged Out!',
            text: 'You have been successfully logged out.',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            // Hide sections and show the banner
            navbar.classList.add('hidden');
            vocabularySection.classList.add('hidden');
            faqSection.classList.add('hidden');
            footerContainer.classList.add('hidden');
            banner.classList.remove('hidden');
        });
    });

    // Smooth scrolling for FAQ and Learn buttons
    document.getElementById('faq-btn').addEventListener('click', function () {
        faqSection.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('learn-btn').addEventListener('click', function () {
        vocabularySection.scrollIntoView({ behavior: 'smooth' });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });
});

const vocabularyGrid = document.getElementById('vocabularyGrid');
const lessonButtons = document.querySelectorAll('.lesson-button');
const loadingMessage = document.getElementById('loading');
const congratulationMessage = document.getElementById('congratulation');
const noLessonSelectedDiv = document.getElementById('noLessonSelected');
let allWords = [];
let initialLoad = true;
let speechSynthesisUtterance = new SpeechSynthesisUtterance();
let currentPopup = null; // To manage currently open popup

// Function to fetch words by level
async function fetchWordsByLevel(levelId) {
    try {
        loadingMessage.style.display = 'block';
        vocabularyGrid.style.display = 'none';
        congratulationMessage.style.display = 'none';
        noLessonSelectedDiv.style.display = 'none';
        hidePopup();
        const response = await fetch(`https://openapi.programming-hero.com/api/level/${levelId}`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching words by level:", error);
        return [];
    } finally {
        loadingMessage.style.display = 'none';
        congratulationMessage.style.display = 'block';
        if (!initialLoad) {
            vocabularyGrid.style.display = 'grid';
            congratulationMessage.style.display = 'none';
            noLessonSelectedDiv.style.display = 'none';
        }
        initialLoad = false;
    }
}

// Function to fetch all words (if needed for fallback or initial load)
async function fetchAllWords() {
    try {
        loadingMessage.style.display = 'block';
        vocabularyGrid.style.display = 'none';
        congratulationMessage.style.display = 'none';
        noLessonSelectedDiv.style.display = 'none';
        hidePopup();
        const response = await fetch('https://openapi.programming-hero.com/api/words/all');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching all words:", error);
        return [];
    } finally {
        loadingMessage.style.display = 'none';
        congratulationMessage.style.display = 'none';
        if (!initialLoad) {
            vocabularyGrid.style.display = 'grid';
            congratulationMessage.style.display = 'none';
            noLessonSelectedDiv.style.display = 'none';
        }
        initialLoad = false;
    }
}

// Function to fetch word details
async function fetchWordDetails(wordId) {
    try {
        const response = await fetch(`https://openapi.programming-hero.com/api/word/${wordId}`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching word details:", error);
        return null;
    }
}

// Function to display word details in a popup
function displayWordDetailsPopup(details, buttonElement) {
    hidePopup(); // Hide any existing popup

    const cardElement = buttonElement.closest('.vocabulary-card');
    if (!cardElement) return;

    const popup = document.createElement('div');
    popup.classList.add('word-details-popup');

    // Check if synonyms are missing and display "অর্থ নেই" if they are
    let synonymsText = details.synonyms && details.synonyms.length > 0 ? details.synonyms.join(', ') : 'অর্থ নেই';

    popup.innerHTML = `
        <h4>${details.word}</h4>
        <p><strong>Meaning:</strong> ${details.meaning || 'অর্থ নেই'}</p>
        <p><strong>Example:</strong> ${details.example || 'N/A'}</p>
        <p><strong>Synonyms:</strong> ${synonymsText}</p>
        <button id="close-popup-btn" style="background-color: blue; color: white; border: none; padding: 5px 10px; cursor: pointer;">Close</button>
    `;

    cardElement.appendChild(popup);

    // Add event listener to the "Close" button
    const closeButton = popup.querySelector('#close-popup-btn');
    closeButton.addEventListener('click', () => {
        // Hide the popup
        hidePopup();
    });

    // Position the popup above the info button
    const buttonRect = buttonElement.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();
    popup.style.bottom = `${cardRect.height - (buttonRect.top - cardRect.top) + 5}px`;
    popup.style.left = `${(buttonRect.left - cardRect.left) - (popup.offsetWidth / 2 - buttonRect.width / 2)}px`;

    popup.style.display = 'block';
    currentPopup = popup;

    // Close popup when clicking outside
    setTimeout(() => {
        document.addEventListener('click', closePopupOnOutsideClick);
    }, 0);
}

function hidePopup() {
    if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
        document.removeEventListener('click', closePopupOnOutsideClick);
    }
}

function closePopupOnOutsideClick(event) {
    if (currentPopup && !currentPopup.contains(event.target)) {
        hidePopup();
    }
}

// Function to speak the word
function speakWord(text) {
    speechSynthesisUtterance.text = text;
    speechSynthesis.speak(speechSynthesisUtterance);
}

// Function to display vocabulary words
function displayWords(words) {
    vocabularyGrid.innerHTML = '';
    if (!words || words.length === 0) {
        const noVocabularyMessage = document.createElement('h2');
        noVocabularyMessage.textContent = 'এই Lesson এ এখনো কোনো Vocabulary যুক্ত করা হয়নি';
        noVocabularyMessage.style.textAlign = 'center';
        vocabularyGrid.appendChild(noVocabularyMessage);
        vocabularyGrid.style.display = 'block';
        noLessonSelectedDiv.style.display = 'none';
        return;
    }

    words.forEach(word => {
        const card = document.createElement('div');
        card.classList.add('vocabulary-card');

        const title = document.createElement('h3');
        title.textContent = word.word;

        const meaningDiv = document.createElement('div');
        meaningDiv.classList.add('meaning');
        meaningDiv.textContent = `Meaning/Pronunciation `;

        const pronunciationDiv = document.createElement('div');
        pronunciationDiv.classList.add('pronunciation');
        pronunciationDiv.textContent = ` ${word.meaning || 'অর্থ নেই' || 'N/A'}`;

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');

        const infoButton = document.createElement('div');
        infoButton.classList.add('action-button', 'info');
        infoButton.addEventListener('click', (event) => {
            fetchWordDetails(word.id).then(details => {
                displayWordDetailsPopup(details, event.target);
            });
            event.stopPropagation(); // Prevent immediate closing
        });

        const soundButton = document.createElement('div');
        soundButton.classList.add('action-button', 'sound');
        soundButton.addEventListener('click', () => {
            speakWord(word.word);
        });

        actionsDiv.appendChild(infoButton);
        actionsDiv.appendChild(soundButton);

        card.appendChild(title);
        card.appendChild(meaningDiv);
        card.appendChild(pronunciationDiv);
        card.appendChild(actionsDiv);

        vocabularyGrid.appendChild(card);
    });
    vocabularyGrid.style.display = 'grid';
    congratulationMessage.style.display = 'none';
    noLessonSelectedDiv.style.display = 'none';
}

// Event listener for lesson button clicks
lessonButtons.forEach(button => {
    button.addEventListener('click', async () => {
        lessonButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        hidePopup();

        const levelId = button.dataset.levelId;
        if (levelId) {
            const wordsForLevel = await fetchWordsByLevel(levelId);
            displayWords(wordsForLevel);
        }
    });
});

// Load initial state: Show "No lesson selected" message
vocabularyGrid.style.display = 'none';
noLessonSelectedDiv.style.display = 'block';
loadingMessage.style.display = 'none';
congratulationMessage.style.display = 'none';

// Hide congratulation message when any lesson button is clicked
lessonButtons.forEach(button => {
    button.addEventListener('click', () => {
        congratulationMessage.style.display = 'none';
        vocabularyGrid.style.display = 'grid';
        noLessonSelectedDiv.style.display = 'none';
        hidePopup();
    });
});