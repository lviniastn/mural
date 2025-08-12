        // scripts.js
        
        // 1. Defina a URL da API
        const API_URL = 'https://api-mural.onrender.com/recados';

        // 2. Selecione o elemento DOM onde a lista será construída
        const muralLista = document.getElementById('mural-lista');
        const btnOrdenar = document.getElementById('btn-ordenar');
        const dropdown = document.getElementById('dropdown');
        const loadingElement = document.getElementById('loading');

        // Variáveis globais
        let recados = [];

        // Função para formatar data
        function formatarData(dataISO) {
            const data = new Date(dataISO);
            return data.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Função para criar elemento de recado
        function criarRecadoElemento(recado) {
            const li = document.createElement('li');
            li.className = 'recado';
            
            li.innerHTML = `
                <div class="recado-header">
                    <span class="recado-autor">${recado.autor}</span>
                    <span class="recado-data">${formatarData(recado.data_criacao)}</span>
                </div>
                <div class="recado-mensagem">${recado.mensagem}</div>
            `;
            
            // Adiciona arrastar e soltar
            li.draggable = true;
            li.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', recado.id);
                setTimeout(() => {
                    li.style.opacity = '0.4';
                }, 0);
            });
            
            li.addEventListener('dragend', () => {
                li.style.opacity = '1';
            });
            
            return li;
        }

        // Função para exibir recados
        function exibirRecados() {
            muralLista.innerHTML = '';
            
            recados.forEach(recado => {
                const recadoElement = criarRecadoElemento(recado);
                muralLista.appendChild(recadoElement);
            });
            
            loadingElement.style.display = 'none';
        }

        // Funções de ordenação
        function ordenarRecentes() {
            recados.sort((a, b) => 
                new Date(b.data_criacao) - new Date(a.data_criacao)
            );
        }

        function ordenarAntigos() {
            recados.sort((a, b) => 
                new Date(a.data_criacao) - new Date(b.data_criacao)
            );
        }

        function ordenarAlfabetica() {
            recados.sort((a, b) => 
                a.autor.localeCompare(b.autor)
            );
        }

        // Função para exibir erro
        function exibirErro(mensagem) {
            loadingElement.style.display = 'none';
            
            const erroDiv = document.createElement('div');
            erroDiv.className = 'erro';
            erroDiv.innerHTML = `
                <h2>Erro ao carregar recados</h2>
                <p>${mensagem}</p>
                <button class="btn-tentar" id="btn-tentar">Tentar Novamente</button>
            `;
            
            muralLista.parentElement.appendChild(erroDiv);
            
            document.getElementById('btn-tentar').addEventListener('click', buscarRecados);
        }

        // Passo 2: Fazer a requisição usando fetch
        async function buscarRecados() {
            try {
                // Remover mensagem de erro se existir
                const erroExistente = document.querySelector('.erro');
                if (erroExistente) erroExistente.remove();
                
                loadingElement.style.display = 'block';
                
                // Fazendo a requisição GET
                const response = await fetch(API_URL);
                
                // Verificando se a resposta é OK (status 200)
                if (!response.ok) {
                    throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
                }
                
                // Convertendo a resposta para JSON
                recados = await response.json();
                
                // Ordenar e exibir os recados
                ordenarRecentes();
                exibirRecados();
                
            } catch (error) {
                console.error('Erro ao buscar recados:', error);
                exibirErro(error.message || 'Não foi possível carregar os recados. Verifique sua conexão e tente novamente.');
            }
        }

        // Event Listeners para o botão de ordenação
        btnOrdenar.addEventListener('click', () => {
            dropdown.classList.toggle('active');
        });

        // Event Listener para as opções do dropdown
        document.querySelectorAll('.dropdown-option').forEach(option => {
            option.addEventListener('click', () => {
                const ordem = option.dataset.ordem;
                
                switch (ordem) {
                    case 'recentes':
                        ordenarRecentes();
                        break;
                    case 'antigos':
                        ordenarAntigos();
                        break;
                    case 'alfabetica':
                        ordenarAlfabetica();
                        break;
                }
                
                exibirRecados();
                dropdown.classList.remove('active');
            });
        });

        // Fechar o dropdown se clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.ordenacao')) {
                dropdown.classList.remove('active');
            }
        });

        // Permitir soltar recados em qualquer lugar do mural
        muralLista.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        muralLista.addEventListener('drop', (e) => {
            e.preventDefault();
            const recadoId = e.dataTransfer.getData('text/plain');
            const recadoElement = document.querySelector(`.recado[draggable="true"]`);
            
            if (recadoElement) {
                // Encontra a posição do mouse
                const rect = muralLista.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Define a posição do elemento
                recadoElement.style.position = 'absolute';
                recadoElement.style.left = `${x}px`;
                recadoElement.style.top = `${y}px`;
                
                muralLista.appendChild(recadoElement);
            }
        });

        // Inicialização quando o DOM estiver carregado
        document.addEventListener('DOMContentLoaded', buscarRecados);

        const btnAdd = document.getElementById('btn-add');
        const modalAdd = document.getElementById('modal-add');
        const btnSalvar = document.getElementById('btn-salvar');
        const btnCancelar = document.getElementById('btn-cancelar');
        
        btnAdd.addEventListener('click', () => {
            modalAdd.classList.add('active');
        });
        
        btnCancelar.addEventListener('click', () => {
            modalAdd.classList.remove('active');
        });
        
        btnSalvar.addEventListener('click', async () => {
            const autor = document.getElementById('input-autor').value.trim();
            const mensagem = document.getElementById('input-mensagem').value.trim();
        
            if (!autor || !mensagem) {
                alert('Preencha todos os campos!');
                return;
            }
        
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ autor, mensagem })
                });
        
                if (!response.ok) throw new Error('Erro ao adicionar recado');
        
                modalAdd.classList.remove('active');
                document.getElementById('input-autor').value = '';
                document.getElementById('input-mensagem').value = '';
        
                await buscarRecados();
            } catch (error) {
                alert(error.message);
            }
        });
        
        // Fechar modal ao clicar fora
        modalAdd.addEventListener('click', (e) => {
            if (e.target === modalAdd) {
                modalAdd.classList.remove('active');
            }
        });
        