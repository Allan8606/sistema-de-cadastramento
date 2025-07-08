import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs,
  doc, deleteDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAOpgz5VOB_NesRyrBLTGiR8VQMwifBXng",
  authDomain: "cadastramento-58cf3.firebaseapp.com",
  projectId: "cadastramento-58cf3",
  storageBucket: "cadastramento-58cf3.firebasestorage.app",
  messagingSenderId: "695056583432",
  appId: "1:695056583432:web:a588994137adb2aeadfabd",
  measurementId: "G-P04YJMRME8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Cadastro
const form = document.getElementById("form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const nome = document.getElementById("nome").value;
  const cpf = document.getElementById("cpf").value;
  const senha = document.getElementById("senha").value;
  
  try {
    await addDoc(collection(db, "clientes"), {
      nome: nome,
      cpf: cpf,
      senha: senha,
    });
    alert("Cliente cadastrado com sucesso!");
    form.reset();
  } catch (e) {
    alert("Erro ao cadastrar cliente: " + e);
  }
});

// Pesquisa e exclusão
const searchBtn = document.getElementById("searchBtn");
searchBtn.addEventListener("click", async () => {
  const searchNome = document.getElementById("searchNome").value.toLowerCase();
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "clientes"));

    const clientesEncontrados = querySnapshot.docs.filter((docItem) => {
      const nomeCliente = docItem.data().nome.toLowerCase();
      return nomeCliente.includes(searchNome);
    });

    if (clientesEncontrados.length === 0) {
      resultDiv.innerHTML = "<p>Nenhum cliente encontrado.</p>";
      return;
    }

    clientesEncontrados.forEach((docItem) => {
      const data = docItem.data();
      const docId = docItem.id;

      const clienteHTML = document.createElement("div");
      clienteHTML.innerHTML = `
        <div class="cliente-info">
          <p>
            <strong>Nome:</strong> <span class="nome-span">${data.nome}</span><br>
            <strong>CPF:</strong> <span class="cpf-span">${data.cpf}</span><br>
            <strong>Senha:</strong> <span class="senha-span">${data.senha}</span>
          </p>
          <button data-id="${docId}" class="edit-btn">Editar</button>
          <button data-id="${docId}" class="delete-btn">Excluir</button>
        </div>
        <hr>
      `;
      resultDiv.appendChild(clienteHTML);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        try {
          await deleteDoc(doc(db, "clientes", id));
          alert("Cliente excluído com sucesso!");
          btn.parentElement.parentElement.remove();
        } catch (e) {
          alert("Erro ao excluir cliente: " + e);
        }
      });
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const clienteDiv = btn.closest(".cliente-info");
        const nomeSpan = clienteDiv.querySelector(".nome-span");
        const cpfSpan = clienteDiv.querySelector(".cpf-span");
        const senhaSpan = clienteDiv.querySelector(".senha-span");
        const docId = btn.getAttribute("data-id");

        // Troca spans por inputs
        nomeSpan.outerHTML = `<input type='text' class='edit-nome' value='${nomeSpan.textContent}'>`;
        cpfSpan.outerHTML = `<input type='text' class='edit-cpf' value='${cpfSpan.textContent}'>`;
        senhaSpan.outerHTML = `<input type='text' class='edit-senha' value='${senhaSpan.textContent}'>`;

        // Troca botão Editar por Salvar
        btn.style.display = 'none';
        let saveBtn = document.createElement('button');
        saveBtn.textContent = 'Salvar';
        saveBtn.className = 'save-btn';
        saveBtn.setAttribute('data-id', docId);
        btn.parentElement.insertBefore(saveBtn, btn.nextSibling);

        saveBtn.addEventListener('click', async () => {
          const newNome = clienteDiv.querySelector('.edit-nome').value;
          const newCpf = clienteDiv.querySelector('.edit-cpf').value;
          const newSenha = clienteDiv.querySelector('.edit-senha').value;
          try {
            await updateDoc(doc(db, "clientes", docId), {
              nome: newNome,
              cpf: newCpf,
              senha: newSenha
            });
            alert('Cliente atualizado com sucesso!');
            // Atualiza visualmente
            clienteDiv.querySelector('.edit-nome').outerHTML = `<span class='nome-span'>${newNome}</span>`;
            clienteDiv.querySelector('.edit-cpf').outerHTML = `<span class='cpf-span'>${newCpf}</span>`;
            clienteDiv.querySelector('.edit-senha').outerHTML = `<span class='senha-span'>${newSenha}</span>`;
            saveBtn.remove();
            btn.style.display = '';
          } catch (e) {
            alert('Erro ao atualizar cliente: ' + e);
          }
        });
      });
    });

  } catch (e) {
    alert("Erro ao buscar clientes: " + e);
  }
});

const listAllBtn = document.getElementById("listAllBtn");
listAllBtn.addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "clientes"));

    if (querySnapshot.empty) {
      resultDiv.innerHTML = "<p>Nenhum cliente cadastrado.</p>";
      return;
    }

    // Ordenar os clientes por nome (ordem alfabética)
    const clientes = [];
    querySnapshot.forEach((docItem) => {
      clientes.push({ id: docItem.id, ...docItem.data() });
    });
    clientes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

    clientes.forEach((data) => {
      const docId = data.id;
      const clienteHTML = document.createElement("div");
      clienteHTML.innerHTML = `
        <div class="cliente-info">
          <p>
            <strong>Nome:</strong> <span class="nome-span">${data.nome}</span><br>
            <strong>CPF:</strong> <span class="cpf-span">${data.cpf}</span><br>
            <strong>Senha:</strong> <span class="senha-span">${data.senha}</span>
          </p>
          <button data-id="${docId}" class="edit-btn">Editar</button>
          <button data-id="${docId}" class="delete-btn">Excluir</button>
        </div>
        <hr>
      `;
      resultDiv.appendChild(clienteHTML);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        try {
          await deleteDoc(doc(db, "clientes", id));
          alert("Cliente excluído com sucesso!");
          btn.parentElement.parentElement.remove();
        } catch (e) {
          alert("Erro ao excluir cliente: " + e);
        }
      });
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const clienteDiv = btn.closest(".cliente-info");
        const nomeSpan = clienteDiv.querySelector(".nome-span");
        const cpfSpan = clienteDiv.querySelector(".cpf-span");
        const senhaSpan = clienteDiv.querySelector(".senha-span");
        const docId = btn.getAttribute("data-id");

        // Troca spans por inputs
        nomeSpan.outerHTML = `<input type='text' class='edit-nome' value='${nomeSpan.textContent}'>`;
        cpfSpan.outerHTML = `<input type='text' class='edit-cpf' value='${cpfSpan.textContent}'>`;
        senhaSpan.outerHTML = `<input type='text' class='edit-senha' value='${senhaSpan.textContent}'>`;

        // Troca botão Editar por Salvar
        btn.style.display = 'none';
        let saveBtn = document.createElement('button');
        saveBtn.textContent = 'Salvar';
        saveBtn.className = 'save-btn';
        saveBtn.setAttribute('data-id', docId);
        btn.parentElement.insertBefore(saveBtn, btn.nextSibling);

        saveBtn.addEventListener('click', async () => {
          const newNome = clienteDiv.querySelector('.edit-nome').value;
          const newCpf = clienteDiv.querySelector('.edit-cpf').value;
          const newSenha = clienteDiv.querySelector('.edit-senha').value;
          try {
            await updateDoc(doc(db, "clientes", docId), {
              nome: newNome,
              cpf: newCpf,
              senha: newSenha
            });
            alert('Cliente atualizado com sucesso!');
            // Atualiza visualmente
            clienteDiv.querySelector('.edit-nome').outerHTML = `<span class='nome-span'>${newNome}</span>`;
            clienteDiv.querySelector('.edit-cpf').outerHTML = `<span class='cpf-span'>${newCpf}</span>`;
            clienteDiv.querySelector('.edit-senha').outerHTML = `<span class='senha-span'>${newSenha}</span>`;
            saveBtn.remove();
            btn.style.display = '';
          } catch (e) {
            alert('Erro ao atualizar cliente: ' + e);
          }
        });
      });
    });

  } catch (e) {
    alert("Erro ao buscar clientes: " + e);
  }
});
