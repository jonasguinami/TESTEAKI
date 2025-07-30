document.addEventListener('DOMContentLoaded', () => {
    const scrollButtons = document.querySelectorAll('.tab-button');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const scrollThreshold = 300; // Altura em pixels para o botão aparecer

    // Lógica para os botões de scroll (manter)
    scrollButtons.forEach(button => {
        button.addEventListener('click', () => {
            scrollButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const targetId = button.dataset.scrollTo;
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Lógica para o botão de Scroll para o Topo
    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Opicional: Destacar o botão de navegação ativo com base na rolagem
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                scrollButtons.forEach(button => {
                    button.classList.remove('active');
                    if (button.dataset.scrollTo === sectionId) {
                        button.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('.plan-section').forEach(section => {
        sectionObserver.observe(section);
    });
});