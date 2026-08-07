import mongoose from 'mongoose';
import dns from 'node:dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

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
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(` SUCCESS! Password works: ${pwd}`);
      await mongoose.disconnect();
      return;
    } catch (err: any) {
      console.log(` FAILED: ${err.message}`);
    }
  }
}

testAll();
