### NoSQL Queries
--

#### Home Screen
---

##### 1. Getting Products Categories with Products.

```mongojs
db.getCollection('Category').aggregate([
    { $match: {parentId: {$exists: false}} },
    { $sort: {itemCount: -1} },
    { $skip: 0 },
    { $limit: 10 },
    { $unset: ["__v","createdAt","updatedAt"] },
    { $lookup: {
            from: "AllProducts",
            let: {categoryId: "$_id"},
            pipeline: [
                {$match: {$expr: {$and: [{$eq: ["$categoryId","$$categoryId"]}]}}},
                {$project: {name:1,primaryImage:1,mrp:1,price:1,sellerCity:1}},
                {$limit: 10}
            ] ,
            as: "products",
        }}
])
```

##### 2. Search Home Page

###### Getting the Nearest Seller (For Now Just Bengaluru Sellers)
```mongojs
db.Seller.find({city:"Bengaluru"})
.sort({productCount:-1}).limit(8)
```

##### 3. Search Product

Search product based on query, add filter of Price, and also paginate the data

```mongojs
db.AllProducts.aggregate([
    {
        $search: {
            index: 'default',
            text: { query: 'red cap', path: { 'wildcard': '*' } }
        }
    },
    { $match: {price: {$lt: 410, $gt: 400}} },
    { $project: {name:1,primaryImage:1,mrp:1,price:1,sellerCity:1} },
    { $skip: 0 },
    { $limit: 2 }
])
```

##### 4. Generate Occasion Data for Cloth

JSON Genarator for Occasion data (RunOn MongoJS ENV)
```mongojs
var items = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
var itemsGot = db.getCollection('AllProducts').aggregate([
    {$match:{"productAttributes.Occasion":"Casual"}},
    { $sample: {size: 7} },
    { $project: {primaryImage:1,_id:0}}
]).toArray()
    
    itemsGot.map((data,index)=>{
    var let = {
        image: data['primaryImage'],
        index: index,
        name: items[index]
        }
    return let;
    })
```

#### Seller Screen
---

##### 1. Get All Category in Which Seller Sells.

```mongojs
db.AllProducts.aggregate([
    { $match: {sellerId: ObjectId("6217522f80aaaf3da77fa877")} },
    { $group: {_id: "$categoryId", productCount: {$sum:1}} },
    { $lookup: { from: "Category", let: {catId: "$_id"}, pipeline: [
        { $match: { $expr: { $eq: ["$_id","$$catId"] } } },
        { $unset: ["__v","itemCount","updatedAt","createdAt"] }
    ], as: "categoryInfo" } },
    { $unwind: "$categoryInfo" },
    { $replaceRoot: { newRoot: "$categoryInfo" } }
])
```

##### 2. Get Seller Products and Categories by Gender.

```mongojs
db.AllProducts.aggregate([
    { $match: {sellerId: ObjectId("6217522f80aaaf3da77fa877"), gender: "female"} },
    { $group: {_id: "$categoryId", productCount: {$sum:1}} },
    { $lookup: { from: "Category", let: {catId: "$_id"}, pipeline: [
        { $match: { $expr: { $eq: ["$_id","$$catId"] } } },
        { $unset: ["__v","itemCount","updatedAt","createdAt"] }
    ], as: "categoryInfo" } },
    { $unwind: "$categoryInfo" },
    { $replaceRoot: { newRoot: "$categoryInfo" } },
    { $lookup: {
            from: "AllProducts",
            let: {categoryId: "$_id"},
            pipeline: [
                {$match: {$expr: {$and: [{$eq: ["$categoryId","$$categoryId"]},{$eq: ["$sellerId",ObjectId("6217522f80aaaf3da77fa877")]}]}}},
                {$project: {name:1,primaryImage:1,mrp:1,price:1,sellerCity:1}},
                {$limit: 10}
            ] ,
            as: "products",
        }}
])
```

##### 3. Get Seller Category and Sub Categories by Gender.

```mongojs
db.getCollection('AllProducts').aggregate([
    { $match: {sellerId: ObjectId("6217522f80aaaf3da77fa877"), gender: "female"} },
    { $group: {_id: "$categoryId", productCount: {$sum:1}} },
    { $lookup: { from: "Category", let: {catId: "$_id"}, pipeline: [
        { $match: { $expr: { $eq: ["$_id","$$catId"] } } },
        { $unset: ["__v","itemCount","updatedAt","createdAt"] }
    ], as: "categoryInfo" } },
    { $unwind: "$categoryInfo" },
    { $replaceRoot: { newRoot: "$categoryInfo" } },
    { $lookup: {
            from: "Category",
            let: {categoryId: "$_id"},
            pipeline: [
                {$match: {$expr: {$and: [{$eq: ["$parentId","$$categoryId"]}]}}},
                {$project: {name:1,image:1,itemCount:1}},
                {$limit: 10}
            ] ,
            as: "subCategories",
        }}

])
```


##### 4. Get Category and SubCategory list for a particualr seller
(Only fetch the list of category and sub category of product that he sells)

```mongojs
db.getCollection('AllProducts').aggregate([
    { $match: {sellerId: ObjectId("6217522f80aaaf3da77fa877"), gender: "female"} },
    { $group: {_id: "$subCategoryId", productCount: {$sum:1}, categoryId: {$first: "$categoryId"}} },
    { $lookup: { from: "Category", let: {catId: "$_id"}, pipeline: [
        { $match: { $expr: { $eq: ["$_id","$$catId"] } } },
        { $unset: ["__v","itemCount","updatedAt","createdAt"] }
    ], as: "categoryInfo" } },
    { $unwind: "$categoryInfo" },
    { $replaceRoot: { newRoot: "$categoryInfo" } },
    { $lookup: {
            from: "Category",
            let: {parentId: "$parentId"},
            pipeline: [
                {$match: {$expr: {$and: [{$eq: ["$_id","$$parentId"]}]}}},
                {$project: {name:1,image:1,_id:0}},
                {$limit: 10}
            ] ,
            as: "parent",
        }},
    { $unwind: "$parent" },

])
```

#### My Profile Screen
---

##### 1. Saved Products from user profile
(Fetch all the products that user has saved)

```mongojs
db.getCollection('SavedItem').aggregate([
    {$match: {itemType: "AllProducts",userId: ObjectId("624c154116d3fc1be9cb37f3")}},
    {$skip:0},
    {$limit:10},
    {$lookup: {from: "AllProducts",localField:"itemId",foreignField:"_id",as:"itemInfo",pipeline:[{$project:{name:1,primaryImage:1,mrp:1,price:1,location:1}}]}},
    { $unwind: "$itemInfo" },
    { $replaceRoot: { newRoot: "$itemInfo" } }
])
```


##### 2. Saved Stores from user profile 
(Fetch all the products that user has saved)

```mongojs
db.getCollection('SavedItem').aggregate([
    {$match: {itemType: "Seller",userId: ObjectId("624c154116d3fc1be9cb37f3")}},
    {$skip:0},
    {$limit:10},
    {$lookup: {from: "Seller",localField:"itemId",foreignField:"_id",as:"itemInfo",pipeline:[{$project:{name:1,minimumDressPrice:1,maximumDressPrice:1,productCount:1,image:1,location:1}}]}},
    { $unwind: "$itemInfo" },
    { $replaceRoot: { newRoot: "$itemInfo" } }
])
```


#### Store API
---

##### 1. User Cart Item List
(Fetch all the products that are in user cart)

```mongojs
db.getCollection('Cart').aggregate([
    {$match:{userId:ObjectId("6250f4253524df49ba8b969b")}},
    {$lookup:{
        from: "AllProducts",
        let: {id:"$productId"},
        pipeline: [
            {$match:{$expr:{$eq:["$_id","$$id"]}}},
            {$project:{name:1,primaryImage:1,mrp:1,price:1,inventory:1,location:1,sellerId:1,sellerName:1}}
        ],
        as:"info"}},
    { $unwind: "$info" },
    {
      $set: {
        "info.size":"$size","info.count":"$count","info.addedOn":"$createdAt"
      }
    },
    { $set: {"productInfo": "$info"} },
    { $replaceWith: "$productInfo" }
])
```


##### 2. User Order List
(Fetch all the products that user has ordered)

```mongojs
db.getCollection('Order').aggregate([
    {$match: {userId: ObjectId("6250f4253524df49ba8b969b"), paidOn: {$exists: true}}},
    {$unwind: "$products"},
    {$project: {_id:1,userId:1,productId: "$products.itemId", size: "$products.size", qty: "$products.qty", status: 1, createdAt: 1, mrp: "$products.purchaseMrp", price: "$products.purchasePrice"}},
    {$lookup:{
        from: "AllProducts",
        let: {"productId":"$productId"},
        pipeline: [
            {$match: {$expr: {$eq: ["$_id","$$productId"]}}},
            {$project: {name:1,primaryImage:1}}
        ],
        as: "products"
    }},
    {$unwind: "$products"},
    {$project: {_id:1,userId:1,productId: "$products.itemId", size: "$products.size", qty: "$products.qty", status: 1, createdAt: 1, mrp: "$mrp", price: "$price", name: "$products.name", image: "$products.primaryImage"} },
])
```

---
#### Wearingo Seller Ap Queries
---
(Queries to support the apis)


⚪. Home Header

// categories
 ```mongojs
db.getCollection('StoreCloth').aggregate([
 {$group: {_id: "$categoryId"}},
 {$lookup: {localField: "_id", foreignField: "_id", from: "Category", as: "info"}},
 {$unwind: "$info"},
 {$replaceRoot: {newRoot: "$info"}}
 ])
```

// Home Banner
```mongojs
db.getCollection('PromoBanner').findOne({"key":"shop_home_top_banner"})
```

⚪. Personalized (recommended, most visited, near me)

// Recommended

 ```mongojs
db.getCollection('Store').aggregate([
 {
     $geoNear: {
        near: { type: "Point", coordinates: [ 77.61027, 12.9224 ] },
        distanceField: "dist.calculated",
        maxDistance: 50000
     }
   },
 { $sort: { "rating": -1 } },
 { $limit: 8 }
 ])
```

// most visited
 
 ```mongojs
db.getCollection('Store').aggregate([
 {
     $geoNear: {
        near: { type: "Point", coordinates: [ 77.61027, 12.9224 ] },
        distanceField: "dist.calculated",
        maxDistance: 50000
     }
   },
 { $sort: { "visits": -1 } },
 { $limit: 8 }
 ])
```

// near me
 
 ```mongojs
db.getCollection('Store').aggregate([
 {
     $geoNear: {
        near: { type: "Point", coordinates: [ 77.61027, 12.9224 ] },
        distanceField: "dist.calculated",
        maxDistance: 15000
     }
   },
 { $sort: { "reviewCount":-1,"rating": -1 } },
 { $limit: 8 }
 ])
 ```

⚪. Search home page (areas, most visited shop, categories and stores around you)
 
 ```mongojs
db.getCollection('Area').find({})
```
// most visited
 
// categories
 
// near me

⚪. Search Store Cloth
```mongojs
 db.getCollection('StoreCloth').find({ $text: { $search: "red" } })
 db.getCollection('Store').find({ $text: { $search: "hold" } })
```

⚪. Shop info by id
```mongojs
 db.getCollection('Store').find({ _id: ObjectId("62998bdce6dc84b98df1ef36") })
```

⚪. Shop latest clothes api (categories on the first response)
 ```mongojs
db.getCollection('StoreCloth').find({storeId: ObjectId("62998bdce6dc84b98df1ef36")}).sort({_id:-1})
 
db.getCollection('StoreCloth').aggregate([
 {$group: {_id: "$categoryId"}},
 {$lookup: {localField: "_id", foreignField: "_id", from: "Category", as: "info"}},
 {$unwind: "$info"},
 {$replaceRoot: {newRoot: "$info"}}
 ])
```

⚪. Add New Shop Cloth

⚪. Update Shop Cloth

⚪. Add Shop

⚪. Update shop info

