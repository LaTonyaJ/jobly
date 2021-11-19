const express = require('express');
const jsonschema = require('jsonschema');

const jobSearchSchema = require('../schemas/jobSearch.json');
const jobNewSchema = require('../schemas/jobNew.json');
const jobUpdateSchema = require('../schemas/jobUpdate.json');

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Job = require("../models/job");


const router = new express.Router();

router.get('/', async(req, res, next) => {
    const q = req.query;
    if(q.minSalary) q.minSalary = +q.minSalary;
    q.hasEquity = q.hasEquity === 'true';
    //Get all jobs
    try{
    const validator = jsonschema.validate(q, jobSearchSchema);
    if(!validator.valid){
        const err = validator.errors.map(e => e.stack);
        throw new BadRequestError(err);
    }

    const results = await Job.findAll(q);
    return res.json({results});
    }catch(e){
        return next(e);
    }
});

router.post("/", ensureLoggedIn, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.create(req.body);
      return res.status(201).json({ job });
    } catch (err) {
      return next(err);
    }
  });

  router.get("/:id", async function (req, res, next) {
    try {
      const job = await Job.get(req.params.id);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });
  
  /** PATCH /[id] { fld1, fld2, ... } => { job }
   *
   * Patches job data.
   *
   * fields can be: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Authorization required: login
   */
  
  router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.update(req.params.id, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });
  
  /** DELETE /[id]  =>  { deleted: id }
   *
   * Authorization: login
   */
  
  router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
      await Job.remove(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  });
  

module.exports = router;