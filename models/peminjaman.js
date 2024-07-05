const db = require("../db")

const totalData = async(queryParams) => {
    let sql = `
        SELECT
            COUNT(*) total
        FROM
            trpeminjaman
            LEFT JOIN msmahasiswa ON  trpeminjaman.pmj_mhs_id = msmahasiswa.mhs_id
    `

    if (queryParams.sfilter_search) {
        sql += `
            WHERE msmahasiswa.mhs_nim LIKE '%${queryParams.sfilter_search}%' 
            OR msmahasiswa.mhs_nama LIKE '%${queryParams.sfilter_search}%' 
            OR trpeminjaman.pmj_tglpeminjaman::TEXT LIKE '%${queryParams.sfilter_search}%' 
            OR trpeminjaman.pmj_tglpengembalian::TEXT LIKE '%${queryParams.sfilter_search}%' 
        `
    }
    const { rows } = await db.query(sql)
    return rows[0].total
}

const totalDataReport = async(queryParams) => {
    let sql = `
        SELECT
            COUNT(*) total
        FROM
            trpeminjaman
            LEFT JOIN msmahasiswa ON  trpeminjaman.pmj_mhs_id = msmahasiswa.mhs_id
        WHERE 1=1
    `

    if (
        queryParams.sfilter_mhs_nim || 
        queryParams.sfilter_mhs_nama || 
        queryParams.sfilter_pmj_tglpeminjaman || 
        queryParams.sfilter_pmj_tglpengembalian || 
        queryParams.sfilter_lama_pinjam_hari 
    ) {

        if (queryParams.sfilter_mhs_nim) {
            sql += `
                AND msmahasiswa.mhs_nim LIKE '%${queryParams.sfilter_mhs_nim}%' 
            `
        }
        
        if (queryParams.sfilter_mhs_nama) {
            sql += `
                AND msmahasiswa.mhs_nama LIKE '%${queryParams.sfilter_mhs_nama}%' 
            `
        }
        if (queryParams.sfilter_pmj_tglpeminjaman) {
            sql += `
                AND trpeminjaman.pmj_tglpeminjaman::TEXT LIKE '%${queryParams.sfilter_pmj_tglpeminjaman}%' 
            `
        }
        if (queryParams.sfilter_pmj_tglpengembalian) {
            sql += `
                AND trpeminjaman.pmj_tglpengembalian::TEXT LIKE '%${queryParams.sfilter_pmj_tglpengembalian}%' 
            `
        }
        if (queryParams.sfilter_lama_pinjam_hari) {
            sql += `
                AND 
					CASE 
                    WHEN trpeminjaman.pmj_statuspengembalian = 'N' THEN
                        EXTRACT(DAY FROM AGE(CURRENT_DATE, trpeminjaman.pmj_tglpeminjaman)) + 1
                    ELSE
                        EXTRACT(DAY FROM AGE(trpeminjaman.pmj_tglpengembalian, trpeminjaman.pmj_tglpeminjaman)) + 1
                    END = ${queryParams.sfilter_lama_pinjam_hari}
            `
        }
    }
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

    let sql = `
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
    `

    if (queryParams.sfilter_search) {
        sql += `
            WHERE
            msmahasiswa.mhs_nim LIKE '%${queryParams.sfilter_search}%' 
            OR msmahasiswa.mhs_nama LIKE '%${queryParams.sfilter_search}%' 
            OR trpeminjaman.pmj_tglpeminjaman::TEXT LIKE '%${queryParams.sfilter_search}%' 
            OR trpeminjaman.pmj_tglpengembalian::TEXT LIKE '%${queryParams.sfilter_search}%' 
        `
        sql += ` ORDER BY trpeminjaman.pmj_tglpeminjaman ASC`
    } else {
        sql += ` ORDER BY trpeminjaman.pmj_tglpeminjaman ASC`
        sql += ` LIMIT ${perPage} OFFSET ${offset}`
    }

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

const findDtPeminjamanByPmjId = async (pmj_id) =>{
    const sql = `
        SELECT * FROM dtpeminjaman WHERE dpmj_pmj_id = ${pmj_id}
    `
    const { rows } = await db.query(sql)
    return rows
}

const report = async (queryParams) => {
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

    const resultData = []

    let sql = `
        SELECT
            trpeminjaman.pmj_id,
            msmahasiswa.mhs_nim,
            msmahasiswa.mhs_nama,
            trpeminjaman.pmj_tglpeminjaman,
            trpeminjaman.pmj_tglpengembalian,
            trpeminjaman.pmj_statuspengembalian,
            CASE 
            WHEN trpeminjaman.pmj_statuspengembalian = 'N' THEN
                EXTRACT(DAY FROM AGE(CURRENT_DATE, trpeminjaman.pmj_tglpeminjaman)) + 1
            ELSE
                EXTRACT(DAY FROM AGE(trpeminjaman.pmj_tglpengembalian, trpeminjaman.pmj_tglpeminjaman)) + 1
            END AS lama_pinjam_hari
        FROM
            trpeminjaman
            LEFT JOIN msmahasiswa ON  trpeminjaman.pmj_mhs_id = msmahasiswa.mhs_id
        WHERE 1=1
    `

    if (
        queryParams.sfilter_mhs_nim || 
        queryParams.sfilter_mhs_nama || 
        queryParams.sfilter_pmj_tglpeminjaman || 
        queryParams.sfilter_pmj_tglpengembalian || 
        queryParams.sfilter_lama_pinjam_hari 
    ) {

        if (queryParams.sfilter_mhs_nim) {
            sql += `
                AND msmahasiswa.mhs_nim LIKE '%${queryParams.sfilter_mhs_nim}%' 
            `
        }
        
        if (queryParams.sfilter_mhs_nama) {
            sql += `
                AND msmahasiswa.mhs_nama LIKE '%${queryParams.sfilter_mhs_nama}%' 
            `
        }
        if (queryParams.sfilter_pmj_tglpeminjaman) {
            sql += `
                AND trpeminjaman.pmj_tglpeminjaman::TEXT LIKE '%${queryParams.sfilter_pmj_tglpeminjaman}%' 
            `
        }
        if (queryParams.sfilter_pmj_tglpengembalian) {
            sql += `
                AND trpeminjaman.pmj_tglpengembalian::TEXT LIKE '%${queryParams.sfilter_pmj_tglpengembalian}%' 
            `
        }
        if (queryParams.sfilter_lama_pinjam_hari) {
            sql += `
                AND 
					CASE 
                    WHEN trpeminjaman.pmj_statuspengembalian = 'N' THEN
                        EXTRACT(DAY FROM AGE(CURRENT_DATE, trpeminjaman.pmj_tglpeminjaman)) + 1
                    ELSE
                        EXTRACT(DAY FROM AGE(trpeminjaman.pmj_tglpengembalian, trpeminjaman.pmj_tglpeminjaman)) + 1
                    END = ${queryParams.sfilter_lama_pinjam_hari}
            `
        }

        sql += ` ORDER BY trpeminjaman.pmj_tglpeminjaman ASC`
    } else if (queryParams.sfilter_buk_id || queryParams.sfilter_buk_judul) {
        sql += ` ORDER BY trpeminjaman.pmj_tglpeminjaman ASC`
    } else if(

        !queryParams.sfilter_mhs_nim && 
        !queryParams.sfilter_mhs_nama && 
        !queryParams.sfilter_pmj_tglpeminjaman && 
        !queryParams.sfilter_pmj_tglpengembalian && 
        !queryParams.sfilter_lama_pinjam_hari &&
        !queryParams.sfilter_buk_id &&
        !queryParams.sfilter_buk_judul

    ) {
        sql += ` ORDER BY trpeminjaman.pmj_tglpeminjaman ASC`
        sql += ` LIMIT ${perPage} OFFSET ${offset}`
    }


    const result= await db.query(sql)
    for (let i = 0; i < result.rows.length; i++) {
        const element = result.rows[i];
        const sqlDetail = `
            SELECT
                msbuku.buk_id,
                msbuku.buk_judul 
            FROM
                dtpeminjaman
                LEFT JOIN msbuku ON dtpeminjaman.dpmj_buk_id = msbuku.buk_id 
            WHERE
                dpmj_pmj_id = ${element.pmj_id}
        `

        const resultDt = await db.query(sqlDetail)
        element.dtbuku = resultDt.rows
        resultData.push(element)
    }

    // FILTER BUKU
    if (queryParams.sfilter_buk_id) {
        const filterByBukId = (array, bukId) => {
            return array.filter(item => 
                item.dtbuku.some(book => book.buk_id == bukId)
            );
        };

        return filterByBukId(resultData, queryParams.sfilter_buk_id)

    }

    if (queryParams.sfilter_buk_judul) {

        const filterByBukJudul = (array, bukJudul) => {
            return array.filter(item => 
                item.dtbuku.some(book => book.buk_judul.toLowerCase().includes(bukJudul.toLowerCase()))
            );
        };

        return filterByBukJudul(resultData, queryParams.sfilter_buk_judul)

    }

    return resultData
}

module.exports = {
    totalData,
    findAll,
    findById,
    findDtPeminjamanByPmjId,
    report,
    totalDataReport
}