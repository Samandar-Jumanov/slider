import { string, z } from 'zod';





export const AdStatusSchema = z.enum(["PENDING" , "ACTIVE" , "REJECTED"])

export const AdBaseSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(255, { message: "Title must be 255 characters or less" }),
  description: z.string().min(1, { message: "Description is required" }).max(1000, { message: "Description must be 1000 characters or less" }),
  link: z.string().url({ message: "Invalid URL format" }),
  mediaUrl: z.string().url({ message: "Invalid media URL format" }),
  tg_username: z.string(),
  status: z.enum(["PENDING" , "ACTIVE" , "REJECTED"])
});

export const CreateAdSchema = AdBaseSchema.extend({
  title: z.string().min(1, { message: "Title is required" }).max(255, { message: "Title must be 255 characters or less" }),
  description: z.string().min(1, { message: "Description is required" }).max(1000, { message: "Description must be 1000 characters or less" }),
  link: z.string().url({ message: "Invalid URL format" }),
  mediaUrl: z.string().url({ message: "Invalid media URL format" }),
  tg_username: z.string(),
  status: z.enum(["PENDING" , "ACTIVE" , "REJECTED"])
});


export const GetAdSchema = z.object({
       params : z.object({
          id : z.string()
       })
})

export const UpdateAdStatusSchema = AdBaseSchema.partial().extend({
  id: z.string().min(1, { message: "Ad ID is required" })
});


export type AdBaseDto = z.infer<typeof AdBaseSchema>;
export type CreateAdDto = z.infer<typeof CreateAdSchema>;
export type UpdateAdDto = z.infer<typeof UpdateAdStatusSchema>;
export type AdStatus = z.infer<typeof AdStatusSchema>;

