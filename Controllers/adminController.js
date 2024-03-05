const catchAsync = require("../ErrorHandler/catchAsync");
const AppError = require("../ErrorHandler/appError");
const Admin = require("./../Models/adminModel");
const authUtils = require("../Utils/authUtils");

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
	const admins = await Admin.find();
	res.status(200).json(admins);
});

exports.Change = catchAsync(async (req, res, next) => {
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

// exports.ChangePasswordAdmin = catchAsync(async (req, res, next) => {
// const id = req.params.id;
// let admin = await Admin.findById(id).select("+password");

// if (! admin) {
// next(new AppError("no admin found with this id ", 404));
// return;
// }
// const {oldPassword, newPassword} = req.body;
// const isMatch = await bcrypt.compare(oldPassword, admin.password);

// if (! isMatch) {
// next(new AppError("password does not match ", 401));
// return;
// }

// console.log("is match");
// const passwordNewhash = await bcrypt.hash(newPassword, 12);
// const data = {
// password: passwordNewhash
// };

// admin = await Admin.findByIdAndUpdate(id, data, {
// new: true,
// runValidators: false
// });
// res.status(201).json({msg: "password change"});
// });
