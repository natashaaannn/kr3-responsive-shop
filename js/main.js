document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.site-nav__toggle');
  const navigation = document.getElementById('site-navigation');

  if (menuButton && navigation) {
    const closeMenu = (restoreFocus = false) => {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
      if (restoreFocus) menuButton.focus();
    };

    menuButton.addEventListener('click', () => {
      const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isExpanded));
      navigation.classList.toggle('is-open', !isExpanded);
    });

    navigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        closeMenu(true);
      }
    });

    document.addEventListener('click', (event) => {
      if (!navigation.contains(event.target) && !menuButton.contains(event.target)) {
        closeMenu();
      }
    });

    window.matchMedia('(min-width: 768px)').addEventListener('change', () => closeMenu());
  }

  const filters = document.getElementById('catalog-filter-form');
  const filterDisclosure = document.querySelector('.catalog-filter-disclosure');

  if (filterDisclosure) {
    const wideScreen = window.matchMedia('(min-width: 1024px)');
    const updateDisclosure = () => {
      filterDisclosure.open = wideScreen.matches;
    };
    updateDisclosure();
    wideScreen.addEventListener('change', updateDisclosure);
  }

  if (filters) {
    const cards = Array.from(document.querySelectorAll('.catalog-products .product-card'));
    const count = document.getElementById('catalog-results-count');
    const empty = document.getElementById('catalog-empty');

    const filterCards = () => {
      const selectedTypes = Array.from(filters.querySelectorAll('[name="type"]:checked'), (input) => input.value);
      const selectedStatuses = Array.from(filters.querySelectorAll('[name="status"]:checked'), (input) => input.value);
      const fromField = filters.querySelector('[name="price-from"]');
      const toField = filters.querySelector('[name="price-to"]');
      const minPrice = fromField.value === '' ? 0 : Number(fromField.value);
      const maxPrice = toField.value === '' ? Infinity : Number(toField.value);

      if (minPrice > maxPrice) {
        toField.setCustomValidity('Максимальная цена должна быть не меньше минимальной.');
        toField.reportValidity();
        return false;
      }
      toField.setCustomValidity('');
      let visible = 0;

      cards.forEach((card) => {
        const price = Number(card.querySelector('.product-card__price').textContent.replace(/[^\d]/g, ''));
        const badge = card.querySelector('.product-card__badge');
        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.some((status) =>
          badge && badge.classList.contains(`product-card__badge--${status}`));
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(card.dataset.category);
        const show = matchesType && matchesStatus && price >= minPrice && price <= maxPrice;
        card.hidden = !show;
        if (show) visible += 1;
      });

      count.textContent = `Показано товаров: ${visible} из ${cards.length}`;
      empty.hidden = visible !== 0;
      return true;
    };

    filters.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!filterCards()) return;
      if (filterDisclosure && !window.matchMedia('(min-width: 1024px)').matches) {
        filterDisclosure.open = false;
      }
    });

    filters.querySelector('[name="price-to"]').addEventListener('input', (event) => {
      event.target.setCustomValidity('');
    });

    filters.addEventListener('reset', () => {
      filters.querySelector('[name="price-to"]').setCustomValidity('');
      setTimeout(filterCards, 0);
    });
    filterCards();
  }

  const dialog = document.getElementById('order-dialog');
  const openDialog = document.getElementById('open-callback-dialog');
  const closeDialog = document.getElementById('close-order-dialog');

  if (dialog && openDialog) {
    openDialog.addEventListener('click', () => {
      const status = dialog.querySelector('.success-message');
      if (status) status.hidden = true;
      dialog.showModal();
    });

    if (closeDialog) closeDialog.addEventListener('click', () => dialog.close());

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener('close', () => openDialog.focus());
  }

  document.querySelectorAll('.order-form').forEach((form) => {
    const status = form.nextElementSibling?.classList.contains('success-message')
      ? form.nextElementSibling
      : null;

    form.querySelectorAll('input, select, textarea').forEach((field) => {
      const clearState = () => {
        field.removeAttribute('aria-invalid');
        if (status) status.hidden = true;
      };
      field.addEventListener('input', clearState);
      field.addEventListener('change', clearState);
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fields = Array.from(form.elements).filter((field) => field.willValidate);
      fields.forEach((field) => field.removeAttribute('aria-invalid'));
      if (status) status.hidden = true;

      if (!form.checkValidity()) {
        fields.forEach((field) => {
          if (!field.checkValidity()) field.setAttribute('aria-invalid', 'true');
        });
        form.reportValidity();
        return;
      }

      if (status) {
        status.hidden = false;
        status.focus();
      }
      form.reset();
    });
  });

  const map = document.querySelector('.map-container');
  if (map) {
    const labelMap = () => {
      const frame = map.querySelector('iframe');
      if (!frame) return false;
      frame.title = 'Карта расположения магазина SpookyShop';
      frame.loading = 'lazy';
      return true;
    };

    if (!labelMap()) {
      const observer = new MutationObserver(() => {
        if (labelMap()) observer.disconnect();
      });
      observer.observe(map, { childList: true, subtree: true });
    }
  }
});
