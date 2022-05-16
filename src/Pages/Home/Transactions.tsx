import React from 'react'; 
import Layout from '../Layout';
import useWallet, {TF} from '../../useWallet';

/* import Networks from '../../config/networks.json' */
const networks = require('../../config/networks.json') as NetworkType

const Transactions = () => { 
	const {txs} = useWallet();   
	const [status, setStatus] = React.useState({
		pagenum :  0,
		total : txs.length
	})
	const goPrevious = () => {
		if(status.pagenum > 0) setStatus({...status, pagenum : status.pagenum-1}); 
	}
	const goNext = () => {
		if(status.pagenum < status.total / 15 -1) setStatus({...status, pagenum : status.pagenum+1});
	}
	return (
		<Layout>
			<div className='container txs'>    
				<h1>Recent transaction history</h1>
				<div className='row  hr'>
					<div className='col-md-3'>Time</div>
					<div className='col-md-3'>Address</div>
					<div className='col-md-3 right'>Amount</div>
					<div className='col-md-3 right'>Status</div>
				</div>
				{ 		
					txs.map((i, index) =>(
						(index >= status.pagenum * 15 && index < (status.pagenum + 1) * 15) && (
							<div className='row' key = {index}>
								<div className='col-md-3'><label>Time: </label>{TF(i.created)}</div>
								<div className='col-md-3'><label>Address: </label>{i.address.slice(0,10) + '...' + i.address.slice(-10)}</div>
								<div className='col-md-3 right'><label>Amount: </label>{i.amount} {i.coin.toUpperCase()}</div>
								<div className='col-md-3 right'><label>Status: </label>{i.confirmed ?'Success' : i.confirms + ' / ' + networks[i.chain].confirmations}</div>
							</div>
						)
					)) 
				}
				<div className="status-footer row">
					<div className="col-md-6">
						Showing {status.pagenum*15+1} to {status.total} of entrie
					</div>
					<div className="col-md-6">
						<button className='page-btn' onClick = {e => goPrevious()}>Previous</button>
						<button className='page-btn' onClick = {e => goNext()}>Next</button>
					</div>
				</div>
			</div>
		</Layout>
	)
};

export default Transactions;