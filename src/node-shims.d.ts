declare module "node:crypto" { export function createHash(algorithm: string): { update(data: string): any; digest(encoding: "hex"): string }; }
declare module "node:test" { const test: (name: string, fn: () => void | Promise<void>) => void; export default test; }
declare module "node:assert/strict" { const assert: any; export default assert; }
declare const process: { argv: string[]; env: Record<string,string|undefined>; stdin: { setEncoding(enc:string):void; on(event:string, cb:(chunk:string)=>void):void }; stdout: { write(data:string):void }; };
