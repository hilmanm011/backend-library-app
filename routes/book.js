const express = require('express');
const booksCtrl = require('../controllers/books');
// const authentication = require('../middleware/authentication');
const router = express.Router();

const baseroute = '/books';

router
    .route(`${baseroute}`)
    .get(
        booksCtrl.findAllBooks
    );

router
    .route(`${baseroute}/:buk_id`)
    .get(
        booksCtrl.findOneBook
    );

router
    .route(`${baseroute}`)
    .post(
        booksCtrl.createBook
    );

router
    .route(`${baseroute}/:buk_id`)
    .put(
        booksCtrl.updateBook
    );

router
    .route(`${baseroute}/:buk_id`)
    .delete(
        booksCtrl.deleteBook
    );


module.exports = router;
