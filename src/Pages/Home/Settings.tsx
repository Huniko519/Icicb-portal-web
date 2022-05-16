import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../Layout';
import useWallet, {hmac256, getError} from '../../useWallet';
import './settings.scss' ;

const Settings = () => {
	const { loading, call, update } = useWallet();  
	const [status, setStatus] = React.useState({
		currentpass :  '',
		newpass1 :  '',
		newpass2 :  '',
		checked :  false,
		errmsg : '',
		success : ''
	})
	const updateStatus = (params : {[key : string] : string|number|boolean}) => setStatus({...status, ...params})

	const refInput1 = React.useRef<HTMLInputElement>(null)
	const refInput2 = React.useRef<HTMLInputElement>(null)
	const refInput3 = React.useRef<HTMLInputElement>(null)

	const submit = async () => {
		if (loading) return;
		updateStatus({errmsg : '', success : ''})
		if (status.currentpass.length<6 || status.currentpass.length>32) {
			updateStatus({errmsg : 'Invalid password length, expected 6 ~ 32 characters'})
			refInput1?.current?.select();
			refInput1?.current?.focus();
			return;
		}
		if (status.newpass1.length<6 || status.newpass1.length>32) {
			updateStatus({errmsg : 'Invalid password length, expected 6 ~ 32 characters'})
			refInput2?.current?.select();
			refInput2?.current?.focus();
			return;
		}	
		if (status.newpass2.length<6 || status.newpass2.length>32) {
			updateStatus({errmsg : 'Invalid password length, expected 6 ~ 32 characters'})
			refInput3?.current?.select();
			refInput3?.current?.focus();
			return;
		}
		if(status.newpass1!=status.newpass2){ 
			updateStatus({errmsg : 'Invalid confirm password', success: ''})
			refInput3?.current?.select();
			refInput3?.current?.focus();
			return;
		}
		update({loading:true})
		const oldpass = await hmac256(status.currentpass);
		const newpass = await hmac256(status.newpass1);
		await new Promise(resolve=>setTimeout(resolve, 1000))
		const result = await call("/change-password", {oldpass, newpass})
		if (result !== null) {
			if(result.error !== undefined) {
				updateStatus({errmsg : getError(result.error), success : ''})
				refInput1?.current?.select();
				refInput1?.current?.focus();
			} else {
				updateStatus({success : 'New password changed successfuly', errmsg:''})
			}
		} else {
			updateStatus({errmsg : getError(0), success: ''})
		}
		update({loading:false})
	}

	return (
		<Layout>
			<div className='container setting'> 
				<h1>Update Password</h1>
				<p className='grey'> Current Password</p>
				<input  ref = {refInput1} className='input-text w100' type="password"  value = {status.currentpass} onChange = {e=>setStatus({...status, currentpass : e.target.value})}  placeholder='Current Password' />
				<p className='grey'> New Password</p>
				<input ref = {refInput2}  className='input-text w100' type="password"  value = {status.newpass1} onChange = {e=>setStatus({...status, newpass1 : e.target.value})}  placeholder='New Password' />
				<p className='grey'> Confirm Password</p>
				<input  ref = {refInput3}  className='input-text w100' type="password"  value = {status.newpass2} onChange = {e=>setStatus({...status, newpass2 : e.target.value})} placeholder='Confirm Password' /> 
				
				<div style = {{color : 'red'}}>
					<h3>{status.errmsg}</h3>
				</div>
				<div style = {{color : 'green'}}>
					<h3>{status.success}</h3>
				</div>
				<button className="submit" onClick = {submit}>
					Update
				</button> 
				<br/><br/>
				<h1>Reset pincode</h1>
				<div>
					<Link className="submit" to="/reset-pincode">Reset pincode</Link> 
				</div>
			</div>
		</Layout>
	)
};

export default Settings;