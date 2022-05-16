import React from 'react'; 
import {Link} from "react-router-dom";
import useWallet, {getError, validateEmail} from '../../useWallet';
import './index.scss' ;
import logo from '../../assets/logo.png';  
 
interface ResetStatus { 
	email :  string 
	errmsg : string
	success : boolean
}

const Reset = () => {
	const {loading, call, update} = useWallet();
	const [status, setStatus] = React.useState<ResetStatus>({ 
		email : '',
		errmsg :  '',
		success: false
	}) 
	const refEmail = React.useRef<HTMLInputElement>(null) 
	const updateStatus = (params : {[key : string] : string|number|boolean}) => setStatus({...status, ...params}) 

	const submit = async () => {
		if (loading) return;
		updateStatus({errmsg : ''})
		if (validateEmail(status.email) === false) {
			updateStatus({errmsg : 'Invalid email address'})
			refEmail?.current?.select();
			refEmail?.current?.focus();
			return;
		}
		update({loading:true})
		const result = await call("/reset-password", {email:status.email})
		if (result !== null) {
			if(result.error !== undefined) {
				updateStatus({errmsg : getError(result.error)})
			} else { 
				updateStatus({success : true})
			}
		} else {
			updateStatus({errmsg : getError(0)})
		}
		update({loading:false})
	}
	
	return ( 
		<div className="container auth">   
			<div className="panel" style = {{transform:'translateY(100px)'}}>
				<div style = {{textAlign : "center"}}> 
					<img src = {logo} style = {{maxWidth : 100}} alt="bg" />
				</div>
				<h3 style = {{textAlign : "center", margin : 20}}>Forgot Password</h3> 
				{status.success ? (
					<div style={{marginTop:30, color:'green'}}>
						<div>Your request has been sent successfully.</div>
						<div>Please check your email.</div>
						<div>If you couldn't find it, please check in the [spam] inbox.</div>
						<div>Don't forget to click [Looks safe] button.</div>
					</div>
				) : (
					<>
						<p>Email</p> 
						<input type="text" ref = {refEmail} className="w100 input" placeholder="yourmail@mail.com" value = {status.email} onChange = {e=>updateStatus({email : e.target.value})}></input>  
			
						<div style = {{color : 'red'}}>
							<h3 style = {{textAlign : 'center'}}>{status.errmsg}</h3>
						</div>
						<div style = {{color : 'green'}}>
							<h3 style = {{textAlign : 'center'}}>{status.success}</h3>
						</div>
						<div className="title flex middle mt2">
							<button className="submit w100 flex middle center" onClick = {submit}>
								Submit
							</button> 
						</div>
					</>
				)}
				<Link className="title flex middle center mt5" to="/login">
					<span style = {{color : "#bfca23ec"}}>Back to Login</span>
				</Link>
			</div> 
		</div>
	)
};

export default Reset;