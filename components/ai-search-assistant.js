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
        // Create floating button
        const floatingButtonHTML = `
            <div id="ai-floating-button" class="ai-floating-button">
                <div class="ai-float-icon">🤖</div>
                <div class="ai-float-pulse"></div>
                <div class="ai-notification-badge" id="ai-notification" style="display: none;">1</div>
            </div>
        `;

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
                <div class="ai-input-section" id="ai-input-section">
                    <div class="ai-input-container">
                        <input type="text" id="ai-chat-input" class="ai-chat-input" placeholder="Ask me anything about medical prompts..." />
                        <button id="ai-send-btn" class="ai-send-btn">→</button>
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

        // Insert floating button and assistant into body
        document.body.insertAdjacentHTML('beforeend', floatingButtonHTML + assistantHTML);
        
        // Add AI Assistant specific styles
        this.addAIStyles();
    }

    setupEventListeners() {
        // Floating button click
        const floatingBtn = document.getElementById('ai-floating-button');
        if (floatingBtn) {
            floatingBtn.addEventListener('click', () => {
                this.toggleAssistant();
            });
        }

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

        // AI chat input
        const chatInput = document.getElementById('ai-chat-input');
        const sendBtn = document.getElementById('ai-send-btn');
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleChatMessage();
                }
            });
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.handleChatMessage();
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

        // Click outside to close
        document.addEventListener('click', (e) => {
            const assistant = document.getElementById('ai-search-assistant');
            const floatingButton = document.getElementById('ai-floating-button');
            
            if (this.isActive && 
                !assistant.contains(e.target) && 
                !floatingButton.contains(e.target) && 
                !e.target.closest('.prompt-card')) {
                this.hideAssistant();
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

    toggleAssistant() {
        if (this.isActive) {
            this.hideAssistant();
        } else {
            this.showAssistant();
        }
    }

    showAssistant() {
        const assistant = document.getElementById('ai-search-assistant');
        const floatingBtn = document.getElementById('ai-floating-button');
        
        if (assistant) {
            assistant.style.display = 'block';
            assistant.classList.add('ai-slide-up');
            this.isActive = true;
            this.updateStatus('Ready to help');
            
            // Focus chat input
            setTimeout(() => {
                const chatInput = document.getElementById('ai-chat-input');
                if (chatInput) chatInput.focus();
            }, 300);
        }
        
        if (floatingBtn) {
            floatingBtn.classList.add('ai-hidden');
        }
    }

    hideAssistant() {
        const assistant = document.getElementById('ai-search-assistant');
        const floatingBtn = document.getElementById('ai-floating-button');
        
        if (assistant) {
            assistant.classList.remove('ai-slide-up');
            setTimeout(() => {
                assistant.style.display = 'none';
            }, 200);
            this.isActive = false;
        }
        
        if (floatingBtn) {
            floatingBtn.classList.remove('ai-hidden');
        }
    }

    handleChatMessage() {
        const chatInput = document.getElementById('ai-chat-input');
        if (!chatInput || !chatInput.value.trim()) return;
        
        const message = chatInput.value.trim();
        chatInput.value = '';
        
        this.handleSearchQuery(message);
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

    addAIStyles() {
        if (document.getElementById('ai-assistant-styles')) return; // Prevent duplicate styles
        
        const styles = document.createElement('style');
        styles.id = 'ai-assistant-styles';
        styles.textContent = `
            /* Floating Button Styles */
            .ai-floating-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 1000;
                border: none;
                overflow: visible;
            }

            .ai-floating-button:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
            }

            .ai-floating-button.ai-hidden {
                transform: translateY(100px) scale(0.8);
                opacity: 0;
                pointer-events: none;
            }

            .ai-float-icon {
                font-size: 28px;
                z-index: 2;
                animation: ai-float-bounce 2s infinite;
            }

            .ai-float-pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: rgba(102, 126, 234, 0.3);
                animation: ai-pulse 2s infinite;
            }

            .ai-notification-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 20px;
                height: 20px;
                background: #ff4757;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                color: white;
                border: 2px solid white;
            }

            /* AI Assistant Container Styles */
            .ai-assistant-container {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 400px;
                height: 600px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                z-index: 999;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                border: 1px solid rgba(0, 0, 0, 0.1);
                transform: translateY(100px) scale(0.95);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .ai-assistant-container.ai-slide-up {
                transform: translateY(0) scale(1);
                opacity: 1;
            }

            .ai-assistant-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                position: relative;
            }

            .ai-avatar {
                position: relative;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
            }

            .ai-icon {
                font-size: 20px;
                z-index: 2;
            }

            .ai-pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                animation: ai-pulse 2s infinite;
            }

            .ai-info h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            .ai-status {
                margin: 0;
                font-size: 12px;
                opacity: 0.9;
            }

            .ai-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 18px;
                transition: background-color 0.2s;
            }

            .ai-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .ai-chat-container {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                background: #f8f9fa;
            }

            .ai-welcome-message {
                margin-bottom: 16px;
            }

            .ai-message {
                margin-bottom: 12px;
                display: flex;
                align-items: flex-start;
            }

            .ai-message-bot {
                justify-content: flex-start;
            }

            .ai-message-user {
                justify-content: flex-end;
            }

            .ai-message-content {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                max-width: 85%;
            }

            .ai-message-user .ai-message-content {
                flex-direction: row-reverse;
            }

            .ai-avatar-small {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #667eea;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                flex-shrink: 0;
                color: white;
            }

            .ai-message-user .ai-avatar-small {
                background: #28a745;
            }

            .ai-text {
                background: white;
                padding: 12px 16px;
                border-radius: 16px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                font-size: 14px;
                line-height: 1.4;
            }

            .ai-message-user .ai-text {
                background: #667eea;
                color: white;
            }

            .ai-typing-animation {
                display: flex;
                gap: 4px;
                align-items: center;
                padding: 12px 16px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .ai-typing-animation span {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #ccc;
                animation: ai-typing 1.4s infinite ease-in-out both;
            }

            .ai-typing-animation span:nth-child(1) { animation-delay: -0.32s; }
            .ai-typing-animation span:nth-child(2) { animation-delay: -0.16s; }

            .ai-input-section {
                padding: 16px;
                border-top: 1px solid #e9ecef;
                background: white;
            }

            .ai-input-container {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .ai-chat-input {
                flex: 1;
                padding: 12px 16px;
                border: 1px solid #ddd;
                border-radius: 24px;
                outline: none;
                font-size: 14px;
                transition: border-color 0.2s;
            }

            .ai-chat-input:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .ai-send-btn {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: none;
                background: #667eea;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 16px;
                transition: background-color 0.2s;
            }

            .ai-send-btn:hover {
                background: #5a67d8;
            }

            .ai-suggestions {
                padding: 16px;
                border-top: 1px solid #e9ecef;
                background: white;
            }

            .ai-suggestion-chips {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .ai-chip {
                background: #f1f3f4;
                border: none;
                border-radius: 16px;
                padding: 8px 12px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .ai-chip:hover {
                background: #667eea;
                color: white;
                transform: translateY(-1px);
            }

            .ai-prompt-suggestions {
                margin-top: 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .ai-prompt-suggestion {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 12px;
                padding: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .ai-prompt-suggestion:hover {
                border-color: #667eea;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .ai-prompt-title {
                font-weight: 600;
                font-size: 13px;
                color: #333;
                margin-bottom: 4px;
            }

            .ai-prompt-desc {
                font-size: 12px;
                color: #666;
                line-height: 1.3;
                margin-bottom: 8px;
            }

            .ai-prompt-meta {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .ai-prompt-difficulty {
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 8px;
                font-weight: 600;
                text-transform: uppercase;
            }

            .ai-prompt-difficulty.beginner {
                background: #d4edda;
                color: #155724;
            }

            .ai-prompt-difficulty.intermediate {
                background: #fff3cd;
                color: #856404;
            }

            .ai-prompt-difficulty.advanced {
                background: #f8d7da;
                color: #721c24;
            }

            .ai-prompt-category {
                font-size: 10px;
                color: #666;
                text-transform: capitalize;
            }

            /* Animations */
            @keyframes ai-pulse {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.1);
                    opacity: 0.7;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            @keyframes ai-float-bounce {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-3px);
                }
            }

            @keyframes ai-typing {
                0%, 80%, 100% {
                    transform: scale(0.8);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            /* Mobile Responsiveness */
            @media (max-width: 768px) {
                .ai-assistant-container {
                    width: calc(100vw - 40px);
                    height: calc(100vh - 120px);
                    bottom: 20px;
                    right: 20px;
                    left: 20px;
                }

                .ai-floating-button {
                    width: 50px;
                    height: 50px;
                }

                .ai-float-icon {
                    font-size: 24px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialize AI Search Assistant when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiSearchAssistant = new AISearchAssistant();
});