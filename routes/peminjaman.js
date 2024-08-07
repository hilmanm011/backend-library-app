const express = require('express');
const peminjamanCtrl = require('../controllers/peminjaman');
// const authentication = require('../middleware/authentication');
const router = express.Router();

const baseroute = '/peminjaman';

router
    .route(`${baseroute}`)
    .get(
        peminjamanCtrl.findAllPeminjaman
    );

    
router
    .route(`${baseroute}/report`)
    .get(
        peminjamanCtrl.findAllReport
    );


router
    .route(`${baseroute}/:pmj_id`)
    .get(
        peminjamanCtrl.findOnePeminjaman
    );

router
    .route(`${baseroute}`)
    .post(
        peminjamanCtrl.createNewPeminjaman
    );

router
    .route(`${baseroute}/:pmj_id/status`)
    .patch(
        peminjamanCtrl.updateStatusYpeminjaman
    );

module.exports = router;
