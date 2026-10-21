# Espelho Interior

Tarô junguiano na web. A pessoa informa alguns dados, escreve a pergunta, escolhe as cartas e recebe uma leitura escrita pelo Claude, que trata as cartas como imagens arquetípicas para refletir, não como previsões.

- 78 cartas ilustradas em SVG, desenhadas em código (sem imagens externas)
- 12 tiragens, com sugestão automática pela forma da pergunta
- Cartas invertidas, revelação com animação 3D e arcano do ano pessoal
- Catálogo com o significado de cada carta e diário de leituras salvo no navegador
- Leitura básica offline quando a API não está disponível

## Como funciona

```
navegador (index.html + js/)  ──POST /api/leitura──▶  função serverless (api/leitura.js)  ──▶  API da Anthropic
        ◀────────────── texto da leitura, em streaming ──────────────
```

O site é estático. A única parte que roda no servidor é `api/leitura.js`. Ela recebe a consulta, confere se os dados fazem sentido, monta o pedido e devolve a leitura enquanto o Claude escreve. A chave da API fica só no servidor e nunca é enviada ao navegador.

| Arquivo | Função |
| --- | --- |
| `index.html`, `css/estilo.css` | Página e estilos |
| `js/arte.js` | Desenho das cartas, da moldura e do verso |
| `js/dados.js` | Baralho, significados e tiragens (usado pelo site e pelo servidor) |
| `js/app.js` | Fluxo da consulta, catálogo e diário |
| `api/leitura.js` | Função que chama a API do Claude |
| `servidor-local.js` | Servidor para testar no seu computador |

## Rodar no seu computador

Requer Node.js 20.12 ou mais novo.

```bash
cp .env.example .env      # depois cole sua chave no arquivo .env
npm run dev               # abre em http://localhost:3000
```

Sem chave, o app funciona normalmente e mostra a leitura básica.

## Publicar na Vercel

1. Crie uma chave em [console.anthropic.com](https://console.anthropic.com) (menu API Keys).
2. Ainda no Console, defina um limite mensal de gastos em Billing. Isso protege sua conta caso alguém abuse do site.
3. Entre em [vercel.com](https://vercel.com) com sua conta do GitHub e clique em **Add New → Project**.
4. Escolha o repositório `espelho-interior`. Não é preciso mudar nada nas configurações de build.
5. Em **Environment Variables**, adicione `ANTHROPIC_API_KEY` com a sua chave.
6. Clique em **Deploy**. Em cerca de um minuto o site fica no ar num endereço `*.vercel.app`.

A cada `git push` na branch principal, a Vercel publica a nova versão sozinha.

### Variáveis de ambiente

| Nome | Obrigatória | Padrão | Para que serve |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | sim | | Chave da API da Anthropic |
| `ANTHROPIC_MODEL` | não | `claude-sonnet-5-5` | Modelo que escreve a leitura |
| `LIMITE_POR_HORA` | não | `12` | Leituras por hora para cada IP |

## Custos

Cada leitura usa cerca de 1.500 tokens de entrada e 1.000 de saída. Com o Claude Sonnet 5.5, isso fica perto de US$ 0,01 por leitura. Para gastar menos, defina `ANTHROPIC_MODEL=claude-haiku-5-5`. O plano gratuito da Vercel atende bem um projeto pessoal.

## Aviso

O tarô aqui é uma ferramenta de reflexão. Ele não substitui orientação médica, psicológica, jurídica ou financeira.
