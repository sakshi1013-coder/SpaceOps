const bcrypt = require('bcryptjs');

const passwords = {
  admin: 'admin123',
  manager: 'manager123',
  operator: 'operator123'
};

console.log('==================================================');
console.log('Generating Secure Bcrypt Hashes for SpaceOps Users');
console.log('==================================================');

for (const [role, plainText] of Object.entries(passwords)) {
  const hash = bcrypt.hashSync(plainText, 10);
  console.log(`${role} (${plainText}) -> ${hash}`);
}
console.log('==================================================');
