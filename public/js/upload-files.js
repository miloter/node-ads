const uploadFiles = (() => {
    const fileContainerId = 'fileContainer';

    let files = [];
    let isFilesReady = true;    

    const onFileChange = event => {
        isFilesReady = false;
        files = [];

        const filePromises = Object.entries(event.target.files).map(item => {
            // Crea una promesa de conversión a base 64 para cada fichero
            return new Promise((resolve, reject) => {
                // El índice 1 contiene los datos del fichero
                const file = item[1];
                const { name, type, size, lastModified } = file;
                const reader = new FileReader();

                reader.readAsDataURL(file);
                reader.onload = event => {
                    files.push({
                        content: event.target.result,
                        name,
                        type,
                        size,
                        lastModified
                    });
                    resolve();
                };
                reader.onerror = () => {
                    console.error(`Error convirtiendo fichero ${name}`);
                    reject();
                }
            });
        });

        // Intenta la conversión
        Promise.all(filePromises)
            .then(() => {
                isFilesReady = true;
                // Agrega las imágenes al contenedor
                const container = document.querySelector(`#${fileContainerId}`);
                container.innerHTML = files.map(file =>
                    `<img src="${file.content}" width="128"
                         alt="Imagen para subir al servidor">`
                ).join('');
            })
            .catch(error => console.error(error));
    }

    return {
        onFileChange
    };
})();