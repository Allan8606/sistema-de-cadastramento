import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, updateDoc, doc
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

// Máscara de moeda para o campo salário
const salarioInput = document.getElementById('salario');
salarioInput.addEventListener('input', function(e) {
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

function getSalarioNumerico() {
  const valor = salarioInput.value.replace(/[^\d]/g, '');
  return parseFloat(valor) / 100;
}

const financeiroForm = document.getElementById('financeiroForm');
financeiroForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const salario = getSalarioNumerico();
  const mes = document.getElementById('mes').value;
  if (!mes) {
    alert('Selecione o mês!');
    return;
  }
  try {
    await addDoc(collection(db, 'salarios'), {
      salario: salario,
      mes: mes
    });
    alert('Salário bruto adicionado com sucesso!');
    financeiroForm.reset();
    salarioInput.value = '';
  } catch (e) {
    alert('Erro ao adicionar salário: ' + e);
  }
});

const acompanharBtn = document.getElementById('acompanharBtn');
acompanharBtn.addEventListener('click', async () => {
  const resultDiv = document.getElementById('resultFinanceiro');
  resultDiv.innerHTML = '';
  try {
    const querySalarios = await getDocs(collection(db, 'salarios'));
    if (querySalarios.empty) {
      resultDiv.innerHTML = '<p>Nenhum salário cadastrado.</p>';
      return;
    }
    // Agrupar salários por mês
    const salariosPorMes = {};
    const idsPorMes = {};
    querySalarios.forEach((docItem) => {
      const data = docItem.data();
      salariosPorMes[data.mes] = data.salario;
      idsPorMes[data.mes] = docItem.id;
    });
    // Ordem dos meses
    const ordemMeses = [
      'janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'
    ];
    let totalLiquido = 0;
    for (const mes of ordemMeses) {
      if (salariosPorMes[mes] !== undefined) {
        // Buscar despesas do mês
        const q = query(collection(db, 'despesas'), where('mes', '==', mes));
        const queryDespesas = await getDocs(q);
        let totalDespesas = 0;
        queryDespesas.forEach((docItem) => {
          const data = docItem.data();
          totalDespesas += data.valor;
        });
        const salarioBruto = salariosPorMes[mes];
        const salarioLiquido = salarioBruto - totalDespesas;
        totalLiquido += salarioLiquido;
        const mesDiv = document.createElement('div');
        mesDiv.className = 'cliente-info';
        mesDiv.innerHTML = `<strong>${mes.charAt(0).toUpperCase() + mes.slice(1)}</strong><br>
          Salário bruto: <span class='salario-span'>R$ ${salarioBruto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span><br>
          Salário líquido: <span class='liquido-span'>R$ ${salarioLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span><br>
          <button data-id='${idsPorMes[mes]}' class='edit-btn'>Editar</button>
          <button data-id='${idsPorMes[mes]}' class='delete-btn'>Excluir</button>`;
        resultDiv.appendChild(mesDiv);
      }
    }
    // Total do salário líquido
    const totalDiv = document.createElement('div');
    totalDiv.innerHTML = `<p style='font-weight:bold; color:#003366;'>Total salário líquido: R$ ${totalLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>`;
    resultDiv.appendChild(totalDiv);

    // Excluir salário
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm('Tem certeza que deseja excluir este salário?')) return;
        try {
          await deleteDoc(doc(db, 'salarios', id));
          alert('Salário excluído com sucesso!');
          btn.parentElement.remove();
        } catch (e) {
          alert('Erro ao excluir salário: ' + e);
        }
      });
    });

    // Editar salário bruto
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mesDiv = btn.closest('.cliente-info');
        const salarioSpan = mesDiv.querySelector('.salario-span');
        const docId = btn.getAttribute('data-id');
        // Troca span por input
        salarioSpan.outerHTML = `<input type='text' class='edit-salario' value='${salarioSpan.textContent.replace(/[^\d,]/g, "").replace(",", ".")}' style='width:110px;'>`;
        btn.style.display = 'none';
        let saveBtn = document.createElement('button');
        saveBtn.textContent = 'Salvar';
        saveBtn.className = 'save-btn';
        saveBtn.setAttribute('data-id', docId);
        btn.parentElement.insertBefore(saveBtn, btn.nextSibling);
        // Máscara de moeda no input de edição
        const editSalarioInput = mesDiv.querySelector('.edit-salario');
        editSalarioInput.addEventListener('input', function(e) {
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
          const newSalario = editSalarioInput.value.replace(/[^\d]/g, '');
          const newSalarioFloat = parseFloat(newSalario) / 100;
          try {
            await updateDoc(doc(db, 'salarios', docId), {
              salario: newSalarioFloat
            });
            alert('Salário atualizado com sucesso!');
            editSalarioInput.outerHTML = `<span class='salario-span'>R$ ${newSalarioFloat.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>`;
            saveBtn.remove();
            btn.style.display = '';
            // Atualizar salário líquido e total na tela
            const liquidoSpan = mesDiv.querySelector('.liquido-span');
            // Buscar despesas do mês novamente
            let totalDespesas = 0;
            const mesNome = mesDiv.querySelector('strong').textContent.toLowerCase();
            const q = query(collection(db, 'despesas'), where('mes', '==', mesNome));
            const queryDespesas = await getDocs(q);
            queryDespesas.forEach((docItem) => {
              const data = docItem.data();
              totalDespesas += data.valor;
            });
            const novoLiquido = newSalarioFloat - totalDespesas;
            liquidoSpan.textContent = `R$ ${novoLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            // Atualizar total salário líquido
            let totalLiquido = 0;
            document.querySelectorAll('.liquido-span').forEach(span => {
              totalLiquido += parseFloat(span.textContent.replace(/[^\d,]/g, '').replace(',', '.'));
            });
            const totalDiv = document.querySelector('#resultFinanceiro > div:last-child p');
            if (totalDiv) {
              totalDiv.textContent = `Total salário líquido: R$ ${totalLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            }
          } catch (e) {
            alert('Erro ao atualizar salário: ' + e);
          }
        });
      });
    });

  } catch (e) {
    alert('Erro ao buscar salários: ' + e);
  }
}); 