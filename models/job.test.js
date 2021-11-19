"use strict";
process.env.NODE_ENV = 'test';

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");

async function beforeAll() {
    await db.query(`DELETE FROM jobs`);

    await db.query(
    `INSERT INTO jobs(
    title,
    salary,
    equity,
    company_handle)
    VALUES 
    ('title1', 75000, 0.70, 'handle1'),
    ('title2', 85000, 0.80, 'handle2')
    RETURNING id`);
};

async function afterAll(){
    await db.end();
};

describe('Test Job Model', () => {

    test('Get Jobs', async () => {
        let results = await Job.findAll();
        expect(results).toEqual([{
            id: 1,
            title: "title1",
            salary: 75000,
            equity: 0.70,
            company_handle: "handle1"
        },
        {
            id:2,
            title: "title2",
            salary: 85000,
            equity: 0.80,
            company_handle: "handle2"
        }]);
    });
});