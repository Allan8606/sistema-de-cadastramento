import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs,
  doc, deleteDoc 
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
        <p>
          <strong>Nome:</strong> ${data.nome}<br>
          <strong>CPF:</strong> ${data.cpf}<br>
          <strong>Senha:</strong> ${data.senha}
        </p>
        <button data-id="${docId}" class="delete-btn">Excluir</button>
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
          btn.parentElement.remove();
        } catch (e) {
          alert("Erro ao excluir cliente: " + e);
        }
      });
    });

  } catch (e) {
    alert("Erro ao buscar clientes: " + e);
  }
});
