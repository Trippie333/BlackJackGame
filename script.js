// Game variables
let balance = 500;
let currentBet = 50;
let gameActive = false;
let playerHand = [];
let dealerHand = [];
let deck = [];
let playerScore = 0;
let dealerScore = 0;

// Stats variables
let gamesPlayed = 0;
let wins = 0;
let losses = 0;
let maxWin = 0;

// DOM elements
const balanceEl = document.getElementById('balance');
const betAmountEl = document.getElementById('bet-amount');
const winningsEl = document.getElementById('winnings');
const dealerCardsEl = document.getElementById('dealer-cards');
const playerCardsEl = document.getElementById('player-cards');
const dealerScoreEl = document.getElementById('dealer-score');
const playerScoreEl = document.getElementById('player-score');
const messageAreaEl = document.getElementById('message-area');
const dealBtn = document.getElementById('deal-btn');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const resetBtn = document.getElementById('reset-btn');

// Stats elements
const gamesPlayedEl = document.getElementById('games-played');
const winsCountEl = document.getElementById('wins-count');
const lossesCountEl = document.getElementById('losses-count');
const winRateEl = document.getElementById('win-rate');
const maxWinEl = document.getElementById('max-win');

// Betting elements
const betButtons = document.querySelectorAll('.bet-btn');
const customBetInput = document.getElementById('custom-bet');
const decreaseBetBtn = document.getElementById('decrease-bet');
const increaseBetBtn = document.getElementById('increase-bet');
const minBetBtn = document.getElementById('min-bet');
const maxBetBtn = document.getElementById('max-bet');
const doubleBetBtn = document.getElementById('double-bet');

// Card data
const suits = ['heart', 'diamond', 'club', 'spade'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Initialize game
function initGame() {
    updateUI();
    setupEventListeners();
    updateStats();
    showMessage("Place your bet and click DEAL to start", "info");
}

// Setup event listeners
function setupEventListeners() {
    // Game controls
    dealBtn.addEventListener('click', startGame);
    hitBtn.addEventListener('click', playerHit);
    standBtn.addEventListener('click', playerStand);
    resetBtn.addEventListener('click', resetGame);
    
    // Bet buttons
    betButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const betValue = parseInt(this.getAttribute('data-amount'));
            setBet(betValue);
            betButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Custom bet controls
    customBetInput.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (isNaN(value)) value = currentBet;
        if (value < 10) value = 10;
        if (value > 500) value = 500;
        if (value > balance) value = balance;
        
        setBet(value);
        updateBetButtons(value);
    });
    
    // Bet adjustment buttons
    decreaseBetBtn.addEventListener('click', () => adjustBet(-10));
    increaseBetBtn.addEventListener('click', () => adjustBet(10));
    
    // Quick bet buttons
    minBetBtn.addEventListener('click', () => setBet(10));
    maxBetBtn.addEventListener('click', () => setBet(Math.min(500, balance)));
    doubleBetBtn.addEventListener('click', () => setBet(Math.min(500, currentBet * 2)));
}

// Adjust bet amount
function adjustBet(amount) {
    let newBet = currentBet + amount;
    if (newBet < 10) newBet = 10;
    if (newBet > 500) newBet = 500;
    if (newBet > balance) newBet = balance;
    
    setBet(newBet);
}

// Set bet amount
function setBet(amount) {
    if (gameActive) {
        showMessage("Can't change bet during game", "warning");
        return;
    }
    
    if (amount > balance) {
        showMessage("Insufficient funds", "warning");
        return;
    }
    
    currentBet = amount;
    customBetInput.value = amount;
    updateUI();
}

// Update bet buttons active state
function updateBetButtons(value) {
    betButtons.forEach(btn => {
        const btnValue = parseInt(btn.getAttribute('data-amount'));
        btn.classList.toggle('active', btnValue === value);
    });
}

// Start a new game
function startGame() {
    if (gameActive) {
        showMessage("Game already in progress", "warning");
        return;
    }
    
    if (currentBet > balance) {
        showMessage("Insufficient funds", "warning");
        return;
    }
    
    // Deduct bet
    balance -= currentBet;
    
    // Reset hands
    gameActive = true;
    playerHand = [];
    dealerHand = [];
    deck = createDeck();
    
    // Deal initial cards
    playerHand.push(drawCard(), drawCard());
    dealerHand.push(drawCard(), drawCard());
    
    // Calculate scores
    playerScore = calculateScore(playerHand);
    dealerScore = calculateScore([dealerHand[0]]); // Only show dealer's first card
    
    // Update UI
    updateUI();
    renderCards();
    
    // Check for blackjack
    if (playerScore === 21) {
        setTimeout(() => {
            playerStand(); // Automatically stand on blackjack
        }, 1000);
        showMessage("Blackjack!", "success");
    } else {
        showMessage("Your turn - Hit or Stand?", "info");
    }
    
    // Enable/disable buttons
    dealBtn.disabled = true;
    hitBtn.disabled = false;
    standBtn.disabled = false;
}

// Create deck
function createDeck() {
    const newDeck = [];
    
    for (let suit of suits) {
        for (let value of values) {
            newDeck.push({
                suit: suit,
                value: value,
                numericValue: getCardValue(value)
            });
        }
    }
    
    return shuffleDeck(newDeck);
}

// Shuffle deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Draw card
function drawCard() {
    if (deck.length === 0) {
        deck = createDeck();
    }
    return deck.pop();
}

// Get card value
function getCardValue(value) {
    if (value === 'A') return 11;
    if (['J', 'Q', 'K'].includes(value)) return 10;
    return parseInt(value);
}

// Calculate hand score
function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    
    for (let card of hand) {
        score += card.numericValue;
        if (card.value === 'A') aces++;
    }
    
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

// Player hits
function playerHit() {
    if (!gameActive) return;
    
    playerHand.push(drawCard());
    playerScore = calculateScore(playerHand);
    
    updateUI();
    renderCards();
    
    if (playerScore > 21) {
        // Player busts - reveal dealer's hidden card and end game
        dealerScore = calculateScore(dealerHand);
        updateUI();
        renderCards(true); // Show dealer's cards
        endGame("Bust! Alive wins", "loss");
        losses++;
        gamesPlayed++;
        updateStats();
    } else {
        showMessage(`Score: ${playerScore} - Hit again?`, "info");
    }
}

// Player stands
function playerStand() {
    if (!gameActive) return;
    
    gameActive = false;
    showMessage("Alive's turn...", "info");
    
    setTimeout(dealerPlay, 1000);
}

// Dealer plays
function dealerPlay() {
    dealerScore = calculateScore(dealerHand);
    
    // Dealer must hit on 16 or less, stand on 17 or more
    while (dealerScore < 17) {
        dealerHand.push(drawCard());
        dealerScore = calculateScore(dealerHand);
    }
    
    updateUI();
    renderCards(true); // Show all dealer cards
    
    determineWinner();
}

// Determine winner
function determineWinner() {
    let message = "";
    let messageType = "";
    let winnings = 0;
    
    // Check for player bust (should have been caught earlier, but just in case)
    if (playerScore > 21) {
        message = "Bust! Alive wins";
        messageType = "loss";
        winnings = 0;
        losses++;
    }
    // Check for dealer bust
    else if (dealerScore > 21) {
        message = "Alive busts! You win!";
        messageType = "success";
        winnings = currentBet * 2;
        wins++;
    }
    // Compare scores
    else if (dealerScore > playerScore) {
        message = `Alive wins ${dealerScore} to ${playerScore}`;
        messageType = "loss";
        winnings = 0;
        losses++;
    } else if (playerScore > dealerScore) {
        message = `You win ${playerScore} to ${dealerScore}!`;
        messageType = "success";
        winnings = currentBet * 2;
        wins++;
    } else {
        message = `Push! ${playerScore} to ${dealerScore}`;
        messageType = "info";
        winnings = currentBet;
    }
    
    // Check for blackjack bonus (3:2 payout)
    if (playerScore === 21 && playerHand.length === 2 && dealerScore !== 21) {
        message = "Blackjack! 3:2 payout!";
        messageType = "success";
        winnings = currentBet * 2.5;
        // Don't increment wins again if already counted above
    }
    
    // Update stats
    gamesPlayed++;
    if (winnings > maxWin) maxWin = winnings;
    
    // Update balance
    balance += winnings;
    
    // Update display
    winningsEl.textContent = `$${winnings}`;
    winningsEl.style.color = messageType === "success" ? "#4CAF50" : "#FFD700";
    
    endGame(message, messageType);
    updateStats();
}

// End game
function endGame(message, type) {
    showMessage(message, type);
    
    dealBtn.disabled = false;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    gameActive = false;
    
    updateUI();
}

// Reset game
function resetGame() {
    if (gameActive && !confirm("Reset during game?")) return;
    
    balance = 500;
    currentBet = 50;
    gameActive = false;
    playerHand = [];
    dealerHand = [];
    playerScore = 0;
    dealerScore = 0;
    
    gamesPlayed = 0;
    wins = 0;
    losses = 0;
    maxWin = 0;
    
    updateBetButtons(50);
    customBetInput.value = 50;
    winningsEl.textContent = "$0";
    winningsEl.style.color = "#FFD700";
    
    updateUI();
    updateStats();
    renderCards();
    showMessage("Game reset - Place your bet", "info");
    
    dealBtn.disabled = false;
    hitBtn.disabled = true;
    standBtn.disabled = true;
}

// Update UI
function updateUI() {
    balanceEl.textContent = `$${balance}`;
    betAmountEl.textContent = `$${currentBet}`;
    dealerScoreEl.textContent = dealerScore;
    playerScoreEl.textContent = playerScore;
    
    dealBtn.disabled = gameActive || currentBet > balance;
    
    // Update bet input
    customBetInput.value = currentBet;
    
    // Update max bet based on balance
    if (balance < 500) {
        maxBetBtn.textContent = `Max ($${balance})`;
    } else {
        maxBetBtn.textContent = "Max";
    }
}

// Update stats
function updateStats() {
    gamesPlayedEl.textContent = gamesPlayed;
    winsCountEl.textContent = wins;
    lossesCountEl.textContent = losses;
    
    const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
    winRateEl.textContent = `${winRate}%`;
    
    maxWinEl.textContent = `$${maxWin}`;
}

// Render cards
function renderCards(showAllDealerCards = false) {
    // Clear containers
    dealerCardsEl.innerHTML = "";
    playerCardsEl.innerHTML = "";
    
    // Render dealer cards
    dealerHand.forEach((card, index) => {
        const isHidden = index === 0 && !showAllDealerCards && gameActive;
        dealerCardsEl.appendChild(createCardElement(card, isHidden));
    });
    
    // Render player cards
    playerHand.forEach(card => {
        playerCardsEl.appendChild(createCardElement(card, false));
    });
}

// Create card element
function createCardElement(card, isHidden) {
    const cardEl = document.createElement('div');
    cardEl.className = `card dealt ${isHidden ? 'dealer-hidden' : `card-${card.suit}`}`;
    
    if (isHidden) {
        cardEl.innerHTML = '<div class="card-hidden">?</div>';
    } else {
        const suitSymbol = getSuitSymbol(card.suit);
        cardEl.innerHTML = `
            <div class="card-corner card-top-left">${card.value}<br>${suitSymbol}</div>
            <div class="card-center">${suitSymbol}</div>
            <div class="card-corner card-bottom-right">${card.value}<br>${suitSymbol}</div>
        `;
    }
    
    return cardEl;
}

// Get suit symbol
function getSuitSymbol(suit) {
    switch(suit) {
        case 'heart': return '♥';
        case 'diamond': return '♦';
        case 'club': return '♣';
        case 'spade': return '♠';
        default: return '';
    }
}

// Show message
function showMessage(message, type = "info") {
    messageAreaEl.innerHTML = `<p>${message}</p>`;
    
    // Set color based on type
    const colors = {
        info: "#FFD700",
        success: "#4CAF50",
        warning: "#FFA726",
        loss: "#FF5252"
    };
    
    messageAreaEl.style.color = colors[type] || colors.info;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initGame);