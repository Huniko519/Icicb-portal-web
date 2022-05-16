import React from 'react';
import useWallet, {getError} from '../../useWallet'; 
import  './InputCodeDialog.scss'; 

interface InputCodeDialogProps {
	onClose: Function
}
interface InputCodeDialogStatus {
	errmsg: string
	code: string
}

const InputCodeDialog = ({ onClose }: InputCodeDialogProps) => {
	const { call, user, update } = useWallet();

	const [status, setStatus] = React.useState<InputCodeDialogStatus>({
		errmsg: '',
		code: '',
	})

	const updateStatus = (params: {[key: string]: string|number|boolean}) => setStatus({...status, ...params})
	
	const submit = async () => {
		if (status.code.trim().length!==32) {
			updateStatus({errmsg :"Invalid presale code"});
			return
		}
		update({loading:true})
		updateStatus({errmsg: ''})
		const result = await call("/set-presale-code", {code: status.code})
		if (result !== null) {
			if(result.error !== undefined) {
				updateStatus({errmsg: getError(result.error)})
			} else {
				update({user:{...user, presale:true}, loading:false})
				onClose()
				return;
			}
		} else {
			updateStatus({errmsg: getError(0)})
		}
		update({loading:false})
	}

	return (
		<div className="modal">
			<div className="modal-overlay" ></div>
			<div className="modal-container">
				<div style={{textAlign:'right'}}>
					<a className="modal-close" onClick={()=>onClose()}>&times;</a>
				</div>
				<div className="input-code">
					{user && user.presale ? (
						<div style = {{color: 'green', textAlign: 'center', marginTop: 30}}>
							Presale code sent successfully
						</div>
					): (
						<>
							<input type="text" placeholder='Please input presale code' className='input-token w100 mt2' style={{padding:'14px 2em'}} value = {status.code} onChange = {(e)=>{updateStatus({code: e.target.value})}} />
							<div style = {{color: 'red', textAlign: 'center', marginTop: 20}}>
								{status.errmsg}
							</div>
						</>
					)}
					<div className="title flex  mt2 center">
						<button onClick = { submit } className="submit" style = {{ width: 200, padding: 15 }}>Submit</button> 
					</div>
				</div>
			</div>
		</div>
	)
}

export default InputCodeDialog