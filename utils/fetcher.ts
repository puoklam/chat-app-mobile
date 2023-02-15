const HOST = "6668-2400-8902-00-f03c-93ff-fe24-c310.jp.ngrok.io";
const BASE_URL = `https://${HOST}/`;

type fetchFn = (endpoint: string, init?: RequestInit) => Promise<Response>;

const initialize = (endpoint: string, method: string, init?: RequestInit) => {
  if (endpoint.length > 0 && endpoint[0] === "/") endpoint = endpoint.substring(1);
  init = {
    method,
    credentials: "include",
    ...init,
    headers: {
      "True-Client-IP": "mobile",
      ...init?.headers
    }
  };
  if (init.method?.toUpperCase() !== method.toUpperCase()) throw new Error("method not match");
  return { endpoint, init };
};

const get: fetchFn = async (endpoint, init) => {
  const r = initialize(endpoint, "GET", init);
  return fetch(BASE_URL + r.endpoint, r.init);
};

const post: fetchFn = async (endpoint, init) => {
  const r = initialize(endpoint, "POST", init);
  return fetch(BASE_URL + r.endpoint, r.init);
};

const put: fetchFn = async (endpoint, init) => {
  const r = initialize(endpoint, "PUT", init);
  return fetch(BASE_URL + r.endpoint, r.init);
};

const patch: fetchFn = async (endpoint, init) => {
  const r = initialize(endpoint, "PATCH", init);
  return fetch(BASE_URL + r.endpoint, r.init);
};

const ws = (endpoint: string) => {
  const socket = new WebSocket(`wss://${HOST}`, [], {
    headers: {
      "True-Client-IP": "mobile"
    }
  });
  return socket;
}

const fetcher = {
  get,
  post,
  put,
  patch,
  ws
};

export default fetcher;

export {
  fetcher
};


// "infoPlist": {
//   "NSAppTransportSecurity" : {
//     "NSAllowsArbitraryLoads" : true,
//     "NSExceptionDomains": {
//       "localhost:8080": {
//         "NSExceptionAllowsInsecureHTTPLoads": true
//       },
//       "localhost": {
//         "NSExceptionAllowsInsecureHTTPLoads": true
//       },
//       "192.46.226.49": {
//         "NSExceptionAllowsInsecureHTTPLoads": true
//       },
//       "192.46.226.49:8080": {
//         "NSExceptionAllowsInsecureHTTPLoads": true
//       }
//     }
//   }
// }

// https://stackoverflow.com/questions/38418998/react-native-fetch-network-request-failed
// https://github.com/facebook/react-native/issues/25597
// https://stackoverflow.com/questions/45547406/fetch-or-axios-in-react-native-not-working-for-expo-for-ios-apps
// https://stackoverflow.com/questions/57318120/how-can-i-configure-app-json-to-accept-all-connection-types-such-as-http-request
// https://dsinecos.github.io/blog/How-to-call-a-locally-hosted-server-from-expo-app
// https://forums.expo.dev/t/can-expo-get-a-connection-from-localhost-my-local-server-using-expo-xde/3885/2
// https://jsshowcase.com/question/react-native-fetch-https-localhost-network-request-failed