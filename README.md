git-dev-score
=============

Compare yourself to other developers.  Find a developer based on the code they've written.

<p>A simple concept app which aims to read your public and (authorization pending) private repo info and respond with a developer score based on many GIT factors like quantity of code contributions, repositories committed to etc.</p>

<h4>Install</h4>
<p>1.  In the root git-dev-score directory, install npm dev-dependencies from the package.json file.</p>
<code>sudo npm install</code>
<p>2.  In the root git-dev-score directory, Install bower components from the bower.json file.</p>
<code>bower install</code>

<h4>Run the Development Server</h4>
<p>The development server automatically handles updating pages being served.  This is for development only.  From the root directory, run</p>
<code>grunt</code>

<h4>Testing</h4>
<p>Currently Mocha is used for backend test, while Karma is used for front-end testing</p>
<p>To run all test simply run</p>
<code>npm test</code>

<h4>Production Server</h4>
<code>sudo node server.js</code>
