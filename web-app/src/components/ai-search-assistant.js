// AI Search Assistant Component
class AISearchAssistant {
    constructor() {
        this.isActive = false;
        this.conversationHistory = [];
        this.suggestedPrompts = [];
        this.knowledgeBase = this.buildKnowledgeBase();
        this.setupAssistant();
    }

    buildKnowledgeBase() {
        return {
            medicalTopics: {
                'diagnosis': ['differential diagnosis', 'clinical assessment', 'patient evaluation', 'diagnostic criteria'],
                'treatment': ['therapy plans', 'medication management', 'treatment protocols', 'patient care'],
                'nursing': ['care plans', 'patient assessment', 'nursing interventions', 'NANDA diagnoses'],
                'research': ['study design', 'methodology', 'clinical trials', 'evidence-based practice'],
                'education': ['medical training', 'study guides', 'board preparation', 'clinical skills'],
                'administration': ['hospital policies', 'healthcare management', 'compliance', 'quality improvement']
            },
            commonIntents: {
                'help': 'assistance, support, guide, how to',
                'find': 'search, look for, need, want',
                'create': 'make, build, develop, generate',
                'learn': 'study, understand, know, education',
                'improve': 'better, enhance, optimize, upgrade'
            },
            responseTemplates: {
                greeting: [
                    "Hello! I'm your AI search assistant. How can I help you find the perfect medical prompt today?",
                    "Hi there! I'm here to help you discover the right prompts for your medical practice. What are you looking for?",
                    "Welcome! I can help you find specialized medical prompts. What type of healthcare task do you need assistance with?"
                ],
                clarification: [
                    "Could you tell me more about what specific medical area you're working in?",
                    "To help you better, what type of healthcare role are you in? (Doctor, Nurse, Student, etc.)",
                    "What specific medical task or procedure are you looking to get help with?"
                ],
                suggestions: [
                    "Based on your search, here are some relevant prompts that might help:",
                    "I found several prompts that match what you're looking for:",
                    "These medical prompts seem perfect for your needs:"
                ],
                noResults: [
                    "I couldn't find exact matches, but here are some related prompts that might be helpful:",
                    "While I don't have specific prompts for that, these alternatives might work:",
                    "Let me suggest some similar prompts that could be adapted for your needs:"
                ]
            }
        };
    }

    setupAssistant() {
        this.createAssistantUI();
        this.setupEventListeners();
    }

    createAssistantUI() {
        // Create AI Assistant container
        const assistantHTML = `
            <div id="ai-search-assistant" class="ai-assistant-container" style="display: none;">
                <div class="ai-assistant-header">
                    <div class="ai-avatar">
                        <div class="ai-icon">🤖</div>
                        <div class="ai-pulse"></div>
                    </div>
                    <div class="ai-info">
                        <h4>AI Search Assistant</h4>
                        <p class="ai-status">Ready to help</p>
                    </div>
                    <button class="ai-close" id="ai-close-btn">×</button>
                </div>
                <div class="ai-chat-container" id="ai-chat-container">
                    <div class="ai-welcome-message">
                        <div class="ai-message ai-message-bot">
                            <div class="ai-message-content">
                                <div class="ai-avatar-small">🤖</div>
                                <div class="ai-text">
                                    Hello! I'm your AI search assistant. I can help you find the perfect medical prompts for your needs. Try searching for something like "diagnosis help" or "nursing care plans"!
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ai-chat-messages" id="ai-chat-messages"></div>
                    <div class="ai-typing" id="ai-typing" style="display: none;">
                        <div class="ai-message ai-message-bot">
                            <div class="ai-message-content">
                                <div class="ai-avatar-small">🤖</div>
                                <div class="ai-typing-animation">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ai-suggestions" id="ai-suggestions">
                    <div class="ai-suggestion-chips">
                        <button class="ai-chip" data-query="help with patient diagnosis">🩺 Patient Diagnosis</button>
                        <button class="ai-chip" data-query="nursing care plans">👩‍⚕️ Nursing Care</button>
                        <button class="ai-chip" data-query="medical research protocols">📊 Research Protocols</button>
                        <button class="ai-chip" data-query="medical education">📚 Medical Education</button>
                    </div>
                </div>
            </div>
        `;

        // Insert AI Assistant into the search section
        const searchSection = document.querySelector('.search-section');
        if (searchSection) {
            searchSection.insertAdjacentHTML('afterend', assistantHTML);
        }
    }

    setupEventListeners() {
        // Search input enhancement
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (e.target.value.length > 2) {
                    this.handleSearchQuery(e.target.value);
                }
            });

            searchInput.addEventListener('focus', () => {
                this.showAssistant();
            });
        }

        // Close assistant
        const closeBtn = document.getElementById('ai-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideAssistant();
            });
        }

        // Suggestion chips
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ai-chip')) {
                const query = e.target.dataset.query;
                this.handleSuggestionClick(query);
            }
        });

        // Prompt card click tracking
        document.addEventListener('click', (e) => {
            if (e.target.closest('.prompt-card')) {
                this.trackPromptInteraction(e.target.closest('.prompt-card'));
            }
        });
    }

    async handleSearchQuery(query) {
        this.showAssistant();
        this.addUserMessage(query);
        
        // Show typing animation
        this.showTyping();
        
        // Simulate AI processing delay
        await this.delay(1000);
        
        const response = this.generateResponse(query);
        this.hideTyping();
        this.addBotMessage(response);
        
        // Update suggestions
        this.updateSuggestionChips(query);
    }

    generateResponse(query) {
        const lowerQuery = query.toLowerCase();
        const response = {
            text: '',
            prompts: [],
            suggestions: []
        };

        // Analyze query intent
        const intent = this.analyzeIntent(lowerQuery);
        const medicalArea = this.identifyMedicalArea(lowerQuery);
        
        // Generate contextual response
        if (intent === 'greeting' || lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
            response.text = this.getRandomResponse('greeting');
        } else if (intent === 'help' || lowerQuery.includes('help')) {
            response.text = this.getHelpResponse(medicalArea);
        } else {
            // Search for relevant prompts
            const matchingPrompts = this.findRelevantPrompts(lowerQuery);
            if (matchingPrompts.length > 0) {
                response.text = this.getRandomResponse('suggestions');
                response.prompts = matchingPrompts.slice(0, 3); // Top 3 results
            } else {
                response.text = this.getRandomResponse('noResults');
                response.prompts = this.getSimilarPrompts(lowerQuery);
            }
        }

        return response;
    }

    analyzeIntent(query) {
        const { commonIntents } = this.knowledgeBase;
        
        for (const [intent, keywords] of Object.entries(commonIntents)) {
            if (keywords.split(', ').some(keyword => query.includes(keyword))) {
                return intent;
            }
        }
        
        return 'search';
    }

    identifyMedicalArea(query) {
        const { medicalTopics } = this.knowledgeBase;
        
        for (const [area, keywords] of Object.entries(medicalTopics)) {
            if (keywords.some(keyword => query.includes(keyword))) {
                return area;
            }
        }
        
        return 'general';
    }

    findRelevantPrompts(query) {
        // Access the main app's prompts data
        const prompts = window.app ? window.app.prompts : [];
        
        return prompts.filter(prompt => {
            const searchText = `${prompt.title} ${prompt.description} ${prompt.tags.join(' ')}`.toLowerCase();
            const queryWords = query.split(' ');
            return queryWords.some(word => word.length > 2 && searchText.includes(word));
        }).sort((a, b) => {
            // Sort by relevance (simple scoring)
            const aScore = this.calculateRelevanceScore(a, query);
            const bScore = this.calculateRelevanceScore(b, query);
            return bScore - aScore;
        });
    }

    calculateRelevanceScore(prompt, query) {
        const queryWords = query.toLowerCase().split(' ');
        let score = 0;
        
        const searchText = `${prompt.title} ${prompt.description} ${prompt.tags.join(' ')}`.toLowerCase();
        
        queryWords.forEach(word => {
            if (word.length > 2) {
                if (prompt.title.toLowerCase().includes(word)) score += 3;
                if (prompt.description.toLowerCase().includes(word)) score += 2;
                if (prompt.tags.some(tag => tag.toLowerCase().includes(word))) score += 1;
            }
        });
        
        return score;
    }

    getSimilarPrompts(query) {
        const prompts = window.app ? window.app.prompts : [];
        return prompts.slice(0, 3); // Return first 3 as fallback
    }

    getHelpResponse(medicalArea) {
        const areaResponses = {
            diagnosis: "I can help you find diagnostic prompts! Try searching for 'differential diagnosis', 'patient assessment', or 'clinical evaluation'.",
            treatment: "Looking for treatment guidance? Search for 'therapy plans', 'medication management', or 'treatment protocols'.",
            nursing: "Need nursing prompts? Try 'care plans', 'nursing assessment', or 'patient care interventions'.",
            research: "For research help, search for 'study design', 'research methodology', or 'clinical trials'.",
            education: "Looking for educational resources? Try 'study guides', 'medical training', or 'clinical skills'.",
            administration: "Need administrative help? Search for 'hospital policies', 'healthcare management', or 'compliance protocols'.",
            general: "I can help you find medical prompts! Try searching for specific topics like 'patient care', 'diagnosis', 'nursing', or 'medical research'."
        };
        
        return areaResponses[medicalArea] || areaResponses.general;
    }

    getRandomResponse(type) {
        const responses = this.knowledgeBase.responseTemplates[type];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    addUserMessage(message) {
        const chatMessages = document.getElementById('ai-chat-messages');
        const messageHTML = `
            <div class="ai-message ai-message-user">
                <div class="ai-message-content">
                    <div class="ai-text">${message}</div>
                    <div class="ai-avatar-small">👤</div>
                </div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
    }

    addBotMessage(response) {
        const chatMessages = document.getElementById('ai-chat-messages');
        let messageHTML = `
            <div class="ai-message ai-message-bot">
                <div class="ai-message-content">
                    <div class="ai-avatar-small">🤖</div>
                    <div class="ai-text">${response.text}</div>
                </div>
            </div>
        `;

        // Add prompt suggestions if available
        if (response.prompts && response.prompts.length > 0) {
            const promptsHTML = response.prompts.map(prompt => `
                <div class="ai-prompt-suggestion" onclick="app.openPromptModal('${prompt.id}')">
                    <div class="ai-prompt-title">${prompt.title}</div>
                    <div class="ai-prompt-desc">${prompt.description.substring(0, 100)}...</div>
                    <div class="ai-prompt-meta">
                        <span class="ai-prompt-difficulty ${prompt.difficulty.toLowerCase()}">${prompt.difficulty}</span>
                        <span class="ai-prompt-category">${prompt.subcategory.replace('-', ' ')}</span>
                    </div>
                </div>
            `).join('');
            
            messageHTML += `<div class="ai-prompt-suggestions">${promptsHTML}</div>`;
        }

        chatMessages.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
    }

    handleSuggestionClick(query) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = query;
            this.handleSearchQuery(query);
            
            // Trigger the main search
            if (window.app) {
                window.app.filters.search = query;
                window.app.applyFilters();
            }
        }
    }

    updateSuggestionChips(query) {
        const suggestions = document.getElementById('ai-suggestions');
        const relatedQueries = this.generateRelatedQueries(query);
        
        const chipsHTML = relatedQueries.map(q => 
            `<button class="ai-chip" data-query="${q.query}">${q.icon} ${q.label}</button>`
        ).join('');
        
        suggestions.innerHTML = `<div class="ai-suggestion-chips">${chipsHTML}</div>`;
    }

    generateRelatedQueries(query) {
        const related = [
            { query: 'clinical diagnosis help', icon: '🩺', label: 'Diagnosis Help' },
            { query: 'nursing care protocols', icon: '👩‍⚕️', label: 'Nursing Care' },
            { query: 'medical research methods', icon: '📊', label: 'Research Methods' },
            { query: 'patient education materials', icon: '📚', label: 'Patient Education' }
        ];
        
        // Customize based on the query
        if (query.includes('diagnosis')) {
            return [
                { query: 'differential diagnosis', icon: '🔍', label: 'Differential Diagnosis' },
                { query: 'clinical assessment', icon: '📋', label: 'Clinical Assessment' },
                { query: 'patient evaluation', icon: '🏥', label: 'Patient Evaluation' }
            ];
        }
        
        return related;
    }

    showAssistant() {
        const assistant = document.getElementById('ai-search-assistant');
        if (assistant) {
            assistant.style.display = 'block';
            this.isActive = true;
            this.updateStatus('Listening...');
        }
    }

    hideAssistant() {
        const assistant = document.getElementById('ai-search-assistant');
        if (assistant) {
            assistant.style.display = 'none';
            this.isActive = false;
        }
    }

    showTyping() {
        const typing = document.getElementById('ai-typing');
        if (typing) {
            typing.style.display = 'block';
            this.updateStatus('Thinking...');
            this.scrollToBottom();
        }
    }

    hideTyping() {
        const typing = document.getElementById('ai-typing');
        if (typing) {
            typing.style.display = 'none';
            this.updateStatus('Ready to help');
        }
    }

    updateStatus(status) {
        const statusEl = document.querySelector('.ai-status');
        if (statusEl) {
            statusEl.textContent = status;
        }
    }

    scrollToBottom() {
        const chatContainer = document.getElementById('ai-chat-container');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    trackPromptInteraction(promptCard) {
        // Track which prompts users interact with for better suggestions
        const promptId = promptCard.onclick.toString().match(/'([^']+)'/)?.[1];
        if (promptId) {
            console.log('User interacted with prompt:', promptId);
            // Future: Store interaction data for personalized recommendations
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize AI Search Assistant when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiSearchAssistant = new AISearchAssistant();
});