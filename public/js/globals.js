const globals = (() => {
    document.addEventListener('DOMContentLoaded', () => {
        // Pone la clase 'active' al enlace cuyo atributo 'href'
        // coincide con el 'location.pathname'
        const links = document.querySelectorAll('a.nav-link');
        for (const link of links) {
            if (location.pathname === link.getAttribute('href')) {
                link.classList.add('active');
            }
        }        
    });    

    /**
     * Agrega una alerta al contenedor de alertas.
     * @param {*} message 
     * @param {*} type 
     */
    const appendAlert = (message, type) => {
        const alert = document.getElementById('alert');
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');
        alert.append(wrapper);
    };

    /**
     * Elimina todos los mensajes de alerta.
     */
    const removeAlerts = () => {
        const alert = document.getElementById('alert');
        while (alert.firstElementChild) {
            alert.removeChild(alert.firstElementChild);
        }
    };

    return {
        appendAlert,
        removeAlerts
    };
})();
