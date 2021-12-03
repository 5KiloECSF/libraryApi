// const request = require("supertest");
const app = require("../../app");

const supertest = require("supertest");
const User = require("../../app/users/userModel")


// This passes because 1 === 1
it('Testing to see if Jest works', () => {
    expect(1).toBe(1)
})

const usersUrl ="/api/v1/users"

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

        const usr = await User.create({ firstname: "User 1", lastname:"123", phone: "+251911223344", password:"123456", email:"abc@123.com" });
        // console.log("dbCreatedUser=", post)

        const response = await supertest(app).get(usersUrl);
        expect(response.statusCode).toBe(200);

        let doc = response.body.message.data
        console.log("RESP", response.body)
                // Check type and length
                expect(Array.isArray(doc)).toBeTruthy();
                expect(doc.length).toEqual(1);

                // Check data
                expect(doc[0]._id).toBe(usr.id);
                expect(doc[0].name).toBe(usr.name);
                expect(doc[0].phone).toBe(usr.phone);
    });




    test("Create one /api/user", async () => {

        const data = { title: "Post 1", content: "Lorem ipsum" };

        const response = await supertest(app).post(usersUrl);
        expect(response.statusCode).toBe(200);
                // Check the response
                expect(response.body._id).toBeTruthy();
                expect(response.body.title).toBe(data.title);
                expect(response.body.content).toBe(data.content);

                // Check data in the database
                const post = await Post.findOne({ _id: response.body._id });
                expect(post).toBeTruthy();
                expect(post.title).toBe(data.title);
                expect(post.content).toBe(data.content);

    });

    test("GET_ONE /api/users/:id", async () => {
        const user = await User.create({ firstname: "User 1", lastname:"123", phone: "+251911223344", password:"123456", email:"abc@123.com" });

        const response = await supertest(app).get(usersUrl + user.id);
        expect(response.statusCode).toBe(200);

                expect(response.body._id).toBe(user.id);
                expect(response.body.firstname).toBe(user.firstname);
                expect(response.body.phone).toBe(user.phone);

    });

    test("PATCH /api/posts/:id", async () => {
        const post = await Post.create({ title: "Post 1", content: "Lorem ipsum" });

        const data = { title: "New title", content: "dolor sit amet" };

        const response = await supertest(app).patch(usersUrl );
        expect(response.statusCode).toBe(200);

        // Check the response
                expect(response.body._id).toBe(post.id);
                expect(response.body.title).toBe(data.title);
                expect(response.body.content).toBe(data.content);

                // Check the data in the database
                const newPost = await Post.findOne({ _id: response.body._id });
                expect(newPost).toBeTruthy();
                expect(newPost.title).toBe(data.title);
                expect(newPost.content).toBe(data.content);

    });

    test("DELETE /api/posts/:id", async () => {
        const post = await Post.create({
            title: "Post 1",
            content: "Lorem ipsum",
        });

        await supertest(app)
            .delete("/api/posts/" + post.id)
            .expect(204)
            .then(async () => {
                expect(await Post.findOne({ _id: post.id })).toBeFalsy();
            });
    });




})


