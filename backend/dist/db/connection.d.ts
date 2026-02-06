import { Pool } from 'pg';
export declare const pool: Pool;
export declare function testConnection(): Promise<boolean>;
