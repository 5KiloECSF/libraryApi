
exports.item1={name:"principles of power", page:"200", genres:["leadreship", "self-help"]}



const ItemModel={
    id: "",

    name: "",
    imageCover: "",
    slug: "",
    page: 0,

    genres: [""],

    booksAmount: 0,

    description: "",
    borrowingHistory: [undefined],
    currentHolder: "",
    donors: [""],
    images: [""],
    language: "",
    publishedAt: "",
    ratingAverage: 0,
    ratingQuantity: 0,
    summary: "",
    tags: [""]

}

const history1={
    endDate: "jan-31-2020", startDate: "jan-31-2020", userId: "1"
}

exports.itemData1={


    name: "principles and power of vision",
    imageCover: "default.jpg",
    page: 200,

    genres: ["self-help", "leadership"],

    booksAmount: 2,
    authors:["myles-monroe"],

    description: "about vision and its principles",
    // borrowingHistory: [history1, {userId:"2", startDate:" 31-2020"}],
    // currentHolder: "32",
    // donors: ["32"],
    images: ["default.jpg", "default1.jpg"],
    language: "english",
    publishedDate: "jan 31-2020",
    ratingAverage: 0,
    ratingQuantity: 0,
    summary: "",
    tags: ["vision", "myles"]

}

exports.itemData2={


    name: "good morning holy spirit",
    imageCover: "default.jpg",

    page: 300,

    genres: ["self-help", "leadership", ""],

    booksAmount: 2,
    authors:["Benny Hinn"],

    description: "about vision and its principles",
    // borrowingHistory: [history1, {userId:"2", startDate:"22/11/23"}],
    // currentHolder: "32",
    // donors: ["32"],
    images: ["default.jpg", "default1.jpg"],
    language: "english",
    publishedDate: "jan 31-2020",
    ratingAverage: 0,
    ratingQuantity: 0,
    summary: "",
    tags: ["vision", "benny"]

}
