### Server-side Libraries
The server-side code is written using [Node] as the package manager. The modules used in the app are the following:

| Module | Use |
| ------ | --- |
| [Express] | Creates web application |
| [Socket.IO] | Allows for socket connections between the client and the server |
| [iTunes App Reviews] | Accesses iTunes Review API to pull reviews for a given app |
| [Google Play Scraper] | Scrapes the Google Play Store for reviews for a given app |
| [RiTa.js] | Performs text analysis for concordances for the reviews |

### Client-side Libraries
The client-side code is written using an JavaScript library called [p5.js] for ease of DOM manipulation and [Bootstrap] for styling. To communicate with the server, the client-side [Socket.IO] library is used. 

### Server-side Codebase

| File | Description |
| ---- | ----------- |
| [server.js] | Code to run the server and perform the analysis | 

### Client-side Codebase
The client-side code is located within the [public] folder

| File | Description |
| ---- | ----------- |
| [index.html] | HTML file used to include all libraries and create most elements of the page | 
| [sketch.js] | Entry point for the JS code that manages the flow of the app as a whole using [p5.js] methods | 
| [analysis.js] | Overarching analysis code that is responsible for the flow of the analysis, making the concordance, and creating the review list. | 
| [concordance.js] | Code responsible for making the concordance and handling events and searching | 
| [reviewlist.js] | Code responsible for making the lists of all reviews and filtering them | 
| [sorters.js] | Functions to sort reviews | 
| [style.css] | Custom CSS file to extend Bootstraps | 

## How to contribute
This project is open source and open to contribution from anyone. Review the **How to use** section to understand the codebase.

### Dependencies
- [Node.js]
- npm (included with Node)

### Setting up your local environment
1. Download and install [Node.js]
2. Clone the repo
3. Run `npm install`
4. Now you can run the app with `node server.js` (or any method for running node apps)
5. The default port for the app is `localhost:3000`

### References
- [p5.js Reference]
- [p5.js DOM Reference]
- [Bootstrap Reference]

<!-- Server-side External Links -->
[Node.js]: https://nodejs.org/en/download/ "Node.js" 
[Express]: https://expressjs.com/ "Express"
[Socket.IO]: https://socket.io/ "Socket.IO"
[iTunes App Reviews]: https://www.npmjs.com/package/itunes-app-reviews "iTunes App Reviews"
[Google Play Scraper]: https://www.npmjs.com/package/google-play-scraper "Google Play Scraper"
[RiTa.js]: https://rednoise.org/rita/ "RiTa.js"

<!-- Server-side Code -->
[server.js]: server.js

<!-- Client-side Links -->
[p5.js]: https://p5js.org/ "p5.js"
[Bootstrap]: https://getbootstrap.com/ "Bootstrap"
[p5.js Reference]: https://p5js.org/reference/ "p5.js Reference"
[p5.js DOM Reference]: https://p5js.org/reference/#/libraries/p5.dom "p5.js DOM Reference"
[Bootstrap Reference]: https://getbootstrap.com/docs/4.1/getting-started/introduction/ "Bootstrap Reference"

<!-- Client-side Code -->
[public]: public
[index.html]: public/index.html
[sketch.js]: public/sketch.js
[analysis.js]: public/analysis.js
[concordance.js]: public/concordance.js
[reviewlist.js]: public/reviewlist.js
[sorters.js]: public/sorters.js
[style.css]: public/style.css
