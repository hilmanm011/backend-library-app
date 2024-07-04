const inventoryModel = require('../models/inventory')

class Inventory {
    static findAllInventory = async (req, res, next) =>{
        try {
            const result = await inventoryModel.findAll(req.query)
            const total = await inventoryModel.totalData(req.query)
            res.status(200).json({
                status: 200,
                message: 'Berhasil mengambil data',
                total,
                data: result
            })
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Terjadi kesalahan pada server',
                error: error.message
            })
        }
    }

    static findOneInventory = async (req, res, next) =>{
        try {
            const { inv_id } = req.params;
            const inventory = await inventoryModel.findById(inv_id);
    
            if (!inventory) {
                return res.status(404).json({
                    status: 404,
                    message: 'Data tidak ditemukan',
                    data: null
                });
            }
    
            return res.status(200).json({
                status: 200,
                message: 'Berhasil mengambil data',
                data: inventory
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Terjadi kesalahan pada server',
                error: error.message
            });
        }
    }

    static createInventory = async (req, res, next) =>{
        try {
            const { 
                inv_buk_id, 
                inv_lokasi, 
                inv_rak, 
                inv_jumlah, 
            } = req.body

            const data = [
                inv_buk_id,
                inv_lokasi,
                inv_rak,
                inv_jumlah,
            ];

            const result = await inventoryModel.insertInventory(data)
            return res.status(201).json({
                status: 201,
                message: 'Inventory berhasil ditambahkan',
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Terjadi kesalahan pada server',
                error: error.message
            });
        }
    }

    static updateInventory = async (req, res, next) => {
        try {
            const { 
                inv_buk_id,
                inv_lokasi,
                inv_rak,
                inv_jumlah,
            } = req.body

            const { inv_id } = req.params

            const data = [
                inv_buk_id,
                inv_lokasi,
                inv_rak,
                inv_jumlah,
            ];

            const result = await inventoryModel.updateInventory(inv_id, data)
            return res.status(201).json({
                status: 200,
                message: 'Inventory berhasil diubah',
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Terjadi kesalahan pada server',
                error: error.message
            });
        }
    }
}

module.exports = Inventory