cd ..
npm install express
npm install body-parser
npm install express-session
npm install cookie-parser
npm install mysql
npm install mkdirp
npm install async
patch -p0 node_modules/serve-static/index.js < tools/express.patch
