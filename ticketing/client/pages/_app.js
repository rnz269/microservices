// https://github.com/vercel/next.js/blob/master/errors/css-global.md
import 'bootstrap/dist/css/bootstrap.css';

/*
we want css on every page -- thus, we're importing global css into our nextjs project
We can only import global css in this _app.js file

The following function wors like this:
When a user visits a page in our nextjs app, nextjs will import relevant page component
But next doesn't just show this page -- rather, it wraps it inside its own custom
default component referred to as app. we defined _app so that nextjs passes relevant page
to this component as the Component prop. pageProps are the set of props we want to pass
to the page components.

This is the only file we're guaranteed to load up no matter which route user visits
Whereas, if user visits banana route, next won't parse index, so any css in index is moot
*/

export default ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};
