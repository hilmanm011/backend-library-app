const db = require("../db")

const totalData = async() => {
    const sql = `
        SELECT
            COUNT(*) total
        FROM
            trpeminjaman
            LEFT JOIN msmahasiswa ON  trpeminjaman.pmj_mhs_id = msmahasiswa.mhs_id
    `
    const { rows } = await db.query(sql)
    return rows[0].total
}

const findAll = async (queryParams) => {
    let limit = 100
    let page = 1

    // set limit queryParams
    if (queryParams?.limit) {
        if (queryParams.limit.toUpperCase() !== 'ALL') {
            const intLimit = parseInt(queryParams.limit, 10);
            if (!Number.isNaN(intLimit)) {
                limit = intLimit;
            }
        }
    }

    if (queryParams?.page && queryParams.page != 0) {
        const intPage = parseInt(queryParams.page);
        if (!Number.isNaN(intPage)) {
            page = intPage;
        }
    }

    const perPage = limit; //limit
    const offset = (page - 1) * perPage; // Calculate the offset

    const sql = `
        SELECT
            trpeminjaman.pmj_id,
            trpeminjaman.pmj_tglpeminjaman,
            trpeminjaman.pmj_tglpengembalian,
            trpeminjaman.pmj_statuspengembalian,
            msmahasiswa.mhs_nama,
            msmahasiswa.mhs_nim,
            msmahasiswa.mhs_isactive
        FROM
            trpeminjaman
            LEFT JOIN msmahasiswa ON  trpeminjaman.pmj_mhs_id = msmahasiswa.mhs_id
        LIMIT ${perPage} OFFSET ${offset}
    `
    const { rows } = await db.query(sql)
    return rows
}

const findById = async (pmj_id) =>{
    const sql = `
        SELECT
            trpeminjaman.pmj_id,
            trpeminjaman.pmj_tglpeminjaman,
            trpeminjaman.pmj_tglpengembalian,
            trpeminjaman.pmj_statuspengembalian,
            msmahasiswa.mhs_nama,
            msmahasiswa.mhs_nim,
            msmahasiswa.mhs_isactive
        FROM
            trpeminjaman
            LEFT JOIN msmahasiswa ON  trpeminjaman.pmj_mhs_id = msmahasiswa.mhs_id
        WHERE trpeminjaman.pmj_id = ${pmj_id}
    `
    const { rows } = await db.query(sql)
    return rows.length > 0 ? rows[0] : null
}

module.exports = {
    totalData,
    findAll,
    findById
}