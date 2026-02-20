document.addEventListener('DOMContentLoaded', function() {
    fetch('tutorials.json')
        .then(response => response.json())
        .then(data => {
            console.log(data); //debug line
            renderTutorials(data.tutorials);

            const contentFilterInput = document.getElementById('contentFilter');
            const levelFilterSelect = document.getElementById('levelFilter');

            contentFilterInput.addEventListener('input', () => filterTutorials(data.tutorials));
            levelFilterSelect.addEventListener('change', () => filterTutorials(data.tutorials));
        })
        .catch(error => console.error('Error fetching tutorials:', error)); //error handling.
});


function renderTutorials(tutorials) {
    const tutorialContainer = document.getElementById('tutorial-container');
    tutorialContainer.innerHTML = ''; // Clear existing tutorials

    tutorials.forEach(tutorial => {
        const tutorialRow = document.createElement('div');
        tutorialRow.classList.add('tutorial-row');

        let levelColor = '';
        switch (tutorial.level) {
            case "Easy Peasy":
                levelColor = 'rgba(0, 200, 0, 0.05)';
                break;
            case "Medium":
                levelColor = 'rgba(0, 0, 200, 0.05)';
                break;
            case "You'll Need Coffee":
                levelColor = 'rgba(200, 0, 0, 0.05)';
                break;
            default:
                levelColor = 'rgba(0, 0, 0, 0.05)';
        }

        tutorialRow.style.backgroundColor = levelColor;

        tutorialRow.innerHTML = `
            <h2>${tutorial.title}</h2>
            <p>${tutorial.description}</p>
            <p><strong>Category:</strong> ${tutorial.category}</p>
            <p><strong>Level:</strong> ${tutorial.level}</p>
            ${tutorial.link ? `<a href="${tutorial.link}" target="_blank">Link</a>` : ''}
            ${tutorial.github ? `<a href="${tutorial.github}" target="_blank">GitHub</a>` : ''}
        `;
        tutorialContainer.appendChild(tutorialRow);
    });
}

function filterTutorials(tutorials) {
    const contentFilterValue = document.getElementById('contentFilter').value.toLowerCase();
    const levelFilterValue = document.getElementById('levelFilter').value;

    let filteredTutorials = tutorials;

    if (contentFilterValue) {
        filteredTutorials = filteredTutorials.filter(tutorial =>
            tutorial.title.toLowerCase().includes(contentFilterValue) ||
            tutorial.description.toLowerCase().includes(contentFilterValue) ||
            tutorial.category.toLowerCase().includes(contentFilterValue)
        );
    }

    if (levelFilterValue) {
        filteredTutorials = filteredTutorials.filter(tutorial => tutorial.level === levelFilterValue);
    }

    renderTutorials(filteredTutorials);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}