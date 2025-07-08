# ConsultAI - Chatbot Gemini

Chatbot interativo com suporte a texto, imagem e PDF, alimentado pela API do Google Gemini (via Generative AI). Projetado com Flask, Socket.IO e uma interface web interativa.

## Descrição

**ConsultAI** é um assistente virtual. Ele conversa em português do Brasil, responde com educação e confiabilidade, e pode interpretar tanto mensagens de texto quanto arquivos de imagem e PDF.

## Funcionalidades

-  Conversa com linguagem natural usando a API Gemini
-  Suporte a envio de imagens e PDFs
-  Interface web amigável com HTML, CSS e JS
-  Comunicação em tempo real via WebSocket (Socket.IO)
-  Histórico de conversa mantido por sessão
-  Mensagens formatadas com preview de anexos

## Tecnologias Utilizadas

### Backend

- [Python 3.11+](https://www.python.org/)
- [Flask](https://flask.palletsprojects.com/)
- [Flask-SocketIO](https://flask-socketio.readthedocs.io/)
- [python-dotenv](https://pypi.org/project/python-dotenv/)
- [Google Generative AI (gemini)](https://ai.google.dev/)
- [Pillow (PIL)](https://pillow.readthedocs.io/) — manipulação de imagens
- [PyMuPDF (fitz)](https://pymupdf.readthedocs.io/) — extração de texto de PDFs

### Frontend

- HTML5, CSS3, JavaScript
- `style.css` e `script.js` em `/static/`
- Preview de anexos (imagens/PDF)
- Ícones SVG embutidos

## Estrutura do Projeto
```
chatbot-gemini/ 
├── app.py 
├── requirements.txt 
├── Procfile 
├── .env # Chave da API Gemini (não comitar)
├── .gitignore 
├── static/ 
│ ├── css/ 
│ │ └── style.css 
│ └── js/
│ └── script.js 
├── templates/ 
│ └── index.html 
└── README.md 
```
