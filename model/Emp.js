const mongoose=require("mongoose")
const EmpSchema= new mongoose.Schema({

    email:{
        type:"String",
        required:true
    },

    
    Employee:{
        type:"String",
        required:true,
    },
    department:
    {
        type:"String",
        require:true,
    },
    password:
    {
        type:"String",
        require:true,
    }

})

const Emp = mongoose.model("Emp", EmpSchema);
module.exports = Emp;
