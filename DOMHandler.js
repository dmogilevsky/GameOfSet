// Write this function to update the DOM elements to match our GameBoard
function syncModelAndUIGameBoard() {
    console.log("Syncing GameBoard with UI");
    for (let i = 0; i < GameBoard.length; i++) {
        let el = document.getElementById(i);
        if (GameBoard[i] != null) {
            el.src = idToImageSrc(GameBoard[i].id);
        } else {
            el.src = "images/82.png";
        }
    }
    document.getElementById("hint").innerText = "Hint: ";
}

// Matches the img id to the images .png
function idToImageSrc(id) {
    return "images/" + id + ".png";
}

// Changes the string into the id
function imageSrcToID(str) {
    let id = parseInt(str.split("images/")[1].replace(".png", ''));
    console.log("Turned " + str + " into " + id);
    return id;
}

//Highlights selected card
function highlight(el) {
    if (el.className === 'select') {
        el.className = "unselect";
    } else {
        el.className = 'select';
    }

}

// Un-highlights all selected cards. The length of the selected list is dynamically changing based on element criteria,
// hence the while loop instead of a for loop.
function unHighlightAll() {
    let selectedList = document.getElementsByClassName("select");
    while (selectedList.length > 0) {
        selectedList[0].className = selectedList[0].className.replace('select', "unselect");
    }
}

//Hint button that displays the amount of sets on the board
function hintReveal() {
    let hinter = document.getElementById("hint");
    hinter.textContent = "Hint: " + setsOnBoard() + " sets on the current board";

    // display message to redraw game board when there is no set on board
    if (setsOnBoard() === 0) {
        const user_answer = window.confirm('There is no set on the board \n Ready to redraw the game board?');
        if (user_answer) {
            redrawGameBoard();
        }
    }
}

// Changes the player who is currently playing
function changePlayer(playerNumber) {
    if (playerPlaying == null) { // Don't change player if a player has already been chosen
        if (playerNumber != null) {
            playerPlaying = playerNumber;
        }
    }
}

//Prints out the Instructions to the Set Game through a toggle button
function toggleInstructions() {
    let text = `The object of the game is to identify a SET of 3 cards from the 12 cards on the game board.
    Each card has four features: Shape, Color, Number, and Shading. A SET consists of 3 cards in which each of the
    cards' features, looked at one by one, are the same on each card or are different on each card. All of the four
    features must satisfy this rule. The board will automatically fill up with cards and the clock will begin on its
    own. When a player sees a Set, they will click the button corresponding to their player number and select a Set of 3 
    cards. If they correctly select a set of 3, they will win one point. If they incorrectly highlight a set, they will 
    lose one point. Once players have finished playing, they may hit "Finish" to end the game or play until there are no
     sets left. The player with the most points by the end of the game wins. If the players tie then the game ends as a 
     draw. There are additional features that are in the game. The hint button allows players to see how many sets are 
     on the current board. The finish button finishes the current game that is being played. The restart button allows 
     players to restart the game with a new game. The timer is located above the scores to show the duration of the
     game.`

    window.confirm(text)
}

//Updates the score in the HTML
function scoreUpdate() {
    for (let i = 1; i <= scores.length; i++) {
        if (document.getElementById("p" + i.toString() + "score") != null) {
            document.getElementById("p" + i.toString() + "score").innerText = "Player " + i + ": " + scores[i - 1];
        }
    }
}

//Finishes the game button that gives an alert on which player won or if it was a draw
function finish_game() {

    scoreUpdate();
    syncModelAndUIGameBoard();
    let p_win = 0;
    if (scores[0] > scores[1]) {
        p_win = 1;
    } else if (scores[0] < scores[1]) {
        p_win = 2
    }

    if (p_win !== 0) {
        alert("Game Over!\n Player " + p_win + " wins the game with the score: " + scores[p_win - 1] + "!");
    } else {
        alert("Game Over!\n Its a draw!");
    }

}

// Redraw the GameBoard when the user clicks the redraw button or no set on the board
function redrawGameBoard() {
    // copy the GameBoard array
    const tempBoard = [...GameBoard];
    if (Deck.length < CardsOnBoard) {
        finish_game();
    } else {
        let drawnCards = drawCards(12);
        const index_ary = [...Array(CardsOnBoard).keys()];
        GameBoard = [];
        for (let i = 0; i < index_ary.length; i++) {
            GameBoard[i] = drawnCards[i];
        }
        console.log("Redrawn GameBoard: " + GameBoard.length + JSON.stringify(GameBoard));
        syncModelAndUIGameBoard();
        Deck.push.apply(Deck, tempBoard);
        shuffleDeck();
    }
}
