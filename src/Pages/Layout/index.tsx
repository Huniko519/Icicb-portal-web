import React from 'react'; 
import {Link, useHistory} from "react-router-dom"; 
import useWallet from '../../useWallet'; 
import back from '../../assets/back.png';  
import { Dashboard, Presale, Transaction, Settings, Logout, Voucher } from '../../components/Icons' 
import './index.scss'

const menus : Array<{key : string, url : string, icon : JSX.Element, label : string}> = [
    {
        key : "dashboard", 
        url : "/dashboard", 
        icon : <Dashboard size = {25}/>, 
        label : "Dashboard"
    },
    {
        key : "presale", 
        url : "/presale", 
        icon : <Presale size = {25} />, 
        label : "Presale"
    },
    {
        key : "voucher", 
        url : "/voucher", 
        icon : <Voucher size = {25} />, 
        label : "Voucher"
    },
    {
        key : "transaction", 
        url : "/transaction", 
        icon : <Transaction size = {25} />, 
        label : "Transaction"
    },
    {
        key : "setting", 
        url : "/setting", 
        icon : <Settings size = {25} />, 
        label : "Setting"
    },
    {
        key : "logout", 
        url : "", 
        icon : <Logout size = {25} />, 
        label : "Logout"
    },
]

const Layout = (props : any) => {
	const {user, L, currentPage, update, isPublic} = useWallet();
    const history = useHistory();
    const onPage = (key : string, url : string) => {
        if (key === 'logout') {
            update({user : null})
            history.push('/');
        } else {
            update({currentPage : key})
            history.push(url);
        }
    }
    const page = currentPage || 'dashboard'
    return (
        <div style = {{backgroundImage : `url(${back})`, backgroundSize : 'cover', minHeight:'100vh'}}>
            <header style = {{backgroundColor : 'black', height : '70px'}}>
                <div className="justify">
                    <Link className="title flex middle" to="/">
                        <img src="/logo.svg" style = {{width : 40, height : 'auto', marginRight : 10}} alt="logo" />
                        <span className="h2">{L['chain']}</span> 
                    </Link> 
                </div>
            </header>
            <div className="block">
                <div className="topmenu-panel">
                    {menus.map(v=>( (isPublic && v.key==='voucher') ? null : 
                        <a key = {v.key} onClick = {()=>onPage(v.key, v.url)} className = {"topmenu" + (page === v.key ? ' active'  :  '')}>
                            <p>{v.icon}</p>
                            <p>{v.label}</p>
                        </a>
                    ))}
              </div>
              <div className="flex" style={{ height:'100%'}}> 
                    <div className="sidebar-panel" >  
                        <div className="sidebar" > 
                            <h2 style = {{textAlign : "center", paddingTop : "15px"}}>{user?.username || ''}</h2>
                            {/* <p style = {{color : "#3d3d3d", textAlign : "center"}}>#82382948343</p> */}
                            {/* <p style = {{color : "#3d3d3d", textAlign : "center"}}>{user ? }</p> */}
                            {menus.map(v=>( (isPublic && v.key==='voucher') ? null : 
                                <a key = {v.key} onClick = {()=>onPage(v.key, v.url)} className = {page === v.key ? ' active'  :  ''}>
                                    <i>{v.icon}</i>
                                    <span>{v.label}</span>
                                </a>
                            ))}
                        </div> 
                    </div>
                    <div className="main-container"> 
                        <main style = {{display : "block"}}>
                            {props.children}
                        </main>
                    </div>
              </div>
            </div> 
        </div>
    );
}

export default Layout;