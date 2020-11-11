import buildClient from '../api/build-client';
// when nextjs boots up, it searches for pages directory
// nextjs interprets file names within pages directory and map them to file paths in browser

const LandingPage = ({ currentUser }) => {
  return <h1>You are {currentUser ? 'signed in' : 'not signed in'}</h1>;
};

LandingPage.getInitialProps = async (context) => {
  console.log('LANDING PAGE!');
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');

  return data;
};

export default LandingPage;

/*
****************** Overview on Server Side Rendering ******************
how we can decide whether we're signed in:
make request to auth-srv/api/users/currentuser 
- if res is null, not signed in
- else, we're signed in

Question is, when to make request?

We want to serve back a fully-loaded html page with data back to user on first render
- To do this, we must make the request while the app is being SSR by nextjs server

Must take a deeper look at nextjs SSR approach:

Nextjs render process -- when user in browser visits our app, ticketing.dev, Nextjs:
1) inspects url of req, determines set of components to show
2) for each component, calls component's getInitialProps static method
3) Renders each component with data from getInitialProps as props
4) Assembles HTML from all components, sends back response

Defining getInitialProps is our opportunity to fetch data this component needs
during this server side rendering process

After the server delivers fully-formed html to browser, the React app can then
send data requests as per usual. So the above applies to the server-side render process.

bottom line: to fetch data during SSR, define getInitialProps function for component

We cannot do data loading during SSR within component itself -- all components are
rendered just one time during SSR, so we CANNOT make req, wait for resp, update state

Sidenote: during SSR, since the component is rendered exactly once, a console.log in 
component will show up in server logs once

****************** Fetching Data During SSR ****************** 
So, we'll be fetching data during SSR via getInitialProps function outside component
- use axios, not our useRequest hook b/c hooks can only be called within a component
- we cannot fetch data within a component during SSR, rather, we use getInitialProps: 
const response = await axios.get('/api/users/currentuser');
return response.data;

this won't work - nasty error, due to us using NextJS inside a k8s environment
to make this work, we'll have to change some config in next videos

however, if we try to request data within component: axios.get('/api/users/currentuser')
we see that our browser successfully makes the request (after react app mounted -
component's request not made during SSR)

So, when we make request from server during SSR (i.e. getInit..), it fails. 
From browser, after SSR, request is successful.

Obviously, to fit our goal of rendering data on SSR, so that user gets full html page
w/ data on first render, we'll have to get things to work on server

What's responsible for the different outcomes depending on request environment?

****************** Why the Error? ******************
how request works in browser:
- we type in ticketing.dev, request processed by cpu's host file, alias to localhost:80
- this port has been bound to by ingress nginx, who receives request and routes it
- ingress sends to client app, so nextjs SSR an html doc and sends back to us
- browser gets back fully-rendered html doc (of course, we didn't fetch data yet)
- browser boots up react app, then makes request for data @ '/api/users/currentuser'
notice, just included path, no domain! when we make a request w/o domain, browser
assumes you want to make request to current domain (ticketing.dev), and prepends domain to
request: 'ticketing.dev/api/users/currentuser'
- again, request processed by cpu's host file, alias to localhost:80, to ingress, which
routes to auth service, and we got a response from auth service

how request works in server (or why it failed):
- we type in ticketing.dev, request processed by cpu's host file, alias to localhost:80
- this port has been bound to by ingress nginx, who receives request and routes it
- ingress sends to client app, but this time, nextjs tries to fetch data during SSR
- this fetch, made in getInitialRequest, makes request @ '/api/users/currentuser'
we just included the path again, no domain! similar to browser, if you make an http
request without a domain, node networking layer assumes current domain (localhost:80)
- HOWEVER: we are running our nextjs app inside a container, which has own networking.
the request localhost:80/api/users/currentuser went to inside current container, for
which the route doesn't exist -> error!
- request never went to ingress-nginx, and thus never made it to auth service

****************** Two Possible Solutions ******************
Solution is to configure axios differently depending on whether env is browser or node

if in browser: 
configure axios to use baseURL of "" (continue to allow browser to auto-determine domain)

if in node: 
two different options:
option 2:
tell axios that if we're running inside next (during SSR), make sure baseURL is
the auth-service clusterip
- not great: requires nextjs code to know clusterip names of every ms (& routes) it reaches to

better -- option 1:
have nextjs reach out to ingress nginx, as it already has routing rules

Bit of a challenge with this approach:
- what domain are we making request to? 
- how to reach to ingress when already inside cluster?
- another wrinkle: browser's initial req may include cookie. our data req from next
during SSR must also include cookie. next doesn't auto-manage cookie.
- solve: extract cookie off initial browser req, include with data req during SSR

this is the challenge of SSR in a k8s cluster:
requests within the cluster to other services are difficult, especially req w/ cookies

****************** Cross Namespace Service Communication ******************
How do we make a request to ingress-nginx?

- Thinking back to k8s basics, when we want to make a data request from one pod to another 
pod's clusterip service: axios.get('http://auth-srv:3000/api/users/currentuser')
- however, this only works when the service we're requesting is within the same
namespace as pod where request is made

what is a namespace?
- something that exists in k8s world
- all the different objects we create are within a specific k8s namespace
- all the objects we've created are within the default namespace
- we can get all namespaces with kctl cmd: k get namespace
- there's another namespace called ingress-nginx - this is where we're trying to reach

We can't use simple style above to request service existing inside another namespace

Rather, cross namespace communication uses different pattern:
http://NAMEOFSERVICE.NAMESPACE.svc.cluster.local
So, in our example:
NAMESPACE: ingress-nginx
NAMEOFSERVICE: ???

When we type: k get services, we only get services in our default namespace
So, we need another kctl cmd to ask for services within ingress-nginx namespace:
k get services -n ingress-nginx
we see one service, with name ingress-nginx-controller

So, in our ex, to reach from client service to ingress service in another namespace:
http://ingress-nginx-controller.ingress-nginx.svc.cluster.local

Having to memorize ^ syntax is tough. Solution: create External Name Service
It just maps domain. Can set up an ENS that maps requests @ http://ingress-nginx-srv
to the complicated domain above. We won't do it in this project, but you can.

Now, we just need to ensure we pass along cookie as well

****************** When is getInitialProps called? ******************
So, wait, how do we know when a request is going to be executed in browser vs. in nextjs?
rule of thumb: 
- data request from a component always issued from browser
- data request from getInitialProps: might be executed on either browser or server, thus 
need to figure out our env so we can use the correct domain

getInitialProps is always executed during the SSR process
however, getInitialProps will also get executed in browser in one occasion

getInitialProps is executed on the server in following occasions:
- hard refresh of the page
- clicking link from different domain
- typing url into address bar

getInitialProps is executed on the browser in following occasion:
- navigating from one page to another while in the app

Sidenote: when gIP executed on browser, data req made before providing browser html, 
then browser ties data and html and returns full html.

So, outside of getInitialProps, our data requests can always omit domain
Inside getInitialProps, we have to check the env, and prepend request accordingly

rahul q: does this replace onMount data request?
- if user navigates directly to page, getInitialProps fired on server, returns data
as props to component
- if user navigates within app to page, getInitialProps fired on browser, returns data 
as props to component
- so, in either case, the data is provided by the time component is rendered, so rule is
  - fetch data in getInitialProps, set state if nec w/ data props in componentDidMount

****************** On the Server or the Browser ******************
Inside getInitialProps, we need to determine whether this function is being executed
on browser or server
LandingPage.getInitialProps = async() => {
  if (typeof window === 'undefined') {
    // we're on the server, so requests should be made to long url
  } else {
    // we're on the browser, so requests can omit base url
  }
}

****************** Specifying the Host ******************
- Issue with our server request: ingress is designed to catch requests to ticketing.dev
host, while our server makes no mention of this
- We can add this info as a second argument to axios request

const LandingPage = ({currentUser})=> {
  console.log(currentUser);
}

LandingPage.getInitialProps = async() => {
  if (typeof window === 'undefined') {
    // we're on the server, so requests should be made to long url
    const {data} = await axios.get(
      'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser',
      {
        headers: {
          Host: 'ticketing.dev',
        },
      }
    )
  } else {
    // we're on the browser, so requests can omit base url
    const {data} = await axios.get('/api/users/currentuser');
    return data;
  }
}

To test the else case (getInitialProps rendering on browser):
- need to navigate from one page to another while in app
- So, go to /auth/signup, sign up, which posts @ http://ticketing.dev/api/users/signup
on success, triggers get @ http://ticketing.dev/
- to construct a response, browser must first call getInitialProps, which executes 
@ http://ticketing.dev/api/users/currentuser, returns data as prop for our component
- browser finally responds to request for root with component w/ data props
Data successfully returned: {currentUser: {id: 'asdf', email: 'asdf@gmail.com'}}

In the if case (getInitialProps rendering on server):
- whenever a request comes into ingress-nginx, ingress-nginx must know which host we're
trying to reach, as it may have routing rules for multiple hosts
- in browser, data requests auto prepends host of ticketing.dev
- however, in server, there's no indication of host name ticketing.dev
- Thus, we must specify a 2nd argument: the host name, since we're not going through our
cpu's host file to trick ingress into thinking we're coming from ticketing.dev
Data succesfully returned: {currentUser: null}

Since our server doesn't auto-forward cookie on data request, we get back null!
- as mentioned earlier, must extract cookie from client req & include on data req

****************** Passing through the Cookies ******************
- whenever we have incoming request that will cause our next.js app to SSR and execute
data request, need to extract cookie and include on data request

- whenever getInitialProps is called on the server, it receives an argument object which
has property req, which has property headers that look like:

req.headers = {
  host: 'ticketing.dev',
  cookie: 'asdfasdf'
}

We can just forward this headers object as the 2nd arg to our data request:

LandingPage.getInitialProps = async ({req}) => {
  if (typeof window === 'undefined') {
    // we are on the server
    const {data} = await axios.get('http://crazy-long-url', {headers: req.headers})
  }
}

Now, looking at LandingPage.getInitialProps, it's pretty nasty
- don't want to have to worry about the following for every component that needs data
  - conditional env check
  - including complicated domain
  - forwarding headers

We'll extract into a reusable api function

****************** A Reusable API Client ******************
Extract getInitialProps logic into a separate file with helper fn buildClient
- this buildClient returns an axios client that is preconfigured w/ baseURL (depending
  on environment) and headers
- we should use buildClient whenever we want to make a request inside getInitialProps:

  const client = buildClient(context);
  const {data} = await client.get('/api/users/currentuser');
  return data;

  (context is the first arg to getInitialProps)
  
*/

/*
Summary:

Issue 1:
- sometimes, getInitialProps is fired from server, sometimes fired from browser
- server exists within a pod within k8s cluster, and its data requests default don't
go to ingress controller (unlike browser, whose requests always default @ ingress)

Solution 1:
- code inside getInitialProps must detect env, and make data request accordingly

requests from browser can use empty baseURL as domain (axios.get('/api/users/currentuser'))
requests from server (during SSR) default domain to same container, so we fix by 
specifying baseURL to reach out to ingress-nginx directly:
- when making a request from a microservice within one pod to a clusterip in k8s cluster,
and the clusterip is in a different namespace (as ingress-nginx is), follow:

Domain to use for Cross namespace communication pattern:
http://NAMEOFSERVICE.NAMESPACE.svc.cluster.local
so: axios.get('http://ingress-nginx-controller.ingress-nginx.svc.cluster.local')

Issue 2:
- Browser auto-forwards cookie on subsequent http requests, but node.js does not

Solution 2:
- getInitialProps in server env must extract cookie from initial browser req and 
include it on api req

Final Solution that solves both problems:
Create a helper fn buildClient that takes in the getInitialProps 1st argument and
returns an axios client that's prewired w/ appropriate baseURL and headers (to pass cookies)

We use this buildClient fn whenever we want to make a request inside getInitialProps:
 const client = buildClient(context);
  const {data} = await client.get('/api/users/currentuser');
  return data;

*/
