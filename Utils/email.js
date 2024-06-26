const mailer = require('nodemailer');
exports.sendEmail = async options => {
	try {
		// *steps to send email

		// 1 create a transponder (like gmail)
		const transponder = mailer.createTransport({ // service: 'Gmail',
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD
			},


			// ! we cannot use gmail for many platforms because its:
			// 1. only 500 emails are allowed perday
			// 2. its will mark us as an spammer.

		})
		// * 2) define the email
		// setting required options for email.
		const mailOptions = {
			from: "MasterTemplate Plc <hello@mastertemplate.io>",
			to: options.email,
			subject: options.subject,
			text: options.message
		}


		// * 3) send email
		const response = await transponder.sendMail(mailOptions);

		return response;
	} catch (err) {
		console.log(err)
	}
}
