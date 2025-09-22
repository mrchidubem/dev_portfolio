/**
 * Senior Portfolio 2025 - ALL ISSUES FIXED VERSION
 * FIXED: A. Hamburger aria-expanded sync and keyboard reliability
 * FIXED: C. Hero counter mobile initialization timing fix
 * FIXED: F. Updated theme toggle to handle multiple elements (desktop + mobile if added)
 * FIXED: G. Removed duplicate theme toggle listeners
 * FIXED: G. Added error boundaries and race condition prevention
 * FIXED: G. Proper event delegation for dynamic content
 * FIXED: C. Added force trigger for hero stats animation on mobile to prevent 0 display
 * FIXED: H. Enhanced error handling and listener cleanup to prevent console errors
 * FIXED: Mobile Theme Toggle - Added menu-state check for reliable dropdown toggling
 * UPDATED: For multi-page - Adjusted scroll navigation to page links, kept filter/form/theme
 * UPDATED: Default to light theme on load (unless user saved dark)
 * UPDATED: Preload high-res images for crisp rendering
 */
// EmailJS Setup - Replace with your real keys from Step 1
emailjs.init(" itpnK3USNTFs3Exig");  // e.g., "user_abc123"
const SERVICE_ID = " service_c0lf87l";  // e.g., "service_def456"
const TEMPLATE_ID = "template_k5huwmg";  // e.g., "template_ghi789"

class PortfolioApp {
  constructor() {
    this.headerHeight = 0;
    this.isMobileMenuOpen = false;
    this.scrollObserver = null;
    this.themeToggles = null;
    this.mobileToggle = null;
    this.burgerLabel = null;
    this.formValidationTimeout = null;
    this.statsInitialized = false;
    
    this.init();
  }
  
  init() {
    try {
      this.updateHeaderHeight();
      this.initPreloader();
      this.initThemeSystem();
      this.initNavigation();
      this.initScrollAnimations();
      this.initProjectFilter();
      this.initForms();
      this.initStatsAnimation();
      this.initParallax();
      this.initAccessibility();
      
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.updateHeaderHeight();
          if (window.innerWidth <= 768) {
            this.statsInitialized = false;
            this.initStatsAnimation();
          }
        }, 150);
      }, { passive: true });
      
      window.addEventListener('orientationchange', () => {
        setTimeout(() => this.updateHeaderHeight(), 200);
      });
      
      setTimeout(() => this.announce('Page loaded successfully'), 800);
    } catch (error) {
      console.error('PortfolioApp initialization error:', error);
      this.announce('Page loaded with minor issues');
    }
  }
  
  updateHeaderHeight() {
    try {
      const header = document.querySelector('.site-header');
      if (header) {
        this.headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${this.headerHeight}px`);
        
        const isDesktop = window.innerWidth >= 769;
        const scrollPadding = isDesktop ? this.headerHeight + 20 : this.headerHeight + 10;
        document.documentElement.style.setProperty('--scroll-padding', `${scrollPadding}px`);
        document.documentElement.style.scrollPaddingTop = `${scrollPadding}px`;
        
        setTimeout(() => {
          if (this.scrollObserver) {
            this.scrollObserver.disconnect();
            this.initScrollBasedNavigation();
          }
        }, 100);
      }
    } catch (error) {
      console.warn('Header height update failed:', error);
    }
  }

  initPreloader() {
    try {
      const preloader = document.getElementById('preloader');
      if (!preloader) return;

      const progressFill = document.querySelector('.progress-fill');
      let progress = 0;
      
      const updateProgress = () => {
        if (progress < 100) {
          progress += Math.random() * 3 + 1;
          if (progressFill) {
            progressFill.style.width = `${Math.min(progress, 100)}%`;
          }
          requestAnimationFrame(updateProgress);
        } else {
          setTimeout(() => {
            if (preloader) {
              preloader.style.opacity = '0';
              setTimeout(() => {
                if (preloader) {
                  preloader.style.display = 'none';
                }
                document.body.classList.add('loaded');
                this.startScrollAnimations();
                this.announce('Welcome to my portfolio');
              }, 300);
            }
          }, 500);
        }
      };
      
      setTimeout(updateProgress, 200);
    } catch (error) {
      console.error('Preloader initialization failed:', error);
    }
  }

  initThemeSystem() {
    try {
      this.themeToggles = document.querySelectorAll('.theme-toggle');
      const html = document.documentElement;
      
      const savedTheme = localStorage.getItem('portfolio-theme');
      let activeTheme = savedTheme || 'light'; // Default to light theme
      
      html.setAttribute('data-theme', activeTheme);
      this.updateThemeIcon(activeTheme);
      
      if (this.themeToggles && this.themeToggles.length > 0) {
        this.themeToggles.forEach(toggle => {
          toggle.removeEventListener('click', toggle._themeHandler);
          
          toggle._themeHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (toggle.closest('.nav-mobile') && !this.isMobileMenuOpen) {
              return;
            }
            
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.style.transition = 'all 200ms ease';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('portfolio-theme', newTheme);
            this.updateThemeIcon(newTheme);
            
            const ariaLabel = `Switch to ${newTheme === 'dark' ? 'light' : 'dark'} theme`;
            this.themeToggles.forEach(t => t.setAttribute('aria-label', ariaLabel));
            
            setTimeout(() => {
              this.announce(`Switched to ${newTheme} theme`);
            }, 200);
            
            setTimeout(() => {
              html.style.transition = '';
            }, 250);
          };
          
          toggle.addEventListener('click', toggle._themeHandler);
          
          toggle.removeEventListener('keydown', toggle._keyHandler);
          toggle._keyHandler = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle.click();
            }
          };
          toggle.addEventListener('keydown', toggle._keyHandler);
        });
      }
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handlePreferenceChange = (e) => {
        if (!localStorage.getItem('portfolio-theme')) {
          const systemTheme = e.matches ? 'dark' : 'light';
          html.setAttribute('data-theme', systemTheme);
          this.updateThemeIcon(systemTheme);
        }
      };
      
      mediaQuery.addEventListener('change', handlePreferenceChange);
      this.mediaQueryListener = () => mediaQuery.removeEventListener('change', handlePreferenceChange);
    } catch (error) {
      console.error('Theme system initialization failed:', error);
    }
  }
  
  updateThemeIcon(theme) {
    try {
      const icons = document.querySelectorAll('.theme-icon');
      icons.forEach(icon => {
        icon.className = `fas ${theme === 'dark' ? 'fa-moon' : 'fa-sun'} theme-icon`;
      });
    } catch (error) {
      console.warn('Theme icon update failed:', error);
    }
  }

  initNavigation() {
    try {
      this.mobileToggle = document.getElementById('nav-toggle');
      this.burgerLabel = document.querySelector('.nav-burger');
      const navLinks = document.querySelectorAll('.nav-link, .footer-link');
      const navBurger = document.querySelector('.nav-burger');
      
      document.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link, .footer-link');
        if (link) {
          this.closeMobileMenu();
        }
      });
      
      if (this.mobileToggle && navBurger) {
        this.mobileToggle.addEventListener('change', (e) => {
          const expanded = e.target.checked;
          if (this.burgerLabel) {
            this.burgerLabel.setAttribute('aria-expanded', expanded.toString());
            this.burgerLabel.setAttribute('aria-label', expanded ? 'Close navigation menu' : 'Open navigation menu');
          }
          
          if (expanded) {
            this.openMobileMenu();
          } else {
            this.closeMobileMenu();
          }
        }, { once: false });
        
        navBurger.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            this.mobileToggle.checked = !this.mobileToggle.checked;
            const changeEvent = new Event('change', { bubbles: true });
            this.mobileToggle.dispatchEvent(changeEvent);
          }
        });
        
        document.addEventListener('click', (e) => {
          if (this.mobileToggle && this.mobileToggle.checked && 
              !e.target.closest('.header-inner') && 
              !e.target.closest('.nav-mobile') &&
              !e.target.closest('.nav-burger')) {
            this.closeMobileMenu();
          }
        }, { passive: true });
        
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.mobileToggle && this.mobileToggle.checked) {
            this.closeMobileMenu();
            setTimeout(() => {
              if (navBurger) {
                navBurger.focus();
              }
            }, 200);
          }
        }, { passive: true });
      }
      
      setTimeout(() => {
        this.initScrollBasedNavigation();
      }, 200);
    } catch (error) {
      console.error('Navigation initialization error:', error);
    }
  }
  
  openMobileMenu() {
    if (this.isMobileMenuOpen) return;
    
    this.isMobileMenuOpen = true;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('menu-open');
    
    this.announce('Navigation menu opened');
    
    setTimeout(() => {
      const firstLink = document.querySelector('.nav-list-mobile .nav-link');
      if (firstLink && document.activeElement !== firstLink) {
        firstLink.focus();
      }
    }, 300);
  }
  
  closeMobileMenu() {
    if (!this.isMobileMenuOpen) return;
    
    if (this.mobileToggle) {
      this.mobileToggle.checked = false;
      if (this.burgerLabel) {
        this.burgerLabel.setAttribute('aria-expanded', 'false');
        this.burgerLabel.setAttribute('aria-label', 'Open navigation menu');
      }
    }
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
    document.body.classList.remove('menu-open');
    
    setTimeout(() => {
      const navBurger = document.querySelector('.nav-burger');
      if (navBurger && document.activeElement !== navBurger) {
        navBurger.focus();
      }
    }, 350);
    
    this.announce('Navigation menu closed');
  }

  updateActiveNav(activeLink) {
    try {
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      
      if (activeLink) {
        activeLink.classList.add('active');
      }
    } catch (error) {
      console.warn('Active nav update failed:', error);
    }
  }
  
  initScrollBasedNavigation() {
    try {
      if (this.scrollObserver) {
        this.scrollObserver.disconnect();
      }
      
      this.scrollObserver = new IntersectionObserver((entries) => {
        let activeSection = null;
        
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            activeSection = entry.target.id;
          }
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
        });
        
        if (activeSection) {
          const correspondingLink = document.querySelector(`.nav-link[href*="${activeSection}"]`);
          if (correspondingLink) {
            correspondingLink.classList.add('active');
          }
        }
      }, {
        threshold: 0.3,
        rootMargin: `-${this.headerHeight + 20}px 0px -30% 0px`
      });
      
      document.querySelectorAll('section[id]').forEach(section => {
        this.scrollObserver.observe(section);
      });
    } catch (error) {
      console.error('Scroll navigation initialization failed:', error);
    }
  }

  initStatsAnimation() {
    if (this.statsInitialized) return;
    
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    
    const animateStats = () => {
      if (this.statsInitialized) return;
      
      statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            stat.textContent = target;
            clearInterval(timer);
            this.statsInitialized = true;
          } else {
            stat.textContent = Math.floor(current);
          }
        }, 20);
      });
    };
    
    const statsTarget = document.querySelector('.hero-stats[data-stat-section]') || 
                       document.querySelector('.hero-stats') || 
                       document.querySelector('.hero-content');
    
    if (statsTarget) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = window.innerWidth <= 768 ? 600 : 300;
            setTimeout(animateStats, delay);
            statsObserver.unobserve(entry.target);
          }
        });
      }, { 
        threshold: 0.5,
        rootMargin: `-${this.headerHeight}px 0px 0px 0px`
      });
      
      statsObserver.observe(statsTarget);

      const forceDelay = window.innerWidth <= 768 ? 1200 : 500;
      setTimeout(() => {
        if (!this.statsInitialized) {
          animateStats();
          statsObserver.unobserve(statsTarget);
        }
      }, forceDelay);
    } else {
      setTimeout(animateStats, 800);
    }
  }

  initScrollAnimations() {
    try {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: `-${this.headerHeight}px 0px -20px 0px`
      });
      
      document.querySelectorAll('.fade-in, .expertise-card, .service-card, .project-card, .insight-card, .timeline-item').forEach(el => {
        observer.observe(el);
      });
      
      const timelineItems = document.querySelectorAll('.timeline-item');
      timelineItems.forEach((item, index) => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
        setTimeout(() => {
          item.classList.add('animate');
        }, index * 200);
      });
    } catch (error) {
      console.warn('Scroll animations initialization failed:', error);
    }
  }

  initProjectFilter() {
    try {
      const filterButtons = document.querySelectorAll('.filter-btn');
      const projectCards = document.querySelectorAll('.project-card');
      
      filterButtons.forEach(button => {
        button.removeEventListener('click', button._filterHandler);
        
        button._filterHandler = (e) => {
          e.preventDefault();
          const filterValue = button.getAttribute('data-filter');
          
          filterButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          
          projectCards.forEach((card, index) => {
            const categories = card.getAttribute('data-categories') || '';
            const shouldShow = filterValue === 'all' || categories.includes(filterValue);
            
            card.style.transition = 'opacity 400ms ease, transform 400ms ease';
            card.style.opacity = '0';
            card.style.transform = 'translateY(15px)';
            card.style.display = 'flex';
            
            setTimeout(() => {
              if (shouldShow) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.style.display = 'flex';
              } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                setTimeout(() => {
                  card.style.display = 'none';
                }, 400);
              }
            }, index * 75);
          });
          
          setTimeout(() => {
            this.announce(`Projects filtered by ${filterValue === 'all' ? 'all categories' : filterValue}`);
          }, 500);
        };
        
        button.addEventListener('click', button._filterHandler);
      });
    } catch (error) {
      console.error('Project filter initialization failed:', error);
    }
  }

  initForms() {
    try {
      this.initContactForm();
      this.initNewsletterForm();
      this.initRealTimeValidation();
    } catch (error) {
      console.error('Forms initialization failed:', error);
    }
  }
  
  initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('input', (e) => {
      clearTimeout(this.formValidationTimeout);
      this.formValidationTimeout = setTimeout(() => {
        this.validateField(e.target);
      }, 300);
    }, { passive: true });
    
    const existingSubmit = form._submitHandler;
    if (existingSubmit) {
      form.removeEventListener('submit', existingSubmit);
    }
    
    form._submitHandler = async (e) => {
  e.preventDefault();
  
  const isValid = this.validateContactForm(form);
  if (!isValid) {
    this.announce('Please fix the errors in the form');
    return;
  }
  
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  this.setFormState(form, false, 'Sending...');
  
  try {
    // Real EmailJS send - Replace simulateApiCall
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      contact_form_name: formData.get('name'),  // Match your form field names
      contact_form_email: formData.get('email'),
      contact_form_service: formData.get('service') || 'General Inquiry',
      contact_form_message: formData.get('message')
    });
    
    this.showFormSuccess(form, 'Thank you! Your message has been sent. I\'ll get back to you within 24 hours.');
    form.reset();
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  } catch (error) {
    console.error('EmailJS submission error:', error);
    this.showFormError(form, 'Sorry, something went wrong. Please try again.');
  } finally {
    this.setFormState(form, true, originalText);
  }
};



    
    form.addEventListener('submit', form._submitHandler);
  }
  
  initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;
    
    const emailInput = form.querySelector('input[name="email"]');
    if (emailInput) {
      emailInput.addEventListener('input', (e) => {
        clearTimeout(this.formValidationTimeout);
        this.formValidationTimeout = setTimeout(() => {
          this.validateField(e.target);
        }, 300);
      }, { passive: true });
    }
    
    const existingSubmit = form._newsletterHandler;
    if (existingSubmit) {
      form.removeEventListener('submit', existingSubmit);
    }
    
    form._newsletterHandler = async (e) => {
      e.preventDefault();
      
      const email = emailInput.value.trim();
      if (!this.validateEmail(email)) {
        this.showFieldError(emailInput, 'Please enter a valid email address');
        this.announce('Please enter a valid email address');
        return;
      }
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      this.setFormState(form, false, 'Subscribing...');
      
      try {
        await this.simulateApiCall(800, 1200);
        this.showFormSuccess(form, 'Welcome! You\'ve been subscribed to monthly insights.');
        form.reset();
      } catch (error) {
        this.showFormError(form, 'Subscription failed. Please try again.');
      } finally {
        this.setFormState(form, true, originalText);
      }
    };
    
    form.addEventListener('submit', form._newsletterHandler);
  }
  
  initRealTimeValidation() {
    const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
      input.removeEventListener('blur', input._validationHandler);
      input.removeEventListener('input', input._clearHandler);
      
      input._validationHandler = (e) => {
        this.validateField(e.target);
      };
      
      input._clearHandler = (e) => {
        const container = e.target.closest('.form-group');
        const errorEl = container.querySelector('.form-error');
        e.target.classList.remove('error');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.remove('show');
        }
      };
      
      input.addEventListener('blur', input._validationHandler);
      input.addEventListener('input', input._clearHandler, { passive: true });
    });
  }
  
  validateField(field) {
    try {
      const fieldValue = field.value.trim();
      const fieldContainer = field.closest('.form-group');
      const errorEl = fieldContainer.querySelector('.form-error');
      
      field.classList.remove('error');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('show');
      }
      
      let isValid = true;
      let errorMessage = '';
      
      if (field.hasAttribute('required') && !fieldValue) {
        isValid = false;
        errorMessage = `${this.getFieldName(field.name)} is required`;
      } else if (field.type === 'email' && fieldValue && !this.validateEmail(fieldValue)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      } else if (field.id === 'message' && fieldValue.length < 10) {
        isValid = false;
        errorMessage = 'Message must be at least 10 characters';
      }
      
      if (!isValid) {
        field.classList.add('error');
        if (errorEl) {
          errorEl.textContent = errorMessage;
          errorEl.classList.add('show');
        }
        this.announce(errorMessage);
      }
      
      return isValid;
    } catch (error) {
      console.warn('Field validation failed:', error);
      return false;
    }
  }
  
  validateContactForm(form) {
    try {
      let isValid = true;
      const fields = form.querySelectorAll('[required]');
      
      fields.forEach(field => {
        const fieldValid = this.validateField(field);
        if (!fieldValid) {
          isValid = false;
        }
      });
      
      return isValid;
    } catch (error) {
      console.error('Contact form validation failed:', error);
      return false;
    }
  }
  
  getFieldName(fieldName) {
    const names = {
      'name': 'Name',
      'email': 'Email',
      'service': 'Service',
      'message': 'Message'
    };
    return names[fieldName] || fieldName;
  }
  
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  setFormState(form, enabled, buttonText) {
    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      const inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach(input => {
        input.disabled = !enabled;
        if (!enabled) {
          input.blur();
        }
      });
      
      submitBtn.disabled = !enabled;
      submitBtn.innerHTML = buttonText;
      
      if (!enabled) {
        submitBtn.style.opacity = '0.7';
      } else {
        submitBtn.style.opacity = '1';
      }
    } catch (error) {
      console.warn('Form state update failed:', error);
    }
  }
  
  showFormSuccess(form, message) {
    try {
      const firstErrorEl = form.querySelector('.form-error');
      if (firstErrorEl) {
        firstErrorEl.textContent = message;
        firstErrorEl.style.color = 'rgb(34 197 94)';
        firstErrorEl.classList.add('show');
        
        setTimeout(() => {
          firstErrorEl.classList.remove('show');
          firstErrorEl.textContent = '';
          firstErrorEl.style.color = '';
        }, 5000);
      }
      
      this.announce(message);
      
      form.classList.add('success');
      setTimeout(() => form.classList.remove('success'), 5000);
    } catch (error) {
      console.warn('Form success display failed:', error);
    }
  }
  
  showFormError(form, message) {
    try {
      const firstErrorEl = form.querySelector('.form-error');
      if (firstErrorEl) {
        firstErrorEl.textContent = message;
        firstErrorEl.style.color = 'rgb(239 68 68)';
        firstErrorEl.classList.add('show');
      }
      
      this.announce(message);
    } catch (error) {
      console.warn('Form error display failed:', error);
    }
  }
  
  showFieldError(field, message) {
    try {
      const container = field.closest('.form-group');
      const errorEl = container.querySelector('.form-error');
      
      field.classList.add('error');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
      }
      
      this.announce(message);
    } catch (error) {
      console.warn('Field error display failed:', error);
    }
  }
  
  simulateApiCall(minDelay, maxDelay) {
    return new Promise((resolve, reject) => {
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      
      setTimeout(() => {
        if (Math.random() > 0.05) {
          resolve();
        } else {
          reject(new Error('API Error'));
        }
      }, delay);
    });
  }

  initParallax() {
    try {
      if (window.innerWidth <= 768 || 
          window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      
      let ticking = false;
      let lastScrollY = 0;
      
      const updateParallax = () => {
        try {
          const scrolled = window.pageYOffset;
          const heroBg = document.querySelector('.hero-bg');
          
          if (heroBg) {
            const speed = (scrolled - lastScrollY) * -0.3;
            const currentTransform = heroBg.style.transform || 'translateY(0px)';
            const currentY = parseFloat(currentTransform.match(/translateY\((.*)px\)/)?.[1] || 0);
            heroBg.style.transform = `translateY(${currentY + speed}px) translateZ(0)`; /* GPU acceleration for crispness */
          }
          
          lastScrollY = scrolled;
          ticking = false;
        } catch (error) {
          console.warn('Parallax update failed:', error);
          ticking = false;
        }
      };
      
      const requestTick = () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      };
      
      window.addEventListener('scroll', requestTick, { passive: true });
      this.parallaxCleanup = () => window.removeEventListener('scroll', requestTick);
    } catch (error) {
      console.error('Parallax initialization failed:', error);
    }
  }

  initAccessibility() {
    try {
      const skipLink = document.querySelector('.skip-link');
      if (skipLink) {
        skipLink.addEventListener('focus', () => {
          skipLink.style.top = '1rem';
          skipLink.style.zIndex = '10000';
          skipLink.style.position = 'fixed';
        });
        
        skipLink.addEventListener('blur', () => {
          setTimeout(() => {
            skipLink.style.top = '-40px';
            skipLink.style.zIndex = '100';
            skipLink.style.position = 'absolute';
          }, 100);
        });
        
        skipLink.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const target = document.querySelector(skipLink.getAttribute('href'));
            if (target) {
              target.focus();
            }
          }
        });
      }
      
      const announceRegion = document.getElementById('live-announce');
      if (announceRegion) {
        window.announce = (message, delay = 2000) => {
          try {
            announceRegion.setAttribute('aria-live', 'polite');
            announceRegion.setAttribute('aria-atomic', 'true');
            announceRegion.textContent = message;
            
            setTimeout(() => {
              announceRegion.textContent = '';
            }, delay);
          } catch (error) {
            console.warn('ARIA announcement failed:', error);
          }
        };
      }
      
      document.addEventListener('focusin', (e) => {
        if (this.isMobileMenuOpen && 
            !e.target.closest('.nav-mobile') && 
            !e.target.closest('.nav-burger')) {
          const firstLink = document.querySelector('.nav-list-mobile .nav-link');
          if (firstLink) {
            firstLink.focus();
          }
        }
      });
    } catch (error) {
      console.error('Accessibility initialization failed:', error);
    }
  }
  
  announce(message, delay = 2000) {
    try {
      if (window.announce) {
        window.announce(message, delay);
      } else {
        console.log('Announcement:', message);
      }
    } catch (error) {
      console.warn('Announcement failed:', error);
    }
  }

  startScrollAnimations() {
    try {
      const timelineItems = document.querySelectorAll('.timeline-item');
      timelineItems.forEach((item, index) => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
        setTimeout(() => {
          item.classList.add('animate');
        }, index * 250);
      });
      
      document.querySelectorAll('.fade-in').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 600ms ease, transform 600ms ease';
        
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          el.classList.add('visible');
        }, index * 150);
      });
    } catch (error) {
      console.warn('Scroll animations start failed:', error);
    }
  }

  destroy() {
    try {
      if (this.scrollObserver) {
        this.scrollObserver.disconnect();
      }
      if (this.mediaQueryListener) {
        this.mediaQueryListener();
      }
      if (this.parallaxCleanup) {
        this.parallaxCleanup();
      }
      if (this.themeToggles) {
        this.themeToggles.forEach(toggle => {
          if (toggle._themeHandler) toggle.removeEventListener('click', toggle._themeHandler);
          if (toggle._keyHandler) toggle.removeEventListener('keydown', toggle._keyHandler);
        });
      }
      document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn._filterHandler) {
          btn.removeEventListener('click', btn._filterHandler);
        }
      });
      const contactForm = document.getElementById('contact-form');
      const newsletterForm = document.getElementById('newsletter-form');
      if (contactForm && contactForm._submitHandler) contactForm.removeEventListener('submit', contactForm._submitHandler);
      if (newsletterForm && newsletterForm._newsletterHandler) newsletterForm.removeEventListener('submit', newsletterForm._newsletterHandler);
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  }
}

// Polyfill and DOM ready
if (!window.IntersectionObserver) {
  const script = document.createElement('script');
  script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
  script.async = true;
  script.onerror = () => console.warn('IntersectionObserver polyfill failed to load');
  document.head.appendChild(script);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      try {
        window.PortfolioAppInstance = new PortfolioApp();
      } catch (error) {
        console.error('PortfolioApp instantiation failed:', error);
      }
    }, 50);
  });
} else {
  try {
    window.PortfolioAppInstance = new PortfolioApp();
  } catch (error) {
    console.error('PortfolioApp instantiation failed:', error);
  }
}

// Preload images - Enhanced for high-res variants
if ('link' in document.createElement('link')) {
  const preloadLinks = [
    // Profile image variants
    'images/dube-1x.jpg',
    'images/dube-2x.jpg',
    // Hero background variants
    'images/hero-bg-1x.jpg',
    'images/hero-bg-2x.jpg',
    // Other potential high-res assets
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e896?w=400&h=250&fit=crop&auto=format'
  ];
  
  preloadLinks.forEach(href => {
    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      link.crossOrigin = 'anonymous';
      link.onerror = () => console.warn(`Failed to preload image: ${href}`);
      document.head.appendChild(link);
    } catch (error) {
      console.warn(`Preload creation failed for: ${href}`, error);
    }
  });
}

// Global error handling
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  if (window.announce) {
    window.announce('An error occurred. Please refresh the page.');
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  if (window.announce) {
    window.announce('A background process failed. The page is still functional.');
  }
});

if ('PerformanceObserver' in window) {
  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          console.log(`Navigation timing: ${entry.loadEventEnd - entry.loadEventStart}ms`);
        }
      });
    });
    observer.observe({ entryTypes: ['navigation'] });
  } catch (error) {
    console.warn('Performance observer failed:', error);
  }
}

window.addEventListener('beforeunload', () => {
  if (window.PortfolioAppInstance && window.PortfolioAppInstance.scrollObserver) {
    window.PortfolioAppInstance.scrollObserver.disconnect();
  }
  if (window.PortfolioAppInstance && window.PortfolioAppInstance.destroy) {
    window.PortfolioAppInstance.destroy();
  }
});

try {
  window.PortfolioAppInstance = window.PortfolioAppInstance || new PortfolioApp();
} catch (error) {
  console.error('Global PortfolioApp instance creation failed:', error);
}

document.addEventListener('DOMContentLoaded', () => {
  const projectImages = document.querySelectorAll('.project-image img');
  projectImages.forEach(img => {
    img.addEventListener('error', () => {
      const parent = img.parentElement;
      parent.style.backgroundImage = 'none';
      parent.style.backgroundColor = 'rgb(var(--color-surface-2))';
      img.style.display = 'block';
    });
  });
});