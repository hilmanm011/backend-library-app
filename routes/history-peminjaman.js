const express = require('express');
const historyPeminjamanCtrl = require('../controllers/history-peminjaman');
// const authentication = require('../middleware/authentication');
const router = express.Router();

const baseroute = '/history-peminjaman';

router
    .route(`${baseroute}`)
    .get(
        historyPeminjamanCtrl.findAllHistoryPeminjaman
    );

module.exports = router;
