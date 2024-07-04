const db = require("../db");

const totalData = async() => {
    const sql = `
        SELECT
            COUNT(*) total
        FROM
            trinventory
            INNER JOIN msbuku ON trinventory.inv_buk_id = msbuku.buk_id
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
            *
        FROM
            trinventory
            INNER JOIN msbuku ON trinventory.inv_buk_id = msbuku.buk_id
        LIMIT ${perPage} OFFSET ${offset}
    `
    const { rows } = await db.query(sql)
    return rows
}

const findById = async(inv_id) => {
    const values = [inv_id];
    const sql = `
        SELECT
            *
        FROM
            trinventory
            INNER JOIN msbuku ON trinventory.inv_buk_id = msbuku.buk_id
        WHERE trinventory.inv_id = $1
    `
    const { rows } = await db.query(sql, values)
    return rows.length > 0 ? rows[0] : null
}

const insertInventory = async(data) => {
    const sql = `
        INSERT INTO trinventory (
            inv_buk_id,
            inv_lokasi,
            inv_rak,
            inv_jumlah
        ) VALUES (
            $1, 
            $2, 
            $3, 
            $4
        )
        RETURNING *
    `
    console.log(sql);
    const { rows } = await db.query(sql, data)
    return rows[0]
}

const updateInventory = async(inv_id, data) => {
    const sql = `
        UPDATE trinventory
        SET 
            inv_buk_id = $1,
            inv_lokasi = $2,
            inv_rak = $3,
            inv_jumlah = $4
        WHERE
            inv_id = ${inv_id}
        RETURNING *
    `;

    const { rows } = await db.query(sql, data)
    return rows[0]
}

const cekStokByBukuId = async(buk_id) => {
    const sql = `
        SELECT SUM
            ( inv_jumlah ) stok_tersedia 
        FROM
            trinventory 
        WHERE
            inv_buk_id = ${buk_id}
    `

    const { rows } = await db.query(sql)
    return rows[0].stok_tersedia !== null ? rows[0].stok_tersedia : 0;
}

module.exports = {
    totalData,
    findAll,
    findById,
    insertInventory,
    updateInventory,
    cekStokByBukuId
}