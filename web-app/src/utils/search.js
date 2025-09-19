// Search utilities and helpers for the Prompt Library
class SearchUtilities {
    constructor() {
        this.stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
        ]);
        
        this.synonyms = {
            'ai': ['artificial intelligence', 'machine learning', 'ml'],
            'email': ['mail', 'message', 'communication'],
            'code': ['programming', 'software', 'development'],
            'sales': ['selling', 'marketing', 'business development'],
            'engineering': ['technical', 'construction', 'building'],
            'write': ['create', 'generate', 'compose'],
            'analyze': ['examine', 'review', 'evaluate'],
            'plan': ['planning', 'strategy', 'organize']
        };
    }

    // Clean and normalize search terms
    cleanSearchTerm(term) {
        return term
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Extract keywords from search term
    extractKeywords(searchTerm) {
        const cleaned = this.cleanSearchTerm(searchTerm);
        const words = cleaned.split(' ');
        
        return words
            .filter(word => word.length > 2 && !this.stopWords.has(word))
            .map(word => {
                // Add synonyms
                const synonymsForWord = this.synonyms[word] || [];
                return [word, ...synonymsForWord];
            })
            .flat();
    }

    // Highlight search terms in text
    highlightSearchTerms(text, searchTerm) {
        if (!searchTerm || !text) return text;
        
        const keywords = this.extractKeywords(searchTerm);
        let highlightedText = text;
        
        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        });
        
        return highlightedText;
    }

    // Calculate search relevance score
    calculateRelevanceScore(prompt, searchTerm) {
        if (!searchTerm) return 0;
        
        const keywords = this.extractKeywords(searchTerm);
        let score = 0;
        
        // Check different fields with different weights
        const fields = {
            title: { weight: 5, text: prompt.title?.toLowerCase() || '' },
            description: { weight: 3, text: prompt.description?.toLowerCase() || '' },
            tags: { weight: 4, text: prompt.tags?.join(' ').toLowerCase() || '' },
            category: { weight: 2, text: prompt.category?.toLowerCase() || '' },
            industry: { weight: 2, text: prompt.industry?.join(' ').toLowerCase() || '' },
            useCase: { weight: 3, text: prompt.useCase?.toLowerCase() || '' },
            content: { weight: 1, text: prompt.content?.toLowerCase() || '' }
        };
        
        keywords.forEach(keyword => {
            Object.values(fields).forEach(field => {
                const occurrences = (field.text.match(new RegExp(keyword, 'g')) || []).length;
                score += occurrences * field.weight;
            });
        });
        
        return score;
    }

    // Advanced search with filters
    performAdvancedSearch(prompts, filters) {
        let results = [...prompts];
        
        // Text search
        if (filters.search) {
            const searchTerm = this.cleanSearchTerm(filters.search);
            results = results.map(prompt => ({
                ...prompt,
                relevanceScore: this.calculateRelevanceScore(prompt, searchTerm)
            }))
            .filter(prompt => prompt.relevanceScore > 0)
            .sort((a, b) => b.relevanceScore - a.relevanceScore);
        }
        
        // Category filter
        if (filters.category) {
            results = results.filter(prompt => prompt.category === filters.category);
        }
        
        // Difficulty filter
        if (filters.difficulty) {
            results = results.filter(prompt => prompt.difficulty === filters.difficulty);
        }
        
        // AI Tool filter
        if (filters.aiTool) {
            results = results.filter(prompt => 
                prompt.aiTools && prompt.aiTools.includes(filters.aiTool)
            );
        }
        
        // Industry filter
        if (filters.industry) {
            results = results.filter(prompt => 
                prompt.industry && prompt.industry.includes(filters.industry)
            );
        }
        
        // Rating filter
        if (filters.minRating) {
            results = results.filter(prompt => 
                prompt.rating && prompt.rating.average >= filters.minRating
            );
        }
        
        // Tags filter
        if (filters.tags && filters.tags.length > 0) {
            results = results.filter(prompt => 
                prompt.tags && filters.tags.some(tag => prompt.tags.includes(tag))
            );
        }
        
        return results;
    }

    // Get search suggestions
    getSearchSuggestions(prompts, partialTerm) {
        if (!partialTerm || partialTerm.length < 2) return [];
        
        const cleanTerm = this.cleanSearchTerm(partialTerm);
        const suggestions = new Set();
        
        // Collect suggestions from various fields
        prompts.forEach(prompt => {
            // From titles
            if (prompt.title && prompt.title.toLowerCase().includes(cleanTerm)) {
                suggestions.add(prompt.title);
            }
            
            // From tags
            if (prompt.tags) {
                prompt.tags.forEach(tag => {
                    if (tag.toLowerCase().includes(cleanTerm)) {
                        suggestions.add(tag);
                    }
                });
            }
            
            // From categories
            if (prompt.category && prompt.category.toLowerCase().includes(cleanTerm)) {
                suggestions.add(prompt.category);
            }
            
            // From use cases
            if (prompt.useCase && prompt.useCase.toLowerCase().includes(cleanTerm)) {
                suggestions.add(prompt.useCase);
            }
        });
        
        return Array.from(suggestions)
            .slice(0, 8)
            .sort((a, b) => a.length - b.length);
    }

    // Get popular search terms
    getPopularSearchTerms(prompts) {
        const termFrequency = new Map();
        
        prompts.forEach(prompt => {
            // Count tags
            if (prompt.tags) {
                prompt.tags.forEach(tag => {
                    termFrequency.set(tag, (termFrequency.get(tag) || 0) + 1);
                });
            }
            
            // Count words in titles
            const titleWords = this.extractKeywords(prompt.title || '');
            titleWords.forEach(word => {
                if (word.length > 3) {
                    termFrequency.set(word, (termFrequency.get(word) || 0) + 1);
                }
            });
        });
        
        return Array.from(termFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([term]) => term);
    }

    // Create search index for faster searching
    createSearchIndex(prompts) {
        const index = new Map();
        
        prompts.forEach((prompt, promptIndex) => {
            const searchableText = [
                prompt.title,
                prompt.description,
                prompt.useCase,
                ...(prompt.tags || []),
                ...(prompt.industry || []),
                prompt.category
            ].join(' ').toLowerCase();
            
            const keywords = this.extractKeywords(searchableText);
            
            keywords.forEach(keyword => {
                if (!index.has(keyword)) {
                    index.set(keyword, new Set());
                }
                index.get(keyword).add(promptIndex);
            });
        });
        
        return index;
    }

    // Search using pre-built index
    searchWithIndex(searchIndex, prompts, searchTerm) {
        if (!searchTerm) return prompts;
        
        const keywords = this.extractKeywords(searchTerm);
        const matchingPromptIndices = new Set();
        
        keywords.forEach(keyword => {
            const indices = searchIndex.get(keyword);
            if (indices) {
                indices.forEach(index => matchingPromptIndices.add(index));
            }
        });
        
        return Array.from(matchingPromptIndices)
            .map(index => prompts[index])
            .filter(prompt => prompt);
    }

    // Filter prompts by multiple criteria
    applyFilters(prompts, filters) {
        return prompts.filter(prompt => {
            // Category filter
            if (filters.categories && filters.categories.length > 0) {
                if (!filters.categories.includes(prompt.category)) return false;
            }
            
            // Difficulty filter
            if (filters.difficulties && filters.difficulties.length > 0) {
                if (!filters.difficulties.includes(prompt.difficulty)) return false;
            }
            
            // AI Tools filter
            if (filters.aiTools && filters.aiTools.length > 0) {
                const hasMatchingTool = filters.aiTools.some(tool => 
                    prompt.aiTools && prompt.aiTools.includes(tool)
                );
                if (!hasMatchingTool) return false;
            }
            
            // Industry filter
            if (filters.industries && filters.industries.length > 0) {
                const hasMatchingIndustry = filters.industries.some(industry => 
                    prompt.industry && prompt.industry.includes(industry)
                );
                if (!hasMatchingIndustry) return false;
            }
            
            // Rating filter
            if (filters.minRating && prompt.rating) {
                if (prompt.rating.average < filters.minRating) return false;
            }
            
            // Usage filter
            if (filters.minUsage && prompt.usage) {
                if (prompt.usage.count < filters.minUsage) return false;
            }
            
            // Featured filter
            if (filters.featuredOnly && !prompt.isFeatured) return false;
            
            return true;
        });
    }
}

// Create global instance
window.searchUtils = new SearchUtilities();