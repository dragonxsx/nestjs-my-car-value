import {rm} from 'fs/promises';
import * as path from 'path';
import {getConnection} from 'typeorm';

global.beforeEach(async () => {
    try {
        await rm(path.join(__dirname, '..', 'test.sqlite'));
    } catch (err) {
        // Do nothing
    }
});

global.afterEach(async () => {
    const connection = await getConnection();
    await connection.close();
})