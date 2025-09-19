// Prompt Card Component Utilities
class PromptCardComponent {
    constructor() {
        this.favoriteAnimation = null;
    }

    // Create a prompt card element
    createElement(prompt, categories, isFavorite = false) {
        const category = categories.find(c => c.id === prompt.category);
        const categoryName = category ? category.name : prompt.category;
        
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.dataset.promptId = prompt.id;
        card.onclick = () => app.openPromptModal(prompt.id);
        
        card.innerHTML = `
            <div class="prompt-header">
                <div>
                    <div class="prompt-title">${this.escapeHtml(prompt.title)}</div>
                    ${prompt.rating ? `
                        <div class="prompt-rating">
                            <span class="stars">${this.renderStars(prompt.rating.average)}</span>
                            <span>(${prompt.rating.count})</span>
                        </div>
                    ` : ''}
                </div>
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                        onclick="event.stopPropagation(); app.toggleFavorite('${prompt.id}')">
                    ${isFavorite ? '♥' : '♡'}
                </button>
            </div>
            
            <div class="prompt-description">${this.escapeHtml(prompt.description)}</div>
            
            <div class="prompt-meta">
                <span class="meta-tag category-tag">${this.escapeHtml(categoryName)}</span>
                <span class="meta-tag difficulty-tag ${prompt.difficulty.toLowerCase()}">${prompt.difficulty}</span>
                ${prompt.aiTools.map(tool => `<span class="meta-tag">${this.escapeHtml(tool)}</span>`).join('')}
            </div>
            
            <div class="prompt-actions">
                ${prompt.usage ? `<span class="usage-count">Used ${prompt.usage.count} times</span>` : ''}
            </div>
        `;
        
        return card;
    }

    // Render star rating
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '★'.repeat(fullStars);
        
        if (hasHalfStar) stars += '☆';
        
        const remainingStars = 5 - Math.ceil(rating);
        stars += '☆'.repeat(Math.max(0, remainingStars));
        
        return stars;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Animate favorite button
    animateFavorite(promptId, isFavorite) {
        const card = document.querySelector(`[data-prompt-id="${promptId}"]`);
        if (!card) return;
        
        const favoriteBtn = card.querySelector('.favorite-btn');
        if (!favoriteBtn) return;
        
        // Update button state
        favoriteBtn.classList.toggle('active', isFavorite);
        favoriteBtn.innerHTML = isFavorite ? '♥' : '♡';
        
        // Add animation
        favoriteBtn.style.transform = 'scale(1.3)';
        favoriteBtn.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            favoriteBtn.style.transform = 'scale(1)';
        }, 200);
    }

    // Update usage count
    updateUsageCount(promptId, newCount) {
        const card = document.querySelector(`[data-prompt-id="${promptId}"]`);
        if (!card) return;
        
        const usageElement = card.querySelector('.usage-count');
        if (usageElement) {
            usageElement.textContent = `Used ${newCount} times`;
        }
    }

    // Highlight search terms in card
    highlightSearchTerms(card, searchTerm) {
        if (!searchTerm) return;
        
        const title = card.querySelector('.prompt-title');
        const description = card.querySelector('.prompt-description');
        
        if (title && window.searchUtils) {
            title.innerHTML = window.searchUtils.highlightSearchTerms(title.textContent, searchTerm);
        }
        
        if (description && window.searchUtils) {
            description.innerHTML = window.searchUtils.highlightSearchTerms(description.textContent, searchTerm);
        }
    }

    // Add hover effects
    addHoverEffects(card) {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-3px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    }

    // Create category card
    createCategoryCard(category, promptCount) {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.style.setProperty('--category-color', category.color);
        card.onclick = () => app.filterByCategory(category.id);
        
        card.innerHTML = `
            <div class="category-header">
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${this.escapeHtml(category.name)}</div>
            </div>
            <div class="category-description">${this.escapeHtml(category.description)}</div>
            <div class="category-count">${promptCount} prompts available</div>
        `;
        
        return card;
    }

    // Create loading skeleton
    createLoadingSkeleton() {
        const skeleton = document.createElement('div');
        skeleton.className = 'prompt-card loading-skeleton';
        skeleton.innerHTML = `
            <div class="skeleton-header">
                <div class="skeleton-title"></div>
                <div class="skeleton-rating"></div>
            </div>
            <div class="skeleton-description"></div>
            <div class="skeleton-meta">
                <div class="skeleton-tag"></div>
                <div class="skeleton-tag"></div>
                <div class="skeleton-tag"></div>
            </div>
        `;
        return skeleton;
    }
}

// Create global instance
window.promptCard = new PromptCardComponent();