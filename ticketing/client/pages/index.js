import axios from 'axios';
// when nextjs boots up, it searches for pages directory
// nextjs interprets file names within pages directory and map them to file paths in browser

// big issue: need to detect whether we are signed in or not during SSR process so
// the first rendered page to the browser can have signed in/out

const LandingPage = ({ currentUser }) => {
  console.log(currentUser);
  return <h1>Landing Page</h1>;
};

LandingPage.getInitialProps = async () => {
  if (typeof window === 'undefined') {
    // we're on the server, so requests should be made to long url
    // last wrinkle: ingress-nginx doesn't know we're trying to reach ticketing.dev,
    // since we're not going through cpu host file like in browser
    const { data } = await axios.get(
      'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser',
      {
        headers: {
          Host: 'ticketing.dev',
        },
      }
    );
    return data;
  } else {
    // we're on the browser, so requests can omit base url
    const { data } = await axios.get('/api/users/currentuser');
    return data;
  }
};

export default LandingPage;

/*
** Overview on Server Side Rendering **
how we can decide whether we're signed in:
make request to auth-srv/api/users/currentuser -- if res is null, not signed in
Question is, when to make request?
We want to serve back a fully-loaded html page with data back to user on first render
To do this, we must make the request while the app is being SSR by nextjs server
Must take a deeper look at nextjs SSR approach:

Nextjs render process -- when user visits our app, ticketing.dev, in browser, Nextjs:
1) inspects url of req, determines set of components to show
2) for each component, calls component's getInitialProps static method
3) Renders each component with data from getInitialProps as props
4) Assembles HTML from all components, sends back response

Defining getInitialProps is our opportunity to fetch data this component needs
during this server side rendering process

After the server delivers fully-formed html to browser, the React app can then
send data requests as per usual. So the above applies to the server-side render process.

Long story short: to fetch data during SSR, define getInitialProps function in component

We cannot do data loading during SSR within component itself -- all components are
rendered just one time during SSR, so we CANNOT make req, wait for resp, update state

Also, during SSR, since the component is rendered exactly once, a console.log in 
component will show up in server logs once

** Fetching Data During SSR ** 
- use axios, not our useRequest hook b/c hooks can only be called within a component
- we cannot fetch data within a component during SSR, rather, we use getInitialProps: 
const response = await axios.get('/api/users/currentuser');
return response.data;

this won't work - nasty error, due to us using NextJS inside a k8s environment
to make this work, we'll have to change some config

however, if we try to request data within component: axios.get('/api/users/currentuser')
we see that our browser successfully makes the request (after react app mounted -
component's request not made during SSR)

So, when we make request from server (i.e. getInit..), it fails. From browser, it works.
Obviously, to fit our goal of rendering data on SSR, so that user gets full html page
w/ data on first render, we'll have to get things to work on server

What's responsible for the different outcomes depending on request environment?

** Why the Error? **
how request works in browser:
- we type in ticketing.dev, request processed by cpu's host file, alias to localhost:80
- this port has been bound to by ingress nginx, who receives request and routes it
- ingress sends to client app, so nextjs SSR an html doc and sends back to us
- browser gets back fully-rendered html doc (of course, we didn't fetch data yet)
- browser boots up react app, then makes request for data @ '/api/users/currentuser'
notice, just included path, no domain! when we make a request w/o domain, browser
assumes you want to make request to current domain (ticketing.dev), and modifies your
request to 'ticketing.dev/api/users/currentuser'
- again, request processed by cpu's host file, alias to localhost:80, to ingress, which
routes to auth service, and we got a response from auth service

how request works in server (or why it failed):
- we type in ticketing.dev, request processed by cpu's host file, alias to localhost:80
- this port has been bound to by ingress nginx, who receives request and routes it
- ingress sends to client app, but this time, nextjs tries to fetch data during SSR
- this fetch, made in getInitialRequest, makes request @ '/api/users/currentuser'
we just included the path again, no domain! similar to browser, if you make an http
request without a domain, node assumes current domain (localhost:80)
- HOWEVER: we are running our nextjs app inside a container, which has own networking
the request localhost:80/api/users/currentuser went to inside current container, for
which the route doesn't exist -> error!
- request never went to ingress-nginx, and thus never made it to auth service

** Two Possible Solutions **
solution is to configure axios differently depending on whether env is browser or node

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

** Cross Namespace Service Communication **
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

** When is getInitialProps called? **
So, wait, how do we know when a request is going to be executed in browser vs. in nextjs?
rule of thumb: 
- request from a component always issued from browser
- request from getInitialProps: might be executed on either client or server, thus need
to figure out our env so we can use the correct domain

getInitialProps is always executed during the SSR process
however, getInitialProps will also get executed in browser under particular occasions

getInitialProps is executed on the server in following occasions:
- hard refresh of the page
- clicking link from different domain
- typing url into address bar

getInitialProps is executed on the client in following occasion:
- navigating from one page to another while in the app

So, outside of getInitialProps, our data requests can always omit domain
Inside getInitialProps, we have to check the env

** On the Server or the Browser **
Inside getInitialProps, we need to determine whether this function is being executed
on browser or server
LandingPage.getInitialProps = async() => {
  if (typeof window === 'undefined') {
    // we're on the server, so requests should be made to long url
  } else {
    // we're on the browser, so requests can omit base url
  }
}

** Specifying the Host **


*/

/*
summary of issue and solution:
requests from browser can use empty baseURL as domain (axios.get('/api/users/currentuser'))
requests from node (during SSR) default domain to same container, so we fix by 
specifying baseURL to reach out to ingress-nginx directly:
- when making a request from a microservice within one pod to a clusterip in k8s cluster,
and the clusterip is in a different namespace (as ingress-nginx is), follow:

Cross namespace communication pattern:
http://NAMEOFSERVICE.NAMESPACE.svc.cluster.local
so: axios.get('http://ingress-nginx-controller.ingress-nginx.svc.cluster.local')
*/
