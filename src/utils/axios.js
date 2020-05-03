import axios from 'axios';
import retry from 'axios-retry';

retry(axios, { retries: 3, shouldResetTimeout: true });

export default axios;
