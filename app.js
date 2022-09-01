const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

try {
    mongoose.connect("mongodb+srv://makestar:ashish@cluster0.dmaxxjz.mongodb.net/toDoList?retryWrites=true&w=majority",{
    useNewUrlParser:true,
    useUnifiedTopology: true,
});
} catch (error) {
    console.log(error);
}



const itemSchema = {
    name: String
}

const Item = mongoose.model("item",itemSchema);

const item1 = new Item({
    name:"Welcome To Your ToDoList!"
})

const item2 = new Item({
    name:"Hit + to add new items"
})

const item3 = new Item({
    name:" <-- Hit this to remove item"
})

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items : [itemSchema]
}

const List = mongoose.model("List",listSchema);


app.get("/",function(req,res){
    

   Item.find({},function(err,allItems){
    
        if(allItems.length == 0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                   console.log(err);
                }
           })
           res.redirect("/");
        }else{
            res.render("index",{listTitle:"Today",newListItem:allItems});
        }
   })
  
   
   

});

app.post("/", function(req,res){

    var newItem = req.body.newitem;
    const listName = req.body.list;

    const item = new Item({
        name:newItem
    })

    if(listName == "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,allItems){
            allItems.items.push(item);
            allItems.save();

            res.redirect("/" + listName);
        })
    }


   
   

})

app.post("/delete",function(req,res){
    const delID = req.body.checked;
    const listName = req.body.list;

    if(listName == "Today"){
        Item.findByIdAndRemove(delID,function(err){
            if(err){
                console.log(err);
            }else{
                res.redirect("/");
            }     
        });
    }else{
        List.findOneAndUpdate({name:listName},{$pull: {items: {_id: delID}}}, function(err){
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }




})


app.get("/:newParamas",function(req,res){
    
    const paramName = _.capitalize(req.params.newParamas);

    List.findOne({name:paramName},function(err,findList){
        if(!findList){
            const list = new List({
                name:paramName,
                items:defaultItems
            })
        
            list.save();
            res.redirect("/"+paramName);
        }else{
            res.render("index",{listTitle:findList.name,newListItem:findList.items})
        }
    }) 

})


app.listen(3000,function(){
   console.log("Listenning at port 3000");
})

