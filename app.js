//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');
//Deployment ready
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://esha_sherring:<password>@esha.kxejf.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser: true});
const itemsSchema={
 name: String
};
const Item=mongoose.model("Item",itemsSchema);
const item1= new Item({
  name: "welcome"
});
const item2= new Item({
  name: "hope you're good"
});
const item3= new Item({
  name: "Lets start"
});
const defaultItems= [item1,item2,item3];
const listSchema={
  name: String,
  item: [itemsSchema]

};
const List=mongoose.model("List",listSchema);
app.get("/", function(req, res) {

  Item.find({},function(err,foundItems)
  {
    if(foundItems.length==0)
    {
Item.insertMany(defaultItems,function(err){
     if(err)
     {
       console.log("error");
     }
     else{
      console.log("successfully added default items");
     }
});
res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
  });



});
app.get("/:customListName",function(req,res){
const customListName=_.capitalize(req.params.customListName);
List.findOne({name : customListName},function(err, foundList){
  if(!err)
  {
    if(!foundList)
    {
      //to create a new list
      const list=new List({
        name: customListName,
        item: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
    }
    else
    {
      
      res.render("list", {listTitle: foundList.name , newListItems: foundList.item});
    }
    
  }
});

  
});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName =  req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName == "Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.item.push(item);
      foundList.save();
      //console.log(item);
      res.redirect("/"+ listName);

    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId=req.body.checkbox;


  const listName=req.body.listName;
  if(listName =="Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err){
      res.redirect('/');
    });
  
  }
  else
  {
    List.findOneAndUpdate({name: listName}, { $pull: {item: {_id: checkedItemId}}},function(err, foundList){
      if(!err)
      {
        res.redirect("/"+ listName);
      }
      else
      {
        console.log("error");
      }
    });
  }
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
