// Community Contribution System for Prompt Library
class ContributionSystem {
    constructor() {
        this.storageKey = 'promptLibraryContributions';
        this.contributions = this.loadContributions();
        this.generateUserId();
    }

    // Generate or retrieve anonymous user ID
    generateUserId() {
        let userId = localStorage.getItem('promptLibraryUserId');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
            localStorage.setItem('promptLibraryUserId', userId);
        }
        this.userId = userId;
        return userId;
    }

    // Load contributions from localStorage
    loadContributions() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading contributions:', error);
            return [];
        }
    }

    // Save contributions to localStorage
    saveContributions() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.contributions));
            return true;
        } catch (error) {
            console.error('Error saving contributions:', error);
            return false;
        }
    }

    // Submit a new prompt contribution
    submitPrompt(promptData) {
        const errors = this.validatePrompt(promptData);
        if (errors.length > 0) {
            return {
                success: false,
                errors: errors,
                message: 'Please fix the validation errors'
            };
        }

        // Generate unique ID for the contribution
        const contributionId = 'contrib_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

        // Create the contribution object
        const contribution = {
            id: contributionId,
            title: promptData.title.trim(),
            description: promptData.description.trim(),
            content: promptData.content.trim(),
            category: promptData.category,
            subcategory: promptData.subcategory || '',
            industry: Array.isArray(promptData.industry) ? promptData.industry : [promptData.industry].filter(Boolean),
            tags: Array.isArray(promptData.tags) ? promptData.tags : promptData.tags.split(',').map(t => t.trim()).filter(Boolean),
            variables: this.parseVariables(promptData.content),
            aiTools: Array.isArray(promptData.aiTools) ? promptData.aiTools : [promptData.aiTools].filter(Boolean),
            difficulty: promptData.difficulty,
            useCase: promptData.useCase.trim(),
            submittedBy: {
                userId: this.userId,
                name: promptData.authorName || 'Anonymous',
                submittedAt: new Date().toISOString()
            },
            status: 'pending', // pending, approved, rejected
            votes: {
                upvotes: 0,
                downvotes: 0,
                score: 0
            },
            usage: {
                count: 0,
                lastUsed: null
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPublic: false, // Will be true when approved
            isFeatured: false,
            moderationNotes: ''
        };

        // Add to contributions list
        this.contributions.unshift(contribution);
        this.saveContributions();

        return {
            success: true,
            contribution: contribution,
            message: 'Prompt submitted successfully! It will be reviewed before appearing in the library.'
        };
    }

    // Validate prompt data
    validatePrompt(data) {
        const errors = [];

        if (!data.title || data.title.trim().length < 5) {
            errors.push('Title must be at least 5 characters long');
        }

        if (!data.description || data.description.trim().length < 20) {
            errors.push('Description must be at least 20 characters long');
        }

        if (!data.content || data.content.trim().length < 50) {
            errors.push('Prompt content must be at least 50 characters long');
        }

        if (!data.category) {
            errors.push('Please select a category');
        }

        if (!data.difficulty) {
            errors.push('Please select a difficulty level');
        }

        if (!data.aiTools || (Array.isArray(data.aiTools) ? data.aiTools.length === 0 : !data.aiTools)) {
            errors.push('Please select at least one AI tool');
        }

        if (!data.useCase || data.useCase.trim().length < 10) {
            errors.push('Use case description must be at least 10 characters long');
        }

        // Check for inappropriate content (basic filter)
        const inappropriateWords = ['spam', 'hack', 'malware', 'virus'];
        const content = (data.title + ' ' + data.description + ' ' + data.content).toLowerCase();
        
        for (const word of inappropriateWords) {
            if (content.includes(word)) {
                errors.push('Content appears to contain inappropriate material');
                break;
            }
        }

        return errors;
    }

    // Parse variables from prompt content
    parseVariables(content) {
        const variableRegex = /\[([A-Z_]+(?:\/[A-Z_]+)*)\]/g;
        const variables = [];
        const seen = new Set();
        let match;

        while ((match = variableRegex.exec(content)) !== null) {
            const placeholder = match[0];
            const name = match[1];
            
            if (!seen.has(placeholder)) {
                variables.push({
                    name: name.toLowerCase().replace(/\//g, '_'),
                    placeholder: placeholder,
                    description: this.generateVariableDescription(name),
                    example: ''
                });
                seen.add(placeholder);
            }
        }

        return variables;
    }

    // Generate description for variables based on their name
    generateVariableDescription(name) {
        const descriptions = {
            'COMPANY': 'Company or organization name',
            'NAME': 'Person\'s name',
            'FIRST_NAME': 'First name',
            'LAST_NAME': 'Last name',
            'EMAIL': 'Email address',
            'TOPIC': 'Main topic or subject',
            'PRODUCT': 'Product or service name',
            'INDUSTRY': 'Industry or sector',
            'LOCATION': 'Geographic location',
            'DATE': 'Date or time period',
            'BUDGET': 'Budget amount',
            'GOAL': 'Objective or goal',
            'AUDIENCE': 'Target audience',
            'TONE': 'Desired tone or style'
        };

        return descriptions[name.toUpperCase()] || 'Custom variable to be replaced';
    }

    // Get user's contributions
    getUserContributions(userId = null) {
        const targetUserId = userId || this.userId;
        return this.contributions.filter(c => c.submittedBy.userId === targetUserId);
    }

    // Get all contributions by status
    getContributionsByStatus(status = 'pending') {
        return this.contributions.filter(c => c.status === status);
    }

    // Approve a contribution (admin function)
    approveContribution(contributionId, moderatorNotes = '') {
        const contribution = this.contributions.find(c => c.id === contributionId);
        if (!contribution) {
            return { success: false, error: 'Contribution not found' };
        }

        contribution.status = 'approved';
        contribution.isPublic = true;
        contribution.moderationNotes = moderatorNotes;
        contribution.updatedAt = new Date().toISOString();

        this.saveContributions();

        // Add to main prompt library
        this.addToMainLibrary(contribution);

        return {
            success: true,
            contribution: contribution,
            message: 'Contribution approved and added to library'
        };
    }

    // Reject a contribution (admin function)
    rejectContribution(contributionId, reason = '') {
        const contribution = this.contributions.find(c => c.id === contributionId);
        if (!contribution) {
            return { success: false, error: 'Contribution not found' };
        }

        contribution.status = 'rejected';
        contribution.moderationNotes = reason;
        contribution.updatedAt = new Date().toISOString();

        this.saveContributions();

        return {
            success: true,
            contribution: contribution,
            message: 'Contribution rejected'
        };
    }

    // Add approved contribution to main library
    addToMainLibrary(contribution) {
        try {
            // Load existing prompts
            let prompts = [];
            try {
                const saved = localStorage.getItem('promptLibraryData');
                if (saved) {
                    prompts = JSON.parse(saved);
                }
            } catch (error) {
                console.log('No existing prompt data, starting fresh');
            }

            // Convert contribution to prompt format
            const prompt = {
                id: contribution.id,
                title: contribution.title,
                description: contribution.description,
                content: contribution.content,
                category: contribution.category,
                subcategory: contribution.subcategory,
                industry: contribution.industry,
                tags: contribution.tags,
                variables: contribution.variables,
                aiTools: contribution.aiTools,
                difficulty: contribution.difficulty,
                useCase: contribution.useCase,
                author: {
                    name: contribution.submittedBy.name,
                    company: 'Community Contributor'
                },
                votes: contribution.votes,
                usage: contribution.usage,
                createdAt: contribution.createdAt,
                updatedAt: contribution.updatedAt,
                isPublic: true,
                isFeatured: false,
                submittedBy: contribution.submittedBy,
                status: 'approved'
            };

            // Add to prompts array
            prompts.push(prompt);

            // Save back to storage
            localStorage.setItem('promptLibraryData', JSON.stringify(prompts));

            return true;
        } catch (error) {
            console.error('Error adding to main library:', error);
            return false;
        }
    }

    // Get contribution statistics
    getStats() {
        const stats = {
            total: this.contributions.length,
            pending: 0,
            approved: 0,
            rejected: 0,
            byCategory: {},
            byUser: {},
            recentSubmissions: []
        };

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7);

        this.contributions.forEach(contrib => {
            // Status counts
            stats[contrib.status]++;

            // Category counts
            if (!stats.byCategory[contrib.category]) {
                stats.byCategory[contrib.category] = 0;
            }
            stats.byCategory[contrib.category]++;

            // User counts
            const userId = contrib.submittedBy.userId;
            if (!stats.byUser[userId]) {
                stats.byUser[userId] = 0;
            }
            stats.byUser[userId]++;

            // Recent submissions
            const submittedAt = new Date(contrib.submittedBy.submittedAt);
            if (submittedAt >= cutoffDate) {
                stats.recentSubmissions.push(contrib);
            }
        });

        return stats;
    }

    // Search contributions
    searchContributions(query, filters = {}) {
        let results = [...this.contributions];

        // Text search
        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(contrib =>
                contrib.title.toLowerCase().includes(searchTerm) ||
                contrib.description.toLowerCase().includes(searchTerm) ||
                contrib.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Status filter
        if (filters.status) {
            results = results.filter(contrib => contrib.status === filters.status);
        }

        // Category filter
        if (filters.category) {
            results = results.filter(contrib => contrib.category === filters.category);
        }

        // User filter
        if (filters.userId) {
            results = results.filter(contrib => contrib.submittedBy.userId === filters.userId);
        }

        return results;
    }

    // Delete a contribution (only if pending or by the author)
    deleteContribution(contributionId) {
        const contrib = this.contributions.find(c => c.id === contributionId);
        if (!contrib) {
            return { success: false, error: 'Contribution not found' };
        }

        // Only allow deletion of pending contributions or by the author
        if (contrib.status !== 'pending' && contrib.submittedBy.userId !== this.userId) {
            return { success: false, error: 'Cannot delete this contribution' };
        }

        this.contributions = this.contributions.filter(c => c.id !== contributionId);
        this.saveContributions();

        return {
            success: true,
            message: 'Contribution deleted successfully'
        };
    }

    // Export contributions data
    exportContributions() {
        return {
            contributions: this.contributions,
            stats: this.getStats(),
            exportDate: new Date().toISOString(),
            userId: this.userId
        };
    }

    // Clear all contributions (admin function)
    clearAllContributions() {
        this.contributions = [];
        localStorage.removeItem(this.storageKey);
        return true;
    }
}

// Create global instance
window.contributionSystem = new ContributionSystem();