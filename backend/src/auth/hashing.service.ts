import { Injectable } from "@nestjs/common";//provide NestJS decorations
import * as argon2 from 'argon2';//A namespace import (import * as name) imports an entire module into a single object

@Injectable()//reusable
export class HashingService {
    async hash(data: string): Promise<string> {//Async functions always return a promise
        return argon2.hash(data);
    }

    async compare(data: string, hash: string): Promise<boolean> {
        return argon2.verify(hash, data);
    }
}