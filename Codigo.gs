/**
 * TESTE DE TRAVAS MENTAIS · servidor (Google Apps Script)
 * Este código fica DENTRO da planilha da Bárbara (Extensões > Apps Script).
 * Ele valida os códigos, grava as respostas, envia o e-mail e alimenta a área da terapeuta.
 *
 * ANTES DE TUDO: preencha as 2 linhas abaixo e rode a função "configurar" uma vez.
 */
const EMAIL_BARBARA = 'COLOQUE_AQUI_O_EMAIL_DA_BARBARA@gmail.com';
const SENHA_INICIAL = 'bavi062370';   // depois de rodar "configurar", apague o texto entre as aspas

/* ------------------------------------------------------------------ */
const ABA_CODIGOS = 'Codigos';
const ABA_RESPOSTAS = 'Respostas';
const TRAVAS = ['Autoconfiança','Escassez','Aprovação','Paterna','Competência','Vítima','Perfeição','Servidor','Procrastinação','Ambiente'];
const CAB_CODIGOS = ['Código','Cliente','Criado em','Situação','Usado em','Usado por'];
const CAB_DADOS = ['ID','Data','Código','Nome','Idade','Gênero','WhatsApp','E-mail','Profissão','Renda','O que levou à terapia','Maior dor','Como se vê'];
const N_PERGUNTAS = 50;

/** Rode UMA vez: cria as abas, os cabeçalhos e guarda a senha. */
function configurar() {
  const ss = SpreadsheetApp.getActive();
  let c = ss.getSheetByName(ABA_CODIGOS) || ss.insertSheet(ABA_CODIGOS);
  c.getRange(1, 1, 1, CAB_CODIGOS.length).setValues([CAB_CODIGOS]).setFontWeight('bold');
  c.setFrozenRows(1);
  c.getRange('A:F').setNumberFormat('@');

  let r = ss.getSheetByName(ABA_RESPOSTAS) || ss.insertSheet(ABA_RESPOSTAS);
  const cab = CAB_DADOS.concat(
    Array.from({length: N_PERGUNTAS}, (_, i) => 'P' + (i + 1)),
    TRAVAS.map(t => 'Média ' + t)
  );
  r.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight('bold');
  r.setFrozenRows(1);
  r.getRange(1, 1, r.getMaxRows(), CAB_DADOS.length).setNumberFormat('@');

  if (SENHA_INICIAL && SENHA_INICIAL !== 'TROQUE_ESTA_SENHA') {
    PropertiesService.getScriptProperties().setProperty('ADMIN_SENHA', SENHA_INICIAL);
  } else {
    throw new Error('Escreva a senha na SENHA_INICIAL (linha 10) antes de rodar "configurar".');
  }
  MailApp.getRemainingDailyQuota(); // força a autorização de envio de e-mail já agora
  Logger.log('Pronto! Abas criadas e senha salva.');
}

/** Para trocar a senha depois: escreva a nova senha abaixo, rode esta função e apague a senha daqui. */
function trocarSenha() {
  const nova = '';
  if (!nova) throw new Error('Escreva a nova senha entre as aspas na linha "const nova".');
  PropertiesService.getScriptProperties().setProperty('ADMIN_SENHA', nova);
  Logger.log('Senha trocada.');
}

/* ======================= PORTA DE ENTRADA ======================= */
function doGet() { return saida({ ok: true, servico: 'teste-travas' }); }

function doPost(e) {
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    switch (req.acao) {
      case 'validarCodigo':   return saida(validarCodigo(req));
      case 'enviarRespostas': return saida(enviarRespostas(req));
      case 'login':           exigirAdmin(req.senha); return saida({ ok: true });
      case 'gerarCodigos':    exigirAdmin(req.senha); return saida(gerarCodigos(req));
      case 'listarCodigos':   exigirAdmin(req.senha); return saida(listarCodigos());
      case 'cancelarCodigo':  exigirAdmin(req.senha); return saida(cancelarCodigo(req));
      case 'listarRespostas': exigirAdmin(req.senha); return saida(listarRespostas());
      default: return saida({ ok: false, erro: 'Ação desconhecida.' });
    }
  } catch (err) {
    return saida({ ok: false, erro: err.message || String(err) });
  }
}

function saida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ======================= SEGURANÇA DA SENHA ======================= */
function exigirAdmin(senha) {
  const cache = CacheService.getScriptCache();
  if (cache.get('bloqueio')) throw new Error('Muitas tentativas erradas. Espere 15 minutos e tente de novo.');
  const certa = PropertiesService.getScriptProperties().getProperty('ADMIN_SENHA');
  if (!certa) throw new Error('A senha ainda não foi configurada. Rode a função "configurar".');
  if (String(senha || '') !== certa) {
    const falhas = Number(cache.get('falhas') || 0) + 1;
    cache.put('falhas', String(falhas), 600);
    if (falhas >= 5) cache.put('bloqueio', '1', 900);
    throw new Error('Senha incorreta.');
  }
  cache.remove('falhas');
}

/* ======================= CÓDIGOS ======================= */
function abaCodigos() { return SpreadsheetApp.getActive().getSheetByName(ABA_CODIGOS); }

function normCodigo(s) {
  const x = String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return x.length > 4 ? x.slice(0, 4) + '-' + x.slice(4) : x;
}

function acharCodigo(codigo) {
  const aba = abaCodigos();
  const dados = aba.getDataRange().getValues();
  for (let i = 1; i < dados.length; i++) {
    if (String(dados[i][0]) === codigo) return { linha: i + 1, cliente: dados[i][1], status: dados[i][3] };
  }
  return null;
}

function validarCodigo(req) {
  const codigo = normCodigo(req.codigo);
  const c = acharCodigo(codigo);
  if (!c) throw new Error('Código não encontrado. Confira se digitou igual ao que recebeu.');
  if (c.status === 'Usado') throw new Error('Este código já foi usado. Peça um novo para a Bárbara.');
  if (c.status !== 'Disponível') throw new Error('Este código foi cancelado. Peça um novo para a Bárbara.');
  return { ok: true, cliente: c.cliente };
}

function gerarCodigos(req) {
  const qtd = Math.max(1, Math.min(20, Number(req.quantidade) || 1));
  const cliente = limpar(req.cliente, 120);
  const aba = abaCodigos();
  const existentes = new Set(aba.getDataRange().getValues().map(l => String(l[0])));
  const letras = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const novos = [];
  while (novos.length < qtd) {
    let s = '';
    for (let i = 0; i < 8; i++) s += letras[Math.floor(Math.random() * letras.length)];
    s = s.slice(0, 4) + '-' + s.slice(4);
    if (!existentes.has(s)) { existentes.add(s); novos.push(s); }
  }
  const agora = new Date().toISOString();
  aba.getRange(aba.getLastRow() + 1, 1, novos.length, 6)
     .setValues(novos.map(cod => [cod, cliente, agora, 'Disponível', '', '']));
  return { ok: true, codigos: novos };
}

function listarCodigos() {
  const dados = abaCodigos().getDataRange().getValues().slice(1);
  const codigos = dados.filter(l => l[0]).map(l => ({
    codigo: String(l[0]), cliente: String(l[1]), criadoEm: String(l[2]),
    status: String(l[3]), usadoEm: String(l[4]), usadoPor: String(l[5])
  })).reverse();
  return { ok: true, codigos };
}

function cancelarCodigo(req) {
  const c = acharCodigo(normCodigo(req.codigo));
  if (c && c.status === 'Disponível') abaCodigos().getRange(c.linha, 4).setValue('Cancelado');
  return { ok: true };
}

/* ======================= RESPOSTAS ======================= */
function limpar(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max || 2000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;   // impede que um texto vire fórmula na planilha
  return s;
}

function enviarRespostas(req) {
  const codigo = normCodigo(req.codigo);
  const r = req.resposta || {};
  const notas = (r.respostas || []).map(Number);
  if (notas.length !== N_PERGUNTAS || notas.some(n => !(n >= 1 && n <= 10))) {
    throw new Error('Algumas respostas estão faltando. Volte e confira todas as perguntas.');
  }
  ['nome', 'idade', 'genero', 'whatsapp', 'email', 'profissao', 'renda', 'dor', 'autopercepcao'].forEach(k => {
    if (!String(r[k] || '').trim()) throw new Error('Preencha todos os dados obrigatórios.');
  });

  const medias = TRAVAS.map((_, i) => {
    const bloco = notas.slice(i * 5, i * 5 + 5);
    return Math.round(bloco.reduce((a, b) => a + b, 0) / 5 * 10) / 10;
  });

  const trava = LockService.getScriptLock();
  trava.waitLock(20000);
  let id;
  try {
    const c = acharCodigo(codigo);
    if (!c || c.status !== 'Disponível') throw new Error('Este código não está mais disponível. Fale com a Bárbara.');
    id = 'R' + Date.now();
    const agora = new Date().toISOString();
    const linha = [id, agora, codigo, limpar(r.nome, 120), limpar(r.idade, 10), limpar(r.genero, 40),
      limpar(r.whatsapp, 30), limpar(r.email, 120), limpar(r.profissao, 120), limpar(r.renda, 40),
      limpar(r.motivo), limpar(r.dor), limpar(r.autopercepcao)].concat(notas, medias);
    SpreadsheetApp.getActive().getSheetByName(ABA_RESPOSTAS).appendRow(linha);
    abaCodigos().getRange(c.linha, 4, 1, 3).setValues([['Usado', agora, limpar(r.nome, 120)]]);
    SpreadsheetApp.flush();
  } finally {
    trava.releaseLock();
  }

  try { enviarEmail(r, notas, medias); } catch (err) { console.error('E-mail não enviado: ' + err); }
  return { ok: true, id, medias };
}

function listarRespostas() {
  const dados = SpreadsheetApp.getActive().getSheetByName(ABA_RESPOSTAS).getDataRange().getValues().slice(1);
  const D = CAB_DADOS.length;
  const respostas = dados.filter(l => l[0]).map(l => ({
    id: String(l[0]), data: String(l[1]), codigo: String(l[2]), nome: tirarAspas(l[3]), idade: String(l[4]),
    genero: String(l[5]), whatsapp: String(l[6]), email: tirarAspas(l[7]), profissao: tirarAspas(l[8]),
    renda: String(l[9]), motivo: tirarAspas(l[10]), dor: tirarAspas(l[11]), autopercepcao: tirarAspas(l[12]),
    respostas: l.slice(D, D + N_PERGUNTAS).map(Number),
    medias: l.slice(D + N_PERGUNTAS, D + N_PERGUNTAS + TRAVAS.length).map(Number)
  })).reverse();
  return { ok: true, respostas };
}
function tirarAspas(v) { return String(v).replace(/^'/, ''); }

/* ======================= E-MAIL PARA A BÁRBARA ======================= */
function enviarEmail(r, notas, medias) {
  if (!EMAIL_BARBARA || EMAIL_BARBARA.indexOf('COLOQUE_AQUI') === 0) return;
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ordem = medias.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
  const fmt = v => v.toFixed(1).replace('.', ',');
  const nivel = v => v >= 6 ? 'alta' : v >= 5 ? 'media' : 'baixa';
  const CORES = { alta: '#A9813C', media: '#CDB47C', baixa: '#7E9A86' };
  const grupo = n => { const l = ordem.filter(i => nivel(medias[i]) === n); return l.length ? l.map(i => TRAVAS[i] + ' (' + fmt(medias[i]) + ')').join(', ') : 'nenhuma'; };

  const barras = TRAVAS.map((t, i) => {
    const cor = CORES[nivel(medias[i])];
    const w = Math.max(2, Math.round(medias[i] * 10));
    return `<tr>
      <td style="padding:5px 10px 5px 0;text-align:right;font:14px Arial;color:#22362C;white-space:nowrap">${t}</td>
      <td style="padding:5px 0;width:100%"><table width="100%" cellpadding="0" cellspacing="0" style="background:#EEF2ED;border-radius:4px"><tr>
        <td width="${w}%" style="background:${cor};height:18px;border-radius:4px;font-size:1px">&nbsp;</td><td style="font-size:1px">&nbsp;</td></tr></table></td>
      <td style="padding:5px 0 5px 10px;font:bold 15px Georgia;color:#22362C">${fmt(medias[i])}</td></tr>`;
  }).join('');

  const html = `<div style="font-family:Arial,sans-serif;color:#22362C;max-width:640px">
    <h2 style="font-family:Georgia,serif;font-weight:normal;margin:0 0 4px">Nova resposta: ${esc(r.nome)}</h2>
    <p style="margin:0 0 16px;color:#3C5446">${esc(r.idade)} anos, ${esc(r.genero)}, ${esc(r.profissao)}, renda ${esc(r.renda)}<br>
      WhatsApp ${esc(r.whatsapp)} &nbsp;|&nbsp; ${esc(r.email)}</p>
    <h3 style="font-family:Georgia,serif;font-weight:normal;margin:18px 0 6px">Mapa de travas</h3>
    <table cellpadding="0" cellspacing="0" width="100%">${barras}</table>
    <p style="margin:14px 0 4px"><b style="color:#A9813C">Altas (6 a 10):</b> ${grupo('alta')}</p>
    <p style="margin:0 0 4px"><b style="color:#9C8443">Médias (5):</b> ${grupo('media')}</p>
    <p style="margin:0"><b style="color:#5E7B67">Baixas (1 a 4):</b> ${grupo('baixa')}</p>
    <h3 style="font-family:Georgia,serif;font-weight:normal;margin:22px 0 6px">O que levou à terapia</h3><p style="white-space:pre-wrap;margin:0">${esc(r.motivo) || '<i>Não respondeu.</i>'}</p>
    <h3 style="font-family:Georgia,serif;font-weight:normal;margin:18px 0 6px">Maior dor e quando começou</h3><p style="white-space:pre-wrap;margin:0">${esc(r.dor)}</p>
    <h3 style="font-family:Georgia,serif;font-weight:normal;margin:18px 0 6px">Como se vê hoje</h3><p style="white-space:pre-wrap;margin:0">${esc(r.autopercepcao)}</p>
    <p style="margin:24px 0 0;color:#3C5446;font-size:13px">As 50 respostas completas estão na planilha e na Área da terapeuta do site.</p></div>`;

  MailApp.sendEmail({
    to: EMAIL_BARBARA,
    subject: 'Teste de Travas: ' + r.nome + ' (mais forte: ' + TRAVAS[ordem[0]] + ' ' + fmt(medias[ordem[0]]) + ')',
    htmlBody: html,
    replyTo: String(r.email || '').indexOf('@') > 0 ? r.email : undefined,
    name: 'Teste de Travas Mentais'
  });
}
