const db = require("../db");

const totalData = async() => {
    const sql = `
        SELECT
            COUNT(*) total
        FROM
            msbuku
            LEFT JOIN trinventory ON msbuku.buk_id = trinventory.inv_buk_id
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

    const sql = `
        SELECT
            msbuku.buk_id,
            msbuku.buk_judul,
            msbuku.buk_pengarang,
            msbuku.buk_penerbit,
            msbuku.buk_isbn,
            msbuku.buk_tahunterbit,
            trinventory.inv_lokasi,
            trinventory.inv_rak,
            trinventory.inv_jumlah
        FROM
            msbuku
            LEFT JOIN trinventory ON msbuku.buk_id = trinventory.inv_buk_id
        LIMIT ${perPage} OFFSET ${offset}
    `
    const { rows } = await db.query(sql)
    return rows
}

const findById = async(buk_id) => {
    const values = [buk_id];
    const sql = `
        SELECT
            msbuku.buk_id,
            msbuku.buk_judul,
            msbuku.buk_pengarang,
            msbuku.buk_penerbit,
            msbuku.buk_isbn,
            msbuku.buk_tahunterbit,
            trinventory.inv_lokasi,
            trinventory.inv_rak,
            trinventory.inv_jumlah
        FROM
            msbuku
            LEFT JOIN trinventory ON msbuku.buk_id = trinventory.inv_buk_id
        WHERE msbuku.buk_id = $1
    `
    const { rows } = await db.query(sql, values)
    return rows.length > 0 ? rows[0] : null
}

const insertBook = async(data) => {
    const sql = `
        INSERT INTO msbuku (
            buk_judul,
            buk_pengarang,
            buk_penerbit,
            buk_tahunterbit,
            buk_isbn
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

const updateBook = async(buk_id, data) => {
    const sql = `
        UPDATE msbuku
        SET 
            buk_judul = $1,
            buk_pengarang = $2,
            buk_penerbit = $3,
            buk_tahunterbit = $4,
            buk_isbn = $5
        WHERE
            buk_id = ${buk_id}
        RETURNING *
    `;

    const { rows } = await db.query(sql, data)
    return rows[0]
}

const deleteBook = async (buk_id) => {
    const sql = `
        DELETE FROM msbuku
        WHERE buk_id = $1
        RETURNING *
    `;

    const values = [buk_id];

    const { rows } = await db.query(sql, values);
    return rows[0];
};

module.exports = {
    totalData,
    findAll,
    findById,
    insertBook,
    updateBook,
    deleteBook
}