const config = require('./config');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./routes');
const DBVersionControl = require('./migrations');
const APP_DB_VERSION = require('./migrations/app-db-version');

const app = express();

app.use(cors({ origin: '*' ,exposedHeaders: 'content-disposition' }));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


// App Router
app.use('/api', router);

(async () => {
    try {

        // DB Auto Migrations
        const DB_VERSION = await DBVersionControl.getDBVersion();
        if (APP_DB_VERSION > DB_VERSION) {
            await DBVersionControl.migrate(DB_VERSION)
        }
        
    } catch (error) {
        throw error;
    }

    app.listen(config.port, () => {
        console.info(`App backend running on port ${config.port}`);
    });
})();