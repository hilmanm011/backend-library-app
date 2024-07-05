const moment = require('moment')
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
        if (!result) {
            return res.status(401).json({
                status: 401,
                message: 'Data tidak ditemukan',
                data: null
            })
        }
        res.status(200).json({
            status: 200,
            message: 'Berhasil mengambil data',
            data: result
        })
    }

    static createNewPeminjaman = async (req, res, next) => {
        const client = await db.pool.connect();
        try {
            const { pmj_mhs_id, pmj_tglpeminjaman, pmj_tglpengembalian, dtpeminjaman } = req.body;

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

            let defaultTglPengembalian = moment().add(14, 'days').format('YYYY-MM-DD HH:mm:ss')
            if (pmj_tglpengembalian) {
                if (!moment(pmj_tglpengembalian, 'YYYY-MM-DD', true).isValid()) {
                    return res.status(400).json({
                        status: 400,
                        message: `Invalid input: pmj_tglpengembalian harus YYYY-MM-DD format.`,
                    });
                }

                const tglPmjn = moment(pmj_tglpeminjaman)
                const tglPngmbln = moment(pmj_tglpengembalian)

                // Validasi tgl pengembalian tidak boleh lebih dari 14 hari dari tgl peminjaman
                if (tglPngmbln.diff(tglPmjn, 'days') > 14) {
                    return res.status(400).json({
                        status: 400,
                        message: 'Invalid input: pmj_tglpengembalian tidak boleh lebih dari 14 hari setelah pmj_tglpeminjaman.',
                    });
                }

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

            // START TRANSACTIONS
            await client.query('BEGIN');

            // Insert into TRPEMINJAMAN
            const insertPeminjamanQuery = `
                INSERT INTO trpeminjaman (
                    pmj_mhs_id, 
                    pmj_tglpeminjaman, 
                    pmj_tglpengembalian,
                    pmj_statuspengembalian, 
                    pmj_crttime, 
                    pmj_updtime
                ) VALUES (
                    $1, 
                    $2, 
                    $3,
                    'N', 
                    CURRENT_TIMESTAMP, 
                    CURRENT_TIMESTAMP
                )
                RETURNING pmj_id
            `;
            const { rows } = await client.query(insertPeminjamanQuery, [pmj_mhs_id, pmj_tglpeminjaman, defaultTglPengembalian]);
            const pmj_id = rows[0].pmj_id;

            // INSERT HISTORY
            const insertHistory = `
                INSERT INTO hispeminjaman (his_pmj_id, his_description, his_crttime)
                VALUES (${pmj_id}, 'Peminjaman Buku. Inventory stok telah berkurang.', CURRENT_TIMESTAMP )
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

                // Kurangi stock pada inventoty
                const rak = await inventoryModel.getRakByBukuIdAndStokReady(detail.dpmj_buk_id)
                if (rak && rak.length > 0) {
                    const rakInvID = rak[0].inv_id
                    const findOneInv = await inventoryModel.findById(rakInvID)
                    const stock = findOneInv.inv_jumlah - 1
                    const sqlUpd = `UPDATE trinventory SET inv_jumlah = ${stock} WHERE inv_id = ${rakInvID}`
                    client.query(sqlUpd)
                }
            }

            await client.query('COMMIT');
            // END TRANSACTIONS

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

    static updateStatusYpeminjaman = async (req, res, next) => {
        const client = await db.pool.connect();
        try {
            const { pmj_statuspengembalian } = req.body;
            const { pmj_id } = req.params
            const validStatus = ['Y', 'N']
            if (!validStatus.includes(pmj_statuspengembalian)) {
                return res.status(400).json({
                    status: 400,
                    message: `Invalid input: pmj_statuspengembalian harus Y | N.`,
                });
            }
            const cekPmj = await peminjamanModel.findById(pmj_id)
            if (!cekPmj) {
                return res.status(401).json({
                    status: 401,
                    message: 'Data tidak ditemukan',
                    data: null
                })
            }

            const dtPeminjaman = await peminjamanModel.findDtPeminjamanByPmjId(cekPmj.pmj_id)

            // START TRANSACTIONS
            await client.query('BEGIN');
            const pmj_tglpengembalian = moment().format('YYYY-MM-DD')
            const data = [pmj_statuspengembalian, pmj_id, pmj_tglpengembalian]
            const sql = `UPDATE trpeminjaman SET pmj_statuspengembalian = $1, pmj_tglpengembalian = $3 WHERE pmj_id = $2`
            const { rows } = await client.query(sql, data)

            // Update Stock 
            for (let i = 0; i < dtPeminjaman.length; i++) {
                const detail = dtPeminjaman[i];
                const inventoryMin = await inventoryModel.findMinStokInventoryByBukuId(detail.dpmj_buk_id)
                const stock = inventoryMin.inv_jumlah + 1
                const idInv = inventoryMin.inv_id
                const sqlUpd = `UPDATE trinventory SET inv_jumlah = ${stock} WHERE inv_id = ${idInv}`
                client.query(sqlUpd)
            }

            // INSERT HISTORY
            const insertHistory = `
                INSERT INTO hispeminjaman (his_pmj_id, his_description, his_crttime)
                VALUES (${pmj_id}, 'Pengembalian Buku. Telah dikembalikan pada inventory stok.', CURRENT_TIMESTAMP )
            `
            await client.query(insertHistory);


            await client.query('COMMIT');
            // END TRANSACTIONS
            res.status(200).json({
                status: 200,
                message: 'Peminjaman berhasil diubah',
                data: rows[0],
            });

        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({
                status: 500,
                message: 'Terjadi kesalahan pada server',
                error: error.message,
            });
        }
    }

    static findAllReport = async (req, res, next) =>{
        const result = await peminjamanModel.report(req.query)
        const total = await peminjamanModel.totalDataReport(req.query)
        res.status(200).json({
            status: 200,
            message: 'Berhasil mengambil data',
            total,
            data: result
        })
    }
}

module.exports = Peminjaman