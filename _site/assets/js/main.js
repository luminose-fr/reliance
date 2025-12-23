document.addEventListener('DOMContentLoaded', () => {

    // --- NAVBAR BURGER (MOBILE) ---
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    if ($navbarBurgers.length > 0) {
        $navbarBurgers.forEach( el => {
            el.addEventListener('click', () => {
                const target = el.dataset.target;
                const $target = document.getElementById(target);
                el.classList.toggle('is-active');
                $target.classList.toggle('is-active');
            });
        });
    }

    // --- ACCORDIONS (FAQ) ---
    // Logique conservée et renforcée
    const accordions = document.querySelectorAll('.accordion-item');
    
    accordions.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        const icon = item.querySelector('.icon i');

        header.addEventListener('click', () => {
            const isOpen = !content.classList.contains('is-hidden');
            
            // Fermer tous les autres (Mode exclusif pour plus de clarté)
            accordions.forEach(i => {
                const iContent = i.querySelector('.accordion-content');
                const iIcon = i.querySelector('.icon i');
                
                if(iContent !== content) {
                    iContent.classList.add('is-hidden');
                    if(iIcon) {
                        iIcon.classList.remove('fa-minus');
                        iIcon.classList.add('fa-plus');
                    }
                }
            });

            // Basculer l'élément courant
            if (isOpen) {
                content.classList.add('is-hidden');
                if(icon) {
                    icon.classList.remove('fa-minus');
                    icon.classList.add('fa-plus');
                }
            } else {
                content.classList.remove('is-hidden');
                if(icon) {
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                }
            }
        });
    });

    // --- SMOOTH SCROLL & NAVBAR INTERACTION ---
    const nav = document.querySelector('.navbar');
    
    // Changement d'apparence au scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('is-scrolled'); // Classe à styliser si besoin d'ombre supplémentaire
        } else {
            nav.classList.remove('is-scrolled');
        }
    });

    // Navigation fluide avec correction d'offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId) return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                // Fermer le menu mobile si ouvert
                const navMenu = document.getElementById('navbarMenu');
                const navBurger = document.querySelector('.navbar-burger');
                if (navMenu && navMenu.classList.contains('is-active')) {
                    navMenu.classList.remove('is-active');
                    navBurger.classList.remove('is-active');
                }

                // Scroll avec offset (Hauteur navbar ~80px)
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

});