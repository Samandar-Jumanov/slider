import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateUserSchema, LoginSchema, UserSchema } from "@/api/user/userModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";
import { authMiddleware } from "@/common/middleware/auth";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchema);


userRegistry.registerPath({
  method: "get",
  path: "/users",
  tags: ["User"],
  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.get("/:id", authMiddleware,  userController.getAccount);


userRegistry.registerPath({
  method: "post",
  path: "/users",
  tags: ["User"],
  request : {
    body: {
      content: {
        'application/json': {
          schema: CreateUserSchema
        }
      }
    }
  },

  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.post("/", validateRequest(z.object({ body : CreateUserSchema})), userController.createAccount);


userRegistry.registerPath({
  method: "post",
  path: "/users/login",
  tags: ["User"],
  request : {
    body: {
      content: {
        'application/json': {
          schema: LoginSchema
        }
      }
    }
  },

  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.post("/login", validateRequest(z.object({
      body : LoginSchema
})), userController.loginAccount);


userRegistry.registerPath({
  method: "post",
  path: "/users/refresh-token",
  tags: ["User"],
  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.post("/refresh-token", authMiddleware , validateRequest(z.object({
      body : z.object({  token :z.string() })
})), userController.loginAccount);




