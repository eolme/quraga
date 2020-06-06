import context from '../utils/context';
import global from '../utils/global';

const router = {
  state: null,
  push(name) {
    router.state = name;
    window.history.pushState(name, name);
  },
  replace(name) {
    router.state = name;
    window.history.replaceState(name, name);
  },
  back() {
    window.history.back();
  }
};

window.addEventListener('popstate', (e) => {
  const last = router.state;
  router.state = e.state;
  setTimeout(() => {
    global.bus.emit('router:popstate', last);
  }, 0);
});

if (process.env.NODE_ENV !== 'production') {
  context.$router = router;
}

export default router;
