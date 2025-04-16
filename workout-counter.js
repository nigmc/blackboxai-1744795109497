// Track workouts completed
let workoutCount = parseInt(localStorage.getItem('workoutCount')) || 0;

function incrementWorkout() {
    workoutCount++;
    localStorage.setItem('workoutCount', workoutCount);
    
    if (workoutCount >= 5) {
        // Show premium offer
        document.getElementById('premiumOffer').classList.remove('hidden');
        document.getElementById('premiumOffer').classList.add('block');
    }
    return workoutCount;
}

// Check on page load
document.addEventListener('DOMContentLoaded', () => {
    if (workoutCount >= 5) {
        document.getElementById('premiumOffer').classList.remove('hidden');
        document.getElementById('premiumOffer').classList.add('block');
    }
    
    // Update workout counter display
    const counterElement = document.getElementById('workoutCounter');
    if (counterElement) {
        counterElement.textContent = `${workoutCount}/5 workouts completed`;
    }
});

// Currency conversion with low fees (0.5%)
function convertCurrency(amount, fromCurrency, toCurrency) {
    const rates = {
        USD: { EUR: 0.85, GBP: 0.73, CAD: 1.25, AUD: 1.32 },
        EUR: { USD: 1.18, GBP: 0.86, CAD: 1.47, AUD: 1.55 },
        GBP: { USD: 1.37, EUR: 1.16, CAD: 1.71, AUD: 1.80 },
        CAD: { USD: 0.80, EUR: 0.68, GBP: 0.58, AUD: 1.05 },
        AUD: { USD: 0.76, EUR: 0.65, GBP: 0.56, CAD: 0.95 }
    };
    
    if (fromCurrency === toCurrency) return amount;
    
    const rate = rates[fromCurrency]?.[toCurrency] || 1;
    const converted = amount * rate;
    const fee = converted * 0.005; // 0.5% fee
    
    return {
        amount: converted - fee,
        fee: fee,
        rate: rate
    };
}