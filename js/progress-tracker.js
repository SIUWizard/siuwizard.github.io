// Updated Progress Tracker for New Exercise System
// Supports predefined exercises and detailed progress tracking

class ProgressTracker {
    constructor() {
        this.storageKey = 'siu-em-wizard-progress';
        this.sessionKey = 'siu-em-wizard-session';
        this.startTime = Date.now();
        this.currentSession = this.initializeSession();
        this.progress = this.loadProgress();
        
        // Define exercise counts for each topic/subtopic
        this.exerciseCounts = {
            'grundlagen': {
                'grundrechenarten': { easy: 6, medium: 6, hard: 6, total: 18 },
                'brueche': { easy: 5, medium: 5, hard: 5, total: 15 },
                'potenzen': { easy: 4, medium: 4, hard: 4, total: 12 },
                'gleichungen': { easy: 5, medium: 5, hard: 5, total: 15 },
                'ohmsches-gesetz': { easy: 6, medium: 6, hard: 6, total: 18 },
                'spezifischer-widerstand': { easy: 5, medium: 5, hard: 6, total: 16 },
                'leistung-arbeit': { easy: 5, medium: 5, hard: 5, total: 15 }
            },
            'widerstandsschaltungen': {
                'serie-parallel': { easy: 4, medium: 4, hard: 4, total: 12 },
                'gemischte-schaltungen': { easy: 3, medium: 4, hard: 4, total: 11 },
                'spannungsteiler': { easy: 4, medium: 4, hard: 4, total: 12 },
                'stromteiler': { easy: 4, medium: 4, hard: 4, total: 12 },
                'brueckenschaltungen': { easy: 3, medium: 3, hard: 4, total: 10 },
                'kirchhoff': { easy: 4, medium: 5, hard: 5, total: 14 },
                'temp-widerstand': { easy: 3, medium: 3, hard: 3, total: 9 }
            },
            'koordinaten-trigonometrie': {
                'winkelberechnungen': { easy: 4, medium: 4, hard: 4, total: 12 },
                'pythagoras': { easy: 5, medium: 5, hard: 5, total: 15 },
                'trigonometrie': { easy: 5, medium: 5, hard: 5, total: 15 },
                'koordinatensysteme': { easy: 4, medium: 4, hard: 4, total: 12 }
            },
            'feld-kondensatoren': {
                'elektrisches-feld': { easy: 4, medium: 4, hard: 4, total: 12 },
                'kondensatoren': { easy: 5, medium: 5, hard: 5, total: 15 },
                'kapazitaet': { easy: 4, medium: 4, hard: 4, total: 12 }
            },
            'magnetismus-induktivitaet': {
                'magnetfeld': { easy: 4, medium: 4, hard: 4, total: 12 },
                'induktionsgesetz': { easy: 4, medium: 4, hard: 4, total: 12 },
                'induktivitaeten': { easy: 4, medium: 4, hard: 4, total: 12 }
            },
            'zeitabhaengige-schaltungen': {
                'exponentialfunktionen': { easy: 4, medium: 4, hard: 4, total: 12 },
                'rc-schaltungen': { easy: 5, medium: 5, hard: 5, total: 15 },
                'lade-entlade': { easy: 4, medium: 4, hard: 4, total: 12 }
            },
            'wechselstrom': {
                'wechselstrom': { easy: 4, medium: 4, hard: 4, total: 12 },
                'wirk-blindwiderstand': { easy: 5, medium: 5, hard: 5, total: 15 },
                'reaktive-elemente': { easy: 4, medium: 4, hard: 4, total: 12 },
                'leistung': { easy: 5, medium: 5, hard: 5, total: 15 },
                'blindleistungskompensation': { easy: 4, medium: 4, hard: 4, total: 12 }
            },
            'filter': {
                'hoch-tiefpass': { easy: 5, medium: 5, hard: 5, total: 15 },
                'bode-diagramm': { easy: 4, medium: 4, hard: 4, total: 12 },
                'grenzfrequenz': { easy: 4, medium: 4, hard: 4, total: 12 }
            }
        };
        
        this.setupAutoSave();
        this.setupTimeTracking();
    }

    // Initialize session data
    initializeSession() {
        return {
            startTime: Date.now(),
            timeSpent: 0,
            exercisesCompleted: 0,
            currentTopic: null,
            currentExercise: null
        };
    }

    // Load progress from localStorage
    loadProgress() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return this.migrateProgressData(parsed);
            }
        } catch (error) {
            console.warn('Error loading progress:', error);
        }
        
        return this.getDefaultProgress();
    }

    // Get default progress structure
    getDefaultProgress() {
        return {
            version: '1.0',
            user: {
                name: null,
                level: 'beginner',
                preferences: {
                    difficulty: 'medium',
                    showHints: true,
                    autoAdvance: true
                }
            },
            statistics: {
                totalTimeSpent: 0, // in minutes
                sessionsCount: 0,
                exercisesCompleted: 0,
                correctAnswers: 0,
                totalAnswers: 0,
                averageScore: 0,
                streakCurrent: 0,
                streakBest: 0
            },
            topics: this.initializeTopics(),
            achievements: [],
            weakAreas: [],
            strengths: [],
            lastVisited: {
                topic: null,
                exercise: null,
                timestamp: null
            },
            examHistory: []
        };
    }

    // Initialize topics with correct exercise counts
    initializeTopics() {
        const topics = {};
        
        Object.keys(this.exerciseCounts).forEach(topicKey => {
            const subtopics = this.exerciseCounts[topicKey];
            let totalTopicExercises = 0;
            const exercises = {};
            
            Object.keys(subtopics).forEach(subtopicKey => {
                const counts = subtopics[subtopicKey];
                totalTopicExercises += counts.total;
                exercises[subtopicKey] = {
                    completed: 0,
                    total: counts.total,
                    bestScore: 0,
                    timeSpent: 0,
                    difficulty: {
                        easy: { completed: 0, total: counts.easy },
                        medium: { completed: 0, total: counts.medium },
                        hard: { completed: 0, total: counts.hard }
                    }
                };
            });
            
            const topicNames = {
                'grundlagen': 'Grundlagen der Elektrotechnik & Mathematik',
                'widerstandsschaltungen': 'Widerstandsschaltungen & Netzwerkberechnung',
                'koordinaten-trigonometrie': 'Koordinatensysteme & Trigonometrie',
                'feld-kondensatoren': 'Elektrisches Feld & Kondensatoren',
                'magnetismus-induktivitaet': 'Magnetismus & Induktivitäten',
                'zeitabhaengige-schaltungen': 'Zeitabhängige Schaltungen',
                'wechselstrom': 'Wechselstromkreis',
                'filter': 'Filter'
            };
            
            topics[topicKey] = {
                name: topicNames[topicKey] || topicKey,
                totalExercises: totalTopicExercises,
                completedExercises: 0,
                exercises: exercises,
                progress: 0
            };
        });
        
        return topics;
    }

    // Migrate old progress data if structure changed
    migrateProgressData(data) {
        const defaultData = this.getDefaultProgress();
        
        // If it's already version 1.0, return as is
        if (data.version === '1.0') {
            return data;
        }
        
        // Merge with defaults to ensure all properties exist
        const migrated = {
            ...defaultData,
            statistics: { ...defaultData.statistics, ...data.statistics },
            user: { ...defaultData.user, ...data.user },
            achievements: data.achievements || [],
            lastVisited: data.lastVisited || defaultData.lastVisited
        };
        
        // Migrate old topic structure if exists
        if (data.topics) {
            Object.keys(migrated.topics).forEach(topicKey => {
                if (data.topics[topicKey]) {
                    const oldTopic = data.topics[topicKey];
                    migrated.topics[topicKey].completedExercises = oldTopic.completedExercises || 0;
                    migrated.topics[topicKey].progress = oldTopic.progress || 0;
                    
                    // Migrate exercise data
                    if (oldTopic.exercises) {
                        Object.keys(migrated.topics[topicKey].exercises).forEach(exerciseKey => {
                            if (oldTopic.exercises[exerciseKey]) {
                                const oldExercise = oldTopic.exercises[exerciseKey];
                                migrated.topics[topicKey].exercises[exerciseKey].completed = oldExercise.completed || 0;
                                migrated.topics[topicKey].exercises[exerciseKey].bestScore = oldExercise.bestScore || 0;
                                migrated.topics[topicKey].exercises[exerciseKey].timeSpent = oldExercise.timeSpent || 0;
                            }
                        });
                    }
                }
            });
        }
        
        return migrated;
    }

    // Save progress to localStorage
    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
            return true;
        } catch (error) {
            console.error('Error saving progress:', error);
            return false;
        }
    }

    // Setup auto-save functionality
    setupAutoSave() {
        // Save every 30 seconds
        setInterval(() => {
            this.saveProgress();
        }, 30000);

        // Save when page is unloaded
        window.addEventListener('beforeunload', () => {
            this.updateTimeSpent();
            this.saveProgress();
        });

        // Save when page becomes hidden (mobile)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.updateTimeSpent();
                this.saveProgress();
            }
        });
    }

    // Setup time tracking
    setupTimeTracking() {
        // Update time every minute
        setInterval(() => {
            this.updateTimeSpent();
        }, 60000);
    }

    // Update time spent in current session
    updateTimeSpent() {
        const currentTime = Date.now();
        const sessionTime = Math.round((currentTime - this.startTime) / 1000 / 60); // minutes
        
        this.currentSession.timeSpent = sessionTime;
        this.progress.statistics.totalTimeSpent += sessionTime;
        
        // Reset start time for next interval
        this.startTime = currentTime;
    }

    // Update exercise completion for a specific topic/subtopic
    updateExerciseCompletion(topicName, subtopicName, completedExercises) {
        if (!this.progress.topics[topicName] || !this.progress.topics[topicName].exercises[subtopicName]) {
            console.warn(`Topic ${topicName}/${subtopicName} not found`);
            return;
        }

        const exercise = this.progress.topics[topicName].exercises[subtopicName];
        exercise.completed = completedExercises;
        
        // Update topic-level progress
        this.updateTopicProgress(topicName);
        this.saveProgress();
    }

    // Update difficulty-specific progress for a subtopic
    updateDifficultyProgress(topicName, subtopicName, difficulty, completed) {
        if (!this.progress.topics[topicName] || !this.progress.topics[topicName].exercises[subtopicName]) {
            console.warn(`Topic ${topicName}/${subtopicName} not found`);
            return;
        }

        const exercise = this.progress.topics[topicName].exercises[subtopicName];
        if (exercise.difficulty && exercise.difficulty[difficulty]) {
            exercise.difficulty[difficulty].completed = completed;
        }
        
        // Update total completed for this exercise
        const totalCompleted = Object.values(exercise.difficulty).reduce((sum, diff) => sum + diff.completed, 0);
        exercise.completed = totalCompleted;
        
        this.updateTopicProgress(topicName);
        this.saveProgress();
    }

    // Update topic progress
    updateTopicProgress(topicName) {
        const topic = this.progress.topics[topicName];
        if (!topic) return;

        // Count completed exercises
        let completed = 0;
        Object.values(topic.exercises).forEach(exercise => {
            completed += exercise.completed;
        });

        topic.completedExercises = completed;
        topic.progress = Math.round((completed / topic.totalExercises) * 100);
    }

    // Mark exercise as completed (legacy compatibility)
    markExerciseCompleted(topicName, exerciseName, score = null, timeSpent = 0) {
        if (!this.progress.topics[topicName] || !this.progress.topics[topicName].exercises[exerciseName]) {
            console.warn(`Topic ${topicName}/${exerciseName} not found`);
            return;
        }

        const exercise = this.progress.topics[topicName].exercises[exerciseName];
        exercise.timeSpent += timeSpent;
        
        if (score !== null) {
            exercise.bestScore = Math.max(exercise.bestScore, score);
        }

        // Update statistics
        this.progress.statistics.exercisesCompleted++;
        this.currentSession.exercisesCompleted++;
        
        // Update topic progress
        this.updateTopicProgress(topicName);
        
        // Check for achievements
        this.checkAchievements(topicName, exerciseName, score);
        
        // Save progress
        this.saveProgress();
        
        // Fire custom event
        this.fireProgressEvent('exerciseCompleted', {
            topic: topicName,
            exercise: exerciseName,
            score: score
        });
    }

    // Record answer
    recordAnswer(topicName, exerciseName, isCorrect, difficulty = 'medium') {
        this.progress.statistics.totalAnswers++;
        
        if (isCorrect) {
            this.progress.statistics.correctAnswers++;
            this.progress.statistics.streakCurrent++;
            this.progress.statistics.streakBest = Math.max(
                this.progress.statistics.streakBest,
                this.progress.statistics.streakCurrent
            );
        } else {
            this.progress.statistics.streakCurrent = 0;
            this.updateWeakAreas(topicName, exerciseName);
        }

        // Update average score
        this.progress.statistics.averageScore = Math.round(
            (this.progress.statistics.correctAnswers / this.progress.statistics.totalAnswers) * 100
        );

        this.saveProgress();
    }

    // Update weak areas
    updateWeakAreas(topicName, exerciseName) {
        const areaKey = `${topicName}-${exerciseName}`;
        const existing = this.progress.weakAreas.find(area => area.key === areaKey);
        
        if (existing) {
            existing.count++;
            existing.lastSeen = Date.now();
        } else {
            this.progress.weakAreas.push({
                key: areaKey,
                topic: topicName,
                exercise: exerciseName,
                count: 1,
                lastSeen: Date.now()
            });
        }

        // Keep only top 10 weak areas
        this.progress.weakAreas.sort((a, b) => b.count - a.count);
        this.progress.weakAreas = this.progress.weakAreas.slice(0, 10);
    }

    // Update last visited
    updateLastVisited(topicName, exerciseName = null) {
        this.progress.lastVisited = {
            topic: topicName,
            exercise: exerciseName,
            timestamp: Date.now()
        };

        this.currentSession.currentTopic = topicName;
        this.currentSession.currentExercise = exerciseName;
        
        this.saveProgress();
    }

    // Get topic progress with detailed exercise info
    getTopicProgress(topicName) {
        const topic = this.progress.topics[topicName];
        if (!topic) return null;

        const exercises = Object.keys(topic.exercises).map(exerciseKey => {
            const exercise = topic.exercises[exerciseKey];
            return {
                name: exerciseKey,
                completed: exercise.completed,
                total: exercise.total,
                progress: exercise.total > 0 ? Math.round((exercise.completed / exercise.total) * 100) : 0,
                difficulty: exercise.difficulty
            };
        });

        return {
            ...topic,
            exercises: exercises
        };
    }

    // Get overall progress
    getOverallProgress() {
        const topics = Object.values(this.progress.topics);
        const totalExercises = topics.reduce((sum, topic) => sum + topic.totalExercises, 0);
        const completedExercises = topics.reduce((sum, topic) => sum + topic.completedExercises, 0);
        
        return {
            percentage: Math.round((completedExercises / totalExercises) * 100),
            completed: completedExercises,
            total: totalExercises
        };
    }

    // Get statistics
    getStatistics() {
        return {
            ...this.progress.statistics,
            currentSession: this.currentSession
        };
    }

    // Get weak areas
    getWeakAreas() {
        return this.progress.weakAreas.slice(0, 5); // Top 5
    }

    // Get achievements
    getAchievements() {
        return this.progress.achievements.sort((a, b) => b.timestamp - a.timestamp);
    }

    // Check for achievements
    checkAchievements(topicName, exerciseName, score) {
        const achievements = [];

        // First completion achievements
        if (this.progress.statistics.exercisesCompleted === 1) {
            achievements.push({
                id: 'first_exercise',
                name: 'Erste Schritte',
                description: 'Erste Übung abgeschlossen!',
                icon: '🎯',
                timestamp: Date.now()
            });
        }

        // Perfect score achievements
        if (score === 100) {
            achievements.push({
                id: 'perfect_score',
                name: 'Perfekt!',
                description: '100% in einer Übung erreicht!',
                icon: '⭐',
                timestamp: Date.now()
            });
        }

        // Streak achievements
        if (this.progress.statistics.streakCurrent === 10) {
            achievements.push({
                id: 'streak_10',
                name: 'Auf der Siegerstraße',
                description: '10 richtige Antworten in Folge!',
                icon: '🔥',
                timestamp: Date.now()
            });
        }

        // Topic completion achievements
        const topic = this.progress.topics[topicName];
        if (topic && topic.progress === 100) {
            achievements.push({
                id: `topic_${topicName}`,
                name: `${topic.name} Meister`,
                description: `Alle Übungen in ${topic.name} abgeschlossen!`,
                icon: '🏆',
                timestamp: Date.now()
            });
        }

        // Add new achievements
        achievements.forEach(achievement => {
            if (!this.progress.achievements.find(a => a.id === achievement.id)) {
                this.progress.achievements.push(achievement);
                this.showAchievementNotification(achievement);
            }
        });
    }

    // Show achievement notification
    showAchievementNotification(achievement) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <h4>Erfolg freigeschaltet!</h4>
                    <h3>${achievement.name}</h3>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #E31E24, #ff4757);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(227, 30, 36, 0.3);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.5s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 5000);
    }

    // Fire custom progress events
    fireProgressEvent(eventType, data) {
        const event = new CustomEvent('emWizardProgress', {
            detail: {
                type: eventType,
                data: data,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    }

    // Update progress display on main page
    updateMainPageProgress() {
        Object.keys(this.progress.topics).forEach(topicName => {
            const topicCard = document.querySelector(`[data-topic="${topicName}"]`);
            if (topicCard) {
                const topic = this.progress.topics[topicName];
                const progressBar = topicCard.querySelector('.progress-fill');
                const progressText = topicCard.querySelector('.progress-text');
                
                if (progressBar) {
                    progressBar.style.width = `${topic.progress}%`;
                }
                if (progressText) {
                    progressText.textContent = `${topic.completedExercises}/${topic.totalExercises}`;
                }

                // Update subtopic progress
                const subtopics = topicCard.querySelectorAll('.subtopics a');
                subtopics.forEach(link => {
                    const subtopicName = this.extractSubtopicFromUrl(link.href);
                    if (subtopicName && topic.exercises[subtopicName]) {
                        const exercise = topic.exercises[subtopicName];
                        const progressSpan = link.querySelector('.subtopic-progress') || 
                                           this.createSubtopicProgressSpan(exercise.completed, exercise.total);
                        
                        if (!link.querySelector('.subtopic-progress')) {
                            link.appendChild(progressSpan);
                        } else {
                            progressSpan.textContent = `${exercise.completed}/${exercise.total}`;
                        }
                    }
                });
            }
        });

        // Update overall statistics
        const stats = this.getStatistics();
        const overallProgress = this.getOverallProgress();
        
        const statElements = document.querySelectorAll('.progress-stat h3');
        if (statElements.length >= 2) {
            statElements[0].textContent = stats.exercisesCompleted;
            statElements[1].textContent = `${overallProgress.percentage}%`;
        }
    }

    // Helper method to extract subtopic name from URL
    extractSubtopicFromUrl(url) {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        return filename.replace('.html', '');
    }

    // Helper method to create subtopic progress span
    createSubtopicProgressSpan(completed, total) {
        const span = document.createElement('span');
        span.className = 'subtopic-progress';
        span.textContent = `${completed}/${total}`;
        span.style.cssText = `
            float: right;
            background-color: var(--siu-red);
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
        `;
        return span;
    }

    // Reset progress
    resetProgress() {
        if (confirm('Möchten Sie wirklich den gesamten Fortschritt zurücksetzen?')) {
            this.progress = this.getDefaultProgress();
            this.saveProgress();
            window.location.reload();
        }
    }

    // Export progress data
    exportProgress() {
        const dataStr = JSON.stringify(this.progress, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `siu-em-wizard-progress-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Import progress data
    importProgress(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                this.progress = this.migrateProgressData(importedData);
                this.saveProgress();
                alert('Fortschritt erfolgreich importiert!');
                window.location.reload();
            } catch (error) {
                alert('Fehler beim Importieren der Daten: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

// Create CSS for achievement notifications
const achievementCSS = `
.achievement-notification .achievement-content {
    display: flex;
    align-items: center;
    gap: 15px;
}

.achievement-notification .achievement-icon {
    font-size: 2rem;
    flex-shrink: 0;
}

.achievement-notification .achievement-text h4 {
    margin: 0 0 5px 0;
    font-size: 0.9rem;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.achievement-notification .achievement-text h3 {
    margin: 0 0 5px 0;
    font-size: 1.1rem;
    font-weight: bold;
}

.achievement-notification .achievement-text p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
}

.subtopic-progress {
    float: right;
    background-color: var(--siu-red);
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    margin-left: 10px;
}
`;

// Add CSS to document
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = achievementCSS;
    document.head.appendChild(style);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressTrackerNew;
} else {
    window.ProgressTrackerNew = ProgressTrackerNew;
}

// Create global instance
if (typeof window !== 'undefined') {
    window.progressTrackerNew = new ProgressTrackerNew();
}