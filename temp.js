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

	let resident = {
		role: "none"
	};
	resident = token ? await Resident.findOne({passwordResetToken: token}).select("+password") : resident;

	// if (resident.role !== "Super Resident" || resident._id.toString() !== id) { // Check if the resident is not a Super Resident or if the resident ID doesn't match the request ID
	// next(new AppError("Not authorized", 401));
	// return;
	// }
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
		const resetUrl = `${
			req.protocol
		}://${
			req.get('host')
		}/api/v1/residents/reset-password/${resetToken}`;
		const message = `click this link to reset your password ${resetUrl}
			 if your are don't asked for reseting
			  your password, please ignore this email`;

		try {
			const subject = "Reseting Password in Master template using email.";
			const sendMailResponse = await sendEmail({ // email: resident.email,
				email: "bernabastekkalign@gmail.com",
				subject: "Reseting Password in Master template using email.",
				message: message
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
