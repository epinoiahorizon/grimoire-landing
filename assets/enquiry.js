'use strict';

for (const form of document.querySelectorAll('form[data-mailto]')) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const values = [...form.querySelectorAll('[data-field-label]')]
      .map((field) => {
        const value = field.tagName === 'SELECT'
          ? field.selectedOptions[0]?.textContent.trim()
          : field.value.trim();
        return value ? `${field.dataset.fieldLabel}: ${value}` : null;
      })
      .filter(Boolean);

    const body = [
      ...values,
      '',
      'Sent from the Epinoia Horizon website. This page does not store form submissions.'
    ].join('\n');
    const subject = encodeURIComponent(form.dataset.subject || 'Epinoia Horizon enquiry');
    const encodedBody = encodeURIComponent(body);
    const status = form.querySelector('[data-form-status]');
    if (status) status.textContent = 'Opening your email app with this draft. Nothing has been sent yet.';
    window.location.href = `mailto:epinoiahorizon@gmail.com?subject=${subject}&body=${encodedBody}`;
  });
}
