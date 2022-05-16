import React from 'react'; 
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useWallet, {now} from './useWallet';

import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import Reset from './Pages/Auth/Reset';
import Pincode from './Pages/Auth/Pincode';
import Dashboard from './Pages/Home/Dashboard'; 
import Presale from './Pages/Home/Presale'; 
import Voucher from './Pages/Home/Voucher'; 
import Transaction from './Pages/Home/Transactions'; 
import Setting from './Pages/Home/Settings';  
import Loading from './components/Loading';

function App() {
	const {user, updated, loading, call, update, isPublic} = useWallet();

	const getNewTxs = async () => {
		const result = await call("/new-txs")
		if (result !== null && result.result) {
			update({ ...result.result, updated:now() })
		}
	}

	React.useEffect(() => {
		if (user !== null) {
			if (updated===0) {
				getNewTxs()
			} else {
				let timer = setTimeout(getNewTxs, 5000)
				return () => (timer && clearTimeout(timer))
			}
		}
	})

	return (
		<BrowserRouter>
			<Switch>
				<Route exact path="/" component = {user === null ? Login : Dashboard}></Route>
				<Route exact path="/register" component = {Register}></Route>
				<Route exact path="/reset-password" component = {Reset}></Route>
				<Route exact path="/reset-pincode" component = {Pincode}></Route>
				{user===null ? null : (
					<>
						<Route exact path="/dashboard" component = {Dashboard}></Route>
						<Route exact path="/setting" component = {Setting}></Route>
						<Route exact path="/presale" component = {Presale}></Route>
						{isPublic ? null : <Route exact path="/voucher" component = {Voucher}></Route>}
						<Route exact path="/transaction" component = {Transaction}></Route>  
					</>
				)}
				<Route path="*" component = {Login}></Route>
			</Switch>
			<ToastContainer />
			<Loading type="bars" width={100} height={100} color={"#c2ab81"} opacity={0.4} show={!!loading}/>
		</BrowserRouter>
	)
}

export default App;
