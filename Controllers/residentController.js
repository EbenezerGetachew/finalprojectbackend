const catchAsync = require("./../ErrorHandler/catchAsync");
const AppError = require("./../ErrorHandler/appError");
const Resident = require("./../Models/residentModel");
const authUtils = require("./../Utils/authUtils");
const Id = require("./../Models/idModel");
const bcrypt = require("bcryptjs");
const {sendEmail} = require('./../Utils/email');
const {resetTokenGenerator} = require('./../Utils/authUtils');


exports.Register = catchAsync(async (req, res, next) => {
	const data = req.body;
	const newResident = await Resident.create(data);
	const token = authUtils.signToken(newResident._id);
	res.status(201).json({
		data: {
			token,
			newResident
		}
	});
});

exports.Login = catchAsync(async (req, res, next) => {
	if (!(req.body.password && req.body.phoneNumber)) {
		next(new AppError("Phone number and password  should be provided to login !", 400));
	}
	// ? selecting the password of the user by provided phoneNumber
	const resident = await Resident.findOne({phoneNumber: req.body.phoneNumber}).select("+password");

	const errorMsg = "The phoneNumber doesn't exits or the password is not correct!";
	// ? checking if the user exists with the provided phoneNumber.
	if (resident) {
		const correct = await resident.correctPassword(req.body.password, resident.password);

		// ? checking if the provided password is correct
		// ? and returning the auth token for user with its phone number.
		if (correct) {
			const token = authUtils.signToken(resident._id);
			res.status(200).json({
				status: "Successful",
				data: {
					token,
					resident
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
	// const orders = await Order.find()
	const resident = await Resident.findById(id);
	if (! resident) {
		next(new AppError("No resident found", 404));
		return;
	}

	res.status(200).json({resident});
});

exports.ReadMany = catchAsync(async (req, res, next) => {
	const residents = await Resident.find().populate("kebele", "name").exec();
	res.status(200).json(residents);
});

exports.Change = catchAsync(async (req, res, next) => {
	const id = req.params.id;
	const resident = await Resident.findById(id);
	if (! resident) {
		next(new AppError("Resident is not found", 404));
		return;
	}
	let {firstName, lastName, profile} = req.body;

	const data = {
		firstName,
		lastName,
		profile
	};
	const updatedResident = await Resident.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: false
	});
	res.status(201).json(updatedResident);
});

exports.Erase = catchAsync(async (req, res, next) => {
	const id = req.params.id;
	const resident = await Resident.findById(id);
	if (! resident) {
		next(new AppError("resident do not exist with this id", 404));
		return;
	}
	await Resident.findByIdAndDelete(id);
	res.status(204).json({});
});


exports.ResidentInKebele = catchAsync(async (req, res, next) => { // Retrieve the kebele ID from the currently authenticated admin
	const kebeleId = res.locals.admin.kebele.toString();
	const residentInKebele = await Resident.find().populate("kebele", "name").exec();
	// .populate('farmer', 'fullName kebele').exec();
	let residentsInKebele = [];
	residentInKebele.forEach(resident => { // console.log(kebeleId.toString());

		let kebeleNew = resident.kebele.toString();
		if (kebeleNew == kebeleId) {
			residentsInKebele.push(resident);
		}
	})
	res.status(200).json({residentsInKebele});

});

exports.ResidentMyId = catchAsync(async (req, res, next) => {
	const id = res.locals.id;
	const resident = await Resident.findById(id);
	if (resident) {
		const id = await Id.findOne({resident: resident._id});
		res.status(200).json({id});
	} else {
		res.status(404).json({message: "Resident not found"});
	}
})


// people are so stupid :)
// ? changing password which is done by the super resident or the resident himself.
exports.ChangePassword = catchAsync(async (req, res, next) => {
	const id = req.params.id;
	let resident = await Resident.findById(id).select("+password");
	if (resident.role !== "Super Resident" || resident._id.toString() !== id) { // Check if the resident is not a Super Resident or if the resident ID doesn't match the request ID
		next(new AppError("Not authorized", 401));
		return;
	}
	const {oldPassword, newPassword} = req.body;
	const isMatch = await bcrypt.compare(oldPassword, resident.password);

	if (! isMatch) {
		next(new AppError("password does not match ", 401));
		return;
	}

	console.log("is match");
	const passwordNewhash = await bcrypt.hash(newPassword, 12);
	const data = {
		password: passwordNewhash
	};

	resident = await Resident.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: false
	});
	res.status(201).json({msg: "password changed"});
});


// for reseting password using sms or email.
exports.ResetPassword = catchAsync(async (req, res, next) => {
	const token = req.params.token;

	let resident = token ? await Resident.findOne({passwordResetToken: token}).select("+password") : resident;
	if (!(token && resident)) {
		res.status(404).json({message: "The provided reset token is invalid "});
		return
	}
	console.log(resident);
	// excpet the new password .
	const {newPassword} = req.body;
	resident.password = newPassword;
	resident.passwordResetToken = "None";
	await resident.save({new: true, runValidators: false});

	res.status(201).json({message: "password changed"});
});

exports.ForgetPassword = catchAsync(async (req, res, next) => {
	{
		// hre it better be by phone Number for now.
		// while filling forget password i expect the phone number
		const data = req.body;
		let phoneNumber;
		phoneNumber = data.phoneNumber ? data.phoneNumber : null;
		const resident = await Resident.findOne(
			{phoneNumber: phoneNumber}
		);
		if (! resident) {
			res.status(404).json({status: "404", message: "Resident with this email address/ phone number is not found."})
		}
		// this method should be recreated .
		// const resetToken = resident.createPasswordResetToken();
		// const resetToken = "the new token that has been generated";
		const resetToken = resetTokenGenerator();
		resident.passwordResetToken = resetToken;
		await resident.save(
			{validateBeforeSave: false}
		);
		// const resetUrl = `${
		// req.protocol
		// }://${
		// req.get('host')
		// }/api/v1/residents/reset-password/${resetToken}`;

		const resetUrl = `https://kebele-id-service.vercel.app/reset-password/${resetToken}`;
		const newMessage = `
		Hi [${
			resident.firstName
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
			const sendMailResponse = await sendEmail({
				// email: resident.email,
				// email: "bernabastekkalign@gmail.com",
				email: "bereketteshome@143@gmail.com",
				subject,
				message: newMessage
			});
			console.log(sendMailResponse);
			// const sendSmsResponse = await sendSMS(message);

		} catch (err) {
			resident.passwordResetToken = undefined;
			await resident.save({validateBeforeSave: false});
			res.status(500).json({status: "cannot send an email please try again", message: err})
		}
		res.status(200).json(
			{status: "success", message: "A reset link is sent to your email"}
		)


	}

});
