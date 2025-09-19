// Modal Component Utilities
class ModalComponent {
    constructor() {
        this.isOpen = false;
        this.currentPrompt = null;
        this.copyTimeout = null;
    }

    // Open modal with prompt details
    open(prompt, categories) {
        if (this.isOpen) return;
        
        this.currentPrompt = prompt;
        this.isOpen = true;
        
        const modal = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        if (!modal || !title || !content) return;
        
        title.textContent = prompt.title;
        content.innerHTML = this.createContent(prompt, categories);
        
        // Update favorite button
        this.updateFavoriteButton();
        
        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add to usage history if storage is available
        if (window.storage) {
            window.storage.recordUsage(prompt.id);
        }
        
        // Focus trap for accessibility
        this.setupFocusTrap(modal);
    }

    // Close modal
    close() {
        if (!this.isOpen) return;
        
        const modal = document.getElementById('modal-overlay');
        if (modal) {
            modal.style.display = 'none';
        }
        
        document.body.style.overflow = 'auto';
        this.isOpen = false;
        this.currentPrompt = null;
        
        // Clear any active timeouts
        if (this.copyTimeout) {
            clearTimeout(this.copyTimeout);
            this.copyTimeout = null;
        }
    }

    // Create modal content
    createContent(prompt, categories) {
        const category = categories.find(c => c.id === prompt.category);
        const categoryName = category ? category.name : prompt.category;
        
        return `
            <div class="modal-section">
                <h4>Description</h4>
                <p>${this.escapeHtml(prompt.description)}</p>
            </div>
            
            <div class="modal-section">
                <h4>Prompt Content</h4>
                <div class="prompt-content-display">
                    <pre>${this.escapeHtml(prompt.content)}</pre>
                </div>
            </div>

            ${prompt.variables && prompt.variables.length > 0 ? `
                <div class="modal-section">
                    <h4>Variables to Replace</h4>
                    <div class="variables-list">
                        ${prompt.variables.map(v => `
                            <div class="variable-item">
                                <strong class="variable-placeholder">${this.escapeHtml(v.placeholder)}</strong>
                                <span class="variable-description">${this.escapeHtml(v.description)}</span>
                                ${v.example ? `<span class="variable-example">Example: "${this.escapeHtml(v.example)}"</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="modal-section">
                <h4>Details</h4>
                <div class="details-grid">
                    <div class="detail-item">
                        <strong>Category:</strong> ${this.escapeHtml(categoryName)}
                    </div>
                    <div class="detail-item">
                        <strong>Difficulty:</strong> 
                        <span class="difficulty-badge ${prompt.difficulty.toLowerCase()}">${prompt.difficulty}</span>
                    </div>
                    <div class="detail-item">
                        <strong>AI Tools:</strong> ${prompt.aiTools.map(tool => this.escapeHtml(tool)).join(', ')}
                    </div>
                    <div class="detail-item">
                        <strong>Industries:</strong> ${prompt.industry.map(ind => this.escapeHtml(ind)).join(', ')}
                    </div>
                    ${prompt.rating ? `
                        <div class="detail-item">
                            <strong>Rating:</strong> 
                            <span class="rating-display">
                                ${this.renderStars(prompt.rating.average)} 
                                ${prompt.rating.average}/5 (${prompt.rating.count} reviews)
                            </span>
                        </div>
                    ` : ''}
                    ${prompt.usage ? `
                        <div class="detail-item">
                            <strong>Usage:</strong> Used ${prompt.usage.count} times
                        </div>
                    ` : ''}
                </div>
            </div>

            <div class="modal-section">
                <h4>Tags</h4>
                <div class="tags-display">
                    ${prompt.tags.map(tag => `<span class="tag-chip">${this.escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>

            ${prompt.author ? `
                <div class="modal-section">
                    <h4>Author</h4>
                    <div class="author-info">
                        <span class="author-name">${this.escapeHtml(prompt.author.name)}</span>
                        ${prompt.author.company ? `<span class="author-company">@ ${this.escapeHtml(prompt.author.company)}</span>` : ''}
                    </div>
                </div>
            ` : ''}
        `;
    }

    // Update favorite button state
    updateFavoriteButton() {
        if (!this.currentPrompt) return;
        
        const favoriteBtn = document.getElementById('modal-favorite');
        const heart = favoriteBtn?.querySelector('.heart');
        
        if (!favoriteBtn || !heart) return;
        
        const isFavorite = window.storage ? window.storage.isFavorite(this.currentPrompt.id) : false;
        
        heart.textContent = isFavorite ? '♥' : '♡';
        favoriteBtn.innerHTML = `<span class="heart">${heart.textContent}</span> ${isFavorite ? 'Remove from' : 'Add to'} Favorites`;
        
        favoriteBtn.classList.toggle('active', isFavorite);
    }

    // Copy prompt to clipboard
    async copyPrompt() {
        if (!this.currentPrompt) return false;
        
        try {
            await navigator.clipboard.writeText(this.currentPrompt.content);
            this.showCopySuccess();
            return true;
        } catch (error) {
            console.error('Failed to copy prompt:', error);
            this.showCopyError();
            return false;
        }
    }

    // Show copy success feedback
    showCopySuccess() {
        const copyBtn = document.getElementById('modal-copy');
        if (!copyBtn) return;
        
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '✅ Copied!';
        copyBtn.disabled = true;
        
        this.copyTimeout = setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.disabled = false;
        }, 2000);
    }

    // Show copy error feedback
    showCopyError() {
        const copyBtn = document.getElementById('modal-copy');
        if (!copyBtn) return;
        
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '❌ Copy Failed';
        copyBtn.disabled = true;
        
        this.copyTimeout = setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.disabled = false;
        }, 2000);
    }

    // Toggle favorite status
    toggleFavorite() {
        if (!this.currentPrompt || !window.storage) return;
        
        const isFavorite = window.storage.isFavorite(this.currentPrompt.id);
        
        if (isFavorite) {
            window.storage.removeFavorite(this.currentPrompt.id);
        } else {
            window.storage.addFavorite(this.currentPrompt.id);
        }
        
        this.updateFavoriteButton();
        
        // Update the main app if available
        if (window.app) {
            window.app.favorites = window.storage.getFavorites();
            
            // Re-render prompts if in favorites view
            if (window.app.currentView === 'favorites') {
                window.app.showFavoritesView();
            } else {
                window.app.renderPrompts();
            }
        }
    }

    // Render star rating
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '★'.repeat(fullStars);
        
        if (hasHalfStar) stars += '☆';
        
        const remainingStars = 5 - Math.ceil(rating);
        stars += '☆'.repeat(Math.max(0, remainingStars));
        
        return `<span class="stars">${stars}</span>`;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Setup focus trap for accessibility
    setupFocusTrap(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        };
        
        modal.addEventListener('keydown', handleTabKey);
        
        // Remove event listener when modal closes
        const originalClose = this.close.bind(this);
        this.close = () => {
            modal.removeEventListener('keydown', handleTabKey);
            originalClose();
        };
    }

    // Add custom styles for modal content
    addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .modal-section {
                margin-bottom: 2rem;
            }
            
            .modal-section h4 {
                color: #2d3748;
                margin-bottom: 1rem;
                font-size: 1.1rem;
                font-weight: 600;
            }
            
            .prompt-content-display {
                background: #f8f9fa;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                border-left: 4px solid #667eea;
                padding: 1rem;
                font-family: 'Courier New', monospace;
                white-space: pre-wrap;
                word-wrap: break-word;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .variables-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .variable-item {
                background: #f7fafc;
                padding: 1rem;
                border-radius: 6px;
                border-left: 3px solid #667eea;
            }
            
            .variable-placeholder {
                display: block;
                color: #667eea;
                font-family: monospace;
                margin-bottom: 0.25rem;
            }
            
            .variable-description {
                display: block;
                color: #4a5568;
            }
            
            .variable-example {
                display: block;
                color: #718096;
                font-style: italic;
                font-size: 0.9rem;
                margin-top: 0.25rem;
            }
            
            .details-grid {
                display: grid;
                gap: 0.75rem;
                grid-template-columns: 1fr;
            }
            
            .detail-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .detail-item strong {
                min-width: 100px;
                color: #4a5568;
            }
            
            .difficulty-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.85rem;
                font-weight: 500;
            }
            
            .difficulty-badge.beginner {
                background: #48bb78;
                color: white;
            }
            
            .difficulty-badge.intermediate {
                background: #ed8936;
                color: white;
            }
            
            .difficulty-badge.advanced {
                background: #e53e3e;
                color: white;
            }
            
            .rating-display .stars {
                color: #ffd700;
                margin-right: 0.5rem;
            }
            
            .tags-display {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            
            .tag-chip {
                background: #e2e8f0;
                color: #4a5568;
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.85rem;
            }
            
            .author-info {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .author-name {
                font-weight: 600;
                color: #2d3748;
            }
            
            .author-company {
                color: #718096;
            }
            
            @media (max-width: 768px) {
                .modal-section {
                    margin-bottom: 1.5rem;
                }
                
                .prompt-content-display {
                    font-size: 0.85rem;
                }
                
                .details-grid {
                    grid-template-columns: 1fr;
                }
                
                .detail-item {
                    flex-direction: column;
                    align-items: flex-start;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialize modal styles
document.addEventListener('DOMContentLoaded', () => {
    const modal = new ModalComponent();
    modal.addCustomStyles();
});

// Create global instance
window.modalComponent = new ModalComponent();