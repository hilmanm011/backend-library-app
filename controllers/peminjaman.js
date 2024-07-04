const db = require("../db");
const peminjamanModel = require('../models/peminjaman')
const inventoryModel = require('../models/inventory')
const mahasiswaModel = require('../models/mahasiswa')

class Peminjaman {

    static findAllPeminjaman = async (req, res, next) =>{
        const result = await peminjamanModel.findAll(req.query)
        const total = await peminjamanModel.totalData(req.query)
        res.status(200).json({
            status: 200,
            message: 'Berhasil mengambil data',
            total,
            data: result
        })
    }

    static findOnePeminjaman = async (req, res, next) =>{
        const { pmj_id } = req.params
        const result = await peminjamanModel.findById(pmj_id)
        res.status(200).json({
            status: 200,
            message: 'Berhasil mengambil data',
            data: result
        })
    }

    static createNewPeminjaman = async (req, res, next) => {
        const client = await db.pool.connect();
        try {
            const { pmj_mhs_id, pmj_tglpeminjaman, dtpeminjaman } = req.body;

            if (!pmj_mhs_id) {
                return res.status(400).json({
                    status: 400,
                    message: `Mahasiswa wajib diisi.`,
                });
            }

            if (!pmj_tglpeminjaman) {
                return res.status(400).json({
                    status: 400,
                    message: `Tanggal Peminjaman wajib diisi.`,
                });
            }

            if (!Array.isArray(dtpeminjaman)) {
                return res.status(400).json({
                    status: 400,
                    message: `Data peminjaman tidak valid.`,
                });
            }

            if (dtpeminjaman.length === 0) {
                return res.status(400).json({
                    status: 400,
                    message: `Data peminjaman buku harus diisi setidaknya 1 buku.`,
                });
            }

            // VALIDASI MAHASISWA
            const mhsData = await mahasiswaModel.findById(pmj_mhs_id)
            if (!mhsData) {
                return res.status(400).json({
                    status: 400,
                    message: `Mahasiswa dengan ID ${pmj_mhs_id} tidak ditemukan.`,
                });
            }

            if (mhsData && mhsData.mhs_isactive === 'N') {
                return res.status(400).json({
                    status: 400,
                    message: `Mahasiswa ${mhsData.mhs_nama} tidak aktif.`,
                });
            }

            // // VALIDASI STOK
            for (const detail of dtpeminjaman) {
                const stokReady = await inventoryModel.cekStokByBukuId(detail.dpmj_buk_id);
                if (stokReady <= 0) {
                    // Jika stok tidak tersedia, kembalikan respons kesalahan dan hentikan eksekusi
                    return res.status(400).json({
                        status: 400,
                        message: `Stok buku dengan ID ${detail.dpmj_buk_id} tidak tersedia.`,
                    });
                }
            }

            await client.query('BEGIN');

            // Insert into TRPEMINJAMAN
            const insertPeminjamanQuery = `
                INSERT INTO trpeminjaman (
                    pmj_mhs_id, 
                    pmj_tglpeminjaman, 
                    pmj_statuspengembalian, 
                    pmj_crttime, 
                    pmj_updtime
                ) VALUES (
                    $1, 
                    $2, 
                    'N', 
                    CURRENT_TIMESTAMP, 
                    CURRENT_TIMESTAMP
                )
                RETURNING pmj_id
            `;
            const { rows } = await client.query(insertPeminjamanQuery, [pmj_mhs_id, pmj_tglpeminjaman]);
            const pmj_id = rows[0].pmj_id;

            // INSERT HISTORY
            const insertHistory = `
                INSERT INTO hispeminjaman (his_pmj_id, his_description, his_crttime)
                VALUES (${pmj_id}, 'Peminjaman Buku', CURRENT_TIMESTAMP )
            `
            await client.query(insertHistory);


            // Insert into DTPEMINJAMAN
            const insertDetailPeminjamanQuery = `
                INSERT INTO dtpeminjaman (dpmj_pmj_id, dpmj_buk_id)
                VALUES ($1, $2)
            `;
            const bukuPinjam = []
            for (const detail of dtpeminjaman) {
                bukuPinjam.push(detail.dpmj_buk_id)
                await client.query(insertDetailPeminjamanQuery, [pmj_id, detail.dpmj_buk_id]);
            }

            await client.query('COMMIT');

            res.status(201).json({
                status: 201,
                message: 'Peminjaman berhasil ditambahkan',
                data: {
                    pmj_id,
                    pmj_mhs_id,
                    pmj_tglpeminjaman,
                    dtpeminjaman,
                },
            });
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({
                status: 500,
                message: 'Terjadi kesalahan pada server',
                error: error.message,
            });
        } finally {
            client.release();
        }

    }

    static updatePeminjaman = async (req, res, next) => {
        console.log(req.body);
    }
}

module.exports = Peminjaman