# Espelho Interior

Tarô junguiano na web. A pessoa informa alguns dados, escreve a pergunta, escolhe as cartas e recebe uma leitura escrita por inteligência artificial, que trata as cartas como imagens arquetípicas para refletir, não como previsões.

- 78 cartas ilustradas em SVG, desenhadas em código (sem imagens externas)
- 12 tiragens, com sugestão automática pela forma da pergunta
- Cartas invertidas, revelação com animação 3D e arcano do ano pessoal
- Catálogo com o significado de cada carta e diário de leituras salvo no navegador
- Leitura básica offline quando a API não está disponível

## Como funciona

```
navegador (index.html + js/)  ──POST /api/leitura──▶  função serverless (api/leitura.js)  ──▶  API do Groq
        ◀────────────── texto da leitura, em streaming ──────────────
```

A leitura é gerada pelo [Groq](https://groq.com), no plano gratuito, com o modelo `openai/gpt-oss-120b`. O site é estático. A única parte que roda no servidor é `api/leitura.js`. Ela recebe a consulta, confere se os dados fazem sentido, monta o pedido e devolve a leitura enquanto ela é escrita. A chave da API fica só no servidor e nunca é enviada ao navegador.

| Arquivo | Função |
| --- | --- |
| `index.html`, `css/estilo.css` | Página e estilos |
| `js/arte.js` | Desenho das cartas, da moldura e do verso |
| `js/dados.js` | Baralho, significados e tiragens (usado pelo site e pelo servidor) |
| `js/app.js` | Fluxo da consulta, catálogo e diário |
| `api/leitura.js` | Função que chama a API do Groq |
| `servidor-local.js` | Servidor para testar no seu computador |

## Rodar no seu computador

Requer Node.js 20.12 ou mais novo.

```bash
cp .env.example .env      # depois cole sua chave no arquivo .env
npm run dev               # abre em http://localhost:3000
```

Sem chave, o app funciona normalmente e mostra a leitura básica.

## Publicar na Vercel (grátis)

1. Crie uma conta em [console.groq.com](https://console.groq.com) e gere uma chave em **API Keys**. O plano gratuito não pede cartão de crédito.
2. Entre em [vercel.com](https://vercel.com) com sua conta do GitHub, no plano Hobby, e clique em **Add New → Project**.
3. Escolha o repositório `espelho-interior`. Não é preciso mudar nada nas configurações de build.
4. Em **Environment Variables**, adicione `GROQ_API_KEY` com a sua chave.
5. Clique em **Deploy**. Em cerca de um minuto o site fica no ar num endereço `*.vercel.app`.

A cada `git push` na branch principal, a Vercel publica a nova versão sozinha.

### Variáveis de ambiente

| Nome | Obrigatória | Padrão | Para que serve |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | sim | | Chave da API do Groq |
| `GROQ_MODEL` | não | `openai/gpt-oss-120b` | Modelo que escreve a leitura |
| `LIMITE_POR_HORA` | não | `12` | Leituras por hora para cada IP |

## Custos e limites

Tudo roda em planos gratuitos: Vercel Hobby e Groq Free. O plano gratuito do Groq tem limites de uso por minuto e por dia, que dão para dezenas de leituras diárias. Quando o limite é atingido, o Groq recusa novos pedidos sem cobrar nada, e o app mostra a leitura básica até o limite renovar. Os limites atuais da sua conta ficam em [console.groq.com/settings/limits](https://console.groq.com/settings/limits).

## Aviso

O tarô aqui é uma ferramenta de reflexão. Ele não substitui orientação médica, psicológica, jurídica ou financeira.
