const catchAsync = require("../ErrorHandler/catchAsync");
const AppError = require("../ErrorHandler/appError");
const Admin = require("./../Models/adminModel");
const authUtils = require("../Utils/authUtils");
const bcrypt = require("bcryptjs");
const {sendEmail} = require('./../Utils/email');
const {resetTokenGenerator} = require('./../Utils/authUtils');


// cool creator
exports.StartSystem = catchAsync(async (req, res, next) => {
	let data = req.body;
	// checking if super user is already created .

	const admins = await Admin.find()
	if (admins.length > 1) { // Returning can't find the end point error if the system is already started.
		next(new AppError(`can't find ${
			req.originalUrl
		} on our server`, 404));
		return;
	}
	data.role = "Super Admin";
	const newAdmin = await Admin.create(data);
	const token = authUtils.signToken(newAdmin._id);
	res.status(201).json({
		data: {
			token,
			newAdmin
		}
	});
});
// registration controller.
exports.Register = catchAsync(async (req, res, next) => {
	const data = req.body;
	const newAdmin = await Admin.create(data);

	const token = authUtils.signToken(newAdmin._id);
	res.status(201).json({
		data: {
			token,
			newAdmin
		}
	});
});

exports.Login = catchAsync(async (req, res, next) => {
	console.log("hello"); // ?checking weather phone number and password is provided.
	if (!(req.body.password && req.body.phoneNumber)) {
		next(new AppError("Phone number and password  should be provided to login !", 400));
	}
	// ? selecting the password of the user by provided phoneNumber
	const admin = await Admin.findOne({phoneNumber: req.body.phoneNumber}).select("+password");

	const errorMsg = "The phoneNumber doesn't exits or the password is not correct!";
	// ? checking if the user exists with the provided phoneNumber.
	if (admin) {
		const correct = await admin.correctPassword(req.body.password, admin.password);

		// ? checking if the provided password is correct
		// ? and returning the auth token for user with its phone number.
		if (correct) {
			const token = authUtils.signToken(admin._id);
			res.status(200).json({
				status: "Successful",
				data: {
					token,
					admin
				}
			});
		} else {
			next(new AppError(errorMsg, 400));
		}
	} else { // ? Handling  incorrect password error.
		next(new AppError(errorMsg, 400));
	}
});


exports.Read = catchAsync(async (req, res, next) => {
	const id = req.params.id;
	const admin = await Admin.findById(id);
	if (! admin) {
		next(new AppError("No admin found", 404));
		return;
	}
	res.status(200).json({admin});
});


exports.ReadMany = catchAsync(async (req, res, next) => {
	const admins = await Admin.find().populate("kebele", "name").exec();
	res.status(200).json(admins);
});
exports.ReadKebeleAdmins = exports.Change = catchAsync(async (req, res, next) => {
	const id = req.params.id;
	const admin = await Admin.findById(id);
	if (! admin) {
		next(new AppError("Admin is not found", 404));
		return;
	}
	let {firstName, lastName, profile} = req.body;

	const data = {
		firstName,
		lastName,
		profile
	};
	const updatedAdmin = await Admin.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: false
	});

	res.status(201).json(updatedAdmin);
});

exports.Erase = catchAsync(async (req, res, next) => {
	const id = req.params.id;
	const admin = await Admin.findById(id);
	if (! admin) {
		next(new AppError("admin do not exist with this id", 404));
		return;
	}
	await Admin.findByIdAndDelete(id);
	res.status(204).json({});
});


// people are so stupid :)
// ? changing password which is done by the super admin or the admin himself.
exports.ChangePassword = catchAsync(async (req, res, next) => {
	const id = req.params.id;
	let admin = await Admin.findById(id).select("+password");
	if (admin.role !== "Super Admin" || admin._id.toString() !== id) { // Check if the admin is not a Super Admin or if the admin ID doesn't match the request ID
		next(new AppError("Not authorized", 401));
		return;
	}
	const {oldPassword, newPassword} = req.body;
	const isMatch = await bcrypt.compare(oldPassword, admin.password);

	if (! isMatch) {
		next(new AppError("password does not match ", 401));
		return;
	}

	console.log("is match");
	const passwordNewhash = await bcrypt.hash(newPassword, 12);
	const data = {
		password: passwordNewhash
	};

	admin = await Admin.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: false
	});
	res.status(201).json({msg: "password changed"});
});


// for reseting password using sms or email.
exports.ResetPassword = catchAsync(async (req, res, next) => {
	const token = req.params.token;

	let admin = {
		role: "none"
	};
	admin = token ? await Admin.findOne({passwordResetToken: token}).select("+password") : admin;
	console.log(admin);
	// excpet the new password .
	const {newPassword} = req.body;
	admin.password = newPassword;
	admin.passwordResetToken = "None";
	await admin.save({new: true, runValidators: false});

	res.status(201).json({message: "password changed"});
});

exports.ForgetPassword = catchAsync(async (req, res, next) => {
	{
		// hre it better be by phone Number for now.
		// while filling forget password i expect the phone number
		const data = req.body;
		let phoneNumber;
		phoneNumber = data.phoneNumber ? data.phoneNumber : null;
		const admin = await Admin.findOne(
			{phoneNumber: phoneNumber}
		);
		if (! admin) {
			res.status(404).json({status: "404", message: "Admin with this email address/ phone number is not found."})
		}
		// this method should be recreated .
		// const resetToken = admin.createPasswordResetToken();
		// const resetToken = "the new token that has been generated";
		const resetToken = resetTokenGenerator();
		admin.passwordResetToken = resetToken;
		await admin.save(
			{validateBeforeSave: false}
		);
		const resetUrl = `${
			req.protocol
		}://${
			req.get('host')
		}/api/v1/admin/reset-password/${resetToken}`;

		const newMessage = `
		Hi [${
			admin.firstName
		}],<br><br>

We received a request to reset your password for the Addis Ababa kebele ID issuing and renewal system. If you requested this, follow the simple steps below to create a new, secure password:<br><br>

1. Click the button below to be redirected to the password reset page:<br><br>
<b><a href="${resetUrl}">Click Here</a></b><br><br> 2. Enter your new password and confirm it.<br>
3. Click "Reset Password" to complete the process.<br><br>

**Important:** If you didn't request a password reset, you can safely disregard this email. Your password remains unchanged.<br><br>

For your security, this reset link will expire within [duration of 24 hours]. If you don't reset your password within this timeframe, you'll need to request a new reset link.<br><br>

If you have any trouble resetting your password, please don't hesitate to contact our support team at [bereket@idrenewal@gmail.com].<br><br>

Sincerely,<br>

The Addis Ababa kebele ID System Team
		
		
	
		
		`;


		try {
			const subject = "Reseting Password in Addis Ababa kebele id issuing and renewal system.";
			const sendMailResponse = await sendEmail({ // email: admin.email,
				email: "bernabastekkalign@gmail.com",
				subject,
				message: newMessage
			})
			console.log(sendMailResponse);
			// const sendSmsResponse = await sendSMS(message);

		} catch (err) {
			admin.passwordResetToken = undefined;
			await admin.save({validateBeforeSave: false});
			res.status(500).json({status: "cannot send an email please try again", message: err})
		}
		res.status(200).json(
			{status: "success", message: "A reset link is sent to your email"}
		)


	}

});
