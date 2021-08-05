import {
    UseInterceptors,
    NestInterceptor,
    ExecutionContext,
    CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';
import { nextTick } from 'process';

export class SerializeInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
        // Run something before a request is handled
        // by the request handler
        console.log('I\'m running before the handler', context);

        return handler.handle().pipe(
            map((data: any) => {
                // Run something before the response is sent out
                console.log('I\'m running before response is sent out', data);
                
            })
        )
        
    }
}