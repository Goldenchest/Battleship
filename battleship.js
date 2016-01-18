// Created by Gary Chien

var cheatMode = false;

// check if an array contains a certain element
Array.prototype.contains = function(target) {
	for (i in this) {
		if (this[i] === target) return true;
	}
	return false;
}
// get a random element from an array
Array.prototype.getRandomElem = function() {
	if (this.length > 0)
		return this[Math.floor(Math.random()*this.length)];
	else {
		alert('empty array error');
		throw new Error('empty array error');
	}
}

// returns an array without a specific item (more readable wrapper function for underscore's _.without)
Array.prototype.without = function(target) {
	return _.without(this, target);
}

var letters = ['placeholder','A','B','C','D','E','F','G','H','I','J']; // 'placeholder' is used because axis labels do not have a letter assigned to them
var allCells = []; // array of all cells in each grid (from A1 to J10)
for (var i=0; i<10; i++) {
	for (var j=1; j<11; j++) {
		allCells.push(letters[i+1].concat(j.toString()));
	}
}

// pShips and cShips will be randomly generated later on in the code
var pShips = {
	carrier: [], // size 5
	battleship: [], // size 4
	submarine: [], // size 3
	destroyer: [], // size 3
	patrol: [] // size 2
}

var cShips = {
	carrier: [], // size 5
	battleship: [], // size 4
	submarine: [], // size 3
	destroyer: [], // size 3
	patrol: [], // size 2
}

var unplacedShips = ['carrier', 'battleship', 'submarine', 'destroyer', 'patrol']; // ships that have not been placed on the board yet
var unavailableCells = []; // cells that cannot have a ship placed on it

// get random cell from grid
function getRandomCell() {
	return allCells.getRandomElem();
}

// get random orientation for ships
function getRandomOrientation() {
	if (Math.random() > 0.5) return 'horizontal';
	return 'vertical';
}

// determine the orientation of a ship
function determineOrientation(ship) { // ship is an array of coordinates
	if (ship[0].charAt(0) === ship[1].charAt(0)) { // if first letters of first two coordinates are identical...
		return "vertical"; // ship is vertical
	}
	return "horizontal"; // otherwise, ship is horizontal
}

// get the longest unplaced ship type (we will place ships in order of length from longest to shortest).
function getLongestShipType() {
	if (unplacedShips.contains('carrier')) return 'carrier';
	else if (unplacedShips.contains('battleship')) return 'battleship';
	else if (unplacedShips.contains('submarine')) return 'submarine';
	else if (unplacedShips.contains('destroyer')) return 'destroyer';
	else if (unplacedShips.contains('patrol')) return 'patrol';
	else return 'no ships left';
}

// generate a random ship of the specified shipType
function generateShip(shipType) {
	var coord = getRandomCell();
	var coordLetterInd = letters.indexOf(coord.charAt(0));
	var coordNum = Number(coord.substring(1));
	var orientation = getRandomOrientation();
	var shipLength = 0;
	var failureMessage = "can't place";
	var ship = [];
	if (shipType === 'carrier')
		shipLength = 5;
	else if (shipType === 'battleship')
		shipLength = 4;
	else if (shipType === 'submarine' || shipType == 'destroyer')
		shipLength = 3;
	else if (shipType === 'patrol')
		shipLength = 2;
	if (orientation === 'horizontal') {
		if (coordLetterInd+shipLength > letters.length) return failureMessage;
		for (var i=0; i<shipLength; i++) {
			var newCoord = letters[coordLetterInd+i].concat(coord.substring(1));
			if (unavailableCells.contains(newCoord)) {
				unavailableCells = _.difference(unavailableCells, ship);
				return failureMessage;
			}
			ship.push(newCoord);
			unavailableCells.push(newCoord);
		}
	} else if (orientation === 'vertical') {
		if (coordNum+shipLength > 11) return failureMessage;
		for (var i=0; i<shipLength; i++) {
			var newNum = coordNum+i;
			var newCoord = coord.charAt(0).concat((newNum).toString());
			if (unavailableCells.contains(newCoord)) {
				unavailableCells = _.difference(unavailableCells, ship);
				return failureMessage;
			}
			ship.push(newCoord);
			unavailableCells.push(newCoord);
		}
	}
	unplacedShips = _.difference(unplacedShips, shipType);
	return ship;
}

/*
Ship placement algorithm
1. Get a random cell and orientation. If no cells are available, restart the entire algorithm.
2. Check if longest unplaced ship can be placed at that cell.
3. If so, place it and add the ship's cells to unavailable cells.
   Else, add the failed cell to unavailable cells and go back to step 1.
4. Remove the longest ship from the list of unplaced ships.
5. If list of unplaced ships is non-empty, go back to step 2. Else, you're finished.
*/

var cBoard = {
	isAHit: function(coord) {
		for (var shipType in cShips) {
			if (cShips[shipType].contains(coord)) return true;
		}
		return false;
	},
	getShipType: function(coord) {
		for (var shipType in cShips) {
			if (cShips[shipType].contains(coord)) return shipType;
		}
		return "no ship";
	},
	placeRandomShips: function() {
		unplacedShips = ['carrier', 'battleship', 'submarine', 'destroyer', 'patrol'];
		unavailableCells = [];
		while (unplacedShips.length > 0) {
			if (unavailableCells.length === 100) {
				unplacedShips = ['carrier', 'battleship', 'submarine', 'destroyer', 'patrol'];
				unavailableCells = [];
			}
			var placedShip = generateShip(unplacedShips[0]);
			if (placedShip === "can't place") continue;
			else {
				cShips[unplacedShips[0]] = placedShip;
				unplacedShips = unplacedShips.slice(1);
			}
		}
	},
	hitCells: [],
	uncheckedCells: allCells
}

var pBoard = {
	isAHit: function(coord) {
		for (var shipType in pShips) {
			if (pShips[shipType].contains(coord)) return true;
		}
		return false;
	},
	getShipType: function(coord) {
		for (var shipType in pShips) {
			if (pShips[shipType].contains(coord)) return shipType;
		}
		return "no ship";
	},
	placeRandomShips: function() {
		unplacedShips = ['carrier', 'battleship', 'submarine', 'destroyer', 'patrol'];
		unavailableCells = [];
		while (unplacedShips.length > 0) {
			if (unavailableCells.length === 100) {
				unplacedShips = ['carrier', 'battleship', 'submarine', 'destroyer', 'patrol'];
				unavailableCells = [];
			}
			var placedShip = generateShip(unplacedShips[0]);
			if (placedShip === "can't place") continue;
			else {
				pShips[unplacedShips[0]] = placedShip;
				unplacedShips = unplacedShips.slice(1);
			}
		}
	},
	hitCells: [],
	uncheckedCells: allCells
}

// function created for debugging purposes
function printMessage(message) {
	$('body').append('<p>'+message+'</p>');
}

// get all available cells surrounding a given cell
function getAdjacentCells(cell) {
	var cellLetter = cell.charAt(0);
	var cellNum = cell.substring(1);
	var adjacentCells = [];
	if (cellLetter !== 'A') {
		var prevLetter = letters[letters.indexOf(cellLetter)-1];
		var candidateCell = prevLetter.concat(cellNum);
		if (pBoard.uncheckedCells.contains(candidateCell)) {
			adjacentCells.push(candidateCell); // cell to the left
		}
	}
	if (cellLetter !== 'Z') {
		var nextLetter = letters[letters.indexOf(cellLetter)+1];
		var candidateCell = nextLetter.concat(cellNum);
		if (pBoard.uncheckedCells.contains(candidateCell)) {
			adjacentCells.push(candidateCell); // cell to the right
		}
	}
	if (cellNum !== '1') {
		var upperNum = (Number(cellNum)-1).toString();
		var candidateCell = cellLetter.concat(upperNum);
		if (pBoard.uncheckedCells.contains(candidateCell)) {
			adjacentCells.push(candidateCell); // cell on top
		}
	}
	if (cellNum !== '10') {
		var lowerNum = (Number(cellNum)+1).toString();
		var candidateCell = cellLetter.concat(lowerNum);
		if (pBoard.uncheckedCells.contains(candidateCell)) {
			adjacentCells.push(candidateCell); // cell on bottom
		}
	}
	return adjacentCells;
}

// targeting data
var hitChain = [];
var nextMove = '';

// reset the targeting data
function clearTargetingData() {
	hitChain = [];
	nextMove = '';
}

/*
Hunting algorithm
1. Clear data from hitChain and nextMove. (In most cases they should already be cleared,
   but this is done in case hunt() is used as an override.)
1. If uncheckedCells.length > 0, set targetedCell to a random unchecked cell. Then:
	1. If targetedCell is a hit, then:
	   - Mark the cell as 'hit'.
	   - Add targetedCell to pBoard.hitCells.
	   - Remove targetedCell from pBoard.uncheckedCells.
	   - Add targetedCell to beginning of hitChain.
	   - Set surroundingCells to all unchecked cells surrounding targetedCell, using getAdjacentCells.
	   - If surroundingCells.length > 0, then set nextMove to the first element of surroundingCells.
	   - Else if surroundingCells.length is 0, then reset hitChain and nextMove (will hunt again on next turn).
	2. Else if targetedCell is a miss, then:
	   - Mark the cell as 'miss'.
	   - Remove targetedCell from pBoard.uncheckedCells.
	   - hitChain and nextMove should already be cleared, so computer will hunt again on next turn.
2. Else if uncheckedCells.length is 0, do nothing.
*/

// fire at a random unchecked cell on the player's board
function hunt() {
	if (pBoard.uncheckedCells.length > 0) {
		clearTargetingData();
		var targetedCell = pBoard.uncheckedCells.getRandomElem();
		if (pBoard.isAHit(targetedCell)) { // targetedCell is a hit
			//printMessage('Hunt successful!');
			$('#p'+targetedCell).addClass('hit'); // mark the cell as 'hit'
			pBoard.hitCells.push(targetedCell); // add targetedCell to pBoard.hitCells
			pBoard.uncheckedCells = pBoard.uncheckedCells.without(targetedCell); // remove targetedCell from pBoard.uncheckedCells
			hitChain.unshift(targetedCell); // add targetedCell to beginning of hitChain (which should be initially empty)
			var surroundingCells = getAdjacentCells(targetedCell);
			//$('body').append('<p>checkpoint3</p>');
			//$('body').append('<p>Surrounding Cells: '+surroundingCells+'</p>');
			if (surroundingCells.length > 0) {
				// set nextMove to a random available cell surrounding targetedCell
				nextMove = getAdjacentCells(targetedCell).getRandomElem();
				//printMessage('nextMove (from hunt): '+nextMove);
			} else {
				//printMessage('Clearing targeting data...');
				clearTargetingData();
			}
		} else { // targetedCell is a miss
			$('#p'+targetedCell).addClass('miss'); // mark the cell as 'miss'
			pBoard.uncheckedCells = pBoard.uncheckedCells.without(targetedCell); // remove targetedCell from pBoard.uncheckedCells
		}
	}
}

// given a chain of hits (array of adjacent cells), find the next logical cell to fire at
function getNextCell(hits) { // hits is an array of at least two adjacent hit cells with most recent hit first
	var orientation = determineOrientation(hits);
	var nextCell = '';
	if (orientation === 'horizontal') {
		//printMessage('orientation was H');
		var cellNum = hits[0].substring(1); //4
		//printMessage('cellNum: '+cellNum);
		var firstLetter = hits[0].charAt(0); //H
		//printMessage('firstLetter: '+firstLetter);
		var secondLetter = hits[1].charAt(0); //G
		//printMessage('secondLetter: '+secondLetter);
		if (letters.indexOf(firstLetter) < letters.indexOf(secondLetter)) { // first cell to left of second cell
			// must find cell to left of first cell
			//printMessage('firstL<secondL');
			if (letters.indexOf(firstLetter) > 1) {
				var newLetter = letters[letters.indexOf(firstLetter)-1];
				nextCell = newLetter.concat(cellNum);
				//printMessage('nextCell: '+nextCell)
			}
		}
		else if (letters.indexOf(firstLetter) > letters.indexOf(secondLetter)) {
			// must find cell to right of first cell
			//printMessage('firstL>secondL');
			//printMessage('ind: '+letters.indexOf(firstL
			if (letters.indexOf(firstLetter) < 10) {
				//printMessage('ind: '+letters.indexOf(firstLetter)+1);
				var newLetter = letters[letters.indexOf(firstLetter)+1];
				nextCell = newLetter.concat(cellNum);
				//printMessage('nextCell: '+nextCell);
			}
		}
	}
	else if (orientation === 'vertical') {
		//printMessage('getNextCell(hits) orientation was V');
		var cellLetter = hits[0].charAt(0);
		var firstNum = Number(hits[0].substring(1));
		var secondNum = Number(hits[1].substring(1));
		if (firstNum < secondNum) { // first cell is above second cell
			// must find cell above first cell
			//printMessage('firstN<secondN');
			if (firstNum > 1) {
				var newNumber = firstNum-1;
				nextCell = cellLetter.concat(newNumber.toString());
				//printMessage('nextCell: '+nextCell);
			}
		}
		else if (firstNum > secondNum) { // first cell is below second cell
			// must find cell below first cell
			//printMessage('firstN>secondN');
			if (firstNum < 10) {
				var newNumber = firstNum+1;
				nextCell = cellLetter.concat(newNumber.toString());
				//printMessage('nextCell: '+nextCell);
			}
		}
	}
	if (!pBoard.uncheckedCells.contains(nextCell)) nextCell = '';
	//printMessage('final nextCell: '+nextCell+'getNextCell()');
	//printMessage('exiting getNextCell(hits)');
	return nextCell;
}

// extends getNextCell to give AI the ability to check other side of a chain of hits
function getNextMoveFromChain() {
	var nextCell = getNextCell(hitChain);
	if (nextCell !== '') {
		return nextCell;
	}
	else {
		hitChain = hitChain.reverse();
		nextCell = getNextCell(hitChain);
		return nextCell;
	}
}

// If a hunt() hits a ship, latch() lets the AI "latch" on to the ship and systematically DEMOLISH IT
function latch() {
	if (hitChain.length > 0 && nextMove !== '') {
		var nextTargetedCell = nextMove;
		if (pBoard.isAHit(nextTargetedCell)) { // nextTargetedCell is a hit
			$('#p'+nextTargetedCell).addClass('hit');
			pBoard.hitCells.push(nextTargetedCell);
			pBoard.uncheckedCells = pBoard.uncheckedCells.without(nextTargetedCell);
			hitChain.unshift(nextTargetedCell);
			nextMove = getNextMoveFromChain();
		}
		else { // nextTargetedCell is a miss
			$('#p'+nextTargetedCell).addClass('miss');
			pBoard.uncheckedCells = pBoard.uncheckedCells.without(nextTargetedCell);
			if (hitChain.length > 1) {
				nextMove = getNextMoveFromChain();
			}
			else if (hitChain.length === 1) {
				var surroundingCells = getAdjacentCells(hitChain[0]);
				if (surroundingCells.length > 0) {
					nextMove = surroundingCells.getRandomElem();
				} else clearTargetingData();
			}
		}
	}
	else hunt();
}

function computerWon() {
	return pBoard.hitCells.length === 17;
}
function playerWon() {
	return cBoard.hitCells.length === 17;
}
function gameOver() {
	return computerWon() || playerWon();
}
function displayGameOverPopup() {
	if (computerWon())
		$('body').append('<div class="game_over_popup" id="defeat"><p>You lose :/</p></div>');
	else
		$('body').append('<div class="game_over_popup" id="victory"><p>You win!</p></div>');
}

var gameOverPopupDisplayed = false;

$(document).ready(function() {
	//$('body').append('<div class="game_over_popup" id="defeat"><p>You lose :/</p></div>');
	for (var i=1; i<12; i++) { // iterate through numbers
		for (var j=1; j<12; j++) { // iterate through letters
			var letter = letters[j-1];
			var number = (i-1).toString();
			var label = letter.concat(number);
			var $playerCell = $('<div class="cell player"></div>').attr('id','p'+label);
			var $computerCell = $('<div class="cell computer"></div>').attr('id','c'+label);
			$('#playerGrid').append($playerCell);
			$('#computerGrid').append($computerCell);
			if (i === 1 || j === 1) {
				if (i === 1 && j === 1) {
					$playerCell.css('opacity','0.0');
					$computerCell.css('opacity','0.0');
				} else if (j === 1) {
					$playerCell.removeClass('player').addClass('label').html('<p>'+number+'</p>');
					$computerCell.removeClass('computer').addClass('label').html('<p>'+number+'</p>');
				} else if (i === 1) {
					$playerCell.removeClass('player').addClass('label').html('<p>'+letter+'</p>');
					$computerCell.removeClass('computer').addClass('label').html('<p>'+letter+'</p>');
				}
			}
		}
		$('#playerGrid').append('<br>');
		$('#computerGrid').append('<br>');
	}
	cBoard.placeRandomShips();
	pBoard.placeRandomShips();
	for (var shipType in pShips) {
		var ship = pShips[shipType];
		for (var i=0; i<ship.length; i++) {
			var cell = ship[i];
			$('#p'+cell).addClass('hidden');
		}
	}
	if (cheatMode) {
		for (var shipType in cShips) {
			var ship = cShips[shipType];
			for (var i=0; i<ship.length; i++) {
				var cell = ship[i];
				$('#c'+cell).addClass('hidden');
			}
		}
	}
	$('.computer').hover(
		function() {
			$(this).addClass('highlight');
		},
		function() {
			$(this).removeClass('highlight');
		}
	);
	$('.computer').click(function() {
		clickedCoord = $(this).attr('id').substring(1); // remove first 'c'
		if (!gameOver() && cBoard.uncheckedCells.contains(clickedCoord)) {
			
			if (cBoard.isAHit(clickedCoord)) {
				$(this).addClass('hit');
				cBoard.hitCells.push(clickedCoord);
			}
			else {
				$(this).addClass('miss');
			}
			if (cBoard.uncheckedCells.contains(clickedCoord)) {
				if ((hitChain.length > 0) && (nextMove !== ''))
					latch();
				else hunt();
				if (gameOver()) {
					displayGameOverPopup();
					gameOverPopupDisplayed = true;
				}
			}
			cBoard.uncheckedCells = cBoard.uncheckedCells.without(clickedCoord);
		}
		else if (gameOver() && !gameOverPopupDisplayed) {
			displayGameOverPopup();
			gameOverPopupDisplayed = true;
		}
	});
});