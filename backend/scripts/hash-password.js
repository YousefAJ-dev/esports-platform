const bcrypt = require('bcrypt');

async function run() {
	const password = 'Password123!';
	const saltRounds = 10;


	const hash = await bcrypt.hash(password, saltRounds);

	console.log(`Plain password: `, password);
	console.log(`Hashed password: `, hash);

}

run();