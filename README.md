# LIBRARY APP
Express Js, PostgreSQL
## Prasyarat

Pastikan Anda telah menginstal perangkat berikut sebelum memulai:

- [Node.js](https://nodejs.org/) (versi 14.x atau lebih baru)
- [npm](https://www.npmjs.com/) atau [Yarn](https://yarnpkg.com/)
- Sesuikan BASE_URL_SERVER pada file .env
- Config Database: 
NODE_ENV=development
PORT=5011
BASE_API=http://localhost:5011/

DB_DIALECT=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=dblibrary
DB_USERNAME=postgres
DB_PASSWORD=root


## Langkah-langkah Instalasi

1. **Clone repository ini:**

    ```bash
    git clone https://github.com/hilmanm011/backend-library-app
    cd backend-library-app
    ```

2. **Instal dependensi:**

    Jika Anda menggunakan npm:

    ```bash
    npm install
    ```

    Jika Anda menggunakan Yarn:

    ```bash
    yarn install
    ```

## Menjalankan Server

Untuk menjalankan Server di mode pengembangan:

Jika Anda menggunakan node:


```bash
node app.js
```

Server on running: http://localhost:5011/

