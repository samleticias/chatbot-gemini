document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const chatBox = document.getElementById("chat-box");
  const messageInput = document.getElementById("message-input");
  const fileInput = document.getElementById("file-input");
  const attachmentPreview = document.getElementById("attachment-preview");
  const attachmentImage = document.getElementById("attachment-image");
  const attachmentPdfName = document.getElementById("attachment-pdf-name");
  const removeAttachmentBtn = document.getElementById("remove-attachment");
  const attachmentBtn = document.getElementById("attachment-btn");
  const attachmentMenu = document.getElementById("attachment-menu");
  const attachImageBtn = document.getElementById("attach-image-btn");
  const attachPdfBtn = document.getElementById("attach-pdf-btn");
  const chatForm = document.getElementById("chat-form");

  let tempAttachment = null;

  // Toggle do menu
  attachmentBtn.addEventListener("click", () => {
    attachmentMenu.classList.toggle("hidden");
  });

  // Anexar imagem
  attachImageBtn.addEventListener("click", () => {
    fileInput.accept = "image/*";
    fileInput.click();
    attachmentMenu.classList.add("hidden");
  });

  // Anexar PDF
  attachPdfBtn.addEventListener("click", () => {
    fileInput.accept = "application/pdf";
    fileInput.click();
    attachmentMenu.classList.add("hidden");
  });

  // Preview do anexo
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      tempAttachment = {
        data: e.target.result,
        name: file.name,
        type: file.type,
      };
      showPreview();
    };
    reader.readAsDataURL(file);
  });

  function showPreview() {
    attachmentPreview.classList.remove("hidden");

    if (tempAttachment.type.includes("image")) {
      attachmentImage.src = tempAttachment.data;
      attachmentImage.classList.remove("hidden");
      attachmentPdfName.classList.add("hidden");
    } else {
      attachmentPdfName.textContent = tempAttachment.name;
      attachmentPdfName.classList.remove("hidden");
      attachmentImage.classList.add("hidden");
    }
  }

  // Remover anexo
  removeAttachmentBtn.addEventListener("click", () => {
    tempAttachment = null;
    fileInput.value = "";
    attachmentPreview.classList.add("hidden");
  });

  // Enviar mensagem
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = messageInput.value.trim();

    if (!msg && !tempAttachment) return;

    addMessage(msg, "user", tempAttachment);

    const dataToSend = {
      mensagem: msg || (tempAttachment.type.includes("image") ? "Descreva esta imagem para mim." : "Resuma o conteúdo deste PDF para mim."),
    };

    if (tempAttachment) {
      dataToSend.arquivo = tempAttachment.data;
    }

    socket.emit("enviar_mensagem", dataToSend);

    messageInput.value = "";
    removeAttachmentBtn.click(); 
  });

  function addMessage(text, who, attachment = null) {
    const div = document.createElement("div");
    div.classList.add("message", who);

    if (text) {
      const p = document.createElement("p");
      p.textContent = text;
      div.appendChild(p);
    }

    if (attachment) {
      if (attachment.type.includes("image")) {
        const img = document.createElement("img");
        img.src = attachment.data;
        div.appendChild(img);
      } else if (attachment.type.includes("pdf")) {
        const embed = document.createElement("embed");
        embed.src = attachment.data;
        embed.type = "application/pdf";
        embed.width = "100%";
        embed.height = "250px";
        embed.style.borderRadius = "10px";
        embed.style.marginTop = "10px";
        div.appendChild(embed);
      }
    }

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  socket.on("resposta_servidor", (data) => {
    addMessage(data.resposta, "bot");
  });

  socket.on("connect", () => {
    socket.emit("conectar");
    console.log("Conectado ao servidor");
  });
});