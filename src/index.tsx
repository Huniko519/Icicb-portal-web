import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import reportWebVitals from './reportWebVitals';
import {configureStore} from '@reduxjs/toolkit';
import Slice from './reducer'
import './index.scss';

const store = configureStore({reducer: Slice.reducer});

ReactDOM.render(
	<Provider store = {store}>
		<React.StrictMode>
			<App />
		</React.StrictMode>
	</Provider>,
	document.getElementById('root')
);

reportWebVitals();
