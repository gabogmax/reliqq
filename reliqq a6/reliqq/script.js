/* ===== CARROSSEL AUTOMÁTICO ===== */
const INTERVALO = 4000; // tempo entre as trocas, em milissegundos

document.querySelectorAll(".carrossel").forEach((car, n) => {
    const trilho = car.querySelector(".produtos");
    const slides = trilho.querySelectorAll(".produto");
    const pontos = car.querySelector(".pontos");
    const passo = () => slides[0].offsetWidth + parseFloat(getComputedStyle(trilho).columnGap || 0);
    const atual = () => Math.round(trilho.scrollLeft / passo());

    slides.forEach(() => pontos.appendChild(document.createElement("span")));
    const marcar = () => [...pontos.children].forEach((p, i) => p.classList.toggle("ativo", i === atual()));
    marcar();
    trilho.addEventListener("scroll", marcar, { passive: true });

    const ir = (i) => trilho.scrollTo({ left: ((i + slides.length) % slides.length) * passo() });
    const proximo = () => ir(atual() + 1);

    car.querySelector(".seta-esq").addEventListener("click", () => { ir(atual() - 1); reiniciar(); });
    car.querySelector(".seta-dir").addEventListener("click", () => { proximo(); reiniciar(); });

    // troca sozinho; pausa enquanto o mouse, o dedo ou o foco do teclado estão no carrossel
    let timer = null;
    const parar = () => { clearInterval(timer); timer = null; };
    const iniciar = () => { if (!timer && !document.hidden) timer = setInterval(proximo, INTERVALO + n * 700); };
    const reiniciar = () => { parar(); iniciar(); };

    car.addEventListener("mouseenter", parar);
    car.addEventListener("mouseleave", iniciar);
    car.addEventListener("focusin", parar);
    car.addEventListener("focusout", iniciar);
    car.addEventListener("touchstart", parar, { passive: true });
    car.addEventListener("touchend", () => setTimeout(iniciar, INTERVALO), { passive: true });
    document.addEventListener("visibilitychange", () => (document.hidden ? parar() : iniciar()));

    iniciar();
});
