import os
import base64
import io
from PIL import Image
import fitz
from dotenv import load_dotenv
from flask import Flask, render_template, session
from flask_socketio import SocketIO, emit
import google.generativeai as genai

# Carregando variáveis de ambiente e configurações iniciais
load_dotenv()
genai.configure(api_key=os.getenv("API_KEY_GEMINAI"))

# Inicialização do Flask e WebSocket
app_web = Flask(__name__)
socket_io = SocketIO(app_web, cors_allowed_origins="*")

# Instância do modelo Gemini
modelo_gemini_ai = genai.GenerativeModel("gemini-1.5-flash-latest")

# Histórico inicial do assistente virtual ConsultAI
conversa_inicial = [
    {
        'role': 'user',
        'parts': ['Oi! Eu sou o ConsultAI, um assistente virtual criado pela Sammya. Estou aqui para ajudar, sempre educado e confiável, respondendo em português do Brasil.']
    },
    {
        'role': 'model',
        'parts': ['Olá! Eu sou o ConsultAI e estou aqui para te ajudar no que for preciso. Vamos começar?']
    }
]

# Função auxiliar para decodificar arquivos enviados
def decodificar_arquivo(base64_str):
    cabecalho, dados_b64 = base64_str.split(",", 1)
    dados_bytes = base64.b64decode(dados_b64)

    if "image" in cabecalho:
        img = Image.open(io.BytesIO(dados_bytes))
        return img
    elif "pdf" in cabecalho:
        texto_pdf = ""
        with fitz.open(stream=dados_bytes, filetype="pdf") as documento:
            for pagina in documento:
                texto_pdf += pagina.get_text()
        return f"\n\n--- TEXTO EXTRAÍDO DO PDF ---\n{texto_pdf}"
    return None

# Eventos do WebSocket
@socket_io.on("conectar")
def usuario_conectado():
    session['historico_chat'] = conversa_inicial
    msg_boas_vindas = conversa_inicial[1]['parts'][0]
    emit("resposta_servidor", {"resposta": msg_boas_vindas})
    print("Usuário novo conectado. Histórico criado.")

@socket_io.on("enviar_mensagem")
def receber_mensagem(dados):
    chat = modelo_gemini_ai.start_chat(history=session.get('historico_chat', conversa_inicial))
    texto_usuario = dados.get("mensagem", "")
    arquivo_usuario = dados.get("arquivo")

    entrada_para_modelo = [texto_usuario] if texto_usuario else []

    if arquivo_usuario:
        print("Arquivo recebido do usuário.")
        conteudo_arquivo = decodificar_arquivo(arquivo_usuario)
        if conteudo_arquivo:
            entrada_para_modelo.append(conteudo_arquivo)

    try:
        resposta_modelo = chat.send_message(entrada_para_modelo)
        session['historico_chat'] = chat.history
        emit("resposta_servidor", {"resposta": resposta_modelo.text})
    except Exception as erro:
        print(f"[Erro detectado]: {erro}")
        emit("resposta_servidor", {"resposta": f"Houve um problema: {erro}"})

# Rota principal da aplicação
@app_web.route("/")
def pagina_inicial():
    return render_template("index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socket_io.run(app_web, host="0.0.0.0", port=port)