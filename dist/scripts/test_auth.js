"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const node_dns_1 = __importDefault(require("node:dns"));
try {
    node_dns_1.default.setServers(['8.8.8.8', '1.1.1.1']);
    node_dns_1.default.setDefaultResultOrder('ipv4first');
}
catch (e) { }
const passwords = [
    'tanadolP5623',
    'wmN2LOV1g9xlRJpH',
    encodeURIComponent('tanadolP5623'),
    encodeURIComponent('wmN2LOV1g9xlRJpH')
];
const username = 'tanatose0918_db_user';
const cluster = 'nutritrustprototype.uxtbpbi.mongodb.net';
async function testAll() {
    for (const pwd of passwords) {
        const uri = `mongodb+srv://${username}:${pwd}@${cluster}/Web_application_base?retryWrites=true&w=majority`;
        console.log(`Testing with password: ${pwd.substring(0, 4)}***`);
        try {
            await mongoose_1.default.connect(uri, { serverSelectionTimeoutMS: 5000 });
            console.log(` SUCCESS! Password works: ${pwd}`);
            await mongoose_1.default.disconnect();
            return;
        }
        catch (err) {
            console.log(` FAILED: ${err.message}`);
        }
    }
}
testAll();
