const moment = require("moment");

function isWithinLast3DaysOfMonth(date) {
  const lastDayOfMonth = moment(date).endOf("month");
  const threeDaysBefore = moment(lastDayOfMonth).subtract(2, "days");

  return (
    moment(date).isSameOrAfter(threeDaysBefore) &&
    moment(date).isSameOrBefore(lastDayOfMonth)
  );
}

export default isWithinLast3DaysOfMonth;
