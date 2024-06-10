const catchAsync = require("./../ErrorHandler/catchAsync");
const AppError = require("./../ErrorHandler/appError");
const Contact = require("./../Models/contactModel");

exports.Create = catchAsync(async (req, res, next) => {
	const data = req.body;
	const newContact = await Contact.create(data);
	res.status(201).json({newContact});
});

exports.Read = catchAsync(async (req, res, next) => {
	const id = req.params.id;
	// !Authorization should be done here.
	const _contact = await Contact.findById(id);
	if (! _contact) {
		next(new AppError("No contact found", 404));
		return;
	}
	res.status(200).json({_contact});
});

exports.ReadMany = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const contacts = await Contact.find();
	res.status(200).json({contacts});
});

exports.Change = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const id = req.params.id;
	const _contact = await Contact.findById(id);
	if (! _contact) {
		next(new AppError("Contact is not found", 404));
		return;
	}
	const data = req.body;
	const updatedContact = await Contact.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: false
	});

	res.status(201).json(updatedContact);
});


exports.Erase = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const id = req.params.id;
	const _contact = await Contact.findById(id);
	if (! _contact) {
		next(new AppError("Contact do not exist with this id", 404));
		return;
	}
	await Contact.findByIdAndDelete(id);
	res.status(201).json({msg: "success"});
});
