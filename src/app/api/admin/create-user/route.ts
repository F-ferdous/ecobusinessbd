import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      displayName,
      mobileNumber,
      role = "Manager",
      status = "active",
      country = null,
    } = body || {};
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Create user in Firebase Auth
    const user = await adminAuth.createUser({ email, password, displayName });

    // Create Firestore Users/{uid}
    const now = new Date();
    await adminDb
      .collection("Users")
      .doc(user.uid)
      .set(
        {
          email: email.toLowerCase(),
          displayName: displayName || "",
          role,
          mobileNumber: mobileNumber || "",
          status,
          country,
          createdAt: now,
          updatedAt: now,
        },
        { merge: true }
      );

    return NextResponse.json({ ok: true, uid: user.uid });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
