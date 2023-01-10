//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true });
mongoose.connect("mongodb+srv://whitesoftx:Xchange75us@cluster0.zog3eqp.mongodb.net/todolistDB", { useNewUrlParser: true });

// Create Schema
const itemsSchema = {
  name: String
};

// Create Model
const Item = mongoose.model("Item", itemsSchema);

// Add Items
const item1 = new Item ({
  name: "Drink Coffee"
});

const item2 = new Item ({
  name: "Read & Reply Mails"
});

const item3 = new Item ({
  name: "Update Plugins"
});

// Insert all items to thye to the Items collection
const defaultItems = [item1, item2, item3];

// Custom routing Schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};

 const List = mongoose.model("List", listSchema);


// Item.insertMany(defaultItems, function(err){
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("To Do items are successfully added to the todolistDB");
//     }
// });

app.get("/", function(req, res) {


  // find items in the collection
  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
    if (err) {
        console.log(err);
    } else {
        console.log("To Do items are successfully added to the todolistDB");
    }
  });
    res.redirect("/");

    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
});

});

// Dynamic Routes Creation

app.get("/:customListName", function(req, res) {
const customListName = _.capitalize(req.params.customListName);

// Find out if the list already exists
List.findOne({name: customListName}, function(err, foundList){
  if (!err) {
    if (!foundList){
      // Create new list if not found
      const list = new List ({
        name: customListName,
        items: defaultItems
      });

        // Save the list created
      list.save();

      // Redirect to the new Custom List created
      res.redirect("/" + customListName);

    } else {
      // Show the found list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      
    }
  }
});

const list = new List ({
  name: customListName,
  items: defaultItems
});

list.save();
     
  });

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
  name: itemName
});

 if (listName === "Today") {
  item.save();
  res.redirect("/"); 
 } else {
   List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
   });
 }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Checked Item successfully removed");
        res.redirect("/");
    }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }

 

});

app.get("/work", function(req, res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});

