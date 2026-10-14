# Teste de Travas Mentais: como colocar no ar

São dois arquivos:

- **index.html**: o site (visual, formulário, gráfico, área da terapeuta).
- **Codigo.gs**: o "motor" que roda dentro de uma planilha Google da Bárbara. Ele guarda códigos e respostas, confere a senha e envia o e-mail.

Tempo total: uns 20 minutos. Faça na conta Google **da Bárbara** (é dela o e-mail que envia e a planilha que guarda os dados).

---

## Capítulo 1: testar antes de tudo (2 minutos)

1. Baixe o `index.html` e dê dois cliques nele. Ele abre no navegador.
2. Aparece uma faixa bege: "Modo demonstração". Nesse modo tudo fica salvo só no seu navegador.
3. Digite o código `DEMO-2026` e faça o teste inteiro.
4. No rodapé, clique em **Área da terapeuta**, senha `bavi062370`. Veja a resposta, o gráfico e gere códigos novos.

Se gostou do jeito que funciona, siga para o Capítulo 2.

---

## Capítulo 2: criar a planilha e o motor (10 minutos)

1. Logado na conta da Bárbara, abra **sheets.new** no navegador. Nomeie a planilha: `Teste de Travas - Respostas`.
2. Menu **Extensões > Apps Script**. Abre uma aba nova com um arquivo `Código.gs` com algumas linhas.
3. Apague tudo que estiver lá. Cole o conteúdo inteiro do arquivo **Codigo.gs**.
4. Na linha 9, troque `COLOQUE_AQUI_O_EMAIL_DA_BARBARA@gmail.com` pelo e-mail dela (mantenha as aspas).
5. A linha 10 já vem com a senha da Bárbara: `const SENHA_INICIAL = 'bavi062370';`. Não precisa mexer.
6. Clique no ícone de disquete (**Salvar projeto**).
7. Na barra de cima, no seletor de funções, escolha **configurar** e clique em **Executar**.
8. Vai pedir autorização: **Revisar permissões** > escolha a conta da Bárbara > **Avançado** > **Acessar Teste de Travas (não seguro)** > **Permitir**. Esse aviso aparece porque o script é dela mesma e não passou por verificação do Google; é normal.
9. Embaixo aparece "Pronto! Abas criadas e senha salva." Volte à planilha: existem as abas **Codigos** e **Respostas**.
10. Volte ao Apps Script e, na linha 10, apague a senha deixando só `''`. Salve de novo. A senha continua guardada de forma escondida.

---

## Capítulo 3: publicar o motor como "App da Web" (3 minutos)

1. No Apps Script, botão azul **Implantar > Nova implantação**.
2. Na engrenagem ao lado de "Selecionar tipo", escolha **App da Web**.
3. Preencha assim:
   - Descrição: `versão 1`
   - Executar como: **Eu (e-mail da Bárbara)**
   - Quem pode acessar: **Qualquer pessoa**
4. Clique em **Implantar**. Copie o **URL do app da Web** (termina em `/exec`).

Atenção: se um dia você mudar o Codigo.gs, faça **Implantar > Gerenciar implantações > lápis (editar) > Versão: Nova versão > Implantar**. Assim o link continua o mesmo.

---

## Capítulo 4: ligar o site ao motor (1 minuto)

1. Abra o `index.html` num editor de texto (Bloco de Notas ou VS Code).
2. Procure por `API_URL: ""` (fica perto do fim, no bloco CONFIGURAÇÃO).
3. Cole o link entre as aspas: `API_URL: "https://script.google.com/macros/s/....../exec",`
4. No mesmo bloco, confira `WHATSAPP: "5522992685522"` (55 + DDD + número da Bárbara).
5. `MOSTRAR_RESULTADO_AO_CLIENTE: true` mostra o gráfico para o cliente no final. Troque para `false` se a Bárbara preferir mostrar só na consulta.
6. Salve. Abra o arquivo: a faixa "Modo demonstração" sumiu. Agora tudo vai para a planilha.

---

## Capítulo 5: colocar o site no ar (5 minutos)

Mesmo caminho do seu site atual no GitHub Pages:

1. No GitHub, **New repository**, nome `teste-travas`, marque **Public**, **Create**.
2. **Add file > Upload files**, envie só o `index.html`. **Commit changes**.
3. **Settings > Pages > Branch: main / root > Save**.
4. Em 1 a 2 minutos o endereço aparece no topo da página: `https://SEU-USUARIO.github.io/teste-travas/`.
5. Volte ao `index.html`, preencha `LINK_DO_TESTE` com esse endereço, e suba de novo (Upload files substitui).

Se depois quiser um endereço próprio (ex.: `teste.barbaravieira.com.br`), dá para apontar um domínio para esse mesmo repositório.

---

## Capítulo 6: como a Bárbara usa no dia a dia

**Liberar um cliente**
1. Site > rodapé **Área da terapeuta** > senha.
2. Aba **Códigos de acesso** > nome do cliente > **Gerar código**.
3. Clique em **Enviar pelo WhatsApp** (abre o WhatsApp com a mensagem pronta, com link e código) ou **Copiar mensagem pronta**.

Cada código vale para **uma** resposta. Depois de usado, aparece como "Usado" com o nome de quem respondeu. Um código não usado pode ser cancelado.

**Ver resultados**
1. Aba **Respostas**: lista de todos que responderam, com a trava mais forte de cada um.
2. Clique numa pessoa: dados, textos, gráfico, a leitura por faixa e as 50 notas agrupadas por trava (notas 6 ou mais ficam destacadas).
3. **Imprimir ou salvar em PDF** gera a ficha da pessoa para guardar ou levar para a sessão.

**Faixas do resultado**: média de 6 a 10 = trava **alta** (dourado); média 5 = **média** (dourado claro); média de 1 a 4 = **baixa** (verde). Quando a média tem casa decimal, 5,0 a 5,9 conta como média e até 4,9 conta como baixa.

**WhatsApp do cliente**: no final, o botão "Enviar meu resultado e agendar pelo WhatsApp" abre a conversa com a Bárbara já com as travas altas, médias e baixas escritas na mensagem.

**E-mail**: a cada resposta, a Bárbara recebe um e-mail com o gráfico, as travas separadas por faixa e os textos. Se ela clicar em "Responder", vai direto para o e-mail do cliente.

**Planilha**: tudo também fica na aba Respostas (uma linha por pessoa, as 50 notas e as 10 médias). Dá para filtrar, ordenar e baixar normalmente.

---

## Capítulo 7: dúvidas e problemas comuns

- **"Senha incorreta" com a senha certa**: depois de 5 erros, o sistema bloqueia por 15 minutos. Espere e tente de novo.
- **Trocar a senha**: no Apps Script, na função `trocarSenha`, escreva a nova senha em `const nova = ''`, execute `trocarSenha`, depois apague a senha dali e salve.
- **Não chegou e-mail**: confira o e-mail na linha 9 do Codigo.gs e a caixa de spam. A conta gratuita do Google envia até cerca de 100 e-mails por dia.
- **"Sem conexão com o servidor"**: o `API_URL` está errado ou a implantação não está como "Qualquer pessoa". Refaça o Capítulo 3.
- **Mudei o Codigo.gs e nada mudou**: falta criar a "Nova versão" da implantação (fim do Capítulo 3).
- **O cliente fechou no meio**: o progresso fica salvo no aparelho dele. Basta voltar ao link e digitar o mesmo código.
