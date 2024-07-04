const booksModel = require('../models/book')

class Books {
    static findAllBooks = async (req, res, next) => {
        try {
            const books = await booksModel.findAll(req.query)
            const total = await booksModel.totalData(req.query)
            res.status(200).json({
                status: 200,
                message: 'Berhasil mengambil data',
                total,
                data: books
            })
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Terjadi kesalahan pada server',
                error: error.message
            })
        }
    }

    static findOneBook = async (req, res, next) => {
        try {
            const { buk_id } = req.params;
            const book = await booksModel.findById(buk_id);
    
            if (!book) {
                return res.status(404).json({
                    status: 404,
                    message: 'Data tidak ditemukan',
                    data: null
                });
            }
    
            return res.status(200).json({
                status: 200,
                message: 'Berhasil mengambil data',
                data: book
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Terjadi kesalahan pada server',
                error: error.message
            });
        }
    }

    static createBook = async (req, res, next) => {
        try {
            const { 
                buk_judul, 
                buk_pengarang, 
                buk_penerbit, 
                buk_tahunterbit, 
                buk_isbn,
            } = req.body

            const data = [
                buk_judul,
                buk_pengarang,
                buk_penerbit,
                buk_tahunterbit,
                buk_isbn
            ];

            const result = await booksModel.insertBook(data)
            return res.status(201).json({
                status: 201,
                message: 'Buku berhasil ditambahkan',
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

    static updateBook = async (req, res, next) => {
        try {
            const { 
                buk_judul, 
                buk_pengarang, 
                buk_penerbit, 
                buk_tahunterbit, 
                buk_isbn
            } = req.body

            const { buk_id } = req.params

            const data = [
                buk_judul,
                buk_pengarang,
                buk_penerbit,
                buk_tahunterbit,
                buk_isbn
            ];

            const result = await booksModel.updateBook(buk_id, data)
            return res.status(201).json({
                status: 200,
                message: 'Buku berhasil diubah',
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

    static deleteBook = async (req, res, next) => {
        try {
            const { buk_id } = req.params;
            const book = await booksModel.findById(buk_id);
    
            if (!book) {
                return res.status(404).json({
                    status: 404,
                    message: 'Data tidak ditemukan',
                    data: null
                });
            }
    
            const result = await booksModel.deleteBook(buk_id)
            return res.status(200).json({
                status: 200,
                message: 'Berhasil menghapus data',
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

module.exports = Books