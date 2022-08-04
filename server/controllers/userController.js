const bcrypt=require('bcryptjs')
const userModel=require('../models/userModel')


module.exports.register=async(req,res)=>{
    console.log(req.body)

    const userCheck=await userModel.findOne({email:req.body.email})
     console.log(userCheck)
    if(userCheck)
      {
          res.json({
              status:false,
              error:"user already exists"
          })
      }

      else{
          let password=req.body.password
          let hashedPassword=await bcrypt.hash(password,10)
          let user=await userModel.create({
              userName:req.body.userName,
              email:req.body.email,
              password:hashedPassword
          })

          if(user){
              res.json({
                  status:true,
                  message:"User created successfully",
                  user
              })
          }
      }
}

module.exports.login=async(req,res)=>{
    console.log(req.body)

     const user=await userModel.findOne({email:req.body.email})

      if(!user)
        {
            res.json({
                status:false,
                message:"User with given email does not exist "
            })
        }
        else{

            const isValidPassword=await bcrypt.compare(req.body.password,user.password)
            if(!isValidPassword)
              {
                  res.json({
                      status:false,
                      message:"Invalid userName or password"
                  })
              }
              else{
                  res.json({
                      status:true,
                      user
                  })
              }
        }
}

module.exports.setAvatar=async (req,res,next) =>{
    try{
        const userId=req.params.id;
        const avatarImage=req.body.image;

        const userData= await userModel.findByIdAndUpdate(userId,{
            isAvatarImageSet:true,
            avatarImage,
        })

        return res.json({
            isSet:userData.isAvatarImageSet,
            image:userData.avatarImage,
        })
    }
    catch(ex){
        next(ex)
    }
}


module.exports.getAllUsers= async (req,res,next)=>{
    try{
        const users=await userModel.find({_id:{$ne:req.params.id}}).select([
            "email","userName","avatarImage","_id"
        ])

        return res.json(users)
    }

    catch(ex){
        next(ex)
    }
}