import { INestApplication, ValidationPipe } from "@nestjs/common";
const cookieSession = require("cookie-session");

export const setupApp = (app: INestApplication) => {
    app.use(cookieSession({
        keys: ['asdasddf']
    }));
    
    app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true
        })
    );   
}