"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

class Job{
    /** Create a job (from data), update db, return new job data.
   * */

  static async create(data) {

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS companyHandle`,
        [
          data.title,
          data.salary,
          data.equity,
          data.companyHandle
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * */

  static async findAll(searchQuery = {}) {
    let query = `SELECT j.id,
                j.title,
                j.salary,
                j.equity,
                j.company_handle
                FROM jobs AS j
                LEFT JOIN companies AS c ON c.handle = j.company_handle`;

    let whereExpressions = []; //Arrayof WHERE queries
    let queryValues = []; //Values for WHERE queries

    const { title, minSalary, hasEquity } = searchQuery;

    
    if(minSalary !== undefined){
      queryValues.push(minSalary);
      console.log(queryValues.length)
      whereExpressions.push(`salary >= $${queryValues.length}`);
    }
    if(hasEquity === true){
      whereExpressions.push(`equity > 0`);
    }
    if(title){
      queryValues.push(`%${title}%`);
      console.log(queryValues.length)
      whereExpressions.push(`title ILIKE $${queryValues.length}`);
    }

    if(whereExpressions.length > 0){
      //If any queries were added we need to extract WHERE queries
      //to add to the query
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    query += " ORDER BY title";
    console.log(query)
    const jobResults = await db.query(query, queryValues);
    return jobResults.rows;
  }

  /** Given a job id, return data about a job.
   *
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                title,
                salary,
                equity,
                company_handle AS companyHandle
                FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No matching job Found`);
    
    const companiesRes = await db.query(
        `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
         FROM companies
         WHERE handle = $1`, [job.companyHandle]);

  //delete job.companyHandle;
  job.company = companiesRes.rows[0];

  return job;

  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data,{});
    const VarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${VarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No matching job found`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No matching job`);
  }
}

module.exports = Job;