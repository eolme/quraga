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
  global.bus.emit('router:popstate', null, last);
});

export default router;
