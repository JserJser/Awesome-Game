import store from '../store'
import router from '../router'
import _Vue from '../_config/main'

const SET_SESSION = (E, F) => sessionStorage.setItem(E, F);
const GET_SESSION = G => sessionStorage.getItem(G);
const DEL_SESSION = K => sessionStorage.removeItem(K);

const SET_LOCAL = (H, I) => localStorage.setItem(H, I);
const GET_LOCAL = J => localStorage.getItem(J);
const DEL_LOCAL = J => localStorage.removeItem(J);

const COMMIT = (STR, DATA) => {
  if (typeof STR == 'string') return store.commit(STR, DATA)
  if (typeof STR == 'object' && !_.isEmpty(STR)) {
    for (let key in STR) {
      store.commit(key, STR[key]);
    }
    return;
  }
};
const DISPATCH = (STR, DATA) => store.dispatch(STR, DATA);

const PUSH = URL => router.push(URL);
const PARAMS = () => _Vue.$route.params;
const ROUTE = () => _Vue.$route;;
const PATH = () => _Vue.$route.path;

export {
  SET_SESSION,
  GET_SESSION,
  DEL_SESSION,
  SET_LOCAL,
  GET_LOCAL,
  DEL_LOCAL,
  COMMIT,
  PUSH,
  DISPATCH,
  PARAMS,
  ROUTE,
  PATH,
};
