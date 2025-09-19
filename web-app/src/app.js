// Main Application Class
class PromptLibraryApp {
    constructor() {
        this.prompts = [];
        this.categories = [];
        this.filteredPrompts = [];
        this.favorites = this.loadFavorites();
        this.currentView = 'browse';
        
        this.searchEngine = null;
        this.filters = {
            search: '',
            category: '',
            difficulty: '',
            aiTool: ''
        };

        this.init();
    }

    async init() {
        await this.loadData();
        this.initializeSearch();
        this.setupEventListeners();
        this.renderCategories();
        this.renderPrompts();
        this.populateFilters();
    }

    async loadData() {
        try {
            // Load categories
            const categoriesResponse = await fetch('data/categories.json');
            this.categories = await categoriesResponse.json();

            // Try to load from localStorage first (includes user votes)
            const savedPrompts = window.votingSystem?.loadPromptsFromStorage();
            
            if (savedPrompts && savedPrompts.length > 0) {
                this.prompts = savedPrompts;
            } else {
                // Load both sample and professional prompts
                const [sampleResponse, professionalResponse] = await Promise.all([
                    fetch('data/sample-prompts.json'),
                    fetch('data/professional-prompts.json')
                ]);
                
                const samplePrompts = await sampleResponse.json();
                const professionalPrompts = await professionalResponse.json();
                
                // Combine all prompts
                this.prompts = [...samplePrompts, ...professionalPrompts];
                
                // Save to localStorage for future updates
                window.votingSystem?.savePromptsToStorage(this.prompts);
            }
            
            this.filteredPrompts = [...this.prompts];

            console.log(`Loaded ${this.prompts.length} prompts and ${this.categories.length} categories`);
        } catch (error) {
            console.error('Error loading data:', error);
            // Load fallback data if files don't exist yet
            this.loadFallbackData();
        }
    }

    loadFallbackData() {
        // Minimal data to show the interface works
        this.prompts = [
            {
                id: 'demo-1',
                title: 'Professional Email Template',
                description: 'Create professional email templates for business communication',
                content: 'Write a professional email to [RECIPIENT] about [TOPIC]. The tone should be [TONE] and include [KEY_POINTS].',
                category: 'sales',
                subcategory: 'email-templates',
                industry: ['Business', 'Sales', 'Marketing'],
                tags: ['email', 'professional', 'communication', 'business'],
                variables: [
                    { name: 'recipient', placeholder: '[RECIPIENT]', description: 'Who you are writing to', example: 'John Smith' },
                    { name: 'topic', placeholder: '[TOPIC]', description: 'Main subject of the email', example: 'quarterly review meeting' },
                    { name: 'tone', placeholder: '[TONE]', description: 'Desired tone', example: 'formal and friendly' },
                    { name: 'key_points', placeholder: '[KEY_POINTS]', description: 'Important points to cover', example: 'agenda, timing, preparation needed' }
                ],
                aiTools: ['Universal'],
                difficulty: 'Beginner',
                useCase: 'Business communication and outreach',
                rating: { average: 4.5, count: 127 },
                usage: { count: 1250, lastUsed: new Date().toISOString() },
                createdAt: new Date().toISOString(),
                isPublic: true,
                isFeatured: true
            }
        ];
        this.filteredPrompts = [...this.prompts];
    }

    initializeSearch() {
        // Initialize Fuse.js for fuzzy search
        const fuseOptions = {
            keys: [
                { name: 'title', weight: 3 },
                { name: 'description', weight: 2 },
                { name: 'tags', weight: 2 },
                { name: 'category', weight: 1 },
                { name: 'industry', weight: 1 },
                { name: 'useCase', weight: 1 }
            ],
            threshold: 0.3,
            includeScore: true
        };

        this.searchEngine = new Fuse(this.prompts, fuseOptions);
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        searchInput.addEventListener('input', debounce(() => {
            this.filters.search = searchInput.value;
            this.applyFilters();
        }, 300));

        searchBtn.addEventListener('click', () => {
            this.filters.search = searchInput.value;
            this.applyFilters();
        });

        // Filter controls
        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });

        document.getElementById('difficulty-filter').addEventListener('change', (e) => {
            this.filters.difficulty = e.target.value;
            this.applyFilters();
        });

        document.getElementById('ai-tool-filter').addEventListener('change', (e) => {
            this.filters.aiTool = e.target.value;
            this.applyFilters();
        });

        // Clear filters
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Sorting
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.sortPrompts(e.target.value);
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchView(btn.dataset.view);
            });
        });

        // Modal functionality
        this.setupModalListeners();
    }

    setupModalListeners() {
        const modal = document.getElementById('modal-overlay');
        const closeBtn = document.getElementById('modal-close');
        const copyBtn = document.getElementById('modal-copy');
        const favoriteBtn = document.getElementById('modal-favorite');

        // Close modal
        closeBtn.addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Copy prompt
        copyBtn.addEventListener('click', () => this.copyCurrentPrompt());

        // Favorite prompt
        favoriteBtn.addEventListener('click', () => this.toggleCurrentFavorite());

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    populateFilters() {
        const categoryFilter = document.getElementById('category-filter');
        
        // Clear existing options except first one
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        
        // Add categories
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }

    renderCategories() {
        const grid = document.getElementById('categories-grid');
        
        if (!grid || this.categories.length === 0) return;

        grid.innerHTML = this.categories.map(category => {
            const promptCount = this.prompts.filter(p => p.category === category.id).length;
            
            return `
                <div class="category-card" onclick="app.filterByCategory('${category.id}')" 
                     style="--category-color: ${category.color}">
                    <div class="category-header">
                        <div class="category-icon">${category.icon}</div>
                        <div class="category-name">${category.name}</div>
                    </div>
                    <div class="category-description">${category.description}</div>
                    <div class="category-count">${promptCount} prompts available</div>
                </div>
            `;
        }).join('');
    }

    renderPrompts() {
        const grid = document.getElementById('prompts-grid');
        const resultsCount = document.getElementById('results-count');
        const noResults = document.getElementById('no-results');

        if (this.filteredPrompts.length === 0) {
            grid.innerHTML = '';
            noResults.style.display = 'block';
            resultsCount.textContent = 'No prompts found';
            return;
        }

        noResults.style.display = 'none';
        resultsCount.textContent = `${this.filteredPrompts.length} prompts found`;

        grid.innerHTML = this.filteredPrompts.map(prompt => this.createPromptCard(prompt)).join('');
    }

    createPromptCard(prompt) {
        const category = this.categories.find(c => c.id === prompt.category);
        const categoryName = category ? category.name : prompt.category;
        const isFavorite = this.favorites.includes(prompt.id);
        
        // Get voting information
        const userVote = window.votingSystem?.getUserVote(prompt.id);
        const votes = prompt.votes || { upvotes: 0, downvotes: 0, score: 0 };

        return `
            <div class="prompt-card" onclick="app.openPromptModal('${prompt.id}')">
                <div class="prompt-header">
                    <div>
                        <div class="prompt-title">${prompt.title}</div>
                        ${prompt.rating ? `
                            <div class="prompt-rating">
                                <span class="stars">${this.renderStars(prompt.rating.average)}</span>
                                <span>(${prompt.rating.count})</span>
                            </div>
                        ` : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                                onclick="event.stopPropagation(); app.toggleFavorite('${prompt.id}')">
                            ${isFavorite ? '♥' : '♡'}
                        </button>
                        <div class="vote-buttons">
                            <button class="vote-btn ${userVote === 'up' ? 'upvoted' : ''}" 
                                    onclick="event.stopPropagation(); app.upvotePrompt('${prompt.id}')">
                                ▲ ${votes.upvotes}
                            </button>
                            <span class="vote-score">${votes.score > 0 ? '+' : ''}${votes.score}</span>
                            <button class="vote-btn ${userVote === 'down' ? 'downvoted' : ''}" 
                                    onclick="event.stopPropagation(); app.downvotePrompt('${prompt.id}')">
                                ▼ ${votes.downvotes}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="prompt-description">${prompt.description}</div>
                
                <div class="prompt-meta">
                    <span class="meta-tag category-tag">${categoryName}</span>
                    <span class="meta-tag difficulty-tag ${prompt.difficulty.toLowerCase()}">${prompt.difficulty}</span>
                    ${prompt.aiTools.map(tool => `<span class="meta-tag">${tool}</span>`).join('')}
                </div>
                
                <div class="prompt-actions">
                    ${prompt.usage ? `<span class="usage-count">Used ${prompt.usage.count} times</span>` : ''}
                    ${prompt.submittedBy ? `<span class="contributor">by ${prompt.submittedBy.name}</span>` : ''}
                </div>
            </div>
        `;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '★'.repeat(fullStars);
        
        if (hasHalfStar) stars += '☆';
        
        const remainingStars = 5 - Math.ceil(rating);
        stars += '☆'.repeat(remainingStars);
        
        return stars;
    }

    applyFilters() {
        let filtered = [...this.prompts];

        // Search filter
        if (this.filters.search && this.searchEngine) {
            const searchResults = this.searchEngine.search(this.filters.search);
            filtered = searchResults.map(result => result.item);
        }

        // Category filter
        if (this.filters.category) {
            filtered = filtered.filter(p => p.category === this.filters.category);
        }

        // Difficulty filter
        if (this.filters.difficulty) {
            filtered = filtered.filter(p => p.difficulty === this.filters.difficulty);
        }

        // AI Tool filter
        if (this.filters.aiTool) {
            filtered = filtered.filter(p => p.aiTools.includes(this.filters.aiTool));
        }

        this.filteredPrompts = filtered;
        this.renderPrompts();

        // Update page sections visibility
        const categoriesSection = document.getElementById('categories-section');
        const hasActiveFilters = Object.values(this.filters).some(filter => filter !== '');
        categoriesSection.style.display = hasActiveFilters ? 'none' : 'block';
        
        // Update results title
        const resultsTitle = document.getElementById('results-title');
        resultsTitle.textContent = hasActiveFilters ? 'Search Results' : 'Featured Prompts';
    }

    filterByCategory(categoryId) {
        this.filters.category = categoryId;
        document.getElementById('category-filter').value = categoryId;
        this.applyFilters();
    }

    clearFilters() {
        this.filters = { search: '', category: '', difficulty: '', aiTool: '' };
        
        // Reset form elements
        document.getElementById('search-input').value = '';
        document.getElementById('category-filter').value = '';
        document.getElementById('difficulty-filter').value = '';
        document.getElementById('ai-tool-filter').value = '';
        
        this.applyFilters();
    }

    sortPrompts(sortBy) {
        switch (sortBy) {
            case 'votes':
                this.filteredPrompts.sort((a, b) => (b.votes?.score || 0) - (a.votes?.score || 0));
                break;
            case 'rating':
                this.filteredPrompts.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
                break;
            case 'usage':
                this.filteredPrompts.sort((a, b) => (b.usage?.count || 0) - (a.usage?.count || 0));
                break;
            case 'recent':
                this.filteredPrompts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'trending':
                if (window.votingSystem) {
                    this.filteredPrompts = window.votingSystem.getTrending(this.filteredPrompts);
                }
                break;
            case 'alphabetical':
                this.filteredPrompts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default: // relevance - keep current order
                break;
        }
        this.renderPrompts();
    }


    switchView(view) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        this.currentView = view;
        
        // Handle different views
        switch (view) {
            case 'browse':
                this.showBrowseView();
                break;
            case 'favorites':
                this.showFavoritesView();
                break;
            case 'contribute':
                this.showContributeView();
                break;
            case 'trending':
                this.showTrendingView();
                break;
        }
    }

    showBrowseView() {
        this.applyFilters();
    }

    showFavoritesView() {
        const favoritePrompts = this.prompts.filter(p => this.favorites.includes(p.id));
        this.filteredPrompts = favoritePrompts;
        this.renderPrompts();
        
        document.getElementById('results-title').textContent = 'Your Favorites';
        document.getElementById('categories-section').style.display = 'none';
    }

    showContributeView() {
        // Check if user has permission to submit prompts
        if (window.authSystem) {
            const permissions = window.authSystem.getVotingPermissions();
            if (!permissions.canSubmitPrompts) {
                const grid = document.getElementById('prompts-grid');
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                        <h3>🔐 Login Required</h3>
                        <p style="margin: 1.5rem 0; color: #666;">Please login or continue as a guest to contribute prompts to the library.</p>
                        <button onclick="window.authSystem.showLoginModal()" class="btn-primary">Login to Contribute</button>
                    </div>
                `;
                document.getElementById('results-title').textContent = 'Contribute to the Library';
                document.getElementById('categories-section').style.display = 'none';
                document.getElementById('results-count').textContent = '';
                return;
            }
        }
        
        const grid = document.getElementById('prompts-grid');
        grid.innerHTML = this.createContributionForm();
        
        document.getElementById('results-title').textContent = 'Contribute to the Library';
        document.getElementById('categories-section').style.display = 'none';
        document.getElementById('results-count').textContent = '';
        
        // Setup form handlers
        this.setupContributionForm();
    }
    
    showTrendingView() {
        if (window.votingSystem) {
            this.filteredPrompts = window.votingSystem.getTrending(this.prompts, 7);
        } else {
            this.filteredPrompts = [...this.prompts];
        }
        this.renderPrompts();
        
        document.getElementById('results-title').textContent = 'Trending This Week';
        document.getElementById('categories-section').style.display = 'none';
    }

    // Modal functionality
    openPromptModal(promptId) {
        const prompt = this.prompts.find(p => p.id === promptId);
        if (!prompt) return;

        this.currentPrompt = prompt;
        const modal = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');

        title.textContent = prompt.title;
        content.innerHTML = this.createModalContent(prompt);
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    createModalContent(prompt) {
        const category = this.categories.find(c => c.id === prompt.category);
        const isFavorite = this.favorites.includes(prompt.id);

        // Update favorite button
        const favoriteBtn = document.getElementById('modal-favorite');
        const heart = favoriteBtn.querySelector('.heart');
        heart.textContent = isFavorite ? '♥' : '♡';
        favoriteBtn.innerHTML = `<span class="heart">${heart.textContent}</span> ${isFavorite ? 'Remove from' : 'Add to'} Favorites`;

        return `
            <div class="mb-3">
                <p><strong>Description:</strong> ${prompt.description}</p>
            </div>
            
            <div class="mb-3">
                <h4>Prompt Content:</h4>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border-left: 4px solid #667eea; font-family: monospace; white-space: pre-wrap;">${prompt.content}</div>
            </div>

            ${prompt.variables && prompt.variables.length > 0 ? `
                <div class="mb-3">
                    <h4>Variables to Replace:</h4>
                    <ul>
                        ${prompt.variables.map(v => `
                            <li><strong>${v.placeholder}</strong> - ${v.description}
                                ${v.example ? ` (e.g., "${v.example}")` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}

            <div class="mb-3">
                <h4>Details:</h4>
                <p><strong>Category:</strong> ${category ? category.name : prompt.category}</p>
                <p><strong>Difficulty:</strong> ${prompt.difficulty}</p>
                <p><strong>AI Tools:</strong> ${prompt.aiTools.join(', ')}</p>
                <p><strong>Industries:</strong> ${prompt.industry.join(', ')}</p>
                ${prompt.rating ? `<p><strong>Rating:</strong> ${prompt.rating.average}/5 (${prompt.rating.count} reviews)</p>` : ''}
                ${prompt.usage ? `<p><strong>Usage:</strong> Used ${prompt.usage.count} times</p>` : ''}
            </div>

            <div class="mb-3">
                <h4>Tags:</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${prompt.tags.map(tag => `<span class="meta-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
    }

    closeModal() {
        document.getElementById('modal-overlay').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentPrompt = null;
    }

    copyCurrentPrompt() {
        if (!this.currentPrompt) return;

        navigator.clipboard.writeText(this.currentPrompt.content).then(() => {
            // Show temporary success message
            const copyBtn = document.getElementById('modal-copy');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✅ Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    toggleCurrentFavorite() {
        if (!this.currentPrompt) return;
        this.toggleFavorite(this.currentPrompt.id);
        // Update modal content to reflect change
        const content = document.getElementById('modal-content');
        content.innerHTML = this.createModalContent(this.currentPrompt);
    }

    toggleFavorite(promptId) {
        const index = this.favorites.indexOf(promptId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(promptId);
        }
        this.saveFavorites();
        
        // Re-render if we're in the current view to update favorite buttons
        if (this.currentView === 'browse') {
            this.renderPrompts();
        } else if (this.currentView === 'favorites') {
            this.showFavoritesView();
        }
    }

    loadFavorites() {
        try {
            const saved = localStorage.getItem('promptLibraryFavorites');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem('promptLibraryFavorites', JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }
    
    // Voting methods
    upvotePrompt(promptId) {
        if (!window.votingSystem) return;
        
        // Check authentication if required
        if (window.authSystem && !window.authSystem.handleVoteAttempt(promptId, 'up')) {
            return; // Login modal was shown, exit early
        }
        
        const result = window.votingSystem.upvote(promptId, this.prompts);
        if (result.success) {
            this.renderPrompts(); // Re-render to show updated vote counts
            
            // Show vote confirmation message
            if (window.authSystem) {
                const userName = window.authSystem.getDisplayName();
                window.authSystem.showMessage(
                    result.message === 'Vote removed' 
                        ? `${userName}: Upvote removed` 
                        : `${userName}: Upvoted! 👍`, 
                    'success'
                );
            }
        } else {
            if (window.authSystem) {
                window.authSystem.showMessage('Failed to record vote', 'error');
            }
        }
    }
    
    downvotePrompt(promptId) {
        if (!window.votingSystem) return;
        
        // Check authentication if required
        if (window.authSystem && !window.authSystem.handleVoteAttempt(promptId, 'down')) {
            return; // Login modal was shown, exit early
        }
        
        const result = window.votingSystem.downvote(promptId, this.prompts);
        if (result.success) {
            this.renderPrompts(); // Re-render to show updated vote counts
            
            // Show vote confirmation message
            if (window.authSystem) {
                const userName = window.authSystem.getDisplayName();
                window.authSystem.showMessage(
                    result.message === 'Vote removed' 
                        ? `${userName}: Downvote removed` 
                        : `${userName}: Downvoted 👎`, 
                    'success'
                );
            }
        } else {
            if (window.authSystem) {
                window.authSystem.showMessage('Failed to record vote', 'error');
            }
        }
    }
    
    // Create contribution form
    createContributionForm() {
        return `
            <div class="contribution-form" style="grid-column: 1 / -1;">
                <h3 style="margin-bottom: 2rem; color: #2d3748;">Share Your Prompt with the Community</h3>
                
                <form id="contribution-form">
                    <div class="form-group">
                        <label for="prompt-title">Prompt Title *</label>
                        <input type="text" id="prompt-title" class="form-input" placeholder="Give your prompt a clear, descriptive title" required>
                        <div class="form-error" id="title-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="prompt-description">Description *</label>
                        <textarea id="prompt-description" class="form-textarea" placeholder="Explain what your prompt does and how it helps users" required></textarea>
                        <div class="form-error" id="description-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="prompt-content">Prompt Content *</label>
                        <textarea id="prompt-content" class="form-textarea" style="min-height: 150px;" placeholder="Write your prompt here. Use [PLACEHOLDER] for variables that users should replace" required></textarea>
                        <div class="form-error" id="content-error"></div>
                        <small style="color: #718096;">Use square brackets for variables like [COMPANY_NAME] or [TOPIC]</small>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="prompt-category">Category *</label>
                            <select id="prompt-category" class="form-select" required>
                                <option value="">Select a category</option>
                                ${this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                            </select>
                            <div class="form-error" id="category-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="prompt-difficulty">Difficulty *</label>
                            <select id="prompt-difficulty" class="form-select" required>
                                <option value="">Select difficulty</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                            <div class="form-error" id="difficulty-error"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="prompt-usecase">Use Case *</label>
                            <input type="text" id="prompt-usecase" class="form-input" placeholder="e.g., Email marketing, Code review, Content creation" required>
                            <div class="form-error" id="usecase-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="prompt-industry">Industry</label>
                            <input type="text" id="prompt-industry" class="form-input" placeholder="e.g., Marketing, Healthcare, Technology">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="prompt-tags">Tags</label>
                            <input type="text" id="prompt-tags" class="form-input" placeholder="email, marketing, automation (comma-separated)">
                        </div>
                        
                        <div class="form-group">
                            <label for="prompt-aitools">AI Tools</label>
                            <input type="text" id="prompt-aitools" class="form-input" placeholder="ChatGPT, Claude, Universal (comma-separated)">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="author-name">Your Name (Optional)</label>
                        <input type="text" id="author-name" class="form-input" placeholder="How should we credit you?">
                    </div>
                    
                    <div class="form-group" style="text-align: center;">
                        <button type="submit" class="btn-primary" style="padding: 1rem 2rem; font-size: 1.1rem;">Submit Prompt for Review</button>
                        <div class="form-success" id="form-success" style="display: none; margin-top: 1rem;"></div>
                        <div class="form-error" id="form-error" style="display: none; margin-top: 1rem;"></div>
                    </div>
                </form>
                
                <div style="margin-top: 2rem; padding: 1.5rem; background: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea;">
                    <h4 style="color: #2d3748; margin-bottom: 1rem;">Guidelines for Contributions</h4>
                    <ul style="color: #4a5568; line-height: 1.6;">
                        <li>Make your prompts clear and actionable</li>
                        <li>Include helpful context and examples when possible</li>
                        <li>Use descriptive variable names like [COMPANY_NAME] instead of [X]</li>
                        <li>Test your prompts before submitting</li>
                        <li>Be respectful and professional</li>
                        <li>All submissions are reviewed before being published</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    // Setup contribution form handlers
    setupContributionForm() {
        const form = document.getElementById('contribution-form');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContributionSubmit();
        });
    }
    
    // Handle contribution form submission
    handleContributionSubmit() {
        if (!window.contributionSystem) {
            console.error('Contribution system not available');
            return;
        }
        
        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        document.getElementById('form-success').style.display = 'none';
        document.getElementById('form-error').style.display = 'none';
        
        // Get contributor name from auth system if available
        let authorName = document.getElementById('author-name').value;
        if (window.authSystem && window.authSystem.isLoggedIn()) {
            const user = window.authSystem.getCurrentUser();
            authorName = authorName || user.name || user.email || 'Anonymous Contributor';
        }
        
        // Collect form data
        const formData = {
            title: document.getElementById('prompt-title').value,
            description: document.getElementById('prompt-description').value,
            content: document.getElementById('prompt-content').value,
            category: document.getElementById('prompt-category').value,
            difficulty: document.getElementById('prompt-difficulty').value,
            useCase: document.getElementById('prompt-usecase').value,
            industry: document.getElementById('prompt-industry').value,
            tags: document.getElementById('prompt-tags').value,
            aiTools: document.getElementById('prompt-aitools').value || 'Universal',
            authorName: authorName,
            submitterId: window.authSystem ? window.authSystem.getCurrentUser()?.id : null
        };
        
        // Submit the contribution
        const result = window.contributionSystem.submitPrompt(formData);
        
        if (result.success) {
            // Show success message
            const successEl = document.getElementById('form-success');
            successEl.textContent = result.message;
            successEl.style.display = 'block';
            
            // Reset form
            document.getElementById('contribution-form').reset();
            
            // Auto-approve for demo purposes (in real app, this would be manual)
            setTimeout(() => {
                if (window.contributionSystem) {
                    window.contributionSystem.approveContribution(result.contribution.id, 'Auto-approved for demo');
                    // Reload prompts to show the new contribution
                    this.loadData().then(() => {
                        console.log('New contribution added to library!');
                    });
                }
            }, 2000);
            
        } else {
            // Show errors
            if (result.errors && result.errors.length > 0) {
                result.errors.forEach(error => {
                    if (error.includes('Title')) {
                        this.showFieldError('title-error', error);
                    } else if (error.includes('Description')) {
                        this.showFieldError('description-error', error);
                    } else if (error.includes('content')) {
                        this.showFieldError('content-error', error);
                    } else if (error.includes('category')) {
                        this.showFieldError('category-error', error);
                    } else if (error.includes('difficulty')) {
                        this.showFieldError('difficulty-error', error);
                    } else if (error.includes('Use case')) {
                        this.showFieldError('usecase-error', error);
                    } else {
                        const generalError = document.getElementById('form-error');
                        generalError.textContent = error;
                        generalError.style.display = 'block';
                    }
                });
            } else {
                const generalError = document.getElementById('form-error');
                generalError.textContent = result.message || 'An error occurred';
                generalError.style.display = 'block';
            }
        }
    }
    
    // Show field-specific error
    showFieldError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize the application when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PromptLibraryApp();
});

// Make app globally accessible for onclick handlers
window.app = app;