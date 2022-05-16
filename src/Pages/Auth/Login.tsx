import React from 'react'; 
import {Link, useHistory} from "react-router-dom"; 
import './index.scss' ;
import logo from '../../assets/logo.png'; 
import useWallet, {hmac256, getError, validateUsername, validateEmail} from '../../useWallet';

interface LoginStatus {
	username :  string
	password :  string
	errmsg :  string
}

const Login = () => {
	const {call, update, loading} = useWallet();
	const [status, setStatus] = React.useState<LoginStatus>({
		username :  '',
		password :  '',
		errmsg :  ''
	})
	const refUsername = React.useRef<HTMLInputElement>(null)
	const refPassword = React.useRef<HTMLInputElement>(null)
	const updateStatus = (params : {[key : string] : string|number|boolean}) => setStatus({...status, ...params}) 
	const history = useHistory()
	const submit = async () => {
		if (loading) return;
		updateStatus({errmsg : ''})
		if (validateEmail(status.username) === false && validateUsername(status.username) === false) {
			updateStatus({errmsg : getError(1001)})
			refUsername?.current?.select();
			refUsername?.current?.focus();
			return;
		}
		if (status.password.length<6 || status.password.length>32) {
			updateStatus({errmsg : 'Invalid password length, expected 6 ~ 32 characters'})
			refPassword?.current?.select();
			refPassword?.current?.focus();
			return;
		}
		update({loading:true})
		const password = await hmac256(status.password);  
		const result = await call("/login", {username : status.username, password})
		if (result !== null) {
			if(result.error !== undefined) {
				updateStatus({errmsg : getError(result.error)})
				if(result.error===1004) { refUsername.current?.focus(); refUsername.current?.select(); }
				else {refPassword.current?.focus(); refPassword.current?.select();}
			} else {
				const user = result.result as LoginResponseType
				update({user, currentPage : 'dashboard', loading:false})
				if (user.pinCode) {
					history.push("/dashboard")
				} else {
					history.push("/reset-pincode")
				}
				return
			}
		} else {
			updateStatus({errmsg : getError(0)})
		}
		update({loading:false})
	}

	return (
		<div className="container auth">   
			<div className="panel">
				<div style = {{textAlign : "center"}}> 
					<img src = {logo} style = {{maxWidth : 100}} alt="bg" />
				</div>
				<h3 style = {{textAlign : "center", margin : 20}}>Sign in your account</h3>
				<p>Username</p> 
				<input ref = {refUsername} type="text" value = {status.username} onChange = {e=>setStatus({...status, username : e.target.value})} className="w100 input" placeholder="username" onKeyPress={(event)=>{if(event.key == "Enter"){refPassword.current?.focus(); refPassword.current?.select();}}} />
				<p>password</p> 
				<input ref = {refPassword} type="password" value = {status.password} onChange = {e=>setStatus({...status, password : e.target.value})} className="w100 input" onKeyPress={(event)=>{if(event.key == "Enter"){submit()}}} />
				<div className='justify'>
					<p><input type="checkbox" id="checkbox"/><label htmlFor="checkbox">Remember my preferene</label> </p>
					<Link className="title flex middle" to="/reset-password">
						<p style = {{textDecoration : "underline", color : "#a7a7a7"}}>Forget password?</p>
					</Link>   
				</div>

				<div style = {{color : 'red'}}>
					<h3 style = {{textAlign : 'center'}}>{status.errmsg}</h3>
				</div>
				<div className="title flex middle mt2">
					<button className="submit w100 flex middle center" onClick = {submit}>
						Log in
					</button> 
				</div>
				<Link className="title flex middle mt3" to="/register">
					<p style = {{color : "#a7a7a7"}}>Don't have an account? <span style = {{color : "#bfca23ec"}}>Signup</span></p>
				</Link>   
			</div> 
		</div>
	)
};

export default Login;