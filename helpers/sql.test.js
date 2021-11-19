const { sqlForPartialUpdate } = require('./sql');
const { BadRequestError } = require("../expressError");



describe('Partial Updates', () => {
    test('update', () => {
        const {setCols, values} = sqlForPartialUpdate({
            lastName: "Johnson"
        }, {
            lastName: "last_name"
        });
        expect(setCols).toEqual("\"last_name\"=$1");
        expect(values).toEqual(["Johnson"]);
    })

    test('no data update', () => {
        try {
            sqlForPartialUpdate({});
        } catch (error) {
            expect(error).toBeInstanceOf(BadRequestError);
        }
    })
})