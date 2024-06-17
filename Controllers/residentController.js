const catchAsync = require("./../ErrorHandler/catchAsync");
const AppError = require("./../ErrorHandler/appError");
const Resident = require("./../Models/residentModel");
const authUtils = require("./../Utils/authUtils");
const Id = require("./../Models/idModel");


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

// exports.ChangePasswordResident = catchAsync(async (req, res, next) => {
// const id = req.params.id;
// let resident = await Resident.findById(id).select("+password");

// if (! resident) {
// next(new AppError("no resident found with this id ", 404));
// return;
// }
// const {oldPassword, newPassword} = req.body;
// const isMatch = await bcrypt.compare(oldPassword, resident.password);

// if (! isMatch) {
// next(new AppError("password does not match ", 401));
// return;
// }

// console.log("is match");
// const passwordNewhash = await bcrypt.hash(newPassword, 12);
// const data = {
// password: passwordNewhash
// };

// resident = await Resident.findByIdAndUpdate(id, data, {
// new: true,
// runValidators: false
// });
// res.status(201).json({msg: "password change"});
// });
