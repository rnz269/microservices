import buildClient from '../api/build-client';
// when nextjs boots up, it searches for pages directory
// nextjs interprets file names within pages directory and maps them to file paths in browser

const LandingPage = ({ currentUser }) => {
  return <h1>You are {currentUser ? 'signed in' : 'not signed in'}</h1>;
};

// gets info about currentUser, supplies to LandingPage as props
LandingPage.getInitialProps = async (context) => {
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');
  return data;
};

export default LandingPage;
