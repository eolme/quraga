import axios from 'axios';

axios.defaults.timeout = 0;
axios.defaults.timeoutErrorMessage = 'Network Error';

export default axios;
