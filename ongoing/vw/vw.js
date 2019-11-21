// MMVW - MIND MAKERS VIRTUAL WORLD
const URL_VW="usrxtml111kkkxxvyi812902134lk";
const URL_ARG="xtml111kkkxxv";
const URL_PWD="usrxtml111mmsdskkkdk112399s";
const URL_PWDARG="x42342341kkkxxv";
var aplicacaoCorrente="";
var usuarioCorrente="";
var pontos = new Map();
var contaTentativas = new Map();
var ultimaDataHoraTentativa = new Map();
const url='http://localhost:800/'+URL_VW;
const urlPonto='http://localhost:800/'+URL_VW+"?"+URL_ARG+'=';
const urlSenha='http://localhost:800/'+URL_PWD+"?"+URL_PWDARG+'=';

window.addEventListener("message", function({data}){
  //console.log(data);
    var dadosA=data.split(',');
    if (dadosA[0]=='digitar')
       document.getElementById(dadosA[1]).value = dadosA[2];
    else if (dadosA[0]=='clicar')
       document.getElementById(dadosA[1]).click();   
    else if (dadosA[0]=='obterHTML')
       parent.postMessage(document.getElementById('tela').innerHTML,'*');       
 }, false);

function obtemLoginCorrente(chamador) {
	
	// Neste caso, formado por "usuario_eXX", onde eXX é o numero da estacao corrente se usando localhost	
	var Http = new XMLHttpRequest();
	Http.open("GET",url);
	Http.send();
	
	Http.onreadystatechange=(e)=>{
		
		try {
			var retorno = JSON.parse(Http.responseText);
		
			if (retorno && retorno != null) {	
				try{document.getElementById("login").value='usuario_e'+retorno.user;}catch(e){}
				usuarioCorrente='usuario_e'+retorno.user;	
				pontos.set('personal',retorno.personal);
				pontos.set('company',retorno.company);
				pontos.set('bank',retorno.bank);								
			}
			
	//		alert(chamador+'');
			
			if (chamador && chamador=='coletaOferta')
				coletaOferta();
		
		} catch(e) {
			//console.log('Erro ao tentar recuperar usuario = '+e);
			
		} 
	}
	
}

function getPontoApp(tipoApp) {
	
	return pontos.get(tipoApp);
}

function setPontoApp(url,tipoApp,pontosTotais) {

	var Http = new XMLHttpRequest();	
	Http.open("GET",url+tipoApp+"$"+pontosTotais);
	Http.send();
	
	pontos.set(tipoApp,pontosTotais);
	
}


function getSenha(tipoApp,login,next) {
	
	var Http = new XMLHttpRequest();
	Http.open("GET",urlSenha+tipoApp+login);
	Http.send();
	
	Http.onreadystatechange=(e)=>{
		
		try {
			var retorno = JSON.parse(Http.responseText);
		
			if (retorno && retorno != null) {	
				return next(null,retorno.senha);							
			}
		
		} catch(e) {
			
			console.log('Erro ao tentar recuperar senha = '+e);
			return next(null,'1902340mfk345dpfgmdfpgdfpogdk');
			
		} 
	}
}

function setSenha(tipoApp,login,senha) {
	
		var Http = new XMLHttpRequest();
	Http.open("GET",urlSenha+tipoApp+login+"-"+senha);
	Http.send();
	
}

var bloqueioRobo=false;
function formInit(chamador) {
	
	if (window.location.href.indexOf('personal')>-1)
		aplicacaoCorrente="personal";
	else if (window.location.href.indexOf('bank')>-1)
		aplicacaoCorrente="bank";
	else if (window.location.href.indexOf('company')>-1)
		aplicacaoCorrente="company";
		
	contaTentativas.set(aplicacaoCorrente,0);
	ultimaDataHoraTentativa.set(aplicacaoCorrente,null);
	bloqueioRobo=false;
	bloqueioTentativa=false;
		
    obtemLoginCorrente(chamador);
    
   	if ((window.location.href.indexOf('localhost')>-1)) {
		try{
			document.getElementById('login').style.visibility="visible";
			document.getElementById('login').style.height="47px;";
			document.getElementById('login').style.fontSize="1px;";
			document.getElementById('login').style.paddingTop="12px";
			document.getElementById('login').style.paddingBottom="12px";
			document.getElementById('login').style.marginTop="8px";
			document.getElementById('login').style.marginBottom="8px";
			
			document.getElementById('loginaux').style.visibility="hidden";	
			document.getElementById('loginaux').style.height="1px;";
			document.getElementById('loginaux').style.fontSize="1px;";
			document.getElementById('loginaux').style.paddingTop="0";
			document.getElementById('loginaux').style.paddingBottom="0";
			document.getElementById('login').style.marginTop="0";
			document.getElementById('login').style.marginBottom="0";
		} catch(e){}
	} else {
		try{
			document.getElementById('loginaux').style.visibility="visible";
			document.getElementById('loginaux').style.height="47px;";
			document.getElementById('loginaux').style.fontSize="1px;";
			document.getElementById('loginaux').style.paddingTop="12px";
			document.getElementById('loginaux').style.paddingBottom="12px";
			document.getElementById('login').style.marginTop="8px";
			document.getElementById('login').style.marginBottom="8px";
						
			document.getElementById('login').style.visibility="hidden";	
			document.getElementById('login').style.height="1px;";
			document.getElementById('login').style.fontSize="1px;";
			document.getElementById('login').style.paddingTop="0";
			document.getElementById('login').style.paddingBottom="0";
			document.getElementById('login').style.marginTop="0";
			document.getElementById('login').style.marginBottom="0";
		} catch(e){}	
	}
	
   parent.postMessage(document.getElementById('tela').innerHTML,'*');      
	
}

function comutePsw(img) {
	pswField=document.getElementById('password');
	if (img.src.indexOf('eye_checked')>-1) {
		pswField.type="password";
		try {pswField2=document.getElementById('password2');pswField2.type="password"} catch(e){};
		img.src="img/eye.png";
	} else {
		img.src="img/eye_checked.png";
		pswField.type="text";
		try {pswField2=document.getElementById('password2');pswField2.type="text"} catch(e){};
	}
}

function canChangePsw() {
	
	// So pode trocar se já definiu uma vez
	var login = usuarioCorrente;
	
	var senhaEsquecida = localStorage.getItem('vw_senha_'+aplicacaoCorrente+login);	
	
	if (!senhaEsquecida || senhaEsquecida==null) {
		try{document.getElementById('changePsw').style.display="none";}catch(e){};
		try{document.getElementById('codeMsg').style.visibility="hidden";}catch(e){};
		return false;
	}
	
	var d = new Date();
	var momentoAtualInt = d.getTime();
	var ultimaTrocaInt=-1;
	ultimaTrocaStr = localStorage.getItem('vw_ultima_trocasenha'+aplicacaoCorrente);
	
	if (ultimaTrocaStr && ultimaTrocaStr!=null) {
		ultimaTrocaInt = parseInt(ultimaTrocaStr);
	} 
	
	if (ultimaTrocaInt==-1 || ((momentoAtualInt-ultimaTrocaInt)>(1000*60*1))) {
		// passou 5 minutos, então permite
		try{document.getElementById('changePsw').style.display="inline";}catch(e){}
		try{document.getElementById('codeMsg').style.visibility="visible";}catch(e){}
		try{document.getElementById('changePswMsg').style.display="none";}catch(e){}
		
		// Envia o código, para a máquina "localhost" somente.
		// TODO TIRAR O TRUE
		if ((window.location.href.indexOf('localhost')>-1) && window.location.href.indexOf('_forgot')>-1) {
			
			var code = makeid(3);
			
			localStorage.setItem('vw_vefification_code'+aplicacaoCorrente,code);
			setTimeout(enviaAlerta,2000,"Código: <b>"+code+"</b>");
			
		} else {
			try{document.getElementById('changePsw').style.display="inline";}catch(e){};
			try{document.getElementById('codeMsg').style.visibility="visible";}catch(e){};
			try{document.getElementById('changePswMsg').style.display="none";}catch(e){};
		}
		
		return true;
		
	} else {
		localStorage.removeItem('vw_vefification_code'+aplicacaoCorrente);
		document.getElementById('changePsw').style.display="none";
		document.getElementById('codeMsg').style.visibility="hidden";
		document.getElementById('changePswMsg').style.display="inline";
		document.getElementById('tempo').innerHTML=(Math.trunc((((1000*60*1) - (momentoAtualInt-ultimaTrocaInt))/1000/60))+1)+'';
	}
}

function validaChangePsw() {
	
	// Salva nova senha do aluno e ultima hora para evitar excesso de troca.
	var login = document.getElementById('login').value;
	var senha = document.getElementById('password').value;
	var senha2 = document.getElementById('password2').value;
	var codigoInformado = document.getElementById('code').value;
	
	var codigoEnviado = 	localStorage.getItem('vw_vefification_code'+aplicacaoCorrente);
	
		
	if (window.location.href.indexOf('localhost')==-1) {
		alertify.alert("Você não foi reconhecido como usuário desse serviço");
		try{event.preventDefault(); }catch(e){}
		return false;
	}
	
	
	if (!codigoInformado || !codigoEnviado || codigoInformado==null || codigoEnviado==null || codigoEnviado!=codigoInformado) {
		alertify.alert("O código informado não confere com o enviado.");
		try{event.preventDefault(); }catch(e){}
		return false;
	}
	
	if (!senha || !senha2 || senha==null || senha2==null || senha!=senha2) {
		alertify.alert("As senhas informadas não são iguais. Acerte e tente novamente.");
		try{event.preventDefault(); }catch(e){}
		return false;
	}
	
	if (!hasUpperCase(senha)) {
		alertify.alert("Senha deve ter ao menos uma letra maiúscula.");
		try{event.preventDefault(); }catch(e){}
		return false;	
	}
	
	localStorage.setItem('vw_senha_'+aplicacaoCorrente+login,senha);	
	
	var d = new Date();
	var momentoAtualInt = d.getTime();
	
	localStorage.setItem('vw_ultima_trocasenha'+aplicacaoCorrente,momentoAtualInt+'');
	
	setSenha(aplicacaoCorrente,login,senha);
	
	return true;

}
var momentoCorrente=null;
var conta=0;
function validaLogin(urlFinal) {
	conta=0;
	//event.preventDefault()
	// Salva nova senha do aluno e ultima hora para evitar excesso de troca.
	var login = document.getElementById('login').value;
	var senhaInformada = document.getElementById('password').value;
	
	//var senhaRegistrada = localStorage.getItem('vw_senha_'+aplicacaoCorrente+login);
	getSenha(aplicacaoCorrente,login,function(erro,senhaRegistrada){
		//console.log('senha registrada='+senhaRegistrada);
		if ((!senhaInformada || senhaInformada==null || !senhaRegistrada || senhaRegistrada==null ||
		 senhaInformada!=senhaRegistrada) && !bloqueioTentativa && !bloqueioRobo) {
		
			if (senhaRegistrada==undefined || (senhaInformada!=null && senhaRegistrada.length<5)) {

				contaTentativas.set(aplicacaoCorrente,contaTentativas.get(aplicacaoCorrente)+1);
				conta++;
				if (conta % 4 == 0)
					momentoCorrente = new Date();

				if (aplicacaoCorrente=='bank' && contaTentativas.get(aplicacaoCorrente)>20) {
					document.getElementById('loginButton').style.display="none";
					ultimaDataHoraTentativa.set(aplicacaoCorrente,new Date());
					bloqueioTentativa=true;
					alertify.alert("Segurança Bancária!","Você foi bloqueado por excesso de tentativas com erro (mais de 20)!");
				}  if (aplicacaoCorrente=='company' && (momentoCorrente!=null && 
						ultimaDataHoraTentativa.get(aplicacaoCorrente)!=null && 
						momentoCorrente-ultimaDataHoraTentativa.get(aplicacaoCorrente)<500)) {
					alertify.alert("Segurança Corporativa!","Você foi bloqueado por fazer tentativas seguidas com rapidez que indicam o uso de robô!");
					document.getElementById('loginButton').style.display="none";
					bloqueioRobo=true;
				} else {
					if (!bloqueioTentativa && !bloqueioRobo) {		
						alertify.alert("Erro na Autenticação","O login e senha não conferem!");
						ultimaDataHoraTentativa.set(aplicacaoCorrente,new Date());
					}
				    
				}

			}

			return false;
		}
		if (!(aplicacaoCorrente=='bank' && contaTentativas.get(aplicacaoCorrente)>20) && !bloqueioRobo && !bloqueioTentativa) {
			//console.log(urlFinal);
			localStorage.setItem('vwSenha',senhaInformada);
			window.location.href=urlFinal;
		}
		
	});
	
}

function validaRegister() {
	
	// Salva nova senha do aluno e ultima hora para evitar excesso de troca.
	var login = document.getElementById('login').value;
	var senha = document.getElementById('password').value;
	var senha2 = document.getElementById('password').value;

	var ultimaSenhaDoLogin = localStorage.getItem('vw_senha_'+aplicacaoCorrente+login);
	
	if (window.location.href.indexOf('localhost')==-1) {
		alertify.alert("Registro não Permitido","Você não foi reconhecido como usuário desse serviço");
		try{event.preventDefault(); }catch(e){}
		return false;
	}
	
	if (ultimaSenhaDoLogin && ultimaSenhaDoLogin!=undefined && ultimaSenhaDoLogin != null) {
		alertify.alert("Erro no Registro","Esse usuário já foi registrado. Se esqueceu sua senha, utilize a opção para troca");
		try{event.preventDefault(); }catch(e){}
		return false;
	}
	
	if (!senha || !senha2 || senha==null || senha2==null || senha!=senha2) {
		alertify.alert("Erro no Registro","As senhas informadas não são iguais. Acerte e tente novamente.");
		try{event.preventDefault(); }catch(e){}
		return false;
	}
	
	if (!hasUpperCase(senha)) {
		alertify.alert("Erro no Registro","Senha deve ter ao menos uma letra maiúscula.");
		try{event.preventDefault(); }catch(e){}
		return false;		
	}
	
	
	if (!senha.match(/^[A-Z]/i)) {
		alertify.alert("Erro no Registro","Senha deve começar com uma letra maiúscula.");
		try{event.preventDefault(); }catch(e){}
		return false;		
	}
	
	if (senha && senha.length==2 && parseInt(senha.substring(0,1))==-1 && parseInt(senha.substring(1,1))==-1) {
		alertify.alert("Erro no Registro","Senha deve ter ao menos um número.");
		try{event.preventDefault(); }catch(e){}
		return false;		
	}
	
	
	//localStorage.setItem('vw_senha_'+aplicacaoCorrente+login,senha);
	setSenha(aplicacaoCorrente,login,senha);
		
	return true;

}

function alertifyS_alert(titulo,msg) {
	document.getElementById('imgcontainer').innnerHTML=msg;
	setTimeout(restaura,5000);
}

function restaura() {
	document.getElementById('imgcontainer').innnerHTML='<img src="img/personal_icon_color.png" alt="Personal logo" class="avatar">';
}

function hasUpperCase(str) {
    return str.toLowerCase() != str;
}

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function enviaAlerta(msg) {
	var notification = alertify.notify(msg, 'success', 8, function(){  console.log('dismissed'); });
}

function simulaPostForm(acao,urlDestino) {

	if (acao=="login") {
		var urlBase = window.location.href.substring(0,window.location.href.lastIndexOf('/'));
		validaLogin(urlBase+'/'+urlDestino);
		
	} else if (acao=="register" && validaRegister()) {
		
		window.open(urlDestino, "_self");
		
	} else if (acao=="changePsw" && validaChangePsw()) {
		var urlBase = window.location.href.substring(0,window.location.href.lastIndexOf('/'));
	//	alert(urlBase+'/'+urlDestino);
		console.log(urlBase+'/'+urlDestino);
		 window.location.href=urlBase+'/'+urlDestino;
		//window.open(urlBase+'/'+urlDestino, "_self");
	}
	
}

/************************** GANHOS ALEATORIOS **********************************************/

function ganhos() {
	
	if (window.location.href.indexOf('personal')>-1)
		aplicacaoCorrente="personal";
	else if (window.location.href.indexOf('bank')>-1)
		aplicacaoCorrente="bank";
	else if (window.location.href.indexOf('company')>-1)
		aplicacaoCorrente="company";
	
	//usuarioCorrente=obtemLoginCorrente();
	
	var primeira = Math.floor(Math.random() * 40) + 15;

	setTimeout(geraGanhoPorAplicacao,primeira,aplicacaoCorrente);
	
}
var tipoGanho=["personal","bank","company"];
function geraGanhoPorAplicacao(aplicacao) {
	
	if (aplicacao=="") {
		
		// oferta aleatoria
		var proxima = Math.floor(Math.random() * 3);
		
		notificaGanho(proxima);
	} else if (aplicacao=="personal") {
		notificaGanho(0);	
	} else if (aplicacao=="bank") {
		notificaGanho(1);
	} else if (aplicacao=="company") {
		notificaGanho(2);		
	} 
	
	var proxima = Math.floor(Math.random() * 40) + 15;
	
	setTimeout(geraGanhoPorAplicacao,proxima * 1000,aplicacao);
	
}

var ganhoPersonal=["Seus 200 livros digitais chegaram!#200pt","Você ganhou licença para 500 músicas!#500pt","Seu amigo lhe presenteou com 1000 séries de TV!#1000pt"];
var ganhoBank=["Seu cliente pagou! Receba R$ 20.000,00.#20000pt","Seu salário foi depositado! Receba R$ 5.000,00#5000pt","Você ganhou um presente em dinheiro, receba R$ 2.000,00.#2000pt"];
var ganhoCompany=["Confidencial! Armazene as 10 plantas industriais deste mês.#10000pt","Você recebeu 5 projetos confidenciais.#5000pt","5 novas patentes da empresa precisam ser armazenadas.#5000pt"];

function notificaGanho(indiceGanho) {
	
	// notifica apenas se chama com localhost
	if (window.location.href.indexOf('localhost:800')==-1)
		return;
	
	var ganho = Math.floor(Math.random() * 3);
	
	if (indiceGanho==0) {
		var notification = alertify.notify(ganhoPersonal[ganho].replace('#',' '), 'custom', 10, function(){  if (window.location.href.indexOf('personal_login')==-1) window.open("personal_login.html", "_self"); });
		var pontosCorrentes =  ganhoPersonal[ganho].substring(ganhoPersonal[ganho].indexOf('#')+1,ganhoPersonal[ganho].length-2);
		localStorage.setItem(tipoGanho[indiceGanho]+'pontosCorrentes',pontosCorrentes);
		//setPontoApp(tipoGanho[indiceGanho],pontosCorrentes);
	} else if (indiceGanho==1) {
		var notification = alertify.notify(ganhoBank[ganho].replace('#',' '), 'success', 10, function(){  if (window.location.href.indexOf('bank_login')==-1) window.open("bank_login.html", "_self"); });
		var pontosCorrentes =  ganhoBank[ganho].substring(ganhoBank[ganho].indexOf('#')+1,ganhoBank[ganho].length-2);
		localStorage.setItem(tipoGanho[indiceGanho]+'pontosCorrentes',pontosCorrentes);
		//setPontoApp(tipoGanho[indiceGanho],pontosCorrentes);
	} else if (indiceGanho==2) {
		var notification = alertify.notify(ganhoCompany[ganho].replace('#',' '), 'warning', 10, function(){  if (window.location.href.indexOf('company_login')==-1) window.open("company_login.html", "_self"); });
		var pontosCorrentes =  ganhoCompany[ganho].substring(ganhoCompany[ganho].indexOf('#')+1,ganhoCompany[ganho].length-2);
		localStorage.setItem(tipoGanho[indiceGanho]+'pontosCorrentes',pontosCorrentes);
		//setPontoApp(tipoGanho[indiceGanho],pontosCorrentes);
	}
}

function coletaOferta() {

	// Se é um usuario acessando de outra maquina, considera que 'hackeou' este usuario, 

	var meuPatrimonioAtualInt=0;
	
	var meuPatrimonioAtual = getPontoApp(aplicacaoCorrente);
	console.log('meu total de pontos em '+aplicacaoCorrente+ " é de "+meuPatrimonioAtual);

	if (!meuPatrimonioAtual || meuPatrimonioAtual==undefined || meuPatrimonioAtual == null) {
		if (!Number.isNaN(parseInt(document.getElementById('pontos').innerHTML)))
			meuPatrimonioAtualInt = parseInt(document.getElementById('pontos').innerHTML); 
	} else {
		meuPatrimonioAtualInt = parseInt(meuPatrimonioAtual);
	}
	
	document.getElementById('pontos').innerHTML=meuPatrimonioAtualInt+"";
	
	if (window.location.href.indexOf('localhost:800')==-1) {
		rotinaHacker();
		return;
	}
	
	var ganho = localStorage.getItem(aplicacaoCorrente+'pontosCorrentes');
	
	if (!ganho || ganho == undefined || ganho == null || Number.isNaN(parseInt(ganho)))
		return;

	var ganhoInt = parseInt(ganho);
	
	//alert('vai somar '+ganhoInt+ ' ao meu patrimonio '+meuPatrimonioAtualInt);
	
	var patrimonioAcrescido = meuPatrimonioAtualInt+ganhoInt;
	
	document.getElementById('pontos').innerHTML=patrimonioAcrescido+"";

	localStorage.removeItem(aplicacaoCorrente+'pontosCorrentes');
	
//	localStorage.setItem(aplicacaoCorrente+"patrimonioAtual"+usuarioCorrente,patrimonioAcrescido+"");
	setPontoApp(urlPonto,aplicacaoCorrente,patrimonioAcrescido);
	
}

function rotinaHacker() {
	
	document.getElementById('transferir').style.display='block';
	var senhaDescoberta = localStorage.getItem('vwSenha');
	alertify.alert('Hacker','Site violado com senha <b>'+senhaDescoberta+'</b>. '+
	'Clique no botão para tranferir valores para sua conta. <p>'+
	'Dica de hacker para hacker: tente usar essa mesma senha em outros sites do usuário.');
	
}

function transfereParaMim() {

	var valorHackeadoInt = parseInt(document.getElementById('pontos').innerHTML);

	alertify.alert('Hacker','<b>'+valorHackeadoInt+'</b> créditos do site <b>'+aplicacaoCorrente+'</b> trasferidos para sua conta!');

	// Retira pontos do hackeado
	var fim = window.location.href.indexOf('800');
	var servicoHackeado = window.location.href.substring(0,fim+3);
	var urlPontoHackeado=servicoHackeado+'/'+URL_VW+"?"+URL_ARG+'=';
	console.log(urlPontoHackeado);
	setPontoApp(urlPontoHackeado,aplicacaoCorrente,-valorHackeadoInt);
	
	// Acrescenta pontos para o hacker
	setPontoApp(urlPonto,aplicacaoCorrente,valorHackeadoInt);
	document.getElementById('pontos').innerHTML='0';	
}

