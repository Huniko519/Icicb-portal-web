import React from 'react';
import Layout from '../Layout'; 
import useWallet, {NF, getError} from '../../useWallet';  
import  './voucher.scss'; 

interface VoucherStatus {
	code :  string 
	errmsg :  string
	success :  string
}

const Voucher = () => { 
	const {loading, call, update} = useWallet();  
	const [status, setStatus] = React.useState<VoucherStatus>({ 
		code :  '',
		errmsg :  '',
		success :  ''
	})
	const refVoucher = React.useRef<HTMLInputElement>(null);
	const updateStatus = (params : {[key : string] : string|number|boolean}) => setStatus({...status, ...params})
   
	const submit = async () => {
		if (status.code=="") {
			updateStatus({errmsg :"Please input voucher code", success: ''}); 
			refVoucher.current?.focus();
			refVoucher.current?.select();
			return
		}
		update({loading:true})
		updateStatus({errmsg: '', success: ''})
		const result = await call("/set-voucher", {code:status.code})
		if (result !== null) {
			if(result.error !== undefined) {
				updateStatus({errmsg : getError(result.error), success: ''})
			} else {
				updateStatus({errmsg : '', success : 'Voucher code sent successfuly.'})
			}
		} else {
			updateStatus({errmsg : getError(0), success: ''})
		}
		update({loading:false})
	}

	return (
		<Layout> 
			<div className="container voucher">
				<div className='voucher-panel'> 
					<div style = {{textAlign	 : "center"}}>
						<h1>ICICB  <i>Voucher</i></h1> 
					</div>
					<input type="text" ref={refVoucher} pattern="[0-9]" placeholder='Please input voucher code' className='input-token w100' value = {status.code} onChange = {(e)=>{updateStatus({code : e.target.value})}} />
					<div style = {{color : 'red', textAlign : 'center', marginTop :  30}}>
						{status.errmsg}
					</div>
					<div style = {{color : 'green', textAlign : 'center', marginTop :  30}}>
						{status.success}
					</div>
					<div className="title flex  mt3 center">
						<button onClick = {submit} className="submit" style = {{width : 200, padding : 15}} >Submit</button> 
					</div>
				</div>
				<div className='col-md-4 col-sm-12'> </div>
			</div> 
		</Layout>
	)
};

export default Voucher;