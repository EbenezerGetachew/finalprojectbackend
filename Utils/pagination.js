// ? i think instead of passing the modelInstance  ...  the instace of the model should be returned.
const AppError = require("../ErrorHandler/appError");

// @params page,pageSize,modelInstance,endPoint
class Paginator {
	constructor(modelInstance, page = 1, pageSize = 10, endPoint) {
		this.page = 1;
		this.pageSize = 1;
		// this should be the instance of the model that is being paginated.
		this.modelInstance = modelInstance;
		this.endPoint = endPoint;
		this.skip;
		this.endIndex;

		try { // setting pageSize to the size passed by user if it is valid.
			if (parseInt(pageSize)) {
				const newPageSize = parseInt(pageSize);
				this.pageSize = newPageSize > 0 ? newPageSize : this.pageSize;
			}
			// setting page to the passed page if its valid.
			if (parseInt(page)) {
				const newPage = parseInt(page);
				this.page = newPage > 0 ? newPage : this.page;
			}

			// setting what to be skiped for the modelInstance that will be paginated and returned
			this.skip = (page - 1) * pageSize;
			this.endIndex = pageSize * page;
		} catch (err) {
			// throwing error using the custom app error .
			// the error will be a bad request response with specifically issued error message.
			throw new AppError(`Invalid input: ${err}`, 400);
		}
	}

	// the paginate method will return the paginated modelInstance when its called in an instance of paginator class.
	async paginate() {
		const totalItems = await this.modelInstance.countDocuments();
		let data;
		if (this.pageSize > totalItems) {
			data = await this.modelInstance.find();
		} else {
			data = await this.modelInstance.find().skip(this.skip).limit(this.pageSize);
		}
		const totalPages = Math.ceil(totalItems / this.pageSize);

		return {
			next: this._next(totalItems),
			previous: this._previous(totalItems),
			count: data.length,
			totalPages: totalPages,
			data: data
		};
	}

	// check weather the modelInstance has next page if it does it returns it unless it will return null
	_next(totalItems) {
		if (totalItems > this.endIndex) {
			return `${
				this.endPoint
			}?page=${
				this.page + 1
			}&pageSize=${
				this.pageSize
			}`;
		} else {
			return null;
		}
	}
	// check wether the modelInstance has the previous page if does it returns it unless it return null.
	_previous(totalItems) {
		if (this.page > 1 && totalItems > this.pageSize) {
			return `${
				this.endPoint
			}?page=${
				this.page - 1
			}&pageSize=${
				this.pageSize
			}`;
		} else {
			return null;
		}
	}
}

module.exports = Paginator;
