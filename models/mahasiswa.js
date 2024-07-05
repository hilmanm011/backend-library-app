const db = require("../db");

const totalData = async() => {
    const sql = `
        SELECT
            COUNT(*) total
        FROM
            msmahasiswa
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
        SELECT * FROM msmahasiswa 
    `
    if (queryParams.sfilter_search) {
        sql += ` 
            WHERE 
                mhs_id::TEXT LIKE '%${queryParams.sfilter_search}%' 
                OR mhs_nama LIKE '%${queryParams.sfilter_search}%' 
                OR mhs_nim LIKE '%${queryParams.sfilter_search}%' 
                OR mhs_jurusan LIKE '%${queryParams.sfilter_search}%' 
                OR mhs_tahunmasuk::TEXT LIKE '%${queryParams.sfilter_search}%' 
        `
        sql += ` ORDER BY mhs_nama ASC, mhs_nim ASC `
    } else {
        sql += ` ORDER BY mhs_nama ASC, mhs_nim ASC `
        sql += ` LIMIT ${perPage} OFFSET ${offset}`
    }
    const { rows } = await db.query(sql)
    return rows
}

const findById = async(mhs_id) => {
    const values = [mhs_id];
    const sql = `
        SELECT * FROM msmahasiswa WHERE mhs_id = $1
    `
    const { rows } = await db.query(sql, values)
    return rows.length > 0 ? rows[0] : null
}

const insertMahasiswa = async(data) => {
    const sql = `
        INSERT INTO msmahasiswa (
            mhs_nama,
            mhs_nim,
            mhs_jurusan,
            mhs_isactive,
            mhs_tahunmasuk
        ) VALUES (
            $1, 
            $2, 
            $3, 
            $4, 
            $5
        )
        RETURNING *
    `
    const { rows } = await db.query(sql, data)
    return rows[0]
}

const updateMahasiswa = async(mhs_id, data) => {
    const sql = `
        UPDATE msmahasiswa
        SET 
            mhs_nama = $1,
            mhs_nim = $2,
            mhs_jurusan = $3,
            mhs_tahunmasuk = $4
        WHERE
            mhs_id = ${mhs_id}
        RETURNING *
    `;

    const { rows } = await db.query(sql, data)
    return rows[0]
}

const updateIsActiveMahasiswa = async(mhs_id, data) => {
    const sql = `
        UPDATE msmahasiswa
        SET 
            mhs_isactive = $1
        WHERE
            mhs_id = ${mhs_id}
        RETURNING *
    `;

    const { rows } = await db.query(sql, data)
    return rows[0]
}

module.exports = {
    totalData,
    findAll,
    findById,
    insertMahasiswa,
    updateMahasiswa,
    updateIsActiveMahasiswa
}