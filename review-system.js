// Review System with redeemable points
class ReviewSystem {
    constructor() {
        this.reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        this.userPoints = parseInt(localStorage.getItem('userPoints')) || 0;
    }

    submitReview(reviewText, rating) {
        // Calculate points based on review quality (length + rating)
        const lengthPoints = Math.min(Math.floor(reviewText.length / 10), 500); // Up to 500 points for length
        const ratingPoints = rating * 200; // 200-1000 points based on rating (1-5 stars)
        const points = Math.min(lengthPoints + ratingPoints, 1000); // Cap at 1000 points per review
        
        // Bonus for detailed, high-rated reviews
        if (reviewText.length > 200 && rating >= 4) {
            return 1000; // Max points for quality reviews
        }
        
        const review = {
            id: Date.now(),
            text: reviewText,
            rating: rating,
            points: points,
            date: new Date().toISOString()
        };
        
        this.reviews.push(review);
        this.userPoints += points;
        
        localStorage.setItem('reviews', JSON.stringify(this.reviews));
        localStorage.setItem('userPoints', this.userPoints);
        
        return points;
    }

    getAverageRating() {
        if (this.reviews.length === 0) return 0;
        return (this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length).toFixed(1);
    }

    redeemPoints(points) {
        if (this.userPoints >= points) {
            this.userPoints -= points;
            localStorage.setItem('userPoints', this.userPoints);
            return true;
        }
        return false;
    }
}

const reviewSystem = new ReviewSystem();

// Initialize review UI
function initReviewSystem() {
    // Update points display
    const pointsDisplay = document.getElementById('userPoints');
    if (pointsDisplay) {
        pointsDisplay.textContent = reviewSystem.userPoints;
    }

    // Handle review submission
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const reviewText = document.getElementById('reviewText').value;
            const rating = parseInt(document.getElementById('rating').value);
            
            const pointsEarned = reviewSystem.submitReview(reviewText, rating);
            alert(`Thanks for your review! You earned ${pointsEarned} points.`);
            reviewForm.reset();
            
            // Update UI
            if (pointsDisplay) {
                pointsDisplay.textContent = reviewSystem.userPoints;
            }
        });
    }

    // Handle point redemption
    const redeemButtons = document.querySelectorAll('.redeem-points');
    redeemButtons.forEach(button => {
        button.addEventListener('click', () => {
            const pointsRequired = parseInt(button.dataset.points);
            if (reviewSystem.redeemPoints(pointsRequired)) {
                alert(`Success! ${pointsRequired} points redeemed.`);
                if (pointsDisplay) {
                    pointsDisplay.textContent = reviewSystem.userPoints;
                }
            } else {
                alert('Not enough points to redeem this offer.');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initReviewSystem);