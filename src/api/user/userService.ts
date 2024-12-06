import { ServiceResponse } from "@/common/models/serviceResponse";
import logger from "@/utils/logger";
import prisma from "@/lib/prisma";
import { CreateUserDto, UserAuthDto , LoginDto, UserDto  } from "./userModel";
import bcrypt from "bcrypt"
import { generateToken, verifyToken } from "@/utils/jwt";
import { JwtPayload } from "jsonwebtoken";

export class UserService {
    public async  createAccount  ( 
        data : CreateUserDto
    ) : Promise<ServiceResponse<UserAuthDto | null >> {
                  try {
                   
                    const user = await prisma.user.findUnique({
                            where : {
                                     phoneNumber : data.phoneNumber
                            }
                    })

                    if(user) {
                           return ServiceResponse.failure("User already exists" ,null , 429)
                    }

                   const newUser = await prisma.user.create({
                         data : {
                                   username : data.username,
                                   password : await bcrypt.hash(data.password, 10),
                                   phoneNumber : data.phoneNumber,
                                   surname : data.surname,
                                   role : "USER"
                         }
                    })

                    const token =  generateToken({ userId : newUser.id , role : "USER" , phoneNumber : newUser.phoneNumber})

                    const { password , ...rest } = data

                    const returnData = {
                          token ,
                          ...rest
                    }

                    return ServiceResponse.success<UserAuthDto>("User creatd successfully " ,  returnData , 201)
                    
                  } catch (error) {
                    logger.error(`Error creating user : ${error}`)
                    return ServiceResponse.failure("Internal server error " , null , 500)
                  }
    }


    public async loginAccount ( 
        data : LoginDto 
      ) : Promise<ServiceResponse<UserAuthDto | null >> {

             try {

                const user = await prisma.user.findUnique({
                      where : { phoneNumber : data.phoneNumber},
                      include : {
                            ads : true 
                      }
                })
            

                if(!user) {
                    return ServiceResponse.failure("User  not found " , null , 404)
                }

              const validPassword = await bcrypt.compare(data.password , user.password);


              if(!validPassword) {
                   return ServiceResponse.failure("Invalid password" , null , 403)
              }


              const token =   generateToken({ userId : user.id , role : "USER" , phoneNumber : user.phoneNumber})

              const { password , ...rest } = user

              const returnData = {
                    token ,
                    ...rest
              }

              return ServiceResponse.success<UserAuthDto>("User logged succesfully" ,  returnData , 201)
          
              
             } catch (error) {
              logger.error(`Error loggin in  user : ${error}`)
              return ServiceResponse.failure("Internal server error " , null , 500)
             }
      }



      public async getUserAccount ( 
         id : string 
      ) : Promise<ServiceResponse<UserDto | null >> {

             try {
              const user = await prisma.user.findUnique({
                  where : { id  },
                  include : {
                       ads : true
                  }
              })

              if(!user) {
                return ServiceResponse.failure("User  not found " , null , 404)
              }

              return ServiceResponse.success<UserDto>("OK" ,   user  , 200)
              
             } catch (error) {
              logger.error(`Error getting user : ${error}`)
              return ServiceResponse.failure("Internal server error " , null , 500)
             }
      }



        public async refreshToken (
              token : string , id : string
        )  : Promise<ServiceResponse<string | null>> {
      
               try {

                const validToken  : JwtPayload | null=  verifyToken(token);

                if(!validToken) {
                       return ServiceResponse.failure("Invalid token " , null , 403)
                }


                const user = await prisma.user.findUnique({ where : { id }})
                if(!user) return  ServiceResponse.failure("User not found " , null , 404);


                const newToken = generateToken({ userId : user.id , role : user.role , phoneNumber : user.phoneNumber})
                return ServiceResponse.success("OK" , newToken, 200)

               } catch (error) {
                return ServiceResponse.failure("Internal server error" , null , 500)

               }
        }
  
}

export const userService = new UserService();
