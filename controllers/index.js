const indexGet = (req, res, next) => {    
    res.render('index', {
        page: {
            title: 'NodeAds',
            description: 'Tu Página para poner Anuncios...',
            keywords: 'sitio, web, anuncios'
        },
        user: req.user
    });
};

export {
    indexGet,
};
