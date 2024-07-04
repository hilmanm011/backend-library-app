const historyPeminjamanModel = require('../models/history-peminjaman')

class HistoryPeminjaman {
    static findAllHistoryPeminjaman = async (req, res, next) => {
        try {
            const result = await historyPeminjamanModel.findAll(req.query)
            const total = await historyPeminjamanModel.totalData(req.query)
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
}

module.exports = HistoryPeminjaman