import { toast } from 'react-toastify';

export const tips = (html:string) => {
	toast(html, {
		position: "top-right",
		autoClose: 2000,
		closeButton:false,
		style:{
			backgroundColor:'#312d24',
			color:'white',
			border: '1px solid #756b54',
			boxShadow: '1px 2px 2px #5f553e'
		}
	});
}



export const copyToClipboard = (text:string) => {
	var textField = document.createElement('textarea')
	textField.innerText = text
	document.body.appendChild(textField)
	textField.select()
	document.execCommand('copy')
	textField.remove()
	tips("Copied : "+ text);
};
