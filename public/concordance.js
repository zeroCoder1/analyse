let maxWords = 500;

let concordanceDiv;

let wordSpans = [];

let wordSearch;

let clear;

// Called by analysis.js to set all globals
function setConcordanceGlobals() {
    wordSearch = select('#concordanceInput');
    wordSearch.input(searchConcordance);

    clear = select('#clearConcordance');
    clear.mousePressed(clearSelection);

    concordanceDiv = select('#concordance');
}

// As user inputs text, filter the concordance
function searchConcordance() {
    let searchWord = wordSearch.value().toLowerCase();
    for (let i = 0; i < wordSpans.length; i++) {
        if ((searchWord.length === 0 && i > maxWords) || !wordSpans[i].html().startsWith(searchWord)) {
            wordSpans[i].style('display', 'none');
        } else {
            wordSpans[i].style('display', 'inline');
        }
    }
}

// Clear the concordance selection
function clearSelection() {
    selectedWord = '';
    for (ws of wordSpans) {
        if (ws != this) {
            setColor(ws, 'inherit');
        }
    }
    clear.style('display', 'none');
    showAllCurrentReviews();
    setAnalysisStats();
}

function highlight() {
    setColor(this, '#B8B8D1');
}

// Happens when a user clicks a word
function selectWord() {
    setColor(this, '#D7263D');
    selectedWord = this.elt.innerHTML.trim();
    for (ws of wordSpans) {
        if (ws != this) {
            setColor(ws, 'inherit');
        }
    }
    wordSearch.value('');
    searchConcordance();
    clear.style('display', 'block');
    filterReviewList();
    setWordStats();
}

function unhighlight() {
    setColor(this, 'inherit');
}

function setColor(span, color) {
    if (span.elt.innerHTML.trim() !== selectedWord) {
        span.style('color', color);
    }
}

// Creating concordance word spans
async function makeConcordance() {
    maxWords = min(reviewSet.wordsInOrder.length, maxWords);
    select('#concordanceWrapper').style('display', 'block');
    select('#concordanceSearch').style('display', 'flex');
    let minCount = reviewSet.concordance[reviewSet.wordsInOrder[maxWords - 1]];
    let maxCount = reviewSet.concordance[reviewSet.wordsInOrder[0]];
    for (let i = 0; i < reviewSet.wordsInOrder.length; i++) {
        let word = reviewSet.wordsInOrder[i];
        let show = i < maxWords;
        await makeConcordanceWord(word, minCount, maxCount, show);
    }
}

// Creating each span and added events
function makeConcordanceWord(word, minCount, maxCount, show) {
    let count = reviewSet.concordance[word];
    let size = map(count, minCount, maxCount, 12, 96);
    let wordSpan = createSpan(word + ' ');
    wordSpan.style('font-size', size + 'px');
    wordSpan.style('margin', '0px');
    wordSpan.style('cursor', 'pointer');
    wordSpan.style('display', 'none');
    wordSpan.parent(concordanceDiv);
    wordSpan.mouseOver(highlight);
    wordSpan.mousePressed(selectWord);
    wordSpan.mouseOut(unhighlight);
    wordSpans.push(wordSpan);
}

// Resetting all concordance variables and DOM elements
function resetConcordance() {
    for (wordSpan of wordSpans) {
        wordSpan.remove();
    }
    wordSpans.splice(0, wordSpans.length);
}