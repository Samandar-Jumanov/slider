import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
extendZodWithOpenApi(z);



export const ROLES = z.enum(['ADMIN' , "USER"])

// Base User Schema without ID (for creation)
export const CreateUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  surname  : z.string()
});



// User Schema with ID (for retrieval)
export const UserSchema = CreateUserSchema.extend({
  id: z.string().cuid(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  surname  : z.string(),
  ads: z.any(),
  role : ROLES
});



export const CreatedUserSchema = z.object({
      token : z.string(),
      username: z.string().min(3, "Username must be at least 3 characters"),
      phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
      surname  : z.string()
})


export const GetUserSchema = z.object({
        params : z.object({
             id : z.string()
    })
})


export const LoginSchema = z.object({
      phoneNumber : z.string(),
      password : z.string()
})

// User DTO for responses
export type UserDto = z.infer<typeof UserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type GetUserDto = z.infer<typeof GetUserSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type UserAuthDto = z.infer<typeof CreatedUserSchema>