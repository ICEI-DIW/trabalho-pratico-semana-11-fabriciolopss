const EVENTOS_POR_PAGINA = 6;

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("detalhes.html")) {
    carregarDetalhesDoEvento();
  } else {
    inicializarPaginaPrincipal();
  }
});

async function inicializarPaginaPrincipal() {
  await carregarEventosCarrossel();
  await inicializarListaEventos();
}

async function carregarEventosCarrossel() {
  try {
    const eventos = await buscarEventos();
    const eventosAleatorios = selecionarEventosAleatorios(eventos, 5);
    renderizarCarrossel(eventosAleatorios);
  } catch (error) {
    console.error("Erro ao carregar eventos do carrossel:", error);
  }
}

async function inicializarListaEventos() {
  const containerCards = document.getElementById("container-cards");
  const btnMostrarMais = document.getElementById("btn-mostrar-mais");

  let eventos = [];
  let eventosExibidos = 0;

  async function getEventos() {
    eventos = await buscarEventos();
    renderizarEventos();
  }

  function renderizarEventos() {
    containerCards.innerHTML = "";
    const eventosParaMostrar = eventos.slice(
      0,
      eventosExibidos + EVENTOS_POR_PAGINA
    );

    eventosParaMostrar.forEach((evento) => {
      const cardHTML = criarCardEvento(evento);
      containerCards.insertAdjacentHTML("beforeend", cardHTML);
    });

    eventosExibidos += EVENTOS_POR_PAGINA;
    atualizarBotaoMostrarMais(btnMostrarMais, eventos.length, eventosExibidos);
  }

  btnMostrarMais.addEventListener("click", renderizarEventos);
  await getEventos();
}

async function carregarDetalhesDoEvento() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    document.querySelector(".detalhes-container").innerHTML =
      "<p>ID do evento não fornecido na URL.</p>";
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/eventos/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        document.querySelector(".detalhes-container").innerHTML =
          "<p>Evento não encontrado.</p>";
      } else {
        document.querySelector(
          ".detalhes-container"
        ).innerHTML = `<p>Erro ao buscar o evento. Status: ${response.status}</p>`;
      }
      console.error("Erro na resposta do servidor:", response);
      return;
    }

    const evento = await response.json();

    if (!evento || Object.keys(evento).length === 0) {
      document.querySelector(".detalhes-container").innerHTML =
        "<p>Evento não encontrado ou dados do evento estão vazios.</p>";
      return;
    }

    preencherInformacoesEvento(evento);
    if (evento.imagens_complementares) {
      renderizarFotosEvento(evento.imagens_complementares);
    } else {
      console.warn("O evento não possui imagens complementares.");
    }
  } catch (error) {
    console.error("Erro ao carregar detalhes do evento:", error);
    document.querySelector(".detalhes-container").innerHTML =
      "<p>Ocorreu um erro ao tentar carregar os detalhes do evento. Verifique o console para mais informações.</p>";
  }
}

async function buscarEventos() {
  const response = await fetch("http://localhost:3000/eventos");
  if (!response.ok) {
    throw new Error("Erro ao buscar eventos: " + response.statusText);
  }
  return await response.json();
}

function selecionarEventosAleatorios(eventos, quantidade) {
  return eventos.sort(() => 0.5 - Math.random()).slice(0, quantidade);
}

function renderizarCarrossel(eventos) {
  const container = document.querySelector(".display-eventos");
  container.innerHTML = "";

  eventos.forEach((evento, index) => {
    const item = document.createElement("div");
    item.className = `carousel-item${index === 0 ? " active" : ""}`;
    item.innerHTML = criarItemCarrossel(evento);

    item.querySelector(".card-evento").addEventListener("click", () => {
      window.location.href = `detalhes.html?id=${evento.id}`;
    });

    container.appendChild(item);
  });
}

function criarItemCarrossel(evento) {
  return `
        <div class="d-flex justify-content-center">
            <div class="card-evento redirect-click" style="background-image: url('${evento.imagem}');">
                <div class="card-evento-infos">
                    <p class="badge mb-1">${evento.data}</p>
                    <h5>${evento.titulo}</h5>
                    <p class="mb-0">${evento.local}</p>
                </div>
            </div>
        </div>
    `;
}

function criarCardEvento(evento) {
  return `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card h-100 card-completo-evento">
                <div class="parte-imagem card-img-top" style="background-image: url('${evento.imagem}');">
                    <p class="badge bg-primary">${evento.categoria}</p>
                </div>
                <div class="parte-descricao card-body d-flex flex-column justify-content-between">
                    <div>
                        <h3 class="card-title"><b>${evento.titulo}</b></h3>
                        <p class="card-text">${evento.descricao}</p>
                        <div class="texto-e-icone d-flex align-items-center mb-2">
                            <i class="fa fa-calendar me-2" aria-hidden="true"></i>
                            <p class="mb-0">${evento.data}</p>
                        </div>
                        <div class="texto-e-icone d-flex align-items-center mb-2">
                            <i class="fa fa-clock me-2" aria-hidden="true"></i>
                            <p class="mb-0">${evento.hora}</p>
                        </div>
                        <div class="texto-e-icone d-flex align-items-center">
                            <i class="fa fa-map-marker me-2" aria-hidden="true"></i>
                            <p class="mb-0">${evento.local}</p>
                        </div>
                    </div>
                    <button class="botao-detalhes mt-3 btn btn-primary" onclick="redirect(${evento.id})">Ver detalhes</button>
                </div>
            </div>
        </div>
    `;
}

function preencherInformacoesEvento(evento) {
  document.getElementById("evento-titulo").textContent = evento.titulo;
  document.getElementById("evento-imagem").src = evento.imagem;
  document.getElementById("evento-descricao").textContent = evento.descricao;
  document.getElementById("evento-data").textContent = evento.data;
  document.getElementById("evento-hora").textContent = evento.hora;
  document.getElementById("evento-local").textContent = evento.local;
  document.getElementById("evento-categoria").textContent = evento.categoria;
}

function renderizarFotosEvento(imagens) {
  const fotosContainer = document.getElementById("fotos-container");
  fotosContainer.innerHTML = "";

  imagens.forEach((imagem) => {
    const imagemWrapper = document.createElement("div");
    imagemWrapper.className = "imagem-wrapper";

    const imagemElem = document.createElement("img");
    imagemElem.src = imagem.url;
    imagemElem.alt = imagem.descricao;

    const descricaoElem = document.createElement("p");
    descricaoElem.className = "imagem-descricao";
    descricaoElem.textContent = imagem.descricao;

    imagemWrapper.appendChild(imagemElem);
    imagemWrapper.appendChild(descricaoElem);
    fotosContainer.appendChild(imagemWrapper);
  });
}

function atualizarBotaoMostrarMais(btn, totalEventos, eventosExibidos) {
  btn.style.display = totalEventos <= eventosExibidos ? "none" : "block";
}

function redirect(id) {
  window.location.href = "detalhes.html?id=" + id;
}
