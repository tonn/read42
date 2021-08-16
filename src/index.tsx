import React from 'react';
import ReactDOM from 'react-dom';
import ReactModal from 'react-modal';
import { App } from './App';
import './index.scss';
import * as serviceWorker from './serviceWorkerRegistration';
import './Store';
import 'bootstrap';

ReactDOM.render(<React.StrictMode><App /></React.StrictMode>,
  document.getElementById('root')
);

ReactModal.setAppElement(document.getElementById('root')!);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
