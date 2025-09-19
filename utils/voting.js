// Voting System for Prompt Library
class VotingSystem {
    constructor() {
        this.storageKey = 'promptLibraryVotes';
        this.userVotes = this.loadUserVotes();
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

    // Load user's voting history from localStorage
    loadUserVotes() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading user votes:', error);
            return {};
        }
    }

    // Save user's voting history to localStorage
    saveUserVotes() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.userVotes));
            return true;
        } catch (error) {
            console.error('Error saving user votes:', error);
            return false;
        }
    }

    // Get user's vote for a specific prompt
    getUserVote(promptId) {
        return this.userVotes[promptId] || null; // Returns 'up', 'down', or null
    }

    // Cast or change a vote
    vote(promptId, voteType, prompts) {
        if (!promptId || !['up', 'down'].includes(voteType)) {
            return { success: false, error: 'Invalid vote type' };
        }

        const prompt = prompts.find(p => p.id === promptId);
        if (!prompt) {
            return { success: false, error: 'Prompt not found' };
        }

        // Initialize votes if not present
        if (!prompt.votes) {
            prompt.votes = { upvotes: 0, downvotes: 0, score: 0 };
        }

        const currentVote = this.getUserVote(promptId);
        let voteChanged = false;

        // Handle vote logic
        if (currentVote === voteType) {
            // User is removing their vote
            if (voteType === 'up') {
                prompt.votes.upvotes = Math.max(0, prompt.votes.upvotes - 1);
            } else {
                prompt.votes.downvotes = Math.max(0, prompt.votes.downvotes - 1);
            }
            delete this.userVotes[promptId];
            voteChanged = true;
        } else {
            // User is changing their vote or voting for the first time
            if (currentVote) {
                // Remove previous vote
                if (currentVote === 'up') {
                    prompt.votes.upvotes = Math.max(0, prompt.votes.upvotes - 1);
                } else {
                    prompt.votes.downvotes = Math.max(0, prompt.votes.downvotes - 1);
                }
            }
            
            // Add new vote
            if (voteType === 'up') {
                prompt.votes.upvotes += 1;
            } else {
                prompt.votes.downvotes += 1;
            }
            
            this.userVotes[promptId] = voteType;
            voteChanged = true;
        }

        if (voteChanged) {
            // Update score
            prompt.votes.score = prompt.votes.upvotes - prompt.votes.downvotes;
            
            // Save user votes
            this.saveUserVotes();
            
            // Save updated prompts (in a real app, this would go to a server)
            this.savePromptsToStorage(prompts);

            return {
                success: true,
                newVote: this.getUserVote(promptId),
                votes: prompt.votes,
                message: currentVote === voteType ? 'Vote removed' : 'Vote recorded'
            };
        }

        return { success: false, error: 'No changes made' };
    }

    // Upvote a prompt
    upvote(promptId, prompts) {
        return this.vote(promptId, 'up', prompts);
    }

    // Downvote a prompt
    downvote(promptId, prompts) {
        return this.vote(promptId, 'down', prompts);
    }

    // Get vote statistics for a prompt
    getVoteStats(promptId, prompts) {
        const prompt = prompts.find(p => p.id === promptId);
        if (!prompt || !prompt.votes) {
            return { upvotes: 0, downvotes: 0, score: 0, userVote: null };
        }

        return {
            upvotes: prompt.votes.upvotes,
            downvotes: prompt.votes.downvotes,
            score: prompt.votes.score,
            userVote: this.getUserVote(promptId)
        };
    }

    // Sort prompts by vote score
    sortByVotes(prompts, direction = 'desc') {
        return [...prompts].sort((a, b) => {
            const scoreA = a.votes?.score || 0;
            const scoreB = b.votes?.score || 0;
            
            if (direction === 'desc') {
                return scoreB - scoreA;
            } else {
                return scoreA - scoreB;
            }
        });
    }

    // Get trending prompts (high vote velocity)
    getTrending(prompts, days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return prompts
            .filter(prompt => {
                const createdAt = new Date(prompt.createdAt);
                return createdAt >= cutoffDate;
            })
            .sort((a, b) => {
                // Calculate vote velocity (votes per day)
                const daysOldA = Math.max(1, (Date.now() - new Date(a.createdAt)) / (1000 * 60 * 60 * 24));
                const daysOldB = Math.max(1, (Date.now() - new Date(b.createdAt)) / (1000 * 60 * 60 * 24));
                
                const velocityA = (a.votes?.score || 0) / daysOldA;
                const velocityB = (b.votes?.score || 0) / daysOldB;
                
                return velocityB - velocityA;
            });
    }

    // Get top prompts by category
    getTopByCategory(prompts, category, limit = 10) {
        return prompts
            .filter(prompt => prompt.category === category)
            .sort((a, b) => (b.votes?.score || 0) - (a.votes?.score || 0))
            .slice(0, limit);
    }

    // Calculate vote percentage
    getVotePercentage(prompt) {
        if (!prompt.votes || (prompt.votes.upvotes + prompt.votes.downvotes) === 0) {
            return { upvote: 0, downvote: 0 };
        }

        const total = prompt.votes.upvotes + prompt.votes.downvotes;
        return {
            upvote: Math.round((prompt.votes.upvotes / total) * 100),
            downvote: Math.round((prompt.votes.downvotes / total) * 100)
        };
    }

    // Save prompts to localStorage (simulates database)
    savePromptsToStorage(prompts) {
        try {
            localStorage.setItem('promptLibraryData', JSON.stringify(prompts));
            return true;
        } catch (error) {
            console.error('Error saving prompts:', error);
            return false;
        }
    }

    // Load prompts from localStorage
    loadPromptsFromStorage() {
        try {
            const saved = localStorage.getItem('promptLibraryData');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error loading prompts:', error);
            return null;
        }
    }

    // Get vote summary for all prompts
    getVoteSummary(prompts) {
        const summary = {
            totalVotes: 0,
            totalUpvotes: 0,
            totalDownvotes: 0,
            averageScore: 0,
            topPrompt: null,
            controversialPrompt: null
        };

        let maxScore = -Infinity;
        let maxControversy = 0;

        prompts.forEach(prompt => {
            if (prompt.votes) {
                summary.totalUpvotes += prompt.votes.upvotes;
                summary.totalDownvotes += prompt.votes.downvotes;
                
                if (prompt.votes.score > maxScore) {
                    maxScore = prompt.votes.score;
                    summary.topPrompt = prompt;
                }

                // Controversy = high total votes but low score difference
                const totalVotes = prompt.votes.upvotes + prompt.votes.downvotes;
                const controversy = totalVotes > 0 ? totalVotes / Math.abs(prompt.votes.score + 1) : 0;
                
                if (controversy > maxControversy) {
                    maxControversy = controversy;
                    summary.controversialPrompt = prompt;
                }
            }
        });

        summary.totalVotes = summary.totalUpvotes + summary.totalDownvotes;
        summary.averageScore = prompts.length > 0 ? 
            prompts.reduce((sum, p) => sum + (p.votes?.score || 0), 0) / prompts.length : 0;

        return summary;
    }

    // Export user voting data
    exportUserVotes() {
        return {
            userId: this.userId,
            votes: this.userVotes,
            totalVotes: Object.keys(this.userVotes).length,
            exportDate: new Date().toISOString()
        };
    }

    // Clear all user votes (for testing or reset)
    clearUserVotes() {
        this.userVotes = {};
        localStorage.removeItem(this.storageKey);
        return true;
    }
}

// Create global instance
window.votingSystem = new VotingSystem();