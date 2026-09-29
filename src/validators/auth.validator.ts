import { z } from "zod";

export const registerSchema = z.object({
  nama: z.string().min(3),
  email: z.email(),
  password: z
    .string()
    .min(6, { error: "Password must be at least 6 character" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character",
    }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
