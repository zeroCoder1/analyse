// Sort by review date
function dateSorter(a, b) {
    let aDate = new Date(a.date);
    let bDate = new Date(b.date);
    return bDate - aDate;
}

// Sort by review rating positive first
function goodReviewSorter(a, b) {
    let diff = b.rating - a.rating;
    if (diff === 0) {
        return dateSorter(a, b);
    }
    return diff;
}

// Sort by review rating negative first
function badReviewSorter(a, b) {
    let diff = a.rating - b.rating;
    if (diff === 0) {
        return dateSorter(a, b);
    }
    return diff;
}