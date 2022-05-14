const express = require('express');
const docsRoute = require('./docs.route');


//import routes
const userRouter = require("../../app/users/user.route");
const authRouter = require("../../app/auth/auth.route");
const bookRouter = require("../../app/items/item.routes");
const genreRouter = require("../../app/genres/genre.route");


const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRouter,
  },
  {
    path: '/users',
    route: userRouter,
  },{
    path: '/books',
    route: bookRouter,
  },{
    path: '/genres',
    route: genreRouter,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
// if (isDevelopment()) {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
// }

module.exports = router;
