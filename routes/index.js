const router = require('express').Router();

router.use('/', require('./book'));
router.use('/', require('./mahasiswa'));
router.use('/', require('./peminjaman'));
router.use('/', require('./inventory'));
router.use('/', require('./history-peminjaman'));

module.exports = router;
