let output;

let socket;

let reviewSet;

let selectedWord = '';

let userStopWords = [];

let currentReviewList;
let shownReviews = [0, 0, 0];
let shownWords = 0;

// Entry point for the client 
function setup() {
  // p5.js default creates a canvas
  noCanvas();

  // Connect to either the deployed server or the local server
  socket = io.connect('https://secret-everglades-62910.herokuapp.com');

  // Handle server responses
  socket.on('reviewResponse', serverResponded);
  socket.on('reviewError', serverRespondedError);

  // Status for the user
  output = select('#output');
}

// Handle the response
function serverResponded(data) {
  console.log(data);
  if (data && data.reviews && data.reviews.reviews.length > 0) {
    reviewSet = data.reviews;

    // Hands it off to analysis.js
    startAnalysis();

    output.html('');
  } else {
    output.html('No reviews found');
  }
}

// Handle error from the server
function serverRespondedError(error) {
  console.log(error);
  output.html('Server encountered an error retrieving reviews. Check console for error.');
}

// Called every tick. Populates the concordance and reviews if they have not loaded
function draw() {
  if (analyzed) {
    if (currentReviewList && shownReviews[sortType] < currentReviewList.length) {
      let div = currentReviewList[shownReviews[sortType]];
      if (reviewContainsWord(div, selectedWord)) {
        div.style('display', 'block');
      }
      shownReviews[sortType]++;
    }
    for (let i = 0; i < 10; i++) {
      if (wordSpans && shownWords < wordSpans.length && shownWords < maxWords) {
        let ws = wordSpans[shownWords];
        ws.style('display', 'inline');
        shownWords++;
      }
    }
  }
}
