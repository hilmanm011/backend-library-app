const express = require('express');
const mahasiswaCtrl = require('../controllers/mahasiswa');
// const authentication = require('../middleware/authentication');
const router = express.Router();

const baseroute = '/mahasiswa';

router
    .route(`${baseroute}`)
    .get(
        mahasiswaCtrl.findAllMahasiswa
    );

router
    .route(`${baseroute}/:mhs_id`)
    .get(
        mahasiswaCtrl.findOneMahasiswa
    );

router
    .route(`${baseroute}`)
    .post(
        mahasiswaCtrl.createMahasiswa
    );

router
    .route(`${baseroute}/:mhs_id`)
    .put(
        mahasiswaCtrl.updateMahasiswa
    );

router
    .route(`${baseroute}/:mhs_id/activate`)
    .patch(
        mahasiswaCtrl.changeActiveInactive('Y')
    );

router
    .route(`${baseroute}/:mhs_id/inactivate`)
    .patch(
        mahasiswaCtrl.changeActiveInactive('N')
    );


module.exports = router;
