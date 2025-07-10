import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAOpgz5VOB_NesRyrBLTGiR8VQMwifBXng",
  authDomain: "cadastramento-58cf3.firebaseapp.com",
  projectId: "cadastramento-58cf3",
  storageBucket: "cadastramento-58cf3.appspot.com",
  messagingSenderId: "695056583432",
  appId: "1:695056583432:web:a588994137adb2aeadfabd",
  measurementId: "G-P04YJMRME8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Máscara de moeda para o campo valor
const valorInput = document.getElementById('valor');
valorInput.addEventListener('input', function(e) {
  let v = e.target.value.replace(/\D/g, ''); // Remove tudo que não for dígito
  v = v.replace(/^0+/, ''); // Remove zeros à esquerda
  if (v.length === 0) v = '0';
  v = v.padStart(3, '0'); // Garante pelo menos 3 dígitos
  let reais = v.slice(0, -2);
  let centavos = v.slice(-2);
  reais = reais.replace(/^0+(?!$)/, '');
  let reaisFormatado = reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  e.target.value = `R$ ${reaisFormatado},${centavos}`;
});

function getValorNumerico() {
  const valor = valorInput.value.replace(/[^\d]/g, '');
  return parseFloat(valor) / 100;
}

// Cadastro de despesa
const despesaForm = document.getElementById('despesaForm');
despesaForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const valor = getValorNumerico();
  const descricao = document.getElementById('descricao').value;
  const mes = document.getElementById('mes').value;
  if (!mes) {
    alert('Selecione o mês da despesa!');
    return;
  }
  try {
    await addDoc(collection(db, 'despesas'), {
      valor: valor,
      descricao: descricao,
      mes: mes
    });
    alert('Despesa cadastrada!');
    despesaForm.reset();
    valorInput.value = '';
  } catch (e) {
    alert('Erro ao cadastrar despesa: ' + e);
  }
});

// Listar despesas do mês selecionado
const listarMesBtn = document.getElementById('listarMesBtn');
listarMesBtn.addEventListener('click', async () => {
  const mes = document.getElementById('mes').value;
  const resultDiv = document.getElementById('resultDespesas');
  resultDiv.innerHTML = '';
  if (!mes) {
    alert('Selecione o mês para listar as despesas!');
    return;
  }
  try {
    const q = query(collection(db, 'despesas'), where('mes', '==', mes));
    const querySnapshot = await getDocs(q);
    let total = 0;
    if (querySnapshot.empty) {
      resultDiv.innerHTML = '<p>Nenhuma despesa encontrada para este mês.</p>';
      return;
    }
    querySnapshot.forEach((docItem) => {
      const data = docItem.data();
      const docId = docItem.id;
      total += data.valor;
      const despesaHTML = document.createElement('div');
      despesaHTML.innerHTML = `
        <div class="cliente-info">
          <p>
            <strong>Valor:</strong> <span class="valor-span">R$ ${data.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span><br>
            <strong>Descrição:</strong> <span class="desc-span">${data.descricao}</span>
          </p>
          <button data-id="${docId}" class="edit-btn">Editar</button>
          <button data-id="${docId}" class="delete-btn">Excluir</button>
        </div>
        <hr>
      `;
      resultDiv.appendChild(despesaHTML);
    });
    // Total no final
    const totalDiv = document.createElement('div');
    totalDiv.innerHTML = `<p style="font-weight:bold; color:#003366;">Total do mês: R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>`;
    resultDiv.appendChild(totalDiv);

    // Excluir despesa
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          await deleteDoc(doc(db, 'despesas', id));
          alert('Despesa excluída com sucesso!');
          btn.parentElement.parentElement.remove();
        } catch (e) {
          alert('Erro ao excluir despesa: ' + e);
        }
      });
    });

    // Editar despesa
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const despesaDiv = btn.closest('.cliente-info');
        const valorSpan = despesaDiv.querySelector('.valor-span');
        const descSpan = despesaDiv.querySelector('.desc-span');
        const docId = btn.getAttribute('data-id');

        // Troca spans por inputs
        valorSpan.outerHTML = `<input type='text' class='edit-valor' value='${valorSpan.textContent.replace(/[^\d,]/g, "").replace(",", ".")}' style='width:90px;'>`;
        descSpan.outerHTML = `<input type='text' class='edit-desc' value='${descSpan.textContent}'>`;

        // Troca botão Editar por Salvar
        btn.style.display = 'none';
        let saveBtn = document.createElement('button');
        saveBtn.textContent = 'Salvar';
        saveBtn.className = 'save-btn';
        saveBtn.setAttribute('data-id', docId);
        btn.parentElement.insertBefore(saveBtn, btn.nextSibling);

        // Máscara de moeda no input de edição
        const editValorInput = despesaDiv.querySelector('.edit-valor');
        editValorInput.addEventListener('input', function(e) {
          let v = e.target.value.replace(/\D/g, '');
          v = v.replace(/^0+/, '');
          if (v.length === 0) v = '0';
          v = v.padStart(3, '0');
          let reais = v.slice(0, -2);
          let centavos = v.slice(-2);
          reais = reais.replace(/^0+(?!$)/, '');
          let reaisFormatado = reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          e.target.value = `R$ ${reaisFormatado},${centavos}`;
        });

        saveBtn.addEventListener('click', async () => {
          const newValor = editValorInput.value.replace(/[^\d]/g, '');
          const newValorFloat = parseFloat(newValor) / 100;
          const newDesc = despesaDiv.querySelector('.edit-desc').value;
          try {
            await updateDoc(doc(db, 'despesas', docId), {
              valor: newValorFloat,
              descricao: newDesc
            });
            alert('Despesa atualizada com sucesso!');
            // Atualiza visualmente
            editValorInput.outerHTML = `<span class='valor-span'>R$ ${newValorFloat.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>`;
            despesaDiv.querySelector('.edit-desc').outerHTML = `<span class='desc-span'>${newDesc}</span>`;
            saveBtn.remove();
            btn.style.display = '';
          } catch (e) {
            alert('Erro ao atualizar despesa: ' + e);
          }
        });
      });
    });

  } catch (e) {
    alert('Erro ao buscar despesas: ' + e);
  }
});

const listarTotalBtn = document.getElementById('listarTotalBtn');
listarTotalBtn.addEventListener('click', async () => {
  const resultDiv = document.getElementById('resultDespesas');
  resultDiv.innerHTML = '';
  try {
    const querySnapshot = await getDocs(collection(db, 'despesas'));
    if (querySnapshot.empty) {
      resultDiv.innerHTML = '<p>Nenhuma despesa cadastrada.</p>';
      return;
    }
    let totalGeral = 0;
    // Agrupar despesas por mês
    const despesasPorMes = {};
    querySnapshot.forEach((docItem) => {
      const data = docItem.data();
      if (!despesasPorMes[data.mes]) despesasPorMes[data.mes] = [];
      despesasPorMes[data.mes].push({ id: docItem.id, ...data });
      totalGeral += data.valor;
    });
    // Ordem dos meses
    const ordemMeses = [
      'janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'
    ];
    ordemMeses.forEach(mes => {
      if (despesasPorMes[mes]) {
        let totalMes = despesasPorMes[mes].reduce((acc, d) => acc + d.valor, 0);
        const mesDiv = document.createElement('div');
        mesDiv.className = 'cliente-info';
        mesDiv.innerHTML = `<strong>${mes.charAt(0).toUpperCase() + mes.slice(1)}:</strong> R$ ${totalMes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}<br><button class='excluir-mes-btn' data-mes='${mes}'>Excluir mês</button>`;
        resultDiv.appendChild(mesDiv);
      }
    });
    // Total geral
    const totalDiv = document.createElement('div');
    totalDiv.innerHTML = `<p style="font-weight:bold; color:#003366;">Total geral: R$ ${totalGeral.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>`;
    resultDiv.appendChild(totalDiv);

    // Excluir todas as despesas do mês
    document.querySelectorAll('.excluir-mes-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const mes = btn.getAttribute('data-mes');
        if (!confirm(`Tem certeza que deseja excluir TODAS as despesas de ${mes.charAt(0).toUpperCase() + mes.slice(1)}?`)) return;
        try {
          // Buscar todas as despesas do mês
          const q = query(collection(db, 'despesas'), where('mes', '==', mes));
          const snapshot = await getDocs(q);
          const batchPromises = [];
          snapshot.forEach(docItem => {
            batchPromises.push(deleteDoc(doc(db, 'despesas', docItem.id)));
          });
          await Promise.all(batchPromises);
          alert('Todas as despesas do mês excluídas com sucesso!');
          btn.parentElement.remove();
        } catch (e) {
          alert('Erro ao excluir despesas do mês: ' + e);
        }
      });
    });
  } catch (e) {
    alert('Erro ao buscar despesas: ' + e);
  }
}); 