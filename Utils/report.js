// dashboard view.
const AppError = require("../ErrorHandler/appError");
class Report {
	constructor(modelInstance) {
		this.modelInstance = modelInstance;
	}
	_getFirstDayOfYear(year) {
		try { // setting the first day of the passed year as start.
			const startYear = new Date(year, 0, 1);
			// increasing year to find the end of report
			year ++;
			// end of this report year.
			const endYear = new Date(year, 0, 1);
			return {startYear, endYear};
		} catch (err) {
			throw AppError("A year must be a valid number", 400);
		}
	}
	_monthlyPipline(year) {
		const {startYear, endYear} = this._getFirstDayOfYear(year);

		return [
			{
				$match: { // Filter for current year
					createdAt: {
						$gte: startYear,
						$lt: endYear
					}
				}
			}, {
				$group: {
					_id: {
						$month: "$createdAt"
					}, // Group by month
					count: {
						$sum: 1
					}, // Count customers in each month
				}
			}, {
				$project: {
					month: {
						$let: {
							vars: {
								monthNum: "$_id"
							},
							in: {
								$arrayElemAt: [
									[
										"Jan",
										"Feb",
										"Mar",
										"Apr",
										"May",
										"Jun",
										"Jul",
										"Aug",
										"Sep",
										"Oct",
										"Nov",
										"Dec",
									], {
										$subtract: ["$$monthNum", 1]
									},
								]
							}
						}
					},
					count: 1, // Only keep the count
					_id: 0, // Exclude unnecessary fields
				}
			}, {
				$sort: {
					month: 1
				}, // Sort by month name
			},
		];
	}

	async monthlyReport(year) {
		const pipeline = this._monthlyPipline(year);
		const monthlyReportData = await this.modelInstance.aggregate(pipeline);
		return monthlyReportData;
	}

	_weekDate() {
		const startDate = new Date();
		// Get the current date
		// Set to start of the week (Monday)
		const startOfWeek = new Date(startDate);
		startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
		// Set to end of the week (Sunday)
		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(endOfWeek.getDate() + 7);
		return {startOfWeek, endOfWeek};
	}

	_weeklyPipline(filterBy) {
		const {startOfWeek, endOfWeek} = this._weekDate();
		return [
			{
				$match: {
					status: `${filterBy}`,
					createdAt: {
						$gte: startOfWeek,
						$lte: endOfWeek
					}
				}
			}, {
				$group: {
					_id: {
						$dayOfWeek: "$createdAt"
					}, // Group by weekday
					count: {
						$sum: 1
					}
				}
			}, {
				$project: { // Convert weekday number to name using $let
					day: {
						$let: {
							vars: {
								dayNum: "$_id"
							},
							in: {
								$arrayElemAt: [
									[
										"Sun",
										"Mon",
										"Tue",
										"Wed",
										"Thu",
										"Fri",
										"Sat"
									], {
										$subtract: ["$$dayNum", 1]
									},
								]
							}
						}
					},
					count: 1,
					_id: 0
				}
			}, { // Sort by day name
				$sort: {
					day: 1
				}
			},
		];
	}

	async weeklyReport(filterByStatus) {
		const pipeline = this._weeklyPipline(filterByStatus);
		const weeklyReport = await this.modelInstance.aggregate(pipeline);
		return this._weeklyReportFix(weeklyReport);
	}

	_weekUntilToday() {
		const date = new Date();
		const endOfWeek = new Date(date);
		const startOfWeek = new Date(endOfWeek);
		startOfWeek.setDate(endOfWeek.getDate() - 6);
		return {startOfWeek, endOfWeek};
	}

	async lastSevenDaysReport(filterByStatus) {
		const pipeline = this._lastSevenDaysPipeline(filterByStatus);
		const weeklyReport = await this.modelInstance.aggregate(pipeline);
		return weeklyReport;
	}

	_weeklyReportFix(weeklyReport) { // Ensure zero counts for missing days
		const daysOfWeek = [
			"Sun",
			"Mon",
			"Tue",
			"Wed",
			"Thu",
			"Fri",
			"Sat"
		];
		const fixedReport = daysOfWeek.map((day) => {
			const reportForDay = weeklyReport.find((item) => item.day === day);
			return reportForDay || {
				day,
				count: 0
			};
		});
		return fixedReport;
	}
	_lastSevenDaysFix(weeklyReport) { // Ensure zero counts for missing days
		const daysOfWeek = [
			0,
			1,
			2,
			3,
			4,
			5,
			6
		];
		const fixedReport = daysOfWeek.map((day) => {
			const reportForDay = weeklyReport.find((item) => item.day === day);
			return reportForDay || {
				day,
				count: 0
			};
		});
		return fixedReport;
	}

	_lastSevenDaysPipeline(filterBy) {
		const {startOfWeek, endOfWeek} = this._weekUntilToday();
		return [
			{
				$match: {
					status: `${filterBy}`,
					createdAt: {
						$gte: startOfWeek,
						$lte: endOfWeek
					}
				}
			}, {
				$group: {
					_id: {
						$dayOfWeek: "$createdAt"
					}, // Group by weekday
					count: {
						$sum: 1
					}
				}
			}, {
				$project: {
					day: "$_id", // Use the _id directly as the weekday number
					count: 1,
					_id: 0
				}
			}, {
				$sort: {
					day: 1
				}, // Sort by weekday number
			},
		];
	}
}

module.exports = Report;
