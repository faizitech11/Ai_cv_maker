import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/app/lib/db";

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),

  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email is too long"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the account",
      },
      { status: 500 }
    );
  }
}