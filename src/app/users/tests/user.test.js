// const request = require("supertest");
// import expect from "expect";

const app = require("../../../app");

const supertest = require("supertest");
const User = require("../user.model")


// This passes because 1 === 1
it('Testing to see if Jest works', () => {
    expect(1).toBe(1)
})

const usersUrl ="/api/v1/users/"
const {user1, user2} = require("./user.mock")
// const user1 =  { firstname: "first 1", lastname:"last 1", phone: "+251911223344", password:"123456", email:"abc@123.com" }
// const user2 =  { firstname: "first 2", lastname:"last 2", phone: "+251911223355", password:"654321", email:"cde@345.com" }



describe("Test the root path", () => {
    test("It should response the GET method", async () => {
        const response = await supertest(app).get("/");
        expect(response.statusCode).toBe(200);
        console.log("rootResponse=> ",response.body)
    });
});


// describe("Test the root path", () => {
//     test("It should response the GET method", done => {
//         supertest(app).get("/")
//             .then(response => {
//                 expect(response.statusCode).toBe(200);
//                 done();
//             });
//     });
// });


describe("user api", () => {

    afterAll(async () => {
        await User.deleteMany({});
    });
    afterEach(async () => {
        await User.deleteMany();
    });

    beforeEach(() => {
        jest.setTimeout(60000);
    });

    test("GET allUsers /api/users", async () => {
        // console.log("---geting all users")

        const usr = await User.create(user1);
        // console.log("dbCreatedUser=", post)
        const response = await supertest(app).get(usersUrl);
        expect(response.statusCode).toBe(200);
        let doc = response.body.message.data

        console.log("RESP", response.body.message.data)
                // Check type and length
                expect(Array.isArray(doc)).toBeTruthy();
                expect(doc.length).toEqual(1);

                // Check data
                expect(doc[0].id).toBe(usr.id);
                expect(doc[0].firstname).toBe(usr.firstname);
                expect(doc[0].phone).toBe(usr.phone);
    });

    test("Create one /api/user", async () => {

        const response = await supertest(app).post(usersUrl).send(user1);
        expect(response.statusCode).toBe(201);
        let doc = response.body.message.data

        // Check the response
        //         expect(doc.id).toBe(user1.id);
                expect(doc.firstname).toBe(user1.firstname);
                expect(doc.phone).toBe(user1.phone);

                // Check data in the database
            const usr = await User.findOne({ _id: doc._id });
                expect(doc.id).toBe(usr.id);
                expect(doc.firstname).toBe(usr.firstname);
                expect(doc.phone).toBe(usr.phone);


    });

    test("GET_ONE /api/users/:id", async () => {
        const user = await User.create(user1);

        const response = await supertest(app).get(usersUrl + user.id);
        expect(response.statusCode).toBe(200);
        let doc = response.body.message.data

                expect(doc.id).toBe(user.id);
                expect(doc.firstname).toBe(user.firstname);
                expect(doc.phone).toBe(user.phone);

    });

    test("PATCH /api/posts/:id", async () => {
        const user = await User.create(user1);

        const response = await supertest(app).patch(usersUrl + user.id).send(user2);
        expect(response.statusCode).toBe(202);
        let doc = response.body.message.data
        console.log("updated User =", doc)
        // Check the response
        // expect(doc.id).toBe(user.id);
        // expect(doc.firstname).toBe(user1.firstname);
        // expect(doc.phone).toBe(user1.phone);

        const usr = await User.findOne({ _id: doc._id });
        expect(doc.id).toBe(usr.id);
        // expect(doc.firstname).toBe(user2.firstname);
        // expect(doc.phone).toBe(usr.phone);

    });

    test("DELETE /api/posts/:id", async () => {
        const user = await User.create(user1);

        await supertest(app)
            .delete(usersUrl + user.id)
            .expect(204)
            .then(async () => {
                expect(await User.findOne({ _id: user.id })).toBeFalsy();
            });
    });



})


