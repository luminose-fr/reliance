/* ============================================
 * MODAL CLASS (Bulma Compatible)
 * ============================================ */
class Modal {
    constructor(modalId, options = {}) {
        this.modalId = modalId;
        this.modal = document.getElementById(modalId);
        
        if (!this.modal) {
            console.error(`Modal with id "${modalId}" not found`);
            return;
        }

        this.options = {
            closeOnOverlayClick: true,
            closeOnEscape: true,
            onOpen: null,
            onClose: null,
            ...options
        };

        this.background = this.modal.querySelector('.modal-background');
        this.closeButtons = this.modal.querySelectorAll('.modal-close, .delete, [data-modal-close]');

        this.init();
    }

    init() {
        // Fermeture via boutons
        this.closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });

        // Fermeture via background
        if (this.options.closeOnOverlayClick && this.background) {
            this.background.addEventListener('click', () => this.close());
        }

        // Fermeture via Escape
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen()) {
                    this.close();
                }
            });
        }
    }

    open() {
        // Bulma utilise la classe 'is-active' sur le modal lui-même
        this.modal.classList.add('is-active');
        document.documentElement.classList.add('is-clipped');

        if (typeof this.options.onOpen === 'function') {
            this.options.onOpen(this);
        }
    }

    close() {
        this.modal.classList.remove('is-active');
        document.documentElement.classList.remove('is-clipped');

        if (typeof this.options.onClose === 'function') {
            this.options.onClose(this);
        }
    }

    toggle() {
        this.isOpen() ? this.close() : this.open();
    }

    isOpen() {
        return this.modal.classList.contains('is-active');
    }

    destroy() {
        this.close();
    }
}

/* ============================================
 * COOKIE BANNER CLASS
 * ============================================ */
class CookieBanner {
    constructor() {
        this.modalId = 'md-cookies';
        this.banner = document.querySelector('#' + this.modalId);
    }

    init() {
        if (!this.banner) {
            console.warn('Cookie banner element not found');
            return;
        }

        this.cookiesConsentValue = this.getCookie('cookiesConsent');
        this.modal = new Modal(this.modalId, {
            closeOnOverlayClick: false,
            closeOnEscape: false
        });
        
        this.btCookiesAccept = this.banner.querySelector('#bt-cookies-accept');
        this.btCookiesReject = this.banner.querySelector('#bt-cookies-reject');
        this.btUpdateCookies = document.querySelector('#bt-cookies-update');

        // Bind event handlers
        if (this.btCookiesAccept) {
            this.btCookiesAccept.addEventListener('click', (e) => this.grantConsent(e));
        }
        if (this.btCookiesReject) {
            this.btCookiesReject.addEventListener('click', (e) => this.denyConsent(e));
        }
        if (this.btUpdateCookies) {
            this.btUpdateCookies.addEventListener('click', (e) => this.clearConsent(e));
        }

        // Afficher la bannière si aucun consentement
        if (this.cookiesConsentValue !== 'granted' && this.cookiesConsentValue !== 'denied') {
            this.modal.open();
        } else if (this.cookiesConsentValue === 'granted') {
            this.updateGtagConsent('granted');
        }
    }
    
    clearConsent(event) {
        event.preventDefault();
        this.setCookie('cookiesConsent', '', -1);
        this.cookiesConsentValue = this.getCookie('cookiesConsent');
        this.modal.open();
    }
    
    grantConsent(event) {
        event.preventDefault();
        this.setCookie('cookiesConsent', 'granted', 365);
        this.cookiesConsentValue = this.getCookie('cookiesConsent');
        this.updateGtagConsent('granted');
        this.modal.close();
    }

    denyConsent(event) {
        event.preventDefault();
        this.setCookie('cookiesConsent', 'denied', 365);
        this.cookiesConsentValue = this.getCookie('cookiesConsent');
        this.updateGtagConsent('denied');
        this.modal.close();
    }

    updateGtagConsent(status) {
        if (typeof gtag !== 'function') return;
        
        gtag('consent', 'update', {
            'ad_storage': status,
            'ad_user_data': status,
            'ad_personalization': status,
            'analytics_storage': status,
            'personalization_storage': status,
            'functionality_storage': status,
            'security_storage': status
        });
    }

    setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    
    getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
}

/* ============================================
 * UTM PARAMETERS PROPAGATION
 * ============================================ */
class UTMParamsPropagation {
  init() {
    const deleteParams = [];
    const utmParamQueryString = new URLSearchParams(window.location.search);

    utmParamQueryString.forEach((value, key) => {
      if (!key.startsWith("utm_")) {
        deleteParams.push(key);
      }
    });

    deleteParams.forEach((value) => {
      utmParamQueryString.delete(value);
    });

    if (utmParamQueryString.toString()) {
      document.querySelectorAll("a").forEach((item) => {
        if (item.href && item.href !== "") {
          const checkUrl = new URL(item.href);
          if (checkUrl.host === location.host) {
            let doNotProcess = false;
            const linkSearchParams = new URLSearchParams(checkUrl.search);
            
            linkSearchParams.forEach((value, key) => {
              if (key.startsWith("utm_")) doNotProcess = true;
            });
            
            if (doNotProcess) return;
            
            checkUrl.search = new URLSearchParams({
              ...Object.fromEntries(utmParamQueryString),
              ...Object.fromEntries(linkSearchParams),
            });
            
            item.href = checkUrl.href;
          }
        }
      });
    }
  }
}

/* ============================================
 * DOM READY - INITIALIZATION
 * ============================================ */
document.addEventListener('DOMContentLoaded', () => {

    // --- INITIALIZE COOKIE BANNER ---
    const cookieBanner = new CookieBanner();
    cookieBanner.init();

    const utmParams = new UTMParamsPropagation();
    utmParams.init();

    // --- NAVBAR BURGER (MOBILE) ---
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    if ($navbarBurgers.length > 0) {
        $navbarBurgers.forEach(el => {
            el.addEventListener('click', () => {
                const target = el.dataset.target;
                const $target = document.getElementById(target);
                el.classList.toggle('is-active');
                $target.classList.toggle('is-active');
            });
        });
    }

    // --- ACCORDIONS (FAQ) ---
    const accordions = document.querySelectorAll('.accordion-item');
    
    accordions.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        const icon = item.querySelector('.icon i');

        if (!header || !content) return;

        header.addEventListener('click', () => {
            const isOpen = !content.classList.contains('is-hidden');
            
            // Fermer tous les autres (Mode exclusif)
            accordions.forEach(i => {
                const iContent = i.querySelector('.accordion-content');
                const iIcon = i.querySelector('.icon i');
                
                if (iContent !== content) {
                    iContent.classList.add('is-hidden');
                    if (iIcon) {
                        iIcon.classList.remove('fa-minus');
                        iIcon.classList.add('fa-plus');
                    }
                }
            });

            // Basculer l'élément courant
            if (isOpen) {
                content.classList.add('is-hidden');
                if (icon) {
                    icon.classList.remove('fa-minus');
                    icon.classList.add('fa-plus');
                }
            } else {
                content.classList.remove('is-hidden');
                if (icon) {
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                }
            }
        });
    });

    // --- NAVBAR SCROLL EFFECT ---
    const nav = document.querySelector('.navbar');
    
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('is-scrolled');
            } else {
                nav.classList.remove('is-scrolled');
            }
        });
    }

    // --- SMOOTH SCROLL WITH OFFSET ---
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
                    if (navBurger) navBurger.classList.remove('is-active');
                }

                // Scroll avec offset
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