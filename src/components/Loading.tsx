import React from 'react'; 
import ReactLoading from 'react-loading';

interface LoadingProps {
    type : 'blank'|'balls'|'bars'|'bubbles'|'cubes'|'cylon'|'spin'|'spinningBubbles'|'spokes'
    width : number
    height : number
    color : string
    opacity : number
    show : boolean
}

const Loading = ({type="blank", width=100, height=100, color="#eee", opacity=0.5, show=false}:LoadingProps) => {
	return (
        <div style={{position:"fixed", left:0, top:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0, '+opacity+")", zIndex:1111}} hidden={!show}>
            <div style={{position:'absolute', top:'calc(50vh - '+height/2+'px)', left:'calc(50vw - '+width/2+'px)'}}>
                <ReactLoading type={type} color={color} height={height} width={width}/>
            </div>
        </div>
	)
}

export default Loading