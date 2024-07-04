const db = require("../db");

const totalData = async() => {
    const sql = `
        SELECT
            COUNT(*) total
        FROM
            hispeminjaman
            LEFT JOIN trpeminjaman ON hispeminjaman.his_pmj_id = trpeminjaman.pmj_id
            LEFT JOIN msmahasiswa ON trpeminjaman.pmj_mhs_id = msmahasiswa.mhs_id
    `
    const { rows } = await db.query(sql)
    return rows[0].total
}

const findAll = async(queryParams) => {
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

    let sql = `
        SELECT
            trpeminjaman.pmj_id,
            msmahasiswa.mhs_nama,
            hispeminjaman.his_description,
            hispeminjaman.his_crttime
        FROM
            hispeminjaman
            LEFT JOIN trpeminjaman ON hispeminjaman.his_pmj_id = trpeminjaman.pmj_id
            LEFT JOIN msmahasiswa ON trpeminjaman.pmj_mhs_id = msmahasiswa.mhs_id
        WHERE 1=1
    `

    if (queryParams.sfilter_mhs_id || queryParams.sfilter_startdate || queryParams.sfilter_enddate) {
        if (queryParams.sfilter_mhs_id) {
            sql += ` AND msmahasiswa.mhs_id = ${queryParams.sfilter_mhs_id}`
        }

        if (queryParams.sfilter_startdate && queryParams.sfilter_enddate) {
            sql += ` AND hispeminjaman.his_crttime BETWEEN '${queryParams.sfilter_startdate}' AND '${queryParams.sfilter_enddate}'`
        }
    } else {
        sql += ` LIMIT ${perPage} OFFSET ${offset}`
    }

    const { rows } = await db.query(sql)
    return rows
}


module.exports = {
    totalData,
    findAll
}