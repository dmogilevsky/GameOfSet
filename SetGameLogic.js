// 81 Cards
//Each card has 4 attributes
// Green, Red, Purple
// 1, 2, 3
// Diamond, Squiggle, Oval
// Hollow, Striped, Full
class Card {
    constructor(id, shade, shape, color, number) {
        this.id = id; // 1-81
        this.attributes = {"color": color, "number": number, "shape": shape, "shade": shade}
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

function initializeGlobals() {
    GameBoard = []; // Holds the 12 visible cards
    Cards = []; // Holds every card regardless of deck status
    Deck = [];  // The deck of 81 cards
    potentialSet = []; //Holds 3 cards that are user-inputted
    playerPlaying = null; // Player currently selecting cards
}

// Do all the necessary initialization to start the Set game
function startGame() {

    // re-initialize global variables as necessary
    initializeGlobals();

    // Initialize cards and deck
    initializeCards(AttributeMapping);
    unHighlightAll();
    createGameBoard();
    let numPlayers = promptForPlayerNumber();
    scores = [];
    for (let i = 0; i < numPlayers; i++) {
        scores[i] = 0;
    }
    scoreUpdate();
    initializeUI();
}

function promptForPlayerNumber() {
    let numPlayers = null;
    while (numPlayers === null || numPlayers < 1 || numPlayers > 6) {
        numPlayers = parseInt(prompt("Enter the number of players from 1-6, entering 1 will result in" +
            "single player mode.", "1"), 10);
    }
    return numPlayers;
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
        drawnCards.push(Deck.pop());
    }
    console.log("Drawn cards: " + JSON.stringify(drawnCards));
    return drawnCards;
}

// Put 12 cards on the GameBoard
function createGameBoard() {
    GameBoard.push.apply(GameBoard, drawCards(CardsOnBoard));
    syncModelAndUIGameBoard();
}

// Replace the set with newly drawn cards, pass in the indexes on
// the game board that need to be replaced with new cards
function updateBoardAfterSet(gameBoardIndexesToReplace) {

    // If there aren't any cards left, if there are no sets on the board the game is over
    if (Deck.length === 0) {
        finishGame();
        return
    }
    // Start by setting all cards to replace to null
    for (let i = 0; i < gameBoardIndexesToReplace.length; i++) {
        GameBoard[gameBoardIndexesToReplace[i]] = null;
    }
    // Draw up to 3, but less if we don't have 3
    let drawnCards = drawCards(Math.min(Deck.length, CardsInSet));

    // Place them on the game board
    for (let i = 0; i < drawnCards.length; i++) {
        GameBoard[gameBoardIndexesToReplace[i]] = drawnCards[i];

    }
    syncModelAndUIGameBoard();
}

// A set is defined as follows:
// For each attribute in the set, all cards must be the same or all must be different
function isSet(x, y, z) {
    // check to ensure non are null
    let set = true;
    if (x !== null && y !== null && z !== null) {
        for (let key in x.attributes) {
            if (!allAttributesEqual(x, y, z, key) && !allAttributesDifferent(x, y, z, key)) {
                set = false;
            }
        }
    } else {
        set = false;
    }
    return set;
}

function allAttributesEqual(x, y, z, key) {
    return x.attributes[key] === y.attributes[key] && y.attributes[key] === z.attributes[key]
}

function allAttributesDifferent(x, y, z, key) {
    return x.attributes[key] !== y.attributes[key] && x.attributes[key] !== z.attributes[key] &&
        y.attributes[key] !== z.attributes[key]
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
        console.log("Potential Set: " + JSON.stringify(potentialSet));
        // If the potential set has size 3, do setChecking
        if (potentialSet.length === CardsInSet) {
            handleSetCheck();
        }
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
        console.log("Set found");
        scores[playerPlaying - 1]++;
        updateBoardAfterSet([GameBoard.indexOf(potentialSet[0]), GameBoard.indexOf(potentialSet[1]),
            GameBoard.indexOf(potentialSet[2])]);
    } else {
        console.log("Not a set");
        if (scores.length > 1) {
            scores[playerPlaying - 1]--;
        }
    }

    potentialSet = [];
    scoreUpdate();
    if (scores.length > 1) {
        playerPlaying = null;
    }
}
