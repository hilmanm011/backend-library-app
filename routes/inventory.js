const express = require('express');
const inventoryCtrl = require('../controllers/inventory');
// const authentication = require('../middleware/authentication');
const router = express.Router();

const baseroute = '/inventory';

router
    .route(`${baseroute}`)
    .get(
        inventoryCtrl.findAllInventory
    );

router
    .route(`${baseroute}/:inv_id`)
    .get(
        inventoryCtrl.findOneInventory
    );

router
    .route(`${baseroute}`)
    .post(
        inventoryCtrl.createInventory
    );

router
    .route(`${baseroute}/:inv_id`)
    .put(
        inventoryCtrl.updateInventory
    );



module.exports = router;