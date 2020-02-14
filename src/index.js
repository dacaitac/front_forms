import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';


import 'bootstrap/dist/css/bootstrap.css'
import './global.css'
import NewEP from './pages/NewEP'

const container = document.getElementById('root');

ReactDOM.render(<NewEP/>, container);

serviceWorker.unregister()
