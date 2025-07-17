// Updated Exercise System for SIU-EM-Wizard
// Completely redesigned sidebar with topic dropdown always visible

class ExerciseSystem {
    constructor(topicName, subtopicName, exercises) {
        this.topicName = topicName;
        this.subtopicName = subtopicName;
        this.exercises = exercises;
        this.currentExerciseIndex = 0;
        this.completedExercises = new Set();
        this.userProgress = {
            easy: { completed: 0, total: 0 },
            medium: { completed: 0, total: 0 },
            hard: { completed: 0, total: 0 }
        };
        
        // Define all topic titles and subtopics
        this.topicData = {
            'grundlagen': {
                title: 'Grundlagen der Elektrotechnik & Mathematik',
                subtopics: [
                    { name: 'grundrechenarten', title: 'Grundrechenarten' },
                    { name: 'brueche', title: 'Brüche' },
                    { name: 'potenzen', title: 'Potenzen' },
                    { name: 'gleichungen', title: 'Lineare Gleichungen & Bruchgleichungen' },
                    { name: 'ohmsches-gesetz', title: 'Ohmsches Gesetz' },
                    { name: 'spezifischer-widerstand', title: 'Spezifischer Widerstand' },
                    { name: 'leistung-arbeit', title: 'Leistung und Arbeit' }
                ]
            },
            'widerstandsschaltungen': {
                title: 'Widerstandsschaltungen & Netzwerkberechnung',
                subtopics: [
                    { name: 'serie-parallel', title: 'Serie- & Parallelschaltungen' },
                    { name: 'gemischte-schaltungen', title: 'Gemischte Schaltungen' },
                    { name: 'spannungsteiler', title: 'Spannungsteiler' },
                    { name: 'stromteiler', title: 'Stromteiler' },
                    { name: 'brueckenschaltungen', title: 'Brückenschaltungen' },
                    { name: 'kirchhoff', title: 'Kirchhoffsche Gesetze' },
                    { name: 'temp-widerstand', title: 'Temperaturabhängige Widerstände' }
                ]
            },
            'koordinaten-trigonometrie': {
                title: 'Koordinatensysteme & Trigonometrie',
                subtopics: [
                    { name: 'winkelberechnungen', title: 'Winkelberechnungen' },
                    { name: 'pythagoras', title: 'Satz des Pythagoras' },
                    { name: 'trigonometrie', title: 'Trigonometrische Funktionen' },
                    { name: 'koordinatensysteme', title: 'Koordinatensysteme' }
                ]
            },
            'feld-kondensatoren': {
                title: 'Elektrisches Feld & Kondensatoren',
                subtopics: [
                    { name: 'elektrisches-feld', title: 'Elektrisches Feld' },
                    { name: 'kondensatoren', title: 'Kondensatoren' },
                    { name: 'kapazitaet', title: 'Kapazitätsberechnungen' }
                ]
            },
            'magnetismus-induktivitaet': {
                title: 'Magnetismus & Induktivitäten',
                subtopics: [
                    { name: 'magnetfeld', title: 'Magnetfeld' },
                    { name: 'induktionsgesetz', title: 'Induktionsgesetz' },
                    { name: 'induktivitaeten', title: 'Induktivitäten' }
                ]
            },
            'zeitabhaengige-schaltungen': {
                title: 'Zeitabhängige Schaltungen',
                subtopics: [
                    { name: 'exponentialfunktionen', title: 'Exponentialfunktionen' },
                    { name: 'rc-schaltungen', title: 'RC-Schaltungen' },
                    { name: 'lade-entlade', title: 'Lade-/Entladevorgänge' }
                ]
            },
            'wechselstrom': {
                title: 'Wechselstromkreis',
                subtopics: [
                    { name: 'wechselstrom', title: 'Wechselstrom wichtigste Grössen' },
                    { name: 'wirk-blindwiderstand', title: 'Wirk- & Blindwiderstand' },
                    { name: 'reaktive-elemente', title: 'Reaktive Elemente' },
                    { name: 'leistung', title: 'Leistungsberechnungen' },
                    { name: 'blindleistungskompensation', title: 'Blindleistungskompensation' }
                ]
            },
            'filter': {
                title: 'Filter',
                subtopics: [
                    { name: 'hoch-tiefpass', title: 'Hoch- & Tiefpass' },
                    { name: 'bode-diagramm', title: 'Bode-Diagramm' },
                    { name: 'grenzfrequenz', title: 'Grenzfrequenz' }
                ]
            }
        };
        
        this.loadProgress();
        this.initializeUI();
        this.displayCurrentExercise();
        this.updateSidebar();
    }

    loadProgress() {
        // Load progress from localStorage
        const progressKey = `${this.topicName}-${this.subtopicName}-progress`;
        const saved = localStorage.getItem(progressKey);
        
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.completedExercises = new Set(data.completed || []);
            } catch (error) {
                console.warn('Error loading progress:', error);
            }
        }

        // Calculate progress for each difficulty
        ['easy', 'medium', 'hard'].forEach(difficulty => {
            const exercisesOfDifficulty = this.exercises.filter(ex => ex.difficulty === difficulty);
            this.userProgress[difficulty].total = exercisesOfDifficulty.length;
            this.userProgress[difficulty].completed = exercisesOfDifficulty.filter(
                (ex, index) => this.completedExercises.has(index)
            ).length;
        });
    }

    saveProgress() {
        const progressKey = `${this.topicName}-${this.subtopicName}-progress`;
        const data = {
            completed: Array.from(this.completedExercises),
            timestamp: Date.now()
        };
        localStorage.setItem(progressKey, JSON.stringify(data));
    }

    initializeUI() {
        // Set up the basic UI structure
        const container = document.querySelector('.exercise-layout');
        if (!container) {
            console.error('Exercise layout container not found');
            return;
        }

        // Initialize sidebar if not exists
        let sidebar = document.querySelector('.exercise-sidebar');
        if (!sidebar) {
            sidebar = document.createElement('div');
            sidebar.className = 'exercise-sidebar';
            container.appendChild(sidebar);
        }

        this.renderSidebar();
    }

    renderSidebar() {
        const sidebar = document.querySelector('.exercise-sidebar');
        if (!sidebar) return;

        const currentTopic = this.topicData[this.topicName];
        const subtopicOptions = currentTopic ? currentTopic.subtopics : [];

        sidebar.innerHTML = `
            <!-- Topic Title -->
            <div class="topic-title-section">
                <h2 class="topic-title">${currentTopic ? currentTopic.title : this.topicName}</h2>
            </div>

            <!-- Subtopic Selector (Always Visible) -->
            <div class="subtopic-selector-section">
                <label for="subtopicSelect" class="subtopic-label">Unterthema wählen:</label>
                <select id="subtopicSelect" class="subtopic-dropdown">
                    ${subtopicOptions.map(sub => 
                        `<option value="${sub.name}" ${sub.name === this.subtopicName ? 'selected' : ''}>${sub.title}</option>`
                    ).join('')}
                </select>
            </div>

            <!-- Exercise List by Difficulty -->
            <div class="exercise-list">
                <h4>Aufgaben</h4>
                ${this.renderExerciseList()}
            </div>

            <!-- Progress Section (At Bottom) -->
            <div class="difficulty-progress">
                <h3>Fortschritt</h3>
                <div class="progress-item">
                    <div class="progress-label">
                        <span>Einfach</span>
                        <span class="progress-count">${this.userProgress.easy.completed}/${this.userProgress.easy.total}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill easy" style="width: ${this.getProgressPercentage('easy')}%"></div>
                    </div>
                </div>
                <div class="progress-item">
                    <div class="progress-label">
                        <span>Mittel</span>
                        <span class="progress-count">${this.userProgress.medium.completed}/${this.userProgress.medium.total}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill medium" style="width: ${this.getProgressPercentage('medium')}%"></div>
                    </div>
                </div>
                <div class="progress-item">
                    <div class="progress-label">
                        <span>Schwer</span>
                        <span class="progress-count">${this.userProgress.hard.completed}/${this.userProgress.hard.total}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill hard" style="width: ${this.getProgressPercentage('hard')}%"></div>
                    </div>
                </div>
            </div>

            <!-- Navigation Controls -->
            <div class="sidebar-navigation">
                <div class="nav-buttons">
                    <button class="nav-btn secondary" id="prevBtn">
                        ← Vorherige
                    </button>
                    <button class="nav-btn secondary" id="nextBtn">
                        Nächste →
                    </button>
                    <button class="nav-btn primary" id="backBtn">
                        Zurück zur Übersicht
                    </button>
                </div>
            </div>
        `;

        // Add event listeners after rendering
        this.setupSidebarEventListeners();
    }

    setupSidebarEventListeners() {
        // Navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const backBtn = document.getElementById('backBtn');
        const subtopicSelect = document.getElementById('subtopicSelect');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousExercise());
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextExercise());
        }
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = '../../index.html';
            });
        }

        // Subtopic dropdown - direct navigation without button
        if (subtopicSelect) {
            subtopicSelect.addEventListener('change', (e) => {
                const selectedSubtopic = e.target.value;
                if (selectedSubtopic && selectedSubtopic !== this.subtopicName) {
                    // Navigate directly to the first exercise of selected subtopic
                    window.location.href = `${selectedSubtopic}.html`;
                }
            });
        }

        // Difficulty toggles
        const difficultyHeaders = document.querySelectorAll('.difficulty-header');
        difficultyHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const arrow = header.querySelector('.toggle-arrow');
                
                if (content.classList.contains('collapsed')) {
                    content.classList.remove('collapsed');
                    content.classList.add('expanded');
                    header.classList.remove('collapsed');
                } else {
                    content.classList.add('collapsed');
                    content.classList.remove('expanded');
                    header.classList.add('collapsed');
                }
            });
        });

        // Exercise item clicks
        const exerciseItems = document.querySelectorAll('.exercise-item');
        exerciseItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const globalIndex = parseInt(item.dataset.index);
                this.goToExercise(globalIndex);
            });
        });
    }

    renderExerciseList() {
        const difficultyGroups = {
            easy: this.exercises.filter(ex => ex.difficulty === 'easy'),
            medium: this.exercises.filter(ex => ex.difficulty === 'medium'),
            hard: this.exercises.filter(ex => ex.difficulty === 'hard')
        };

        let html = '';
        
        Object.entries(difficultyGroups).forEach(([difficulty, exercises]) => {
            if (exercises.length === 0) return;
            
            const difficultyLabels = {
                easy: 'Einfach',
                medium: 'Mittel', 
                hard: 'Schwer'
            };

            const completedCount = exercises.filter((exercise, localIndex) => {
                const globalIndex = this.exercises.indexOf(exercise);
                return this.completedExercises.has(globalIndex);
            }).length;

            html += `
                <div class="difficulty-section">
                    <div class="difficulty-header ${difficulty}">
                        <span>${difficultyLabels[difficulty]} (${completedCount}/${exercises.length})</span>
                        <span class="toggle-arrow">▼</span>
                    </div>
                    <div class="difficulty-content ${difficulty} expanded">
            `;

            exercises.forEach((exercise, localIndex) => {
                const globalIndex = this.exercises.indexOf(exercise);
                const isCompleted = this.completedExercises.has(globalIndex);
                const isActive = globalIndex === this.currentExerciseIndex;
                
                html += `
                    <div class="exercise-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" 
                         data-index="${globalIndex}">
                        <div class="exercise-number">${localIndex + 1}</div>
                        <div class="exercise-title">Aufgabe ${localIndex + 1}</div>
                    </div>
                `;
            });

            html += '</div></div>';
        });

        return html;
    }

    getProgressPercentage(difficulty) {
        const progress = this.userProgress[difficulty];
        return progress.total > 0 ? (progress.completed / progress.total * 100) : 0;
    }

    updateSidebar() {
        this.renderSidebar();
        this.updateNavigationButtons();
    }

    displayCurrentExercise() {
        const exercise = this.exercises[this.currentExerciseIndex];
        if (!exercise) return;

        const mainContent = document.querySelector('.exercise-main');
        if (!mainContent) return;

        // Update exercise content
        const exerciseContent = mainContent.querySelector('.exercise-content');
        if (exerciseContent) {
            this.renderExerciseContent(exercise, exerciseContent);
        }

        this.updateNavigationButtons();
        this.updateSidebar();
    }

    // Get proper exercise title with difficulty and number
    getExerciseTitle() {
        const exercise = this.exercises[this.currentExerciseIndex];
        if (!exercise) return 'Aufgabe';

        const difficulty = exercise.difficulty;
        const difficultyLabels = {
            easy: 'Einfach',
            medium: 'Mittel',
            hard: 'Schwer'
        };

        // Get exercises of same difficulty up to current index
        const exercisesOfSameDifficulty = this.exercises.filter((ex, index) => 
            ex.difficulty === difficulty && index <= this.currentExerciseIndex
        );
        
        const numberInDifficulty = exercisesOfSameDifficulty.length;
        
        return `${difficultyLabels[difficulty]} Aufgabe ${numberInDifficulty}`;
    }

    renderExerciseContent(exercise, container) {
        container.innerHTML = `
            <div class="exercise-question">
                <h3>${this.getExerciseTitle()}</h3>
                <div class="question-text">
                    ${exercise.question}
                </div>
                ${exercise.image ? `
                    <div class="question-image">
                        <img src="${exercise.image}" alt="Aufgabenbild" />
                    </div>
                ` : ''}
            </div>

            <div class="answer-section">
                <div class="answer-input">
                    <label for="userAnswer">Ihre Antwort:</label>
                    <div class="input-group">
                        <input type="text" id="userAnswer" placeholder="Antwort eingeben..." />
                        ${exercise.unit ? `<span class="unit-label">${exercise.unit}</span>` : ''}
                        <button class="check-button" id="checkAnswerBtn">
                            Prüfen
                        </button>
                    </div>
                </div>
            </div>

            <div class="feedback-section">
                <div id="feedback" class="feedback" style="display: none;"></div>
                <div id="solution" class="solution-section" style="display: none;">
                    <h4>Lösung:</h4>
                    <div class="solution-text">${exercise.solution}</div>
                    <div class="explanation-text" style="margin-top: 15px; font-style: italic; color: #666;">
                        ${exercise.explanation || ''}
                    </div>
                </div>
                <div id="navigation-after-check" class="navigation-section" style="display: none;">
                    <button class="nav-btn primary" id="continueBtn" style="margin-top: 20px;">
                        Weiter zur nächsten Aufgabe
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        const checkBtn = container.querySelector('#checkAnswerBtn');
        const input = container.querySelector('#userAnswer');
        const continueBtn = container.querySelector('#continueBtn');
        
        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.checkAnswer());
        }
        
        if (input) {
            input.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.checkAnswer();
                }
            });
            // Focus on input
            setTimeout(() => input.focus(), 100);
        }

        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.nextExercise();
            });
        }

        // Render MathJax if available
        if (window.MathJax) {
            MathJax.typesetPromise([container]);
        }
    }

    checkAnswer() {
        const exercise = this.exercises[this.currentExerciseIndex];
        const userInput = document.getElementById('userAnswer').value.trim();
        const feedbackEl = document.getElementById('feedback');
        const solutionEl = document.getElementById('solution');
        const navigationEl = document.getElementById('navigation-after-check');
        const checkBtn = document.getElementById('checkAnswerBtn');
        const userAnswerInput = document.getElementById('userAnswer');

        if (!userInput) {
            this.showFeedback('Bitte geben Sie eine Antwort ein.', 'error');
            return;
        }

        const isCorrect = this.validateAnswer(userInput, exercise.answer, exercise.tolerance);
        
        // Disable input and check button after checking
        if (checkBtn) checkBtn.disabled = true;
        if (userAnswerInput) userAnswerInput.disabled = true;
        
        if (isCorrect) {
            this.markExerciseCompleted(this.currentExerciseIndex);
            this.showFeedback(`✅ Richtig!`, 'success');
        } else {
            this.showFeedback(`❌ Falsch. Richtige Antwort: ${exercise.answer} ${exercise.unit || ''}`, 'error');
        }
        
        // Always show solution and navigation
        if (solutionEl) solutionEl.style.display = 'block';
        if (navigationEl && this.currentExerciseIndex < this.exercises.length - 1) {
            navigationEl.style.display = 'block';
        }
    }

    validateAnswer(userAnswer, correctAnswer, tolerance = 0.01) {
        // Clean both answers by removing spaces and converting to lowercase
        const cleanUser = userAnswer.toLowerCase().replace(/\s+/g, '').replace(',', '.');
        const cleanCorrect = String(correctAnswer).toLowerCase().replace(/\s+/g, '').replace(',', '.');

        // First try exact string match (for expressions like "3x+1", "2/3", etc.)
        if (cleanUser === cleanCorrect) {
            return true;
        }

        // Only try numeric comparison if BOTH inputs are pure numbers (no letters)
        const isUserNumeric = /^-?(\d+\.?\d*|\.\d+)$/.test(cleanUser);
        const isCorrectNumeric = /^-?(\d+\.?\d*|\.\d+)$/.test(cleanCorrect);
        
        if (isUserNumeric && isCorrectNumeric) {
            const userNum = parseFloat(cleanUser);
            const correctNum = parseFloat(cleanCorrect);
            
            if (!isNaN(userNum) && !isNaN(correctNum)) {
                const absoluteTolerance = Math.abs(correctNum) * tolerance + 0.001;
                return Math.abs(userNum - correctNum) <= absoluteTolerance;
            }
        }

        return false;
    }

    showFeedback(message, type) {
        const feedbackEl = document.getElementById('feedback');
        if (feedbackEl) {
            feedbackEl.innerHTML = message;
            feedbackEl.className = `feedback ${type}`;
            feedbackEl.style.display = 'block';
        }
    }

    markExerciseCompleted(index) {
        this.completedExercises.add(index);
        
        // Update progress
        const exercise = this.exercises[index];
        this.userProgress[exercise.difficulty].completed = this.exercises
            .filter((ex, i) => ex.difficulty === exercise.difficulty && this.completedExercises.has(i))
            .length;

        this.saveProgress();
        this.updateSidebar();

        // Notify parent window if in iframe
        if (window.parent && window.parent.emWizard) {
            window.parent.emWizard.progressTracker.markExerciseCompleted(
                this.topicName, 
                this.subtopicName
            );
        }
    }

    goToExercise(index) {
        if (index >= 0 && index < this.exercises.length) {
            this.currentExerciseIndex = index;
            this.clearFeedback();
            this.displayCurrentExercise();
        }
    }

    nextExercise() {
        if (this.currentExerciseIndex < this.exercises.length - 1) {
            this.currentExerciseIndex++;
            this.clearFeedback();
            this.displayCurrentExercise();
        } else {
            // At the end, just update sidebar (dropdown is always visible)
            this.updateSidebar();
        }
    }

    previousExercise() {
        if (this.currentExerciseIndex > 0) {
            this.currentExerciseIndex--;
            this.clearFeedback();
            this.displayCurrentExercise();
        }
    }

    clearFeedback() {
        const feedbackEl = document.getElementById('feedback');
        const solutionEl = document.getElementById('solution');
        const navigationEl = document.getElementById('navigation-after-check');
        
        if (feedbackEl) {
            feedbackEl.style.display = 'none';
        }
        if (solutionEl) {
            solutionEl.style.display = 'none';
        }
        if (navigationEl) {
            navigationEl.style.display = 'none';
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (prevBtn) {
            prevBtn.disabled = this.currentExerciseIndex === 0;
            prevBtn.style.opacity = this.currentExerciseIndex === 0 ? '0.5' : '1';
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentExerciseIndex === this.exercises.length - 1;
            nextBtn.style.opacity = this.currentExerciseIndex === this.exercises.length - 1 ? '0.5' : '1';
        }
    }

    // Get overall progress for the topic
    getOverallProgress() {
        const totalCompleted = this.completedExercises.size;
        const totalExercises = this.exercises.length;
        return {
            completed: totalCompleted,
            total: totalExercises,
            percentage: totalExercises > 0 ? Math.round((totalCompleted / totalExercises) * 100) : 0
        };
    }
}

// Helper function to toggle theory section
function toggleTheory() {
    const content = document.querySelector('.theory-content');
    const icon = document.querySelector('.toggle-icon');
    
    if (content && icon) {
        const isHidden = content.style.display === 'none' || !content.classList.contains('active');
        
        if (isHidden) {
            content.style.display = 'block';
            content.classList.add('active');
            icon.textContent = '▲';
        } else {
            content.style.display = 'none';
            content.classList.remove('active');
            icon.textContent = '▼';
        }
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExerciseSystem;
} else {
    window.ExerciseSystem = ExerciseSystem;
}