let express = require('express');
let socket = require('socket.io');
let ItunesAppReviews = require('itunes-app-reviews');
let gplay = require('google-play-scraper');
let rita = require('rita');

// Set up server to listen on the 3000 port or the default for Heroku
let app = express();
let server = app.listen(process.env.PORT || 3000);

// Have the server display the client-side code from the public/ folder
app.use(express.static('public'));

console.log('server running');

// Create itunes review object
let iTunesAppReviews = new ItunesAppReviews();

// Open socket for connections
let io = socket(server);

// Event listener on connection
io.sockets.on('connection', function (socket) {
    console.log('new connection: ' + socket.id);

    // Set up ReviewSet object
    let reviewSet = new ReviewSet();

    // Current variables to prevent repeat api calls
    let currentITunesId = '';
    let currentGPlayId = '';

    // Stop words for RiTa concordance
    let userStopWords = [];

    // Limit for Google play scraper -> Google play scrapes a page at a time
    let pages = 15;
    let processedPages = 0;

    // Client requesting iTunes Reviews
    socket.on('iTunesReviewRequest', function (data) {
        console.log('itunes requested');
        userStopWords = data.userStopWords;
        if (data.id === currentITunesId) {
            console.log('analyze');
            analyzeReviews();
            socket.emit('reviewResponse', { reviews: reviewSet });
        } else {
            currentITunesId = data.id;
            reviewSet.setDefaults();
            iTunesAppReviews.getReviews(data.id, 'in', 10);
        }
    });

    // Client requesting Google Play reviews
    socket.on('googlePlayReviewRequest', function (data) {
        console.log('gplay requested');
        userStopWords = data.userStopWords;
        if (data.id === currentGPlayId) {
            console.log('analyze');
            analyzeReviews();
            socket.emit('reviewResponse', { reviews: reviewSet });
        } else {
            currentGPlayId = data.id;
            reviewSet.setDefaults();
            processedPages = 0;
            for (let i = 0; i < pages; i++) {
                gplay.reviews({
                    appId: data.id,
                    page: i
                }).then(gplayReviews, reviewError);
            }
        }
    });

    // Client can request to reanalyze data
    socket.on('analyzeReviews', function (data) {
        userStopWords = data.userStopWords;
        analyzeReviews();
        socket.emit('reviewResponse', { reviews: reviewSet });
    });

    // Callback for Google Play reviews
    function gplayReviews(reviews) {
        console.log(reviews.length);
        reviews.forEach(r => {
            let reviewText = r.title + ' ' + r.text + ' ';
            reviewSet.allText += reviewText;

            let newReview = new Review(r.userName, r.title, r.text, r.score, null, r.date);
            reviewSet.reviews.push(newReview);
        });
        processedPages++;

        if (processedPages === pages) {
            analyzeReviews();
            socket.emit('reviewResponse', { reviews: reviewSet });
            console.log('Got data');
        }
    }

    // Callback on error
    function reviewError(error) {
        console.log(error);
        socket.emit('reviewError', { error: error.status });
    }

    // iTunes callback on success
    iTunesAppReviews.on('data', function (reviews) {
        console.log(reviews.length);
        reviews.forEach(r => {
            let reviewText = r.title[0] + ' ' + r.content[0]._ + ' ';
            reviewSet.allText += reviewText;

            let newReview = new Review(r.author[0].name[0], r.title[0], r.content[0]._, r['im:rating'][0], r['im:version'][0], r.updated[0])
            reviewSet.reviews.push(newReview);
        });
        analyzeReviews();
        socket.emit('reviewResponse', { reviews: reviewSet });
        console.log('Got data');
    });

    // iTunes error callback
    iTunesAppReviews.on('error', function (err) {
        console.log(err);
        reviewError(err);
    });

    // Analysis methods
    function analyzeReviews() {
        setAverageRating();
        setConcordance();
        setWordsInOrder();
        setWordReviewMap();
        setWordRatings();
    }

    // Sets the overall average rating of the app
    function setAverageRating() {
        let sum = reviewSet.reviews.reduce((acc, rev) => acc + parseInt(rev.rating), 0);
        reviewSet.avgRating = sum / reviewSet.reviews.length;
    }

    // Runs RiTa concordance for each review and then all of the reviews
    function setConcordance() {
        var args = {
            ignoreCase: true,
            ignorePunctuation: true,
            ignoreStopWords: true,
            wordsToIgnore: userStopWords
        };
        reviewSet.reviews.forEach(r => {
            r.concordance = rita.concordance(r.content + ' ' + r.title, args);
        });

        reviewSet.concordance = rita.concordance(reviewSet.allText, args);
    }

    // Gets list of words ordered by number appearances
    function setWordsInOrder() {
        reviewSet.wordsInOrder = Object.keys(reviewSet.concordance);
        reviewSet.wordsInOrder.sort((a, b) => reviewSet.concordance[b] - reviewSet.concordance[a]);
    }

    // Compiles list of reviews for each app
    function setWordReviewMap() {
        for (let word of Object.keys(reviewSet.concordance)) {
            reviewSet.wordReviewMap[word] = [];
            for (let i = 0; i < reviewSet.reviews.length; i++) {
                let rev = reviewSet.reviews[i];
                if (rev.concordance[word] > 0) {
                    reviewSet.wordReviewMap[word].push(i);
                }
            }
        }
    }

    // Accumulates average rating for each word
    function setWordRatings() {
        for (let word of Object.keys(reviewSet.concordance)) {
            let wordSum = 0;
            for (let rev of reviewSet.reviews) {
                if (rev.concordance[word] > 0) {
                    wordSum += parseInt(rev.rating);
                }
            }
            let reviewCount = reviewSet.wordReviewMap[word].length;
            reviewSet.wordRatings[word] = wordSum / reviewCount;
        }
    }

    // Handle disconnect
    socket.on('disconnect',
        function () {
            console.log('Client has disconnected');
        });
});

// Review object constructor
class Review {
    constructor(author, title, content, rating, version, date) {
        this.author = author;
        this.title = title;
        this.content = content;
        this.rating = rating;
        this.version = version;
        this.date = date;
        this.concordance = {};
    }
}

// ReviewSet constructor
class ReviewSet {
    constructor() {
        this.setDefaults();
    }

    setDefaults() {
        this.allText = '';
        this.avgRating = 0;
        this.reviews = [];
        this.concordance = {};
        this.wordsInOrder = [];
        this.wordReviewMap = {};
        this.wordRatings = {};
    }
}
