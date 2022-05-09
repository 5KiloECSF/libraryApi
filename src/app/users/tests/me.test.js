


// const request = require("supertest");
const app = require("../../../app");

const supertest = require("supertest");
const User = require("../userModel")



const usersUrl ="/api/v1/users/"

const {user1, user2} = require("./mock/user.mock")



describe("me api testing", () => {

    afterAll(async () => {
        await User.deleteMany({});
    });
    afterEach(async () => {
        await User.deleteMany();
    });

    beforeEach(() => {
        jest.setTimeout(60000);
    });



    test("GET_ME /api/me", async () => {
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

    test("Update me  /api/posts/:id", async () => {
        const user = await User.create(user1);

        const response = await supertest(app).patch(usersUrl +"/me/update/"+ user.id).send(user2);
        expect(response.statusCode).toBe(202);
        let doc = response.body.message.data
        console.log("updated User =", doc)
        // Check the response
        expect(doc.id).toBe(user.id);
        expect(doc.firstname).toBe(user2.firstname);
        expect(doc.phone).toBe(user2.phone);

        const usr = await User.findOne({ _id: doc._id });
        expect(doc.id).toBe(usr.id);
        expect(doc.firstname).toBe(user2.firstname);
        expect(doc.phone).toBe(usr.phone);

    });


    test("Update me  /api/posts/:id", async () => {
        const user = await User.create(user1);

        const response = await supertest(app).patch(usersUrl +"/me/update/"+ user.id).send(user2);
        expect(response.statusCode).toBe(202);
        let doc = response.body.message.data
        console.log("updated User =", doc)
        // Check the response
        expect(doc.id).toBe(user.id);
        expect(doc.firstname).toBe(user2.firstname);
        expect(doc.phone).toBe(user2.phone);

        const usr = await User.findOne({ _id: doc._id });
        expect(doc.id).toBe(usr.id);
        expect(doc.firstname).toBe(user2.firstname);
        expect(doc.phone).toBe(usr.phone);

    });


})


