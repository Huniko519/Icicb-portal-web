import React from 'react'; 
import useWallet, {getError} from '../../useWallet';
import logo from '../../assets/logo.png';  
import './index.scss' ;
import { Link } from 'react-router-dom';

interface PincodeStatus { 
	number1 : string
	number2 : string
	number3 : string
	number4 : string
	number5 : string
	number6 : string 
	errmsg : string
	success : string
}

const Pincode = () => {
	const {call, update, loading} = useWallet();
	const [status, setStatus] = React.useState<PincodeStatus>({ 
		number1:'',
		number2:'',
		number3:'',
		number4:'',
		number5:'',
		number6:'', 
		errmsg :  '',
		success: ''
	}) 
	
	const refNumber1 = React.useRef<HTMLInputElement>(null) 
	const refNumber2 = React.useRef<HTMLInputElement>(null) 
	const refNumber3 = React.useRef<HTMLInputElement>(null) 
	const refNumber4 = React.useRef<HTMLInputElement>(null) 
	const refNumber5 = React.useRef<HTMLInputElement>(null) 
	const refNumber6 = React.useRef<HTMLInputElement>(null) 
	
	const updateStatus = (params : {[key : string] : string|number|boolean}) => setStatus({...status, ...params}) 


	
	const updateNumber = (value, key) => {
		if(isNaN(parseInt(value))) return;
		if(value.length>1) value=value.substring(0, 1);
		switch(key){
			case 1: updateStatus({number1:value}); refNumber2?.current?.focus(); refNumber2?.current?.select(); break;
			case 2: updateStatus({number2:value}); refNumber3?.current?.focus(); refNumber3?.current?.select(); break;
			case 3: updateStatus({number3:value}); refNumber4?.current?.focus(); refNumber4?.current?.select(); break;
			case 4: updateStatus({number4:value}); refNumber5?.current?.focus(); refNumber5?.current?.select(); break;
			case 5: updateStatus({number5:value}); refNumber6?.current?.focus(); refNumber6?.current?.select(); break;
			case 6: updateStatus({number6:value}); refNumber1?.current?.focus(); refNumber1?.current?.select(); break;
		}
	}

	const submit = async () => {
		if (loading) return;
		const code=status.number1+status.number2+status.number3+status.number4+status.number5+status.number6;
		if(code.length!=6){updateStatus({errmsg : 'Invalid pincode', success: ''}); return;}
		update({loading : true})
		const result = await call("/set-pincode", {code})
		if (result !== null) {
			if(result.error !== undefined) {
				updateStatus({errmsg : getError(result.error), success : ''})
			} else { 
				updateStatus({success : 'Your pincode is changed.', errmsg:''})
			}
		} else {
			updateStatus({errmsg : getError(0), success : ''})
		}
		update({loading: false}) 
	}
	

	return (
		<div className="container auth">   
			<div className="panel" style = {{transform:'translateY(100px)'}}>
				<div style = {{textAlign : "center"}}> 
					<img src = {logo} style = {{maxWidth : 100}} alt="bg" />
				</div>
				<h3 style = {{textAlign : "center", margin : 20}}>Set your pin code</h3> 
				<p style = {{textAlign : "center", margin : 20}}>Will be required when making a transaction</p> 
				
				<div  className="justify" >
					<input type="number" ref = {refNumber1} className="pin-input" max = {9} min = {0} placeholder="-" value = {status.number1} onChange = {e=>updateNumber(e.target.value, 1)}></input>  
					<input type="number" ref = {refNumber2} className="pin-input" max = {9} min = {0} placeholder="-" value = {status.number2} onChange = {e=>updateNumber(e.target.value, 2)}></input>  
					<input type="number" ref = {refNumber3} className="pin-input" max = {9} min = {0} placeholder="-" value = {status.number3} onChange = {e=>updateNumber(e.target.value, 3)}></input>  
					<input type="number" ref = {refNumber4} className="pin-input" max = {9} min = {0} placeholder="-" value = {status.number4} onChange = {e=>updateNumber(e.target.value, 4)}></input>  
					<input type="number" ref = {refNumber5} className="pin-input" max = {9} min = {0} placeholder="-" value = {status.number5} onChange = {e=>updateNumber(e.target.value, 5)}></input>  
					<input type="number" ref = {refNumber6} className="pin-input" max = {9} min = {0} placeholder="-" value = {status.number6} onChange = {e=>updateNumber(e.target.value, 6)}></input>  
					
				</div> 
				<div style = {{color : 'red'}}>
						<h3 style = {{textAlign : 'center'}}>{status.errmsg}</h3>
				</div>
				<div style = {{color : 'green'}}>
					<h3 style = {{textAlign : 'center'}}>{status.success}</h3>
				</div>
				{status.success ? (
					<div className="title flex middle mt2">
						<Link className="submit w100 flex middle center" to="/dashboard" onClick={()=>{update({currentPage:'dashboard'})}}>
							Go to Dashboard
						</Link> 
					</div> 
				) : (
					<div className="title flex middle mt2">
						<button className="submit w100 flex middle center" onClick = {submit}>
							Save
						</button> 
					</div> 
				)}
				
			</div> 
		</div>
	)
};

export default Pincode;