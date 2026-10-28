document.addEventListener('DOMContentLoaded', () => {
  const orderDialog = document.getElementById('order-dialog');
  const openDialogButton = document.getElementById('open-callback-dialog');
  const closeDialogButton = document.getElementById('close-order-dialog');
  const successMessage = document.getElementById('success-message');

  // Безопасное открытие окна
  if (openDialogButton && orderDialog) {
    openDialogButton.addEventListener('click', () => {
      orderDialog.showModal();
    });
  }

  // Безопасное закрытие окна
  if (closeDialogButton && orderDialog) {
    closeDialogButton.addEventListener('click', () => {
      orderDialog.close();
    });
  }

  // Абсолютно все формы на сайте
  const activeForms = document.querySelectorAll('.order-form');

  activeForms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault(); // Отменяем стандартную перезагрузку страницы
      
      const formElements = Array.from(form.elements);
      
      // Сбрасываем старые оранжевые рамки ошибок
      formElements.forEach((element) => {
        if (element.willValidate) {
          element.removeAttribute('aria-invalid');
        }
      });

      //Если поле пустое - предупреждение
      if (!form.checkValidity()) {
        formElements.forEach((element) => {
          if (element.willValidate && !element.checkValidity()) {
            element.setAttribute('aria-invalid', 'true'); // Включаем оранжевую рамку
          }
        });
        
        //"Заполните это поле"
        form.reportValidity(); 
        return;
      }

      // Если всё заполнено, показываем зеленый текст успеха
      const localSuccess = form.nextElementSibling || successMessage;
      if (localSuccess && localSuccess.classList.contains('success-message')) {
        localSuccess.hidden = false;
      }

      form.reset(); // Очищаем ячейки

      // Если форма была внутри модального окна, закрываем его
      if (orderDialog && orderDialog.hasAttribute('open')) {
        orderDialog.close();
      }
    });
  });
});
