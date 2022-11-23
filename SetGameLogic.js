// 81 Cards
//Each card has 4 attributes
class Card {
    constructor(id, shade, shape, color, number, selected) {
        this.id = id; // 1-81
        this.color = color; // Green, Red, Purple
        this.number = number; // 1, 2, 3
        this.shape = shape; // Diamond, Squiggle, Oval
        this.shade = shade; // Hollow, Striped, Full
        this.selected = selected;
    }
}

const NumberOfCards = 81;
const CardsOnBoard = 12;
const CardsInSet = 3;

/* Cards are ordered by:
   Shade: Bold, Striped, Hollow
       Shape: Squiggle, Diamond, Oval
           Color: Red, Purple, Green
             Number: 1, 2, 3
Make mapping for shade, shape, color relative to card order */
const AttributeMapping = [
    ["Bold", "Striped", "Hollow"], // 0. Shade
    ["Squiggle", "Diamond", "Oval"], // 1. Shape
    ["Red", "Purple", "Green"], // 2. Color
];
let GameBoard; // Holds the 12 visible cards
let Cards; // Holds every card regardless of deck status
let Deck;  // The deck of 81 cards
let potentialSet; //Holds 3 cards that are user-inputted
let scores; //Holds user score
let playerPlaying; // Player currently selecting cards

// Do all the necessary initialization to start the Set game
function startGame() {
    // re-initialize global variables as necessary
    GameBoard = [];
    potentialSet = [];
    Cards = [];
    Deck = [];
    scores = [0, 0];
    playerPlaying = null;
    // Make card attribute mapping
    console.log("Attribute mapping made");

    // Initialize cards and deck
    if (Cards.length !== NumberOfCards || Deck.length !== NumberOfCards) {
        console.log("Initializing cards");
        initializeCards(AttributeMapping);
    }
    unHighlightAll();
    changePlayer(playerPlaying);
    scoreUpdate();
    createGameBoard();
}

// Make an array of all 81 cards
function initializeCards(map) {
    Cards = [];
    Deck = [];
    let idCount = 1; // Corresponding with the #.jpg of the card

    for (let i = 0; i <= 2; i++) { // The shade of the card, Bold, Striped, or Hollow
        for (let j = 0; j <= 2; j++) { // The shape of the card, Squiggle, Diamond, Oval
            for (let k = 0; k <= 2; k++) { // The color, Red, Purple, Green
                for (let l = 1; l <= 3; l++) { // Number of shapes in the card
                    Cards[idCount - 1] = new Card(idCount, map[0][i], map[1][j], map[2][k], l, false);
                    Deck[idCount - 1] = new Card(idCount, map[0][i], map[1][j], map[2][k], l, false);
                    idCount++;
                }
            }
        }
    }
    shuffleDeck();
    // Deck = Deck.slice(0, 12); // For testing end of game functionality
}

// Simply shuffle the Deck array
function shuffleDeck() {

    let curId = Deck.length;

    // The remaining elements to shuffle
    while (curId !== 0) {
        // Pick a remaining element
        let randId = Math.floor(Math.random() * curId);
        curId -= 1;
        // Swap it with the current element.
        let tmp = Deck[curId];
        Deck[curId] = Deck[randId];
        Deck[randId] = tmp;
    }
}

// Draw 3 cards to replace matched set and remove the cards from the deck
function drawCards(num) {
    let drawnCards = [];

    for (let i = 1; i <= num; i++) {
        drawnCards.push(Deck[Deck.length - i]);
    }
    Deck.length = (Deck.length - num);
    console.log("Drawn cards: " + JSON.stringify(drawnCards));
    return drawnCards;
}

// Put 12 cards on the GameBoard
function createGameBoard() {
    GameBoard.push.apply(GameBoard, drawCards(CardsOnBoard));
    syncModelAndUIGameBoard();
}

// Replace the set with newly drawn cards
function updateBoardAfterSet(indexArr) {

    let drawnCards;

    if (Deck.length >= CardsInSet) {
        drawnCards = drawCards(CardsInSet);
        for (let i = 0; i < indexArr.length; i++) {
            GameBoard[indexArr[i]] = drawnCards[i];
        }
    } else {
        // Start by setting all cards to replace to null
        for (let i = 0; i < indexArr.length; i++) {
            GameBoard[indexArr[i]] = null;
        }
        // If there are cards left in the deck, replace however many we can
        if (Deck.length > 0) {
            drawnCards = drawCards(Deck.length);
            for (let i = 0; i < drawnCards.length; i++) {
                GameBoard[indexArr[i]] = drawnCards[i];
            }
            // If there aren't any cards left, if there are no sets on the board the game is over
        } else {
            if (setsOnBoard() === 0) {
                finishGame();
            } else {
                syncModelAndUIGameBoard();
            }
        }
    }
}

// A set is defined as follows:
// For each attribute in the set, all cards must be the same or all must be different
function isSet(x, y, z) {
    // check to ensure non are null
    if (x === null || y === null || z === null) {
        return false;
    } else {
        return (
                x.color === y.color && y.color === z.color || x.color !== y.color && x.color !== z.color && y.color !== z.color) &&
            (x.shade === y.shade && y.shade === z.shade || x.shade !== y.shade && x.shade !== z.shade && y.shade !== z.shade) &&
            (x.number === y.number && y.number === z.number || x.number !== y.number && x.number !== z.number && y.number !== z.number) &&
            (x.shape === y.shape && y.shape === z.shape || x.shape !== y.shape && x.shape !== z.shape && y.shape !== z.shape
            );
    }
}

// Return the number of sets on the board
function setsOnBoard() {

    let numSets = 0;

    for (let i = 0; i < CardsOnBoard; i++) {
        for (let j = 1 + i; j < CardsOnBoard; j++) {
            for (let k = 1 + j; k < CardsOnBoard; k++) {
                if (isSet(GameBoard[i], GameBoard[j], GameBoard[k])) {
                    numSets++;
                }
            }
        }
    }
    return numSets;
}

//Adds selected card into array. el is td element, with its child being the image
function cardSelected(el) {

    if (playerPlaying !== null && el.firstChild.getAttribute("src") !== "") {
        highlight(el);
        let card = GameBoard[parseInt(el.id.replace('A', ''))];
        // Add or remove card from the potential set based on selection
        if (card.selected) {
            card.selected = false;
            let a = potentialSet.indexOf(card);
            potentialSet.splice(a, 1);
        } else {
            card.selected = true;
            potentialSet.push(card);
        }
        // If the potential set has size 3, do setChecking
        if (potentialSet.length === CardsInSet) {
            handleSetCheck();
        }
        console.log("Potential Set: " + JSON.stringify(potentialSet));
    }
}

/* Un-highlights all the cards and checks for set. If it's a set,
 increment current player's score, else decrement. Update the score and change player to null */
function handleSetCheck() {

    for (let i = 0; i < CardsInSet; i++) {
        potentialSet[i].selected = false;
    }

    unHighlightAll();

    if (isSet(potentialSet[0], potentialSet[1], potentialSet[2])) {
        scores[playerPlaying - 1]++;
        updateBoardAfterSet([GameBoard.indexOf(potentialSet[0]), GameBoard.indexOf(potentialSet[1]), GameBoard.indexOf(potentialSet[2])]);
    } else {
        scores[playerPlaying - 1]--;
    }

    potentialSet = [];
    scoreUpdate();
    changePlayer(null);
}
