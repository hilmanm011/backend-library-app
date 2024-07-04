const db = require('../db');

class DBVersionControl {
    static async migrate(DB_VERSION) {
        try {
            if (DB_VERSION === 0) {
                await this.createSetting();
                await this.inisialDBVersion();
                DB_VERSION++;
                await this.setDBVersion(DB_VERSION);
            }

            if (DB_VERSION === 1) {
                await this.createMasterBooks();
                await this.createMasterMahasiswa();
                await this.createTrPeminjaman();
                await this.createDtPeminjaman();
                await this.createInventoryStok();
                await this.createHistoryPeminjaman();
                DB_VERSION++;
                await this.setDBVersion(DB_VERSION);
            }

            if (DB_VERSION === 2) {
                await this.createHistoryPeminjaman()
                DB_VERSION++;
                await this.setDBVersion(DB_VERSION);
            }
            
            await this.setDBVersion(DB_VERSION);
        } catch (error) {
            throw new Error(`[Error] : Failed to process auto revision database on version ${DB_VERSION} [Detail Error] : ${error}`);
        }
    }

    static async createSetting() {
        try {

            let sql = `DROP TABLE IF EXISTS setting`;

            await db.query(sql);
    
            sql = `
                CREATE TABLE setting (
                    set_id CHAR(3) NOT NULL,
                    set_seq INT NOT NULL,
                    set_string1 VARCHAR(750) NOT NULL DEFAULT '',
                    set_string2 VARCHAR(750) NOT NULL DEFAULT '',
                    set_int1 INT NOT NULL DEFAULT 0,
                    set_int2 INT NOT NULL DEFAULT 0,
                    set_doub1 DOUBLE PRECISION NOT NULL DEFAULT 0,
                    set_doub2 DOUBLE PRECISION NOT NULL DEFAULT 0,
                    set_datetime TIMESTAMP,
                    set_date DATE,
                    PRIMARY KEY (set_id, set_seq)
                )
            `;
    
            await db.query(sql);
    
            console.log('Table setting created successfully');
        } catch (error) {
            throw new Error(error);
        }
    }

    static async inisialDBVersion() {
        try {
            const sql = `INSERT INTO setting(set_id, set_seq, set_int1) 
                        VALUES('ver', 1, 0)`;
            await db.query(sql)
        } catch (error) {
            throw new Error(error);
        }
    }

    static async setDBVersion(ver) {
        try {
            const sql = `UPDATE setting SET set_int1 = ${ver} 
                        WHERE set_id = 'ver' AND set_seq = 1`;
            await db.query(sql)
        } catch (error) {
            throw new Error(error);
        }
    }

    static getDBVersion() {
        return new Promise(async (resolve, reject) => {
            try {
                // Check if the 'setting' table exists
                let sql = `SELECT to_regclass('public.setting') IS NOT NULL AS exists`;
                let { rows } = await db.query(sql);

                if (rows[0].exists) {
                    sql = `SELECT set_id, set_seq, set_int1 
                            FROM setting
                            WHERE set_id = 'ver'
                            AND set_seq = 1`;
                    let result = await db.query(sql);

                    if (result.rows.length > 0) {
                        resolve(result.rows[0].set_int1);
                    } else {
                        resolve(0);
                    }
                } else {
                    resolve(0);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    static async createMasterBooks() {
        try {
            let sql = `DROP TABLE IF EXISTS msbuku`;
            await db.query(sql);

            sql = `CREATE TABLE msbuku (
                buk_id SERIAL PRIMARY KEY,
                buk_judul VARCHAR(255) NOT NULL,
                buk_pengarang VARCHAR(255) NOT NULL DEFAULT '',
                buk_penerbit VARCHAR(255) NOT NULL DEFAULT '',
                buk_tahunterbit INT,
                buk_isbn VARCHAR(13) NOT NULL DEFAULT '',
                buk_crttime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                buk_updtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )`;
            await db.query(sql);

            console.log('Table msbuku created successfully');
        } catch (error) {
            throw new Error(error);
        }
    }

    static async createMasterMahasiswa() {
        try {
            let sql = `DROP TABLE IF EXISTS msmahasiswa`;
            await db.query(sql);

            sql = `
                CREATE TABLE msmahasiswa (
                    mhs_id SERIAL PRIMARY KEY,
                    mhs_nama VARCHAR(255) NOT NULL,
                    mhs_nim VARCHAR(20) UNIQUE NOT NULL,
                    mhs_jurusan VARCHAR(255) NOT NULL DEFAULT '',
                    mhs_isactive CHAR(1) NOT NULL DEFAULT 'Y',
                    mhs_tahunmasuk INT,
                    mhs_crttime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    mhs_updtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await db.query(sql);

            console.log('Table msmahasiswa created successfully');
        } catch (error) {
            throw new Error(error);
        }
    }

    static async createTrPeminjaman() {
        try {
            let sql = `DROP TABLE IF EXISTS trpeminjaman`;
            await db.query(sql);

            sql = `
                CREATE TABLE trpeminjaman (
                    pmj_id SERIAL PRIMARY KEY,
                    pmj_mhs_id INT NOT NULL,
                    pmj_tglpeminjaman DATE NOT NULL,
                    pmj_tglpengembalian DATE,
                    pmj_statuspengembalian CHAR(1) NOT NULL DEFAULT 'N',
                    pmj_crttime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    pmj_updtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await db.query(sql);

            console.log('Table trpeminjaman created successfully');
        } catch (error) {
            throw new Error(error);
        }
    }

    static async createDtPeminjaman() {
        try {
            let sql = `DROP TABLE IF EXISTS dtpeminjaman`;
            await db.query(sql);

            sql = `
                CREATE TABLE dtpeminjaman (
                    dpmj_id SERIAL PRIMARY KEY,
                    dpmj_pmj_id INT NOT NULL,
                    dpmj_buk_id INT NOT NULL
                )
            `;
            await db.query(sql);

            console.log('Table dtpeminjaman created successfully');
        } catch (error) {
            throw new Error(error);
        }
    }

    static async createInventoryStok() {
        try {
            let sql = `DROP TABLE IF EXISTS trinventory`;
            await db.query(sql);

            sql = `
                CREATE TABLE trinventory (
                    inv_id SERIAL PRIMARY KEY,
                    inv_buk_id INT NOT NULL,
                    inv_lokasi VARCHAR(255) NOT NULL,
                    inv_rak VARCHAR(100) NOT NULL,
                    inv_jumlah INT NOT NULL
                )
            `;
            await db.query(sql);

            console.log('Table trinventory created successfully');
        } catch (error) {
            throw new Error(error);
        }
    }

    static async createHistoryPeminjaman() {
        try {
            let sql = `DROP TABLE IF EXISTS hispeminjaman`;
            await db.query(sql);

            sql = `
                CREATE TABLE hispeminjaman (
                    his_id SERIAL PRIMARY KEY,
                    his_pmj_id INT NOT NULL,
                    his_description VARCHAR(255) NOT NULL,
                    his_crttime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await db.query(sql);

            console.log('Table hispeminjaman created successfully');
        } catch (error) {
            throw new Error(error);
        }
    }

}

module.exports = DBVersionControl;
