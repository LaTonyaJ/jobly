const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  //Get keys from req.body for updating
  const keys = Object.keys(dataToUpdate);
  //If no keys then no data was entered, throw an error
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  //Else make an array with keys and idx for sql select
  const cols = keys.map((colName, idx) =>
      //jsToSql changes camel case to underscore for sql
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    //Return an object of columns to update an their values in sql format
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
