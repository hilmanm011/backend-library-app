const mahasiswaModel = require('../models/mahasiswa')

class Mahasiswa {
    static findAllMahasiswa = async (req, res, next) => {
        try {
            const mahasiswa = await mahasiswaModel.findAll(req.query)
            const total = await mahasiswaModel.totalData(req.query)
            res.status(200).json({
                status: 200,
                message: 'Berhasil mengambil data',
                total,
                data: mahasiswa
            })
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Terjadi kesalahan pada server',
                error: error.message
            })
        }
    }

    static findOneMahasiswa = async (req, res, next) => {
        try {
            const { mhs_id } = req.params;
            const result = await mahasiswaModel.findById(mhs_id);
    
            if (!result) {
                return res.status(404).json({
                    status: 404,
                    message: 'Data tidak ditemukan',
                    data: null
                });
            }
    
            return res.status(200).json({
                status: 200,
                message: 'Berhasil mengambil data',
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

    static createMahasiswa = async (req, res, next) => {
        try {
            const { 
                mhs_nama, 
                mhs_nim, 
                mhs_jurusan, 
                mhs_tahunmasuk, 
            } = req.body

            const data = [
                mhs_nama,
                mhs_nim,
                mhs_jurusan,
                "Y",
                mhs_tahunmasuk,
            ];

            const result = await mahasiswaModel.insertMahasiswa(data)
            return res.status(201).json({
                status: 201,
                message: 'Mahasiswa berhasil ditambahkan',
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

    static updateMahasiswa = async (req, res, next) =>{
        try {
            const { 
                mhs_nama, 
                mhs_nim, 
                mhs_jurusan, 
                mhs_tahunmasuk, 
            } = req.body

            const { mhs_id } = req.params

            const data = [
                mhs_nama, 
                mhs_nim, 
                mhs_jurusan, 
                mhs_tahunmasuk, 
            ];

            const result = await mahasiswaModel.updateMahasiswa(mhs_id, data)
            return res.status(201).json({
                status: 200,
                message: 'Mahasiswa berhasil diubah',
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

    static changeActiveInactive = (status) => async (req, res, next) =>{
        try {
            const { mhs_id } = req.params

            const data = [
                status
            ];

            const result = await mahasiswaModel.updateIsActiveMahasiswa(mhs_id, data)
            return res.status(201).json({
                status: 200,
                message: 'Mahasiswa berhasil diubah',
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

module.exports = Mahasiswa