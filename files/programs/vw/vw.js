// MMVW - MIND MAKERS VIRTUAL WORLD
const VERSAO="1.05";
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
const urlSenha=URL_PWD+"?"+URL_PWDARG+'=';
// Essa sala é atualizada logo na inicialização quando acessando o serviço local
var salaGlobal='1';

var jogoCorrente="CYBER-1";
// pode ser r=rodando (default) ou p=pausa (quando zera, pausa ou finaliza disputa)
var situacaoJogoCorrente="r";

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};

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

var contadorColeta=0;
function obtemLoginCorrente(chamador) {
	
	// Neste caso, formado por "usuario_eXX", onde eXX é o numero da estacao corrente se usando localhost. Usa e1, e2,...,e10,e11,...	
	
   var urlBase = window.location.href.substring(0,window.location.href.lastIndexOf(':800')+4)+"/";
	
	var Http = new XMLHttpRequest();
	Http.open("GET",urlBase+URL_VW);
	Http.send();
	
	Http.onreadystatechange=(e)=>{
		
		if (Http.readyState != 4 || Http.status!=200)
		   return;
		   
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
			
			if (chamador && chamador=='coletaOferta' && contadorColeta==0) {
				contadorColeta=1;
				coletaOferta();
			} else if (contadorColeta==1)
				contadorColeta=0;
		
		} catch(e) {
			//console.log('Erro ao tentar recuperar usuario = '+e);
			
		} 
	}
	
}

function exibeVersao(versao,release) {
	document.getElementById('versao').innerHTML="v"+versao+"."+release;
}

function getPontoApp(tipoApp) {
	
	return pontos.get(tipoApp);
}


// Recupera total de pontos correntes no servidor, por tipo de aplicacao
function getPontosServico() {
	
	// pega URL corrente
    var urlBase = window.location.href.substring(0,window.location.href.lastIndexOf(':800')+4)+"/";
	
	var Http = new XMLHttpRequest();	
	Http.open("GET",urlBase+URL_VW);
	Http.send();
	
	Http.onreadystatechange=(e)=>{
		
	   if (Http.readyState != 4 || Http.status!=200)
		   return;
		
		if (Http && Http.responseText) {
		
			var retorno = JSON.parse(Http.responseText);
				
			//console.log(retorno);	
			//{"user":"1","personal":200,"company":20000,"bank":20000}
			
			var pontoPersonal = retorno.personal;
			var pontoBank = retorno.bank;
			var pontoCompany = retorno.company;
			var totalPontos = (pontoPersonal?parseInt(pontoPersonal):0) + 
							  (pontoBank?parseInt(pontoBank):0) +
							  (pontoCompany?parseInt(pontoCompany):0);
			
			exibePontosTotais(totalPontos);
			
			exibeVersao(VERSAO,retorno.versao);
						
		}
	}
	
}


// Recupera total de pontos sem setar valor local
function setPontosServicoLocalhostSemAlterarMapaLocal(aplicacao,pontosParaAcrescentar) {
		
	var Http = new XMLHttpRequest();	
	Http.open("GET","http://localhost:800/"+URL_VW);
	Http.send();
	
	Http.onreadystatechange=(e)=>{
		
	   if (Http.readyState != 4 || Http.status!=200)
		   return;
		
		if (Http && Http.responseText) {
		
			var retorno = JSON.parse(Http.responseText);
			var pontosAtuaisDoHackerAplicacaoCorrente	= 0;
			//console.log(retorno);	
			//{"user":"1","personal":200,"company":20000,"bank":20000}
			
			if (aplicacao=="personal")
				pontosAtuaisDoHackerAplicacaoCorrente = retorno.personal;
			else if  (aplicacao=="bank")
				pontosAtuaisDoHackerAplicacaoCorrente =  retorno.bank;
			else if  (aplicacao=="company")
				pontosAtuaisDoHackerAplicacaoCorrente =  retorno.company;
	
			
			console.log("O hacker tinha " +pontosAtuaisDoHackerAplicacaoCorrente+" como hackeou "+pontosParaAcrescentar+" ao final vai ficar com "+pontosAtuaisDoHackerAplicacaoCorrente+pontosParaAcrescentar);	
			setPontoApp(urlPonto,aplicacaoCorrente,pontosAtuaisDoHackerAplicacaoCorrente+pontosParaAcrescentar);
			document.getElementById('pontos').innerHTML='0';
		
		}
	}
	
}

// usado para setar pontos
function setPontoApp(urlArg,tipoApp,pontosTotais) {

    console.log('vai setar '+pontosTotais+' da aplicacao '+tipoApp+' com URL '+urlArg);

	var Http = new XMLHttpRequest();	
	Http.open("GET",urlArg+tipoApp+"$"+pontosTotais);
	Http.send();
	
	Http.onreadystatechange=(e)=>{
		
		if (Http.readyState != 4 || Http.status!=200)
		   return;
		
		// Se for negativo esta hackeando de outro usuario.   
		if (pontosTotais<0)
		    return;   
		   
		console.log('registrou '+pontosTotais+" no mapa local para "+tipoApp);   
		pontos.set(tipoApp,pontosTotais);
		
		var pontoLocal = localStorage.getItem(tipoApp+"patrimonioAtual");
		var pontoLocalInt = 0;
		if (pontoLocal && pontoLocal != null)
			pontoLocalInt = parseInt(pontoLocal);
			
		localStorage.setItem(tipoApp+"patrimonioAtual",(pontoLocalInt+pontosTotais)+'');
		console.log('ao final armazenou '+(pontoLocalInt+pontosTotais)+" no local storagelocal");
	}
}


function getSenha(tipoApp,login,next) {
	
	// pega URL corrente
    var urlBase = window.location.href.substring(0,window.location.href.lastIndexOf(':800')+4)+"/";
    
    // Se acessar outra estacao, usa o usuario dela
    if (urlBase.indexOf('localhost')==-1) {
		var usuarioAux = urlBase.substring(urlBase.indexOf('.local')-2,urlBase.indexOf('.local'));
		var usuarioAuxInt = parseInt(usuarioAux);
		login = "usuario_e"+usuarioAuxInt;
	}
	
	var Http = new XMLHttpRequest();
	Http.open("GET",urlBase+urlSenha+tipoApp+login);
	Http.send();
	
	//console.log('Vai pegar senha em '+urlBase+urlSenha+tipoApp+login);
	
	Http.onreadystatechange=(e)=>{
		
		  if (Http.readyState != 4 || Http.status!=200)
		   return;
		
		try {
			var retorno = JSON.parse(Http.responseText);
		
			if (retorno && retorno != null) {	
			//	console.log('pegou senha = '+retorno.senha);
				return next(null,retorno.senha);							
			}
		
		} catch(e) {
			
			console.log('Erro ao tentar recuperar senha = '+e);
			return next(null,'1902340mfk345dpfgmdfpgdfpogdk');
			
		} 
	}
}

function setSenha(tipoApp,login,senha) {
	
	// pega URL corrente
    var urlBase = window.location.href.substring(0,window.location.href.lastIndexOf(':800')+4)+"/";
    
    if (urlBase.indexOf('localhost')==-1) {
		alertify.alert("Alerta de Segurança","Você não é apto a se registrar neste site!");
		return;
	}
	
	var Http = new XMLHttpRequest();
	Http.open("GET",urlBase+urlSenha+tipoApp+login+"-"+senha);
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
    
    // Se está iniciando um novo form e tem este flag, saiu do SPOOF sem clicar em nada, portanto está livre
    if (localStorage.getItem('indAbriuSiteFake')!=null)	{		
		retornaSituacaoSpam("SPOOFING",false);
		localStorage.removeItem('indAbriuSiteFake');
	}	
    
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
   parent.postMessage('URL,'+window.location.href,'*'); 
   
   // Se tinha alguem em SPAM, remove
   localStorage.removeItem('spamCorrenteUsuario');
   localStorage.removeItem('spamCorrenteMensagem');
	
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
	
	// So pode trocar se já registrou
	var login = usuarioCorrente;
	
	if (!localStorage.getItem(aplicacaoCorrente+"Registrado")) {
	
		try{document.getElementById('changePsw').style.display="none";}catch(e){};

		return false;
	}
	

	try{document.getElementById('changePsw').style.display="inline";}catch(e){}
	
	// Envia o código, para a máquina "localhost" somente.
	// TODO TIRAR O TRUE
	if ((window.location.href.indexOf('localhost')>-1) && window.location.href.indexOf('_forgot')>-1) {
		
		var code = makeid(3);
		
		localStorage.setItem('vw_vefification_code'+aplicacaoCorrente,code);
		setTimeout(enviaAlerta,2000,"Código: <b>"+code+"</b>");
		
	} 
	
	return true;

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
	//conta=0;
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
				//if (conta % 2 == 0)
					momentoCorrente = new Date();
					
               // console.log('app corrente = '+aplicacaoCorrente+' momento '+momentoCorrente+' ultima='+ultimaDataHoraTentativa.get(aplicacaoCorrente));
				if (aplicacaoCorrente=='bank' && contaTentativas.get(aplicacaoCorrente)>16) {
					document.getElementById('loginButton').style.display="none";
					bloqueioTentativa=true;
					// retornar msg javascript para parar blockly.
					 parent.postMessage('PAREBLOCKLY','*');  
					alertify.alert("Segurança Bancária!","Você foi bloqueado por excesso de tentativas com erro (mais de 16)!");
  
					 
				}  if (aplicacaoCorrente=='company' && (momentoCorrente!=null && 
						ultimaDataHoraTentativa.get(aplicacaoCorrente)!=null && 
						(momentoCorrente-ultimaDataHoraTentativa.get(aplicacaoCorrente))<=600)) {
					// retornar msg javascript para parar blockly.
					 parent.postMessage('PAREBLOCKLY','*');    
					alertify.alert("Segurança Corporativa!",
						"Você foi bloqueado por fazer tentativas seguidas com rapidez que indicam o uso de robô (duas ou mais chamadas por segundo)! ");
					document.getElementById('loginButton').style.display="none";
					bloqueioRobo=true;

					 
				} else {
				
						//alert(conta+' nulo? '+momentoCorrente);
					if (!bloqueioTentativa && !bloqueioRobo) {	
						if (momentoCorrente!=null)	
							ultimaDataHoraTentativa.set(aplicacaoCorrente,momentoCorrente);
						alertify.alert("Erro na Autenticação","O login e senha não conferem!");
					}
				    
				}

			}

			return false;
		}
		if (!(aplicacaoCorrente=='bank' && contaTentativas.get(aplicacaoCorrente)>16) && !bloqueioRobo && !bloqueioTentativa) {
			//console.log(urlFinal);
			localStorage.setItem('vwSenha',senhaInformada);
			window.location.href=urlFinal;
		}
		
	});
	
}

function validaRegister() {
	
	//console.log('entrou');
	
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
	
	if (localStorage.getItem(aplicacaoCorrente+"Registrado")) {
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
	
	//console.log('vai registrar '+aplicacaoCorrente+"Registrado");
	localStorage.setItem(aplicacaoCorrente+"Registrado","S");
		
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
		//console.log(urlBase+'/'+urlDestino);
		 window.location.href=urlBase+'/'+urlDestino;
		//window.open(urlBase+'/'+urlDestino, "_self");
	}
	
}

/************************** GANHOS ALEATORIOS **********************************************/

// Inicia após um tempo, na carga das paginas
function ganhos() {
	
	if (window.location.href.indexOf('personal')>-1)
		aplicacaoCorrente="personal";
	else if (window.location.href.indexOf('bank')>-1)
		aplicacaoCorrente="bank";
	else if (window.location.href.indexOf('company')>-1)
		aplicacaoCorrente="company";
		
// Na primeira vez, confirma que está registrado e sincrono com servidor
	var url = 'http://localhost:800/vw/registrado';
	var Http = new XMLHttpRequest();
	Http.open("GET",url);
	Http.send();
//	console.log('entrou para conferir registro');		
	Http.onreadystatechange=(e)=>{

	   if (Http.readyState != 4 || Http.status!=200)
		   return;
		
	    var retorno = JSON.parse(Http.responseText);
	
	    if (retorno && retorno != null) {	
	//	console.log('entrou para conferir registro '+retorno.registrado);	
			if (retorno.registrado=='NAO') {
				localStorage.removeItem("personalRegistrado");	
				localStorage.removeItem("bankRegistrado");	
				localStorage.removeItem("companyRegistrado");	
			}
		}	   
	}
		
	
	var primeira = Math.floor(Math.random() * 30) + 15;

	setTimeout(geraGanhoPorAplicacao,primeira,aplicacaoCorrente);
	
}

function iniciaJogo() {
	if (confirm('Tem certeza de que deseja reiniciar o jogo? Seus registros serão desfeitos e pontos serão zerados')) {
		localStorage.setItem("personal"+"patrimonioAtual","0");	
		localStorage.setItem("bank"+"patrimonioAtual","0");	
		localStorage.setItem("company"+"patrimonioAtual","0");	
		localStorage.removeItem("personalRegistrado");	
		localStorage.removeItem("bankRegistrado");	
		localStorage.removeItem("companyRegistrado");	
		exibePontosTotais(0);
		
		var url = 'http://localhost:800/vw/registrado?limpa=s';
		var Http = new XMLHttpRequest();
		Http.open("GET",url);
		Http.send();
		
	}
}

function exibePontosTotais(totalPontos) {
	try{
		document.getElementById('pontosTotais').innerHTML=totalPontos+'';
    } catch(e){console.log(e);}
}

var tipoGanho=["personal","bank","company"];
function geraGanhoPorAplicacao() {
	
	//if (aplicacao=="") {
		
		// oferta aleatoria
	var aplicacao = Math.floor(Math.random() * 3);
		
	notificaGanho(aplicacao);
	/*} else if (aplicacao=="personal") {
		notificaGanho(0);	
	} else if (aplicacao=="bank") {
		notificaGanho(1);
	} else if (aplicacao=="company") {
		notificaGanho(2);		
	} 
	*/
	var proxima = Math.floor(Math.random() * 10) + 11;
	
	//console.log('vai gerar novas notificacoes');
	
//	setTimeout(geraGanhoPorAplicacao,proxima * 1000,aplicacao);
	setTimeout(geraGanhoPorAplicacao,proxima * 1000);	
}

var ganhoPersonal=["Seus 200 livros digitais chegaram!#2000#https://mycloud.com.br?b=2312#S#Amazônia Livros",
"Você ganhou licença para 500 músicas!#5000#https://mycloud.com.br/#S#Amazônia Music",
"Seu amigo lhe presenteou com 1000 séries de TV!#1000#https://www.mycloud.com.br/#S#Net Filmes",
"Promoção Net Filmes! 500 sessões de filmes inéditos!#5000#https://www.mycloud.com.br/#S#Amazônia Filmes",
"Somente hoje! 1500 livros narrados em oferta#1500#https://mycloud.com.br?b=482#S#Amazônia Livros",
"O licenciamento de 30 jogos digitais está liberado!#3000#http://mycloud.com.br?t=jogos#S#Games Max",
"Oi, é aqui de casa! Me passa a senha da internet.#15000#https://cloud.com.br/#p1#Face Social",
"Aqui é seu professor. Este é um bônus extra não divulgado! Clique pra ganhar a disputa!#500#https://www.micloud.com.br/#p1#Sua Escola"
];
var ganhoBank=["Seu cliente pagou!#20000#https://www.bancodigital.com.br/ibanking/x13kd#S#Banco Digital",
"Seu salário foi depositado!#5000#https://www.bancodigital.com.br/ibanking/sal?id=132#S#Banco Digital",
"Seu imposto de renda foi devolvido.#10000#https://www.bancodigital.com.br/ir/f?t=xdfd#S#Banco Digital",
"Seu investimento rendeu juros!#5000#https://bancodigital.com.br/invest?i=3#S#Banco Digital",
"Seu 13o salário foi depositado!.#5000#https://www.bancodigital.com.br/ibanking/sal?id=409#S#Banco Digital",
"Olá, aqui é a Marcela! Depositei na sua conta o que estava te devendo.#8000#https://www.bancodigital.com.br/trnsf?t=100#S#Face Social",
"Você ganhou na loteria!!! Que sorte Hein?!#15000#https://www.bancodigitali.com.br#p1#Banco Digital",
"Olá, aqui é seu gerente! Você ganhou um seguro gratuito no valor de R$ 50.000,00, basta depositar a taxa de R$ 50,00 na conta ACE213.#50000#https://www.banco.com.br/#p1#Face Social"];
var ganhoCompany=["Confidencial! Armazene as 10 plantas industriais deste mês.#10000#https://www.acme.cc?pi=009#S#ACME LTDA",
"Você recebeu 5 projetos confidenciais.#5000#https://www.acme.cc/projeto/conf?p=9949499399388493994348343#S#ACME LTDA",
"5 novas patentes da empresa precisam ser armazenadas.#5000#https://www.acme.cc?patentes=06930,05906820,302342#S#ACME LTDA",
"Seus trabalhos deste mês subiram para a plataforma da empresa.#5000#https://acme.cc?t=1#S#ACME LTDA",
"Os projetos do nosso principal cliente foram aprovados e estão no site#15000#https://www.acme.cc/#S#ACME LTDA",
"Você foi promovido e assumiu 20 projetos muito importantes. Confira!#20000#https://www.acme.cc?projs=a203021#S#ACME LTDA",
"Você foi promovido a presidente da ACME! Entre agora para ser efetivado!!#20000#https://acme.cc/projeto/conf?p=p1ppo2i32#p1#ACME LTDA",
"Aqui é o presidente da ACME!! Me passe seus dados para atualização do nosso RH. Agradeço antecipadamente!#50000#https://acmee.cc/#p1#ACME LTDA"];

const URL_SPAM_RECEIVE="phishingspoofingreceive";
var spamCorrenteUsuario=null;
var spamCorrenteMensagem=null;
var tipoMsg=['custom','success','warning'];
var indClicou = false;
function notificaGanho(indiceGanho) {
	
	// notifica apenas se chama com localhost
	if (window.location.href.indexOf('localhost:800')==-1)
		return;
	
			
	document.body.addEventListener('click',function (e) {
		
		if(e.target.className.indexOf('ajs-message') > -1 ||
				e.target.className.indexOf('link-message') > -1) {
			
			indClicou=true;
			
		}
		
	},false);	   
	
	
	// Se existir SPAM enviado por outro usuário, prioriza
	var url = 'http://localhost:800/'+URL_SPAM_RECEIVE;
	var Http = new XMLHttpRequest();
	Http.open("GET",url);
	Http.send();
	
	Http.onreadystatechange=(e)=>{
		
		//console.log(e);
	   if (Http.readyState != 4 || Http.status!=200)
		   return;
		   
	   var retorno = JSON.parse(Http.responseText);
	
	   if (retorno && retorno != null) {
		   
		   // de qualquer maneira, atualiza o tipo de jogo e situacao
		   
		   jogoCorrente=retorno.jogo;
		   situacaoJogoCorrente=retorno.situacao;
		//   	alert('situacao do jogo ='+situacaoJogoCorrente);
		   	if (situacaoJogoCorrente=='p')
				return;
		   	
		//	console.log('entrou para receber msg com '+retorno);
		
			if (retorno.status=="OK") {
				// tem SPAM, então prioriza
				var mensagem = retorno.msg.split('@@');
				spamCorrenteUsuario=mensagem[0];

				// mensagem trafegou na URL com caracter adaptado - desfaz
				spamCorrenteMensagem=mensagem[1]
				
				console.log(spamCorrenteMensagem);
				spamCorrenteMensagem=spamCorrenteMensagem.replace(/\$\$\$/g,'#');	

			//	console.log('entrou para receber msg com '+spamCorrenteUsuario+ ' e msg = '+spamCorrenteMensagem);
				
				localStorage.setItem('spamCorrenteUsuario',spamCorrenteUsuario);
				localStorage.setItem('spamCorrenteMensagem',spamCorrenteMensagem);				
				
				var indiceTipo = Math.floor(Math.random() * 3);
				
				indClicou=false;
				var notification = alertify.notify(decodificaNotificacao(spamCorrenteMensagem), tipoMsg[indiceTipo], 10, function(isClicked){ 
					    // Se não clicou no link mas clico na caixa de mensagem, tem o mesmo efeito
						if (isClicked) {
							indClicou=true;
						} else {
							indClicou=false;
						}
						trataReacaoSPAM();
					});	
				
			} else {
				
				//console.log('entrou para notificacao padrao');
				// nao tem SPAM, então segue nas mensagens padroes
				// se havia um SPAM corrente e nao clicou, então remove SPAM e comunica que usuario nao clicou
				if (localStorage.getItem('spamCorrenteUsuario')) {
					
					retornaSituacaoSpam('',false);
					
				}
				
				
				localStorage.removeItem('spamCorrenteUsuario');
				localStorage.removeItem('spamCorrenteMensagem');			
				
				ganho = Math.floor(Math.random() * 8);
				
				// evita spam geral quando alunos jogam como hackers
				if (jogoCorrente!='CYBER-1') {
					// se caiu em spam geral, sorteia novamente entre os primeiros que nao sao SPAM
					console.log('entrou para sortear sem SPAM '+jogoCorrente);
					ganho = Math.floor(Math.random() * 6);
				}
				
				
				indClicou=false;
				if (indiceGanho==0) {

					var notification = alertify.notify(decodificaNotificacao(ganhoPersonal[ganho]), 'custom', 10, 
											function(isClicked){ 
												if (isClicked) {
													var pontosEmOferta =  ganhoPersonal[ganho].split('#')[1];
													localStorage.setItem(tipoGanho[indiceGanho]+'pontosEmOferta',pontosEmOferta);
												}
												setTimeout(verificaSeClicouGanho,100,indiceGanho,isClicked);});

				} else if (indiceGanho==1) {
					//  TODO estilo diferente para link
					var notification = alertify.notify(decodificaNotificacao(ganhoBank[ganho]), 'success', 10, 
										function(isClicked){ 
											if (isClicked) {
												var pontosEmOferta =  ganhoBank[ganho].split('#')[1];
												localStorage.setItem(tipoGanho[indiceGanho]+'pontosEmOferta',pontosEmOferta);
											} 
											setTimeout(verificaSeClicouGanho,100,indiceGanho,isClicked);  
											});


				} else if (indiceGanho==2) {
					var notification = alertify.notify(decodificaNotificacao(ganhoCompany[ganho]), 'warning', 10, 
											function(isClicked){  
												if (isClicked) {
													var pontosEmOferta = ganhoCompany[ganho].split('#')[1];
													localStorage.setItem(tipoGanho[indiceGanho]+'pontosEmOferta',pontosEmOferta);
												}
												setTimeout(verificaSeClicouGanho,100,indiceGanho,isClicked);  });
				
				}
			}
		}
	}
	
}

function verificaSeClicouGanho(indiceSite,clicou) {
	
	if (indClicou || clicou) {
		console.log('clicou');		
		 if (window.location.href.indexOf('personal_login')==-1 && indiceSite==0) 
			window.open("personal_login.html", "_self"); 
		 else if (window.location.href.indexOf('bank_login')==-1 && indiceSite==1) 
			window.open("bank_login.html", "_self");
		 else if (window.location.href.indexOf('company_login')==-1 && indiceSite==2) 
			window.open("company_login.html", "_self");

	
	} else {
		console.log('nao clicou');
	}
	
	// mesmo quando hackeia, prossegue.
	//var proxima = Math.floor(Math.random() * 10000) + 9000;

	//setTimeout(geraGanhoPorAplicacao,proxima,aplicacaoCorrente);
	
}

function trataReacaoSPAM() {
			
	if (!indClicou) {
		
		retornaSituacaoSpam('',false);
		
	} else {
		
		var aux = spamCorrenteMensagem.split('#'); 
		if (aux[3]=='p2') {
		
			// PHISHING 
			retornaSituacaoSpam('PHISHING',true);

		
		} else {
			var link = aux[2];
			// SPOOFING VAI PRA SITE PRIMEIRO
			// Mandar conforme o link, para o site mais proximo

			if (link.indexOf('bancodigital')>-1)
				window.open("ban_fake.html", "_self");	
			else if (link.indexOf('acme')>-1)
				window.open("com_fake.html", "_self");	
			else 
				window.open("per_fake.html", "_self");	
			
		}				 
						
	}
	
	// mesmo quando hackeia, prossegue.
	//var proxima = Math.floor(Math.random() * 10000) + 9000;

	//setTimeout(geraGanhoPorAplicacao,proxima,aplicacaoCorrente);
	
	
}

// Recebe true se usuario caiu na mensagem de SPAM, ou false, caso contrario
const URL_SPAM_RECEIVE_UPDATE="phishingspoofingreceiveupdate";
const URL_SPAM_RECEIVE_UPDATE_ACAO="acao";
function retornaSituacaoSpam(tipo,indFuncionouSpam) {
	//console.log('ENTROU');

	if (!localStorage.getItem('spamCorrenteUsuario'))
		return

	// Se existir SPAM enviado por outro usuário, prioriza
	var acao = "SPAM_DESCARTOU";
	if (indFuncionouSpam)
		acao = "SPAM_CLICOU";
	
	var spamCorrenteUsuario=localStorage.getItem('spamCorrenteUsuario');
//	console.log('vai atualizar situacao = '+spamCorrenteUsuario);
	
	localStorage.removeItem('spamCorrenteUsuario');
	localStorage.removeItem('spamCorrenteMensagem');	

	
	var url = 'http://localhost:800/'+URL_SPAM_RECEIVE_UPDATE+"?"+URL_SPAM_RECEIVE_UPDATE_ACAO+"="+spamCorrenteUsuario+"@@"+acao;
	var Http = new XMLHttpRequest();
	Http.open("GET",url);
	Http.send();
	
	Http.onreadystatechange=(e)=>{
		
		  if (Http.readyState != 4 || Http.status!=200)
		   return;
	
		 var retorno = JSON.parse(Http.responseText);
		
		 //alert(retorno);
			 	 
		 if (retorno && retorno.status=="OK") {
			 console.log('atualizou status de '+spamCorrenteUsuario+"@@"+acao);
			 // Após atualizar o status, programa o desvio
			// alert('entrou '+tipo);
			 if (tipo=="PHISHING") {
			 	setTimeout(abreJanelaHacker,2000);
			 }
		 } else {
			 console.log('erro ao atualizar status de '+spamCorrenteUsuario+"@@"+acao);			 
		 }
	
	}
	
}

function abreJanelaHacker() {
	window.open("hackeadousuario.html", "_self");
}

function decodificaNotificacao(notificacaoCodificada) {
	//'<b>Banco ACME</b><p><a href="sdfsd" title="https://www.meubanco.com/meudominio/este/testes">'+ganhoPersonal[ganho].replace('#',' ')+'</a>'
   var topicos = notificacaoCodificada.split('#');
   console.log('chegou notificacao com codigo = '+topicos[3]);
   if (topicos[3]=='p1') {
		// phishing automatico
	return '<b>'+topicos[4]+'</b><p><a style="text-decoration:none;" class="link-message" href="/vw/hackeado.html" title="'+topicos[2]+'">'+topicos[0]+
         '</a><p><span class="link-message" style="font-size:12px">['+topicos[1]+']</span>';
   } else if (topicos[3]=='p2') {
		// phishing manual de aluno
	return '<b>'+topicos[4]+'</b><p><a style="text-decoration:none;" onclick="trataClicouSPAM(\'PHISHING\',event)" class="link-message" href="'+topicos[2]+'" title="'+topicos[2]+'">'+topicos[0]+
            '</a><p><span class="link-message" style="font-size:12px">['+topicos[1]+']</span>';
   } else if (topicos[3]=='p4') {
		// spoofing manual de aluno
		var siteFake="ban_fake";
		if (topicos[2].indexOf('mycloud'))
			siteFake="per_fake";
		else if (topicos[2].indexOf('acme'))
			siteFake="com_fake";
		return '<b>'+topicos[4]+'</b><p><a style="text-decoration:none;" onclick="trataClicouSPAM(\'SPOFFING\',event,\''+siteFake+'\')"  class="link-message" href="'+topicos[2]+'" title="'+topicos[2]+'">'+topicos[0]+
            '</a><p><span class="link-message" style="font-size:12px">['+topicos[1]+']</span>';
  } else {
		// ganha pontos
	return '<b>'+topicos[4]+'</b><p><a style="text-decoration:none;" href="#" class="link-message" title="'+topicos[2]+'">'+topicos[0]+
            '</a><p><span class="link-message" style="font-size:12px">['+topicos[1]+']</span>';
	}
}

/*
 * Tratamento de mensagens de SPAM,apos cliques.
 * Se for SPOOFING, só retorna resultado após clique no site.
 */
function trataClicouSPAM(tipo,e,siteFake) {

	// Evita ir pro link que nao existe
    e.preventDefault();
    
    // De qualquer modo somente delega. TODO REFATORAR
   // if (tipo=='PHISHING') {
		//alert('PHI '+tipo);
	//	indClicou=true;
		
	//} else {
		// SPOOFING
		indClicou=true;
//	}
	
	trataReacaoSPAM();

}

function coletaOferta() {

	// Se é um usuario acessando de outra maquina, considera que 'hackeou' este usuario, 

	var meuPatrimonioAtualInt=0;
	
	var meuPatrimonioAtual = getPontoApp(aplicacaoCorrente);
//	console.log('meu total de pontos em '+aplicacaoCorrente+ " é de "+meuPatrimonioAtual);

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
	
	var ganho = localStorage.getItem(aplicacaoCorrente+'pontosEmOferta');
	
	if (!ganho || ganho == undefined || ganho == null || Number.isNaN(parseInt(ganho)))
		return;

	var ganhoInt = parseInt(ganho);
	
	//alert('vai somar '+ganhoInt+ ' ao meu patrimonio '+meuPatrimonioAtualInt);
	
	var patrimonioAcrescido = meuPatrimonioAtualInt+ganhoInt;

	document.getElementById('pontosGanhos').innerHTML=ganho+"";	
	document.getElementById('pontos').innerHTML=patrimonioAcrescido+"";

	localStorage.removeItem(aplicacaoCorrente+'pontosEmOferta');
	
//	localStorage.setItem(aplicacaoCorrente+"patrimonioAtual"+usuarioCorrente,patrimonioAcrescido+"");
	setPontoApp(urlPonto,aplicacaoCorrente,patrimonioAcrescido);
	
}

function rotinaHacker() {
	
	document.getElementById('transferir').style.display='block';
	var senhaDescoberta = localStorage.getItem('vwSenha');
	parent.postMessage('PAREBLOCKLY','*');
	
	document.getElementById('transferir').style.visibility="hidden";	
	document.getElementById('ok').style.visibility="hidden";	
	    
	alertify.alert('Hacker','Site violado com senha <b>'+senhaDescoberta+'</b>. '+
	'Feche este diálogo para transferir valores para sua conta. <p>'+
	'Dica de hacker para hacker: <b><i>tente usar essa mesma senha em outros sites do usuário</i></b>.',
	 function(){ 
		setTimeout(transferir,1000); });

}

function transferir() {
	document.getElementById('transferir').click();	
}

function sair() {
	document.getElementById('ok').click();	
}

// quando um aluno hackeia o outro
function transfereParaMim() {

	var valorHackeadoInt = parseInt(document.getElementById('pontos').innerHTML);

	alertify.alert('Hacker','<b>'+valorHackeadoInt+'</b> créditos do site <b>'+aplicacaoCorrente+'</b> trasferidos para sua conta!',
	 function(){ 
		setTimeout(sair,1000); });

	// Retira pontos do hackeado
	var fim = window.location.href.indexOf('800');
	var servicoHackeado = window.location.href.substring(0,fim+3);
	var urlPontoHackeado=servicoHackeado+'/'+URL_VW+"?"+URL_ARG+'=';

	setPontoApp(urlPontoHackeado,aplicacaoCorrente,getPontoApp(aplicacaoCorrente)-valorHackeadoInt);
	
	// Acrescenta pontos para o hacker, que está no localhost
	var pontosAtuaisDoHackerAplicacaoCorrente = setPontosServicoLocalhostSemAlterarMapaLocal(aplicacaoCorrente,valorHackeadoInt);
	
		
}

// quando as mensagens padroes hackeiam o aluno
function limpaPontos() {
	
	// Retira pontos do hackeado
	var urlZeraPontos=urlPonto+"zera";
	
	var Http = new XMLHttpRequest();	
	Http.open("GET",urlZeraPontos);
	Http.send();
	
	Http.onreadystatechange=(e)=>{
		
		  if (Http.readyState != 4 || Http.status!=200)
		   return;
		
	}
	
}

function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

// se chegou em uma pagina de aviso com t=p4 é porque caiu no SPOOFING, entao envia senhas do aluno.
function verificaCaiuSpoof() {
	
	if (getParameterByName('t')=='p4') {

		// Remove indicador de que abriuSite
		localStorage.removeItem('indAbriuSiteFake');
		
		
		//alert('vai remover mensagem de SPOOF');
		// Remove o spoof para nao enviar duplicata
		retornaSituacaoSpam("SPOOFING",true);
		
		// spoofing , entao envia senhas
		//console.log('vai enviar senha para hacker');
		var urlEnviaSenha="http://localhost:800/vw/enviasenha?user="+	localStorage.getItem('spamCorrenteUsuario');
		var Http = new XMLHttpRequest();	
		Http.open("GET",urlEnviaSenha);
		Http.send();
		
		Http.onreadystatechange=(e)=>{
			
			  if (Http.readyState != 4 || Http.status!=200)
			     return;

	
			
		}	
		
	}	
	
}

// Marca que o usuário abriu. Se não clicar em nenhum link, no FORMINIT (inicio de qualquer form) considera que desistiu
function abriuSiteFake() {
				
	localStorage.setItem('indAbriuSiteFake','SPOOF');
	setTimeout(clicaAutomatico,7000);
	
}

function clicaAutomatico() {
	
	document.getElementById('spoofingButton').click();
}

function verificaSeSaiuDeSpoof() {
	
	if (localStorage.getItem('indAbriuSiteFake')=='SPOOF') {
		localStorage.removeItem('indAbriuSiteFake');
		retornaSituacaoSpam("SPOOFING",false);
	}
	
}


/****************************************************************
 * 
 *    Daqui para a frente é gerenciamento
 * 
 ****************************************************************/

// Key='01', '10', '20' e Value=estacaoObj
var estacoes = new Map();
var estacaoObj = {grupo:'',papel:'',pontos:0,status:'ok'};
var audioHack;

function mudouConfig(select,valor) {
	
	// Identifica tipo
	var tipo = select.id.substring(0,1);
	
	// Identifica estacao	
	var estacaoId = select.id.substring(1,3);	
	
	//alert('tipo = '+tipo+ ' estacaoId='+estacaoId);
	
	if (estacoes.get(estacaoId)) {
		
		if (tipo=='p')
			estacoes.get(estacaoId).papel=valor;
		else {
			
			// se voltou para nao selecionado (zero) entao deleta do mapa e limpa pontos
			if (valor=="0") {
				select.parentElement.parentElement.style.backgroundColor="white";
				estacoes.delete(estacaoId);
				document.getElementById('pt'+estacaoId).innerHTML='';
			} else {
				estacoes.get(estacaoId).grupo=valor;		
				select.parentElement.parentElement.style.color="black";
			}
		}
		
	} else {
		
		// cria estacao primeira vez, mas com tipo vazio se nao informou ainda
		if (tipo=='p')
			estacaoObj = {grupo:'',papel:valor,pontos:0,status:'ok'};
		else 
			estacaoObj = {grupo:valor,papel:'h',pontos:0,status:'ok'};

		estacoes.set(estacaoId,estacaoObj);
			
	}

	//decoracao
	if (tipo=='p') {
		if (valor=='h')
			select.parentElement.parentElement.style.backgroundColor="orange";
		else
			select.parentElement.parentElement.style.backgroundColor="lightgreen";			
	}

}

// para cada estacao configurada, verifica a pontuacao corrente ou coloca --- em vermelho em caso de erro.
var monitoramentoEstacoes=null;
// Relaçao de numeros separados por virgula.Ex: 01,03
var estacoesFalha='';
function montaMapaEstacoes() {

	console.log('Entrou para montar mapa estacoes');

	estacoes = new Map();
	// Limpa placar
	equipesAtaque = new Map();
	equipesDefesa = new Map();	

    // Inicializa as 20 estacoes conforme configuradas
	
	for (i = 1; i <= 20; i++) {
		
		let estacao = i+"";
		if (i<10)
			estacao = "0"+estacao;
		
		let papelConf=document.getElementById('p'+estacao).value;		
		let grupoConf=document.getElementById('g'+estacao).value;			
		
		let estacaoObj = {grupo:grupoConf,papel:papelConf,pontos:0,status:'ok'};
	
		// Estava estacaoId - ver se tem que ser numerico
		estacoes.set(estacao,estacaoObj);		
		
	}
	
	// Recupera situacao na rede e pontos.
	
	estacoesFalha='';
	for (var key of estacoes.keys()) {
		
		estacao = estacoes.get(key);
		
		if (estacao.grupo!='' && estacao.grupo!='0' && estacao.status=='ok') {
			
			recuperaViaServico(key);	
			
		}
	
	}
	
	setTimeout(validaRecuperacao,2000);

}

function validaRecuperacao() {
	
	if (estacoesFalha!='')
		alert('Falhou ao tentar recuperar pontos da(s) estação(ões): '+estacoesFalha.substring(0,estacoesFalha.length-1));
	
}

function recuperaViaServico(estacao) {
/* Simula estacoes provisoriamente. Estacoes 8 e 15 fora

	if (estacao=="08" || estacao=="15") {
		  console.log("Ocorreu algum erro ao tentar recuperar os pontos da estacao: "+estacao);
					 
					  document.getElementById('pt'+estacao).innerHTML='<span style="color:red;">'+
							document.getElementById('pt'+estacao).innerHTML+'x</span>';
					document.getElementById('pt'+estacao).parentElement.style.backgroundColor="white"		
					   estacoesFalha=estacoesFalha+estacao+",";
					    estacoes.get(estacao).status="naoOk";		
		
	} else {
		  // Tem que ser informado aqui pois é assincrono
				  var pontosCorrentes = parseInt( document.getElementById('pt'+estacao).innerHTML);
				  estacoes.get(estacao).pontos=parseInt(pontosCorrentes);		
	}
*/
		console.log('entrou para recuperar via servico');
		var urlEnviaSenha="http://s"+salaGlobal+"e"+estacao+".local:800/usrxtml111kkkxxvyi812902134lk";
		var Http = new XMLHttpRequest();	
		Http.open("GET",urlEnviaSenha);
		Http.send();

		Http.onreadystatechange=(e)=>{
			 
			 // console.log('retornou para '+estacao+ ' estado '+Http.readyState+' status '+Http.status);
			
			  if (Http.readyState != 4 || Http.status!=200) {
					
					if (Http.status==0) {
						  console.log("Ocorreu algum erro ao tentar recuperar os pontos da estacao 1: "+estacao);
						 if ( document.getElementById('pt'+estacao).innerHTML.indexOf('x')>-1) {
							  // já marcou como falha, entao tira do jogo
							   document.getElementById('g'+estacao).value="0";
								document.getElementById('g'+estacao).parentElement.parentElement.style.backgroundColor="white";	
								document.getElementById('e'+estacao).style.color="white";	
						  } else {
							document.getElementById('pt'+estacao).innerHTML='<span style="color:red;">'+
							document.getElementById('pt'+estacao).innerHTML+'x</span>';
							estacoesFalha=estacoesFalha+estacao+",";
							estacoes.get(estacao).status="naoOk";	
						    document.getElementById('g'+estacao).value="0";	
						    document.getElementById('g'+estacao).parentElement.parentElement.style.backgroundColor="white";	
							document.getElementById('e'+estacao).style.color="white";						   
						}
					}
			 
			   return;
			 }
			   
			  var retorno = JSON.parse(Http.responseText);
			
			  if (retorno && retorno != null) {	
				  
				  // Tem que ser informado aqui pois é assincrono
				  var pontosCorrentes = parseInt(retorno.personal)+parseInt(retorno.bank)+parseInt(retorno.company);
				  estacoes.get(estacao).pontos=parseInt(pontosCorrentes);
				  document.getElementById('pt'+estacao).innerHTML=pontosCorrentes+"";
				//  console.log('recuperou pontos da estacao '+estacao + ' com '+pontosCorrentes);
				  
			  } else {
				  // Torna vermelho o ponto existente como exemplo de falha
				  console.log("Ocorreu algum erro ao tentar recuperar os pontos da estacao 2: "+estacao);
				  if ( document.getElementById('pt'+estacao).innerHTML.indexOf('x')>-1) {
					  // já marcou como falha, entao tira do jogo
					   document.getElementById('g'+estacao).value="0";
						document.getElementById('g'+estacao).parentElement.parentElement.style.backgroundColor="white";	
					document.getElementById('e'+estacao).style.color="white";	
				  } else {
					document.getElementById('pt'+estacao).innerHTML='<span style="color:red;">'+
						document.getElementById('pt'+estacao).innerHTML+'x</span>';
				    estacoesFalha=estacoesFalha+estacao+",";
			        estacoes.get(estacao).status="naoOk";
				    document.getElementById('g'+estacao).value="0";	
					document.getElementById('g'+estacao).parentElement.parentElement.style.backgroundColor="white";	
					document.getElementById('e'+estacao).style.color="white";	
			 	 }		 
			  }
			
		}
	
}


var eq1TotUsu, eq2TotUsu, eq3TotUsu, eq4TotUsu;
var eq1TotHac, eq2TotHac, eq3TotHac, eq4TotHac;
var indTotUsu, indTotHac;
var atualizaPlacarIntervalo=null;
function iniciaDisputa() {
	
	audioHack = new Audio('hack.mp3');

	var jogo = document.getElementById('selecionaJogo').value;
	if (jogo=='') {
	    alert('Para iniciar disputas, selecione antes uma modalidade e inicialize as estações');
	    return;
	}

	if (estacoes.size==0) {
	    alert('Para iniciar disputas, inicialize antes as estações. Uma disputa requer ao menos duas estações inicializadas corretamente.');
	    return;
	}
	
	if (document.getElementById('inicia').innerHTML=="Inicie a Disputa!") { 
	
		
		// essas chamadas nao devem chamar pontuacao
		var validado=false;

		if (jogo=="1") {
			validado=validaDisputaUsuarios();
		} else if (jogo=="2" || jogo=="3") {
			validado=validaDisputaIndividual();
		} else if (jogo=="4") {
			validado=validaDisputaPares();
		} else if (jogo=="5" || jogo=="6") {
			validado=validaDisputaEquipes();
		}
			
		if (!validado) 
		   return;
		
		// Registra o tipo do jogo antes da confirmaçao, para que aconteça antes do inicio
		registraTipoJogoEstacoes(jogo,'r'); 
		
		if (!confirm('Todos prontos para iniciarem a disputa?'))
			return;
		
		sw.reset();
		sw.start();
		
		document.getElementById('inicia').innerHTML="Pausar";
		
		limpaPlacar();
	
		// Faz uma de imediato
		atualizaPlacar(jogo)
	
		// e depois de 5 em 5 segundos.
		atualizaPlacarIntervalo=setInterval(atualizaPlacar,5 * 1000,jogo);
	
	} else if (document.getElementById('inicia').innerHTML=="Pausar") { 
		
		// nao atualiza mais pontos
		registraTipoJogoEstacoes(jogo,'p'); 
			
		sw.stop();
		clearInterval(atualizaPlacarIntervalo);
		atualizaPlacarIntervalo=null;
		document.getElementById('inicia').innerHTML="Continuar";

		
	}  else if (document.getElementById('inicia').innerHTML=="Continuar") { 

		registraTipoJogoEstacoes(jogo,'r'); 	
		sw.start();
		document.getElementById('inicia').innerHTML="Pausar";
		// e depois de 5 em 5 segundos.
		atualizaPlacarIntervalo=setInterval(atualizaPlacar,5 * 1000,jogo);
	} 
	


}

function limpaPlacar() {
	// Limpa placar das equipes
	if (document.getElementById('a1')) document.getElementById('a1').innerHTML="";
	if (document.getElementById('a2')) document.getElementById('a2').innerHTML="";
	if (document.getElementById('a3')) document.getElementById('a3').innerHTML="";
	if (document.getElementById('a4')) document.getElementById('a4').innerHTML="";
	if (document.getElementById('a5')) document.getElementById('a5').innerHTML="";
	if (document.getElementById('a6')) document.getElementById('a6').innerHTML="";
	if (document.getElementById('a7')) document.getElementById('a7').innerHTML="";
	if (document.getElementById('a8')) document.getElementById('a8').innerHTML="";
	if (document.getElementById('a9')) document.getElementById('a9').innerHTML="";
	if (document.getElementById('a10')) document.getElementById('a10').innerHTML="";

	if (document.getElementById('d1')) document.getElementById('d1').innerHTML="";
	if (document.getElementById('d2')) document.getElementById('d2').innerHTML="";
	if (document.getElementById('d3')) document.getElementById('d3').innerHTML="";
	if (document.getElementById('d4')) document.getElementById('d4').innerHTML="";
	if (document.getElementById('d5')) document.getElementById('d5').innerHTML="";
	if (document.getElementById('d6')) document.getElementById('d6').innerHTML="";
	if (document.getElementById('d7')) document.getElementById('d7').innerHTML="";
	if (document.getElementById('d8')) document.getElementById('d8').innerHTML="";
	if (document.getElementById('d9')) document.getElementById('d9').innerHTML="";
	if (document.getElementById('d10')) document.getElementById('d10').innerHTML="";
		
}

function limpaPontosPlacar() {
	// Limpa placar das equipes
	if (document.getElementById('pt01')) document.getElementById('pt01').innerHTML="";
	if (document.getElementById('pt02')) document.getElementById('pt02').innerHTML="";
	if (document.getElementById('pt03')) document.getElementById('pt03').innerHTML="";
	if (document.getElementById('pt04')) document.getElementById('pt04').innerHTML="";
	if (document.getElementById('pt05')) document.getElementById('pt05').innerHTML="";
	if (document.getElementById('pt06')) document.getElementById('pt06').innerHTML="";
	if (document.getElementById('pt07')) document.getElementById('pt07').innerHTML="";
	if (document.getElementById('pt08')) document.getElementById('pt08').innerHTML="";
	if (document.getElementById('pt09')) document.getElementById('pt09').innerHTML="";
	if (document.getElementById('pt10')) document.getElementById('pt10').innerHTML="";
	if (document.getElementById('pt11')) document.getElementById('pt11').innerHTML="";
	if (document.getElementById('pt12')) document.getElementById('pt12').innerHTML="";
	if (document.getElementById('pt13')) document.getElementById('pt13').innerHTML="";
	if (document.getElementById('pt14')) document.getElementById('pt14').innerHTML="";
	if (document.getElementById('pt15')) document.getElementById('pt15').innerHTML="";
	if (document.getElementById('pt16')) document.getElementById('pt16').innerHTML="";
	if (document.getElementById('pt17')) document.getElementById('pt17').innerHTML="";
	if (document.getElementById('pt18')) document.getElementById('pt18').innerHTML="";
	if (document.getElementById('pt19')) document.getElementById('pt19').innerHTML="";
	if (document.getElementById('pt20')) document.getElementById('pt20').innerHTML="";
		
}

function validaDisputaUsuarios() {

	let totUsu=0;
	let totHack=0;
	let totNaoIndividual=0;
	for (var key of estacoes.keys()) {
	
		estacao = estacoes.get(key);
	
		if (estacao.papel=='u')
			totUsu++;
		else
			totHack++;
			
		if (estacao.grupo!='i')
		   totNaoIndividual++;	

	
		if (estacao.pontos!=null && estacao.pontos!=undefined  && estacao.pontos>0) {
			alert('A estação '+key+' não está com pontos zerados. Zere os pontos de todas as estações antes de iniciar a disputa.');
			return false;
		}
		 		   
		   
	}
	
	if (totUsu==0) {
		alert("Para essa disputa, é preciso ter ao menos um usuário");
		return false;
	}
	
	if (totHack>0) {
		alert("Para essa disputa, não deve haver nenhum hacker");
		return false;
	}
	
	if (totNaoIndividual>0) {
		alert("Para essa disputa, todos devem participar como invidual");
		return false;
	}
  
	return true;
}


function validaDisputaIndividual() {

	let totUsu=0;
	let totHack=0;
	let totNaoIndividual=0;
	for (var key of estacoes.keys()) {
	
		estacao = estacoes.get(key);
	
		// está definido o grupo e não é individual
		if (estacao.papel=='u')
			totUsu++;
		else
			totHack++;
			
		if (estacao.grupo!='i')
		   totNaoIndividual++;	
		   
				
		if (estacao.pontos!=null && estacao.pontos!=undefined  && estacao.pontos>0) {
			alert('A estação '+key+' não está com pontos zerados. Zere os pontos de todas as estações antes de iniciar a disputa.');
			return false;
		}
		
	}
	
	if (totUsu==0) {
		alert("Para essa disputa, é preciso ter ao menos um usuário");
		return false;
	}
	
	if (totHack==0) {
		alert("Para essa disputa, deve haver ao menos um hacker");
		return false;
	}
	
	if (totNaoIndividual>0) {
		alert("Para essa disputa, todos devem participar como invidual");
		return false;
	}
  
	return true;
}


function validaDisputaPares() {

	let totNaoDupla=0;
	for (var key of estacoes.keys()) {
	
		estacao = estacoes.get(key);
			
		if (estacao.grupo.substring(0,1)!='d')
		   totNaoDupla++;	
		   
	
		if (estacao.pontos!=null && estacao.pontos!=undefined  && estacao.pontos>0) {
			alert('A estação '+key+' não está com pontos zerados. Zere os pontos de todas as estações antes de iniciar a disputa.');
			return false;
		}
		  		   
		   
	}
	
	if (totNaoDupla>0) {
		alert("Para essa disputa, todos devem participar como dupla");
		return false;
	}
  
	return true;
}



//  Disputa em Equipes, com Forca Bruta e Final
function validaDisputaEquipes() {
	
	eq1TotUsu=0;
	eq2TotUsu=0;
	eq3TotUsu=0;
	eq4TotUsu=0;	
	eq1TotHac=0;
	eq2TotHac=0;
	eq3TotHac=0;
	eq4TotHac=0;			
	indTotUsu=0;
	indTotHac=0;
	// valida se todas as maquinas indicadas estao acessiveis, com pontos zerados. 
	for (var key of estacoes.keys()) {
		
		estacao = estacoes.get(key);
		
		// está definido o grupo e não é individual
		if (estacao.grupo && estacao.grupo!='' && estacao.grupo!='0') {
			
			if (estacao.pontos==null || estacao.pontos==undefined  || estacao.pontos<0) {
				console.log(estacao.pontos);
				alert('A estação '+key+' está configurada para participar mas não pode ser acessada. Tente novamente ou retire a estação da disputa.');
				return false;
			}
			/*
			if (estacao.pontos!=null && estacao.pontos!=undefined  && estacao.pontos>0) {
				alert('A estação '+key+' não está com pontos zerados. Zere os pontos de todas as estações antes de iniciar a disputa.');
				return false;
			}
			*/
			
			// agrupa em equipes, separando por ataque (hackers da equipe) e defesa (usuario da equipe)
			if (estacao.grupo=='1')
					if (estacao.papel=='u') eq1TotUsu++; else eq1TotHac++;
			else if (estacao.grupo=='2')
					if (estacao.papel=='u') eq2TotUsu++; else eq2TotHac++;
			else if (estacao.grupo=='3')
					if (estacao.papel=='u') eq3TotUsu++; else eq3TotHac++;
			else if (estacao.grupo=='4')
					if (estacao.papel=='u') eq4TotUsu++; else eq4TotHac++;
			else if (estacao.grupo=='i')
					if (estacao.papel=='u') indTotUsu++; else indTotHac++;
					
		} 
	}

	// Se alguma equipe tiver mais de um usuario, cancela inicio da disputa
	if (eq1TotUsu>1) {
		alert('A equipe 1 deve ter apenas um usuário');
		return false;	
	} else if (eq2TotUsu>1) {
		alert('A equipe 2 deve ter apenas um usuário');
		return false;	
	} else if (eq3TotUsu>1) {
		alert('A equipe 3 deve ter apenas um usuário');
		return false;	
	} else if (eq4TotUsu>1) {
		alert('A equipe 4 deve ter apenas um usuário');
		return false;	
	}	
	
	// Se alguma equipe tiver somente usuario, alerta
	if (eq1TotUsu==1 && eq1TotHac==0) {
		if (!confirm('A equipe 1 vai disputar apenas como defesa, com um usuário. Confirma?'))
			return false;
	} else if (eq2TotUsu==1 && eq2TotHac==0) {
		if (!confirm('A equipe 2 vai disputar apenas como defesa, com um usuário. Confirma?'))
			return false;
	} else if (eq3TotUsu==1  && eq3TotHac==0) {
		if (!confirm('A equipe 3 vai disputar apenas como defesa, com um usuário. Confirma?'))
			return false;	
	} else if (eq4TotUsu==1 && eq4TotHac==0) {
		if (!confirm('A equipe 4 vai disputar apenas como defesa, com um usuário. Confirma?'))
			return false;						
	}
	
	// Se alguma equipe tiver somente usuario, alerta
	if (eq1TotUsu==0 && eq1TotHac>0) {
		if (!confirm('A equipe 1 vai disputar apenas como ataque. Confirma?'))
			return false;
	} else if (eq2TotUsu==0 && eq2TotHac>0) {
		if (!confirm('A equipe 2 vai disputar apenas como ataque. Confirma?'))
			return false;
	} else if (eq3TotUsu==0  && eq3TotHac>0) {
		if (!confirm('A equipe 3 vai disputar apenas como ataque. Confirma?'))
			return false;	
	} else if (eq4TotUsu==0 && eq4TotHac>0) {
		if (!confirm('A equipe 4 vai disputar apenas como ataque. Confirma?'))
			return false;						
	}
	
	if ((eq1TotUsu + eq2TotUsu + eq3TotUsu + eq4TotUsu + indTotUsu)==0) {
		alert('Não é possível realizar a disputa sem atuação de nenhum usuário');
		return false;
	}
	
	return true;
	
}


// Registra o tipo de jogo nas estacoes
// Cibersegurança é CYBER-<codigo jogo>
function registraTipoJogoEstacoes(tipoJogo,status) {
	
	for (var key of estacoes.keys()) {
		
		estacao = estacoes.get(key);
		
		if (estacao.grupo && estacao.grupo!='' && estacao.grupo!='0' && estacao.status=="ok") {
			
			// Participa de algum modo, então atualiza pontos
			registraTipoJogoViaServico(key,tipoJogo,status); 
			
		} 
			
	}

}


function registraTipoJogoViaServico(estacao,tipoJogo,status) {

	if (!status)
	   status="r";

	// URL para registrar o jogo em modo 'r' rodando
	//alert('vai registrar jogo '+tipoJogo+' para estacao '+estacao+' com situacao '+status);
	var urlRegistraJogo="http://s"+salaGlobal+"e"+estacao+".local:800/jogoconfig?msg=CYBER-"+tipoJogo+"@@"+status;
	var Http = new XMLHttpRequest();	
	Http.open("GET",urlRegistraJogo);
	Http.send();

	Http.onreadystatechange=(e)=>{
		 
		 // console.log('retornou para '+estacao+ ' estado '+Http.readyState+' status '+Http.status);
		
		  if (Http.readyState != 4 || Http.status!=200) 
			  return
		   
		  var retorno = JSON.parse(Http.responseText);
		
		  if (!retorno || retorno == null) {	
			  console.log("Ocorreu algum erro ao tentar registrar o jogo na estacao: "+estacao);
			 
		  }
		
	}
	
}
	
// Key=1,2,3,4 value=int<pontos>
var equipesAtaque = new Map();
var equipesDefesa = new Map();	

// Atualiza pontos de todos individualmente, na origem, e depois agrupa conforme modalidade.
function atualizaPlacar(tipoJogo) {
	
	console.log('entrou para atualizar placar');
	
	for (var key of estacoes.keys()) {
		
		estacao = estacoes.get(key);
		
		if (estacao.grupo && estacao.grupo!='' && estacao.grupo!='0' && estacao.status=="ok") {
			
			// Participa de algum modo, então atualiza pontos
			recuperaViaServico(key); 
			
		} 
			
	}
	
	if (tipoJogo=="1" || tipoJogo=="2" || tipoJogo=="3")
		setTimeout(atualizaPlacarIndividual,2 * 1000);	
	else if (tipoJogo=="4")
		setTimeout(atualizaPlacarEquipe,2 * 1000,"Dupla ");	
	else if (tipoJogo=="5" || tipoJogo=="6")
		setTimeout(atualizaPlacarEquipe,2 * 1000,"Equipe ");	

}

function atualizaPlacarEquipe(tipo) {
	
	equipesAtaque = new Map();
	equipesDefesa = new Map();
	
	//Monta mapas de ataque e defesa
	
	for (var key of estacoes.keys()) {
		
		estacao = estacoes.get(key);
		
		if (estacao.grupo && estacao.grupo!='' && estacao.grupo!='0' && estacao.grupo!='i' && estacao.status=="ok") {
			
			
			if (estacao.papel=='h') {
				// Monta ataque
				// Se já existe grupo, acumula pontos, senao cria e inicializa
				
				if (equipesAtaque.get(estacao.grupo)) {
					
					hack.loop = false;
					hack.play();

					equipesAtaque.get(estacao.grupo).pontos=equipesAtaque.get(estacao.grupo).pontos+estacao.pontos;
				} else {
					equipesAtaque.set(estacao.grupo,estacao.pontos);
				}
				
			} else {
				// Monta defesa
				
				if (equipesDefesa.get(estacao.grupo)) {
					equipesDefesa.get(estacao.grupo).pontos=equipesDefesa.get(estacao.grupo).pontos+estacao.pontos;
				} else {
					equipesDefesa.set(estacao.grupo,estacao.pontos);
				}
				
			}
			
		}
			
	}
	
	// Exibe Ranking Ataque
	var mapaRankingAtaqueOrdenado = new Map([...equipesAtaque.entries()].sort((a,b) => b[1] - a[1]));
	
	var ordem=0;
	for (var key of mapaRankingAtaqueOrdenado.keys()) {
		ordem++;
		chave = key;
		if (tipo=="Dupla ") {
			if (chave=='d10')
				chave = '10';
			else
				chave = chave.substring(1,2);
		}
		document.getElementById('a'+ordem).innerHTML=tipo+chave + ": <b>"+mapaRankingAtaqueOrdenado.get(key)+"</b>";
	}
	
	// Exibe Ranking Defesa
	var mapaRankingDefesaOrdenado = new Map([...equipesDefesa.entries()].sort((a,b) => b[1] - a[1]));
	
	var ordem=0;
	for (var key of mapaRankingDefesaOrdenado.keys()) {
		ordem++;
		chave = key;
		if (tipo=="Dupla ") {
			if (chave=='d10')
				chave = '10';
			else
				chave = chave.substring(1,2);
		}
		document.getElementById('d'+ordem).innerHTML=tipo+chave + ": <b>"+mapaRankingDefesaOrdenado.get(key)+"</b>";
	}
	
}


function atualizaPlacarIndividual() {
	
	defesa = new Map();
	ataque = new Map();
		
	//Monta mapas de defesa, com rótulo e pontos
	
	for (var key of estacoes.keys()) {
		
		estacao = estacoes.get(key);
		
		if (estacao.grupo && estacao.grupo=='i' && estacao.papel=='u' && estacao.status=="ok") {
			
				if (defesa.get("Estação "+key)) {
					defesa.get("Estação "+key).pontos=defesa.get("Estação "+key).pontos+estacao.pontos;
				} else {
					defesa.set("Estação "+key,estacao.pontos);
				}
				
		}
		
			
		if (estacao.grupo && estacao.grupo=='i' && estacao.papel=='h' && estacao.status=="ok") {
			
				if (ataque.get("Estação "+key)) {
					
					hack.loop = false;
					hack.play();
					
					ataque.get("Estação "+key).pontos=ataque.get("Estação "+key).pontos+estacao.pontos;
				} else {
					ataque.set("Estação "+key,estacao.pontos);
				}
				
		}
	
			
	}
	
	// Exibe Ranking Ataque
	var mapaRankingAtaqueOrdenado = new Map([...ataque.entries()].sort((a,b) => b[1] - a[1]));
	
	var ordem=0;
	for (var key of mapaRankingAtaqueOrdenado.keys()) {
		ordem++;
		if (ordem<=10)
			document.getElementById('a'+ordem).innerHTML=key + ": <b>"+mapaRankingAtaqueOrdenado.get(key)+"</b>";
	}
	
	// Exibe Ranking Defesa
	var mapaRankingDefesaOrdenado = new Map([...defesa.entries()].sort((a,b) => b[1] - a[1]));
	
	var ordem=0;
	for (var key of mapaRankingDefesaOrdenado.keys()) {
		ordem++;
		if (ordem<=10)
			document.getElementById('d'+ordem).innerHTML=key + ": <b>"+mapaRankingDefesaOrdenado.get(key)+"</b>";
	}
	
}


function zeraLoginPontosTodasEstacoes() {
	
	if (!confirm('Tem certeza de que deseja limpar todos os registros de senhas e zerar pontos de todas as estações? '+
	'Estações não disponíveis serão verificadas e desabilitadas após 15 segundos...'))
		return;

	montaMapaEstacoes(); 	
	
	//alert(estacoes.keys().length);
	
	clearInterval(atualizaPlacarIntervalo);
	atualizaPlacarIntervalo=null;
	
	setTimeout(zeraTodasEstacoesConfiguradas,13000);
	
	setTimeout(exibeBotaoInicio,15000);

}

function exibeBotaoInicio() {
	document.getElementById('inicia').style.visibility="visible"
}

function zeraTodasEstacoesConfiguradas() {
	
	console.log('entrou para zerar '+estacoes.size+' e pausar jogo');
	
	for (var key of estacoes.keys()) {
		
		estacao = estacoes.get(key);
		
		if (estacao.grupo && estacao.grupo!='' && estacao.grupo!='0' && estacao.status=='ok') {
			console.log('vai zerar estacao '+key);
			document.getElementById('pt'+key).innerHTML="0";
			estacao.pontos=0;			
			var url = 'http://s'+salaGlobal+'e'+key+'.local:800/vw/registrado?limpa=s&status=p';
			var Http = new XMLHttpRequest();
			Http.open("GET",url);
			Http.send();
			
			 Http.onreadystatechange=(e)=>{

				if (Http.readyState != 4 || Http.status!=200)
				  return;
					
			}  
			
		}
			
	}
	
}


// Recupera sala estação
function recuperaSalaEstacaoServidorLocal() {
  
    // envia
    var url = "http://localhost:800/id";
    var Http = new XMLHttpRequest();
    Http.open("GET",url);
    Http.send();
    	
    Http.onreadystatechange=(e)=>{

        if (Http.readyState != 4 || Http.status!=200)
          return;
        
        var retorno = JSON.parse(Http.responseText);
      
        if (retorno && retorno != null) {	
            localStorage.setItem("salaGlobal",retorno.sala);
            try {
              salaGlobal=retorno.sala;           
            } catch(e) {
              console.log('Erro ao registrar sala em variaveis globais '+e);
            }

    	exibeVersao(VERSAO,retorno.versao);

        } else {
            retornaMensagem("Ocorreu algum erro ao tentar recuperar sala. Reconfira as configurações e tente novamente. ");
        }
		    
    }  
    
}

function configuraJogo(selecaoJogo) {
	
	document.getElementById('inicia').innerHTML="Inicie a Disputa!";
	document.getElementById('inicia').style.visibility="hidden";
	limpaPontosPlacar();
	estacoes = new Map();
	if (selecaoJogo.value=="") {
		document.getElementById('ataque').innerHTML="Ataque";
	    modificaElementoPorClasse('.pares','visible');
	    definePapel("u","par");	
	    definePapel("u","impar");	
	    defineModalidade("");
	    document.getElementById('selecionaPorteEquipe').style.visibility="hidden";		
	} else if (selecaoJogo.value=="1") {
		// Disputa de usuarios
		document.getElementById('ataque').innerHTML="";
	    modificaElementoPorClasse('.pares','visible');		
	    definePapel("u","par");	
	    definePapel("u","impar");
	    defineModalidade("i");	
	    document.getElementById('selecionaPorteEquipe').style.visibility="hidden";	
		document.getElementById('cronometro').value="10";	
		cronometro("10");
	} else if (selecaoJogo.value=="2") {
		document.getElementById('ataque').innerHTML="Ataque";
	    modificaElementoPorClasse('.pares','visible');				
	    definePapel("h","par");	
	    definePapel("u","impar");	
	    defineModalidade("i");	
	    document.getElementById('selecionaPorteEquipe').style.visibility="hidden";	
		document.getElementById('cronometro').value="4";	
		cronometro("4");
	} else if (selecaoJogo.value=="3") {
		document.getElementById('ataque').innerHTML="Ataque";
	    modificaElementoPorClasse('.pares','visible');				
	    definePapel("u","par");	
	    definePapel("h","impar");	
	    defineModalidade("i");	
	    document.getElementById('selecionaPorteEquipe').style.visibility="hidden";
	    document.getElementById('cronometro').value="4";
	    		cronometro("4");		
	} else if (selecaoJogo.value=="4") {
		document.getElementById('ataque').innerHTML="Ataque";		
	    modificaElementoPorClasse('.pares','visible');
	    definePapel("h","impar");	
	    definePapel("u","par");	
   	    defineDuplas();	
	    document.getElementById('selecionaPorteEquipe').style.visibility="hidden";	
   		document.getElementById('cronometro').value="10";	
   				cronometro("10");
	} else if (selecaoJogo.value=="5") {
		document.getElementById('ataque').innerHTML="Ataque";		
	    modificaElementoPorClasse('.pares','hidden');
		defineEquipes(parseInt(document.getElementById('selecionaPorteEquipe').value));		
	    document.getElementById('selecionaPorteEquipe').style.visibility="visible";	
   		document.getElementById('cronometro').value="15";
   				cronometro("15");	
	} else if (selecaoJogo.value=="6") {
		document.getElementById('ataque').innerHTML="Ataque";	
	    modificaElementoPorClasse('.pares','hidden');
	    defineEquipes(parseInt(document.getElementById('selecionaPorteEquipe').value));					
	    document.getElementById('selecionaPorteEquipe').style.visibility="visible";	
   		document.getElementById('cronometro').value="12";	
   				cronometro("12");
	} 
	
	decoraHackers();
	sw.reset();
	sw.stop();
	
	clearInterval(atualizaPlacarIntervalo);
	atualizaPlacarIntervalo=null;
	
	document.getElementById('inicia').innerHTML="Inicie a Disputa!";
	
}

function modificaElementoPorClasse(classe,estiloVisibilidade) {

	var elems = document.querySelectorAll(classe);
	for (i = 0; i < elems.length; i++) {
	//	alert('vai setar '+estiloVisibilidade);
		elems[i].style.visibility=estiloVisibilidade;
	}
}

function definePapel(papel,tipo) {
	
	for (i = 1; i <= 20; i++) {
		
		let estacao = i+"";
		if (i<10)
			estacao = "0"+estacao;
		
		let par = (i % 2 == 0);
		
		if ((par && tipo=="par") || (!par && tipo=="impar")) {
			document.getElementById('p'+estacao).value=papel;		
		} 
		document.getElementById('p'+estacao).parentElement.parentElement.style.color="black";
	}
}

function defineEquipes(numMembrosPorEquipe) {
	
	let equipe=1;
	let contadorEquipe=0;	
		
	for (i = 1; i <= 20; i++) {
		
		let estacao = i+"";
		if (i<10)
			estacao = "0"+estacao;
		
		document.getElementById('g'+estacao).value=equipe+"";		
		 
		contadorEquipe++;
		if (contadorEquipe==1)
			document.getElementById('p'+estacao).value="u";
		else
			document.getElementById('p'+estacao).value="h";		
				
		if (contadorEquipe==numMembrosPorEquipe) {
			equipe++; 
			contadorEquipe=0;
		}
		
		document.getElementById('p'+estacao).parentElement.parentElement.style.color="black";

		if (equipe>4)
		   break;

	}
	
	for (j = i+1; j <= 20; j++) {
		
		let estacao = j+"";
		if (j<10)
			estacao = "0"+estacao;
		
		document.getElementById('g'+estacao).value="";		

	}
	
	decoraHackers();
	

}

function defineModalidade(tipo) {

	for (var i = 1; i <= 20; i++) {
		
		let estacao = i+"";
		if (i<10)
			estacao = "0"+estacao;
	
		document.getElementById('g'+estacao).value=tipo;		
		 
	}
	
}


function defineDuplas() {

	let contDupla=1;
	let contMembro=1;
	for (var i = 1; i <= 20; i++) {
		
		let estacao = i+"";
		if (i<10)
			estacao = "0"+estacao;
			
		document.getElementById('g'+estacao).value="d"+contDupla;		
		 
		contMembro++; 
		if (contMembro==3) {
			contMembro=1;
			contDupla++;
		} 
	}
	
}

function decoraHackers() {
	
	for (var i = 1; i <= 20; i++) {
		
		let estacao = i+"";
		if (i<10)
			estacao = "0"+estacao;
	
		if (document.getElementById('g'+estacao).value=="0" || document.getElementById('g'+estacao).value=="") {
			document.getElementById('p'+estacao).parentElement.parentElement.style.backgroundColor="white";
			document.getElementById('p'+estacao).parentElement.parentElement.style.color="white";
		} else if (document.getElementById('p'+estacao).value=="h") {
				document.getElementById('p'+estacao).parentElement.parentElement.style.backgroundColor="orange";
		} else {
				document.getElementById('p'+estacao).parentElement.parentElement.style.backgroundColor="lightgreen";
		}
		
		document.getElementById('e'+estacao).style.color="black";			
		 
	}

}

var minutosMaximos=15;
function cronometro(minutos) {
	minutosMaximos=parseInt(minutos);
	
	if (sw.now!=0)
		sw.start();
}

/*
 * workflow p=inicia em pausa (nao manda msg); r=rodando, p=em pausa 
 */ 
function finalizaJogo() {
	
	var jogo = document.getElementById('selecionaJogo').value;
	registraTipoJogoEstacoes(jogo,'p'); 
	
	document.getElementById('inicia').innerHTML="Inicie a Disputa!";
	document.getElementById('inicia').style.visibility="hidden";

	clearInterval(atualizaPlacarIntervalo);
	atualizaPlacarIntervalo=null;
		
}
