import React from 'react';
import {Link, useHistory} from "react-router-dom";
import useWallet, { getError, hmac256, validateEmail, validateUsername } from '../../useWallet';
import logo from '../../assets/logo.png'; 
import './index.scss' ;

interface RegisterStatus {
	username :  string
	email :  string
	password :  string
	errmsg :  string
}

const Register = () => {
	const {loading, call, update} = useWallet();
	const [status, setStatus] = React.useState<RegisterStatus>({
		username :  '',
		email : '',
		password :  '',
		errmsg :  ''
	})
	const history = useHistory()
	const refUsername = React.useRef<HTMLInputElement>(null)
	const refEmail = React.useRef<HTMLInputElement>(null)
	const refPassword = React.useRef<HTMLInputElement>(null)
	const updateStatus = (params : {[key : string] : string|number|boolean}) => setStatus({...status, ...params}) 
	const submit = async () => {
		if (loading) return; 
		let username = status.username;
		let email = status.email; 
		let password = status.password;
		updateStatus({errmsg : ''})
		if (validateUsername(username) === false) {
			updateStatus({errmsg : getError(1001)})
			refUsername?.current?.select();
			refUsername?.current?.focus();
			return;
		}
		if (validateEmail(email) === false) {
			updateStatus({errmsg : getError(1002)})
			refEmail?.current?.select();
			refEmail?.current?.focus();
			return;
		}

		if (password.length<6 || password.length>32) {
			updateStatus({errmsg : 'Invalid password length, expected 6 ~ 32 characters'})
			refPassword?.current?.select();
			refPassword?.current?.focus();
			return;
		}
		update({loading:true})
		password = await hmac256(password);
		const result = await call("/register", {username, email, password})
		if (result !== null) {
			if(result.error !== undefined){
				updateStatus({errmsg : getError(result.error)})
			} else {
				history.push('/')
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
				<h3 style = {{textAlign : "center", margin : 20}}>Sign up your account</h3>
				<p>Username</p>
				<input ref = {refUsername} type="text" value = {status.username} onChange = {e=>setStatus({...status, username : e.target.value})} className="w100 input" placeholder="name" onKeyPress={(event)=>{if(event.key == "Enter"){refEmail.current?.focus(); refEmail.current?.select();}}} />
				<p>Email</p>
				<input ref = {refEmail} type="text" value = {status.email} onChange = {e=>setStatus({...status, email : e.target.value})} className="w100 input" placeholder="yourmail@gmail.com" onKeyPress={(event)=>{if(event.key == "Enter"){refPassword.current?.focus(); refPassword.current?.select();}}}/>
				<p>Password</p>
				<input ref = {refPassword} type="password" value = {status.password} onChange = {e=>setStatus({...status, password : e.target.value})} className="w100 input"  onKeyPress={(event)=>{if(event.key == "Enter"){submit()}}}  />
				
				<div className = "errmsg">
						<h3 style = {{textAlign : 'center'}}>{status.errmsg}</h3>
				</div>
				<div className="title flex middle mt3">
					<button onClick = {submit} className="submit w100">Sign Up</button>
				</div>
				<Link className="title flex middle" to="/login">
					<p style = {{color : "#a7a7a7"}}>Already have an account? <span style = {{color : "#f1f5beeb"}}> Log in</span></p>
				</Link>
			</div>
		</div>
	)
};

export default Register;