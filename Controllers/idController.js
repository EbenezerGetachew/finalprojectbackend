const catchAsync = require("./../ErrorHandler/catchAsync");
const AppError = require("./../ErrorHandler/appError");
const Id = require("./../Models/idModel");
const Resident = require("./../Models/residentModel");
const Notification = require("./../Models/notificationModel");


exports.Create = catchAsync(async (req, res, next) => {
	const data = req.body;
	const residentId = data.resident;
	if (residentId) {
		let resident = await Resident.findById(residentId);
		data.kebele = resident.kebele;
	} else {
		res.status(400).json({"fail": "user not found"});
	}
	const newId = await Id.create(data);
	res.status(201).json({newId});
});

exports.Read = catchAsync(async (req, res, next) => {
	const id = req.params.id;
	const _id = await Id.findById(id).populate("kebele", "name").populate("resident", "firstName").exec();
	if (! _id) {
		next(new AppError("No id found", 404));
		return;
	}

	res.status(200).json({_id});
});

exports.ReadMany = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const ids = await Id.find().populate("kebele", "name").populate("resident", "firstName").exec();
	res.status(200).json(ids);
});


exports.Change = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const id = req.params.id;
	const _id = await Id.findById(id);
	if (! _id) {
		next(new AppError("Id is not found", 404));
		return;
	}
	const data = req.body;
	let updatedId = {};
	if (data.statusUpdated) { // here is status updated thing.
		const newData = {
			status: data.status,
			reservationDate: data.reservationDate
		}
		updatedId = await Id.findByIdAndUpdate(id, newData, {
			new: true,
			runValidators: false
		});

		let idStatus = data.status;
		let message = "";
		switch (idStatus) {
			case "Up Coming": message = "Your ID status is changed to 'Up Coming'.";
				break;
			case "Active": message = "Your ID status is changed to 'Active'. Please check the reservation date.";
				break;
			case "Completed": message = "Your ID status is changed to 'Completed'. Please go to your kebele and collect it.";
				break;
			case "Rejected": message = "Your ID status is changed to 'Rejected'. Please reapply for an ID.";
				break;
			default: message = "Unknown ID status.";
		}

		// here create the notification table
		let notificationData = {
			resident: _id.resident,
			message: message
		}
		await Notification.create(notificationData);
	} else {
		updatedId = await Id.findByIdAndUpdate(id, data, {
			new: true,
			runValidators: false
		});
	}

	res.status(201).json(updatedId);
});

exports.Erase = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const id = req.params.id;
	const _id = await Id.findById(id);
	if (! _id) {
		next(new AppError("Id do not exist with this id", 404));
		return;
	}
	await Id.findByIdAndDelete(id);
	res.status(201).json({msg: "sucess"});
});

exports.IdInKebele = catchAsync(async (req, res, next) => { // Retrieve the kebele ID from the currently authenticated admin
	const kebeleId = res.locals.admin.kebele;
	console.log(res.locals.admin);
	const _idInKebele = await Id.find().populate("kebele", "name").populate("resident", "firstName").exec();
	// .populate('farmer', 'fullName kebele').exec();
	let _idsInKebele = [];
	_idInKebele.forEach(_id => { // console.log(kebeleId.toString());

		let kebeleNew = _id.kebele;
		console.log(kebeleNew);
		if (kebeleNew) {}

		// console.log(kebeleNew);
		console.log(kebeleId.toString());
		if (kebeleNew == kebeleId) {
			_idsInKebele.push(_id);
		}
	});
	res.status(200).json({_idsInKebele});

});
