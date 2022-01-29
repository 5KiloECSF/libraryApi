

// const request = require("supertest");
const app = require("../../../app");

const supertest = require("supertest");
const ItemModel = require("../itemModel")

// const {itemData1, itemData2 } = require("../../items/tests/item.mock");
const {itemData1, itemData2} = require("./item.mock")



const itemUrl ="/api/v1/books/"


describe("ItemTest api", () => {

    afterAll(async () => {
        await ItemModel.deleteMany({});
    });
    afterEach(async () => {
        await ItemModel.deleteMany();
    });
    beforeEach(() => {
        jest.setTimeout(60000);
    });

    test("GET allItemModels /api/books", async () => {
        // console.log("---geting all items")

        const itm = await ItemModel.create(itemData1);
        // console.log("dbCreatedItemModel=", post)
        const response = await supertest(app).get(itemUrl);
        expect(response.statusCode).toBe(200);
        let doc = response.body.message.data

        console.log("RESP", response.body.message.data)
        // Check type and length
        expect(Array.isArray(doc)).toBeTruthy();
        expect(doc.length).toEqual(1);

        // ==========> actual data Check data
        expect(doc[0].id).toBe(itm.id);
        expect(doc[0].name).toBe(itm.name);
        expect(doc[0].page).toBe(itm.page);
    });

    test("Create one /api/book", async () => {

        const response = await supertest(app).post(itemUrl).send(itemData1);
        expect(response.statusCode).toBe(201);
        let doc = response.body.message.data

        // Check the response
        //         expect(doc.id).toBe(itemData1.id);
        expect(doc.name).toBe(itemData1.name);
        expect(doc.page).toBe(itemData1.page);

        // Check data in the database
        const usr = await ItemModel.findOne({ _id: doc._id });
        expect(doc.id).toBe(usr.id);
        expect(doc.name).toBe(usr.name);
        expect(doc.page).toBe(usr.page);


    });

    test("GET_ONE /api/books/:id", async () => {
        const item = await ItemModel.create(itemData1);

        const response = await supertest(app).get(itemUrl + item.id);
        expect(response.statusCode).toBe(200);
        let doc = response.body.message.data

        expect(doc.id).toBe(item.id);
        expect(doc.name).toBe(item.name);
        expect(doc.page).toBe(item.page);

    });

    test("PATCH /api/posts/:id", async () => {
        const item = await ItemModel.create(itemData1);

        const response = await supertest(app).patch(itemUrl + item.id).send(itemData2);
        expect(response.statusCode).toBe(202);
        let doc = response.body.message.data
        console.log("updated ItemModel =", doc)
        // Check the response
        // expect(doc.id).toBe(item.id);
        // expect(doc.name).toBe(itemData1.name);
        // expect(doc.page).toBe(itemData1.page);

        const usr = await ItemModel.findOne({ _id: doc._id });
        expect(doc.id).toBe(usr.id);
        // expect(doc.name).toBe(itemData2.name);
        // expect(doc.page).toBe(usr.page);

    });

    test("DELETE /api/posts/:id", async () => {
        const item = await ItemModel.create(itemData1);

        const response = await supertest(app).delete(itemUrl + item.id)
        expect(response.statusCode).toBe(204);
        expect(await ItemModel.findOne({ _id: item.id })).toBeFalsy();

    });



})


