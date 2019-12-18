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
	
	// Neste caso, formado por "usuario_eXX", onde eXX é o numero da estacao corrente se usando localhost	
	var Http = new XMLHttpRequest();
	Http.open("GET",url);
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

function getPontoApp(tipoApp) {
	
	return pontos.get(tipoApp);
}


// Recupera total de pontos correntes no servidor, por tipo de aplicacao
function getPontosServico() {
	
	var Http = new XMLHttpRequest();	
	Http.open("GET",url);
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
		}
	}
	
}

function setPontoApp(url,tipoApp,pontosTotais) {

	var Http = new XMLHttpRequest();	
	Http.open("GET",url+tipoApp+"$"+pontosTotais);
	Http.send();
	
	Http.onreadystatechange=(e)=>{
		
		if (Http.readyState != 4 || Http.status!=200)
		   return;
		   
		pontos.set(tipoApp,pontosTotais);
		
		var pontoLocal = localStorage.getItem(tipoApp+"patrimonioAtual");
		var pontoLocalInt = 0;
		if (pontoLocal && pontoLocal != null)
			pontoLocalInt = parseInt(pontoLocal);
			
		localStorage.setItem(tipoApp+"patrimonioAtual",(pontoLocalInt+pontosTotais)+'');
	}
}


function getSenha(tipoApp,login,next) {
	
	var Http = new XMLHttpRequest();
	Http.open("GET",urlSenha+tipoApp+login);
	Http.send();
	
	Http.onreadystatechange=(e)=>{
		
		  if (Http.readyState != 4 || Http.status!=200)
		   return;
		
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
		
	
	var primeira = Math.floor(Math.random() * 40) + 15;

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
	
	//console.log('vai gerar novas notificacoes');
	
	setTimeout(geraGanhoPorAplicacao,proxima * 1000,aplicacao);
	
}

var ganhoPersonal=["Seus 200 livros digitais chegaram!#200#https://mycloud.com.br?b=2312#S#Amazônia Livros",
"Você ganhou licença para 500 músicas!#500#https://mycloud.com.br/#S#Amazônia Music",
"Seu amigo lhe presenteou com 1000 séries de TV!#1000#https://www.mycloud.com.br/#S#Net Filmes",
"Oi, é aqui de casa! Me passa a senha da internet.#1500#https://www.facesocial.com.br/#p1#Face Social",
"Aqui é seu professor. Este é um bônus extra não divulgado! Clique pra ganhar a disputa!#500#https://www.micloud.com.br/#p1#Face Social",
"Promoção Net Filmes! 500 sessões de filmes inéditos!#500#https://www.mycloud.com.br/#S#Amazônia Filmes",
"Somente hoje! 1500 livros narrados em oferta#1500#https://mycloud.com.br?b=482#S#Amazônia Livros",
"Não dá pra perder! São 30000 livros de grátis! Pegue logo seus pontos!!#30000#http://mycloudd.com?b=44#p1#Amazônia Livros"
];
var ganhoBank=["Seu cliente pagou!#20000#https://www.bancodigital.com.br/ibanking/x13kd#S#Banco Digital",
"Seu salário foi depositado!#5000#https://www.bancodigital.com.br/ibanking/sal?id=132#S#Banco Digital",
"Olá, aqui é seu gerente! Você ganhou um seguro gratuito no valor de R$ 50.000,00, basta depositar a taxa de R$ 50,00 na conta ACE213.#50000#https://www.facesocial.com.br/#p1#Face Social",
"Seu imposto de renda foi devolvido.#10000#https://www.bancodigital.com.br/ir/f?t=xdfd#S#Banco Digital",
"Seu investimento rendeu juros!#5000#https://bancodigital.com.br/invest?i=3#S#Banco Digital",
"Seu 13o salário foi depositado!.#5000#https://www.bancodigital.com.br/ibanking/sal?id=409#S#Banco Digital",
"Você ganhou na loteria!!! Que sorte Hein?!#200000#https://www.bancodigitali.com.br#p1#Banco Digital",
"Olá, aqui é a Marcela! Depositei na sua conta o que estava te devendo.#8000#https://www.bancodigital.com.br/trnsf?t=100#S#Face Social"];
var ganhoCompany=["Confidencial! Armazene as 10 plantas industriais deste mês.#10000#https://www.acme.cc?pi=009#S#ACME LTDA",
"Aqui é o presidente da ACME!! Me passe seus dados para atualização do nosso RH. Agradeço antecipadamente!#50000#https://acmee.cc/#p1#ACME LTDA",
"Você recebeu 5 projetos confidenciais.#5000#https://www.acme.cc/projeto/conf?p=9949499399388493994348343#S#ACME LTDA",
"5 novas patentes da empresa precisam ser armazenadas.#5000#https://www.acme.cc?patentes=06930,05906820,302342#S#ACME LTDA",
"Seus trabalhos deste mês subiram para a plataforma da empresa.#5000#https://acme.cc?t=1#S#ACME LTDA",
"Os projetos do nosso principal cliente foram aprovados e estão no site#15000#https://www.acme.cc/#S#ACME LTDA",
"Mais 10 projetos confidenciais estão sob sua responsabilidade.#10000#https://acme.cc/projeto/conf?p=p1ppo2i32#S#ACME LTDA",
"Você foi promovido e assumiu 20 projetos muito importantes. Confira!#20000#https://www.acme.cc?projs=a203021#S#ACME LTDA"];

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
		
		//	console.log('entrou para receber msg com '+retorno);
		
			if (retorno.status=="OK") {
				// tem SPAM, então prioriza
				var mensagem = retorno.msg.split('@@');
				spamCorrenteUsuario=mensagem[0];

				// mensagem trafegou na URL com caracter adapatado - desfaz
				spamCorrenteMensagem=mensagem[1]
				
				console.log(spamCorrenteMensagem);
				spamCorrenteMensagem=spamCorrenteMensagem.replace(/\$\$\$/g,'#');	

				console.log('entrou para receber msg com '+spamCorrenteUsuario+ ' e msg = '+spamCorrenteMensagem);
				
				localStorage.setItem('spamCorrenteUsuario',spamCorrenteUsuario);
				localStorage.setItem('spamCorrenteMensagem',spamCorrenteMensagem);				
				
				var indiceTipo = Math.floor(Math.random() * 3);
				
				indClicou=false;
				var notification = alertify.notify(decodificaNotificacao(spamCorrenteMensagem), tipoMsg[indiceTipo], 10, function(){ 
					    // entra também primeiro na funcao quando clica, mas nao indica
						
						setTimeout(verificaSeClicouSPAM,100);
						
					});	
				
			} else {
				
				//console.log('entrou para notificacao padrao');
				// nao tem SPAM, então segue nas mensagens padroes
				// se havia um SPAM corrente e nao clicou, então remove SPAM e comunica que usuario nao clicou
				if (localStorage.getItem('spamCorrenteUsuario')) {
					
					retornaSituacaoSpam(false);
					
				}
				
				
				localStorage.removeItem('spamCorrenteUsuario');
				localStorage.removeItem('spamCorrenteMensagem');			
				
				ganho = Math.floor(Math.random() * 8);
				
				indClicou=false;
				if (indiceGanho==0) {

					var notification = alertify.notify(decodificaNotificacao(ganhoPersonal[ganho]), 'custom', 10, 
																	function(){ setTimeout(verificaSeClicouGanho,100,indiceGanho);});
					var pontosEmOferta =  ganhoPersonal[ganho].split('#')[1];
					localStorage.setItem(tipoGanho[indiceGanho]+'pontosEmOferta',pontosEmOferta);

				} else if (indiceGanho==1) {
					//  TODO estilo diferente para link
					var notification = alertify.notify(decodificaNotificacao(ganhoBank[ganho]), 'success', 10, 
																	function(){ setTimeout(verificaSeClicouGanho,100,indiceGanho);  });
					var pontosEmOferta =  ganhoBank[ganho].split('#')[1];
					localStorage.setItem(tipoGanho[indiceGanho]+'pontosEmOferta',pontosEmOferta);

				} else if (indiceGanho==2) {
					var notification = alertify.notify(decodificaNotificacao(ganhoCompany[ganho]), 'warning', 10, 
																function(){  setTimeout(verificaSeClicouGanho,100,indiceGanho);  });
					var pontosEmOferta = ganhoCompany[ganho].split('#')[1];
					localStorage.setItem(tipoGanho[indiceGanho]+'pontosEmOferta',pontosEmOferta);

				}
			}
		}
	}
	
}

function verificaSeClicouGanho(indiceSite) {
	
	if (indClicou) {
		//console.log('clicou');		
		 if (window.location.href.indexOf('personal_login')==-1 && indiceSite==0) 
			window.open("personal_login.html", "_self"); 
		 else if (window.location.href.indexOf('bank_login')==-1 && indiceSite==1) 
			window.open("bank_login.html", "_self");
		 else if (window.location.href.indexOf('company_login')==-1 && indiceSite==2) 
			window.open("company_login.html", "_self");

	
	} else {
		//console.log('nao clicou');
	}
	
	// mesmo quando hackeia, prossegue.
	//var proxima = Math.floor(Math.random() * 10000) + 9000;

	//setTimeout(geraGanhoPorAplicacao,proxima,aplicacaoCorrente);
	
}

function verificaSeClicouSPAM() {

			
	if (!indClicou) {
		
		retornaSituacaoSpam(false);
		
	} else {
		
		var aux = spamCorrenteMensagem.split('#'); 
		if (aux[3]=='p2') {
		
			// PHISHING NA HORA
			window.open("hackeadousuario.html", "_self");
			retornaSituacaoSpam(true);
			localStorage.removeItem('spamCorrenteUsuario');
			localStorage.removeItem('spamCorrenteMensagem');	
		
		} else {
			var link = aux[2];
			// SPOOFING VAI PRA SITE PRIMEIRO
			// Mandar conforme o link, para o site mais proximo
			if (link.indexOf('bancodigital'))
				window.open("ban_fake.html", "_self");	
			else if (link.indexOf('acme'))
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
function retornaSituacaoSpam(indFuncionouSpam) {
	console.log('ENTROU');

	if (!localStorage.getItem('spamCorrenteUsuario'))
		return

	// Se existir SPAM enviado por outro usuário, prioriza
	var acao = "SPAM_DESCARTOU";
	if (indFuncionouSpam)
		acao = "SPAM_CLICOU";
	
	var spamCorrenteUsuario=localStorage.getItem('spamCorrenteUsuario');
	console.log('vai atualizar situacao = '+spamCorrenteUsuario);
	
	var url = 'http://localhost:800/'+URL_SPAM_RECEIVE_UPDATE+"?"+URL_SPAM_RECEIVE_UPDATE_ACAO+"="+spamCorrenteUsuario+"@@"+acao;
	var Http = new XMLHttpRequest();
	Http.open("GET",url);
	Http.send();
	
	Http.onreadystatechange=(e)=>{
		
		  if (Http.readyState != 4 || Http.status!=200)
		   return;
	
		 var retorno = JSON.parse(Http.responseText);
	 
		 if (retorno && retorno.status=="OK") {
			 console.log('atualizou status de '+spamCorrenteUsuario+"@@"+acao);
		 } else {
			 console.log('erro ao atualizar status de '+spamCorrenteUsuario+"@@"+acao);			 
		 }
	
	}
	
}

function decodificaNotificacao(notificacaoCodificada) {
	//'<b>Banco ACME</b><p><a href="sdfsd" title="https://www.meubanco.com/meudominio/este/testes">'+ganhoPersonal[ganho].replace('#',' ')+'</a>'
   var topicos = notificacaoCodificada.split('#');
   
   if (topicos[3]=='p1') {
		// phishing automatico
	return '<b>'+topicos[4]+'</b><p><a style="text-decoration:none;" class="link-message" href="/vw/hackeado.html" title="'+topicos[2]+'">'+topicos[0]+
         '</a><p><span class="link-message" style="font-size:12px">['+topicos[1]+']</span>';
   } else if (topicos[3]=='p2') {
		// phishing manual de aluno
	return '<b>'+topicos[4]+'</b><p><a style="text-decoration:none;" class="link-message" href="/vw/hackeadousuario.html" title="'+topicos[2]+'">'+topicos[0]+
            '</a><p><span class="link-message" style="font-size:12px">['+topicos[1]+']</span>';
   } else if (topicos[3]=='p4') {
		// spoofing manual de aluno
		var siteFake="ban_fake";
		if (topicos[2].indexOf('mycloud'))
			siteFake="per_fake";
		else if (topicos[2].indexOf('acme'))
			siteFake="com_fake";
		return '<b>'+topicos[4]+'</b><p><a style="text-decoration:none;" class="link-message" href="/vw/'+siteFake+'.html" title="'+topicos[2]+'">'+topicos[0]+
            '</a><p><span class="link-message" style="font-size:12px">['+topicos[1]+']</span>';
  } else {
		// ganha pontos
	return '<b>'+topicos[4]+'</b><p><a style="text-decoration:none;" href="#" class="link-message" title="'+topicos[2]+'">'+topicos[0]+
            '</a><p><span class="link-message" style="font-size:12px">['+topicos[1]+']</span>';
	}
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
	
	document.getElementById('pontos').innerHTML=patrimonioAcrescido+"";

	localStorage.removeItem(aplicacaoCorrente+'pontosEmOferta');
	
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

// quando um aluno hackeia o outro
function transfereParaMim() {

	var valorHackeadoInt = parseInt(document.getElementById('pontos').innerHTML);

	alertify.alert('Hacker','<b>'+valorHackeadoInt+'</b> créditos do site <b>'+aplicacaoCorrente+'</b> trasferidos para sua conta!');

	// Retira pontos do hackeado
	var fim = window.location.href.indexOf('800');
	var servicoHackeado = window.location.href.substring(0,fim+3);
	var urlPontoHackeado=servicoHackeado+'/'+URL_VW+"?"+URL_ARG+'=';
//	console.log(urlPontoHackeado);
	setPontoApp(urlPontoHackeado,aplicacaoCorrente,-valorHackeadoInt);
	
	// Acrescenta pontos para o hacker
	setPontoApp(urlPonto,aplicacaoCorrente,valorHackeadoInt);
	document.getElementById('pontos').innerHTML='0';	
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
