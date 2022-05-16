import React from 'react';
import Layout from '../Layout'; 
import useWallet, {NF, getError} from '../../useWallet'; 
import Icons from '../Assets'
import  './presale.scss'; 

import icicb from '../../assets/ICICB.svg';
import eth from '../../assets/ETH.svg';
import btc from '../../assets/BTC.svg';
import usdt from '../../assets/USDT.svg';
import bnb from '../../assets/BNB.svg';
import ltc from '../../assets/LTC.svg';
//dsfds
interface PresaleStatus {
	amount1 :  string
	amount2 :  string
	errmsg :  string
	success :  number 
	code : string
	/* presaleCode : boolean */
}

const coins = {
	icicb :  {
		name :  'ICICB',
		icon :  icicb
	},
	eth :  {
		name :  'ETH',
		icon :  eth
	},
	btc :  {
		name :  'BTC',
		icon :  btc
	},
	usdt :  {
		name :  'USDT',
		icon :  usdt
	},
	bnb :  {
		name :  'BNB',
		icon :  bnb
	},
	ltc :  {
		name :  'LTC',
		icon :  ltc
	},
} as {[coin : string] : {name : string, icon : string}}


const Presale = () => { 
	const { loading, prices, balances, call, T, user, update, updated, isPublic } = useWallet(); 
	const [tokens, setTokens] = React.useState<{token1 : string, token2 : string}>({
		token1 :  'eth',
		token2 :  'icicb'
	})
	const [status, setStatus] = React.useState<PresaleStatus>({
		amount1 :  '',
		amount2 :  '',
		errmsg :  '',
		success :  0, 
		code : '',
	})
	const updateStatus = (params : {[key : string] : string|number|boolean}) => setStatus({...status, ...params})
	
	const refDropMenu1 = React.useRef<HTMLDivElement>(null)
	const refDropMenu2 = React.useRef<HTMLDivElement>(null)
	const refInput1 = React.useRef<HTMLInputElement>(null)
	const refInput2 = React.useRef<HTMLInputElement>(null)
	
	const onToken = (token : string, isTarget : boolean) => {
		setTokens({...tokens, [isTarget?'token2' : 'token1'] : token})
		onValue(status.amount1, false)
		const drop = isTarget ? refDropMenu2  :  refDropMenu1
		if (drop && drop.current) {
			drop.current.style.display='none';
			setTimeout(()=>{
				if (drop?.current) drop.current.style.display=''
			},1000)
		}
	}
	const onValue = (value : string, isTarget : boolean) => {
		value = value.replace(/[^0-9.,]/g, '') 
		const coin = tokens.token1
		const target = tokens.token2
		if (!isTarget) {
			const t = (Number(value) || 0)
			const v = t * (prices[coin] / prices[tokens.token2])
			const amount2 = NF(v, 6)
			updateStatus({success : 0, amount1 : value, amount2, errmsg : t>balances[coin]?.balance ? T('msg.exceed', coins[coin].name)  :  ''})
		} else {
			const v = (Number(value) || 0) * (prices[target] / prices[coin])
			const amount1 = NF(v, 6)
			updateStatus({success : 0, amount2 : value, amount1, errmsg : v>balances[coin]?.balance ? T('msg.exceed', coins[coin].name)  :  ''})
		}
	}
	
	const setCode = async () => {
		if (status.code.trim().length!=32) {
			updateStatus({errmsg :"Invalid presale code", success : 0});
			return
		}
		update({loading:true})
		updateStatus({errmsg : '', success : 0})
		const result = await call("/set-presale-code", {code : status.code})
		if (result !== null) {
			if(result.error !== undefined) {
				updateStatus({errmsg : getError(result.error), success : 0})
			} else {
				updateStatus({errmsg : '', success : 'Presale code sent successfully.', presaleCode:true}); 
				update({user:{...user, presale:true}, loading:false, currentPage : 'presale'})
				return;
			}
		} else {
			updateStatus({errmsg : getError(0), success : 0})
		}
		update({loading:false})
	}

	const submit = async () => {
		const coin = tokens.token1
		const target = tokens.token2
		const quantity = Number(status.amount1) || 0
		if (quantity === 0) {
			updateStatus({errmsg : T('msg.correct', coins[coin].name), success : 0})
			if (coins[coin].name !== "icicb"){
				refInput1.current?.focus();
				refInput1.current?.select()
			} else {
				refInput2.current?.focus();
				refInput2.current?.select()
			}
			return
		}
		if (!balances[coin] || quantity > balances[coin]?.balance) {
			updateStatus({errmsg : T('msg.exceed', coins[coin].name), success : 0})
			return
		}
		update({loading:true})
		updateStatus({errmsg : '', success : 0})
		const result = await call("/presale", {coin, quantity, target})
		if (result !== null) {
			if(result.error !== undefined) {
				updateStatus({errmsg : getError(result.error), success : 0})
			} else {
				updateStatus({errmsg : '', success : quantity})
			}
		} else {
			updateStatus({errmsg : getError(0), success : 0})
		}
		update({loading:false})
	}

	const onMax = async () => {
		const coin = tokens.token1
		const balance = balances[coin] ? balances[coin].balance : 0
		onValue(String(balance), false)
	}

	return (
		<Layout> 
			<div className="container presale">
				<div className='presale-panel'> 
					<div style = {{textAlign	 : "center"}}>
						<h1>ICICB  <i>Presale</i></h1> 
					</div>
					{isPublic || user?.presale ? (
						<> 
							<div className="inputbar">
								<div className='token-type'>
									<div className="token-dropdown" >
										{tokens.token1.toUpperCase()}
										<span style = {{position : 'absolute', right:'10%', top:'40%'}}><Icons.arrow color="white" width = {22} height = {22}/> </span>
										<div ref = {refDropMenu1} className="dropdown-list">
											{Object.keys(coins).map(i=>i === tokens.token2 ? null  :  <div key = {i} onClick = {()=>onToken(i, false)} className="dropdown-item">{coins[i].name}</div>)}  
										</div>
									</div>
								</div>
								<div className='token-amount'>
									<input type="text" ref={refInput1} pattern="[0-9.,]" placeholder='0.1' className='input-token' value = {status.amount1} onChange = {e=>onValue(e.target.value, false)} />
									<div style={{position:'absolute', right:20, top:0, bottom:0, display:'flex', alignItems:'center'}}>
										<button onClick={onMax} className="submit mt0">MAX</button>
									</div>
								</div>
								<div className='token-icon'>
									<img src = {coins[tokens.token1].icon} style = {{width : 25 }} alt = {tokens.token1} /> 
								</div>
							</div>
							<div className="inputbar">
								<div className='token-type'>
									<div className="token-dropdown">
										ICICB	
										<span style = {{position : 'absolute', right:'10%', top:'40%'}}><Icons.arrow color="white" width = {22} height = {22}/> </span>
										<div ref = {refDropMenu2} className="dropdown-list">
											{Object.keys(coins).map(i=>i !== 'icicb' ? null  :  <div key = {i} onClick = {()=>onToken(i,true)} className="dropdown-item">{coins[i].name}</div>)}
										</div> 
									</div>
								</div>
								<div className='token-amount'><input type="text" placeholder='300000' ref={refInput2} className='input-token' value = {status.amount2} onChange = {e=>onValue(e.target.value, true)} /></div>
								<div className='token-icon'>
									<img src = {coins[tokens.token2].icon} style = {{width : 25}} alt = {tokens.token2} />
								</div>
							</div> 
							<div style = {{color : 'red', textAlign : 'center', marginTop :  20}}>
								{status.errmsg}
							</div>
							<div style = {{color : 'green', textAlign : 'center', marginTop :  30}}>
								{status.success>0 ? T('msg.success', {amount : status.success, coin : coins[tokens.token1].name, symbol:coins[tokens.token1].name})  :  ''}
							</div>
							<div className="title flex  mt2 center">
								<button onClick = {submit} className="submit" style = {{width : 200, padding : 15}} >Submit</button> 
							</div>
						</>
					) : (
						<>
							<input type="text"   placeholder='Please input presale code' className='input-token w100 mt2' style={{padding:'14px 2em'}} 	 value = {status.code} onChange = {(e)=>{updateStatus({code : e.target.value})}} /> 
							<div style = {{color : 'red', textAlign : 'center', marginTop :  20}}>
								{status.errmsg}
							</div>
							<div className="title flex  mt2 center">
								<button onClick = {setCode} className="submit" style = {{width : 200, padding : 15}} >Submit</button> 
							</div>
						</>
					)}
				</div>  
			</div> 
		</Layout>
		) 
};

export default Presale;