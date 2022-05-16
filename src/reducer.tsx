import { createSlice } from '@reduxjs/toolkit';

const appKey = process.env.REACT_APP_GTAG + '-config'

const locales = {
    "en-US": require('./locales/en-US.json'),
    "zh-CN": require('./locales/zh-CN.json'),
};

const lang = window.localStorage.getItem('lang') || 'en-US';

const initialState: WalletTypes = {
	lang,
    L: locales[lang],
	currentPage: '',
	updated: 0, 
	isPublic: false,
	user: null,
	
	balances:{},
	wallets: {},
	prices:  {},
	logs: 	 {},
	txs: 	 []
}

const getStore = (initialState:any) => {
	try {
		const buf = window.localStorage.getItem(appKey)

		if (buf) {
			const json = JSON.parse(buf)
			for(let k in json) {
				if (initialState[k] !== undefined) {
					initialState[k] = json[k]
				}
			}
		}
		initialState.isPublic = window.location.hostname.indexOf('portal.')===0;// || window.location.hostname==="localhost"
	} catch (err) {
		console.log(err)
	}
	return initialState
}

const setStore = (state:any) => {
	window.localStorage.setItem(appKey, JSON.stringify(state))
}


export default createSlice({
	name: 'bridge',
	initialState: getStore(initialState),
	reducers: {
		update: (state:any, action) => {
			for (const k in action.payload) {
				if (state[k]  ===  undefined) new Error('🦊 undefined account item')
				state[k] = action.payload[k]
			}
			setStore(state)
		}
	}
})
