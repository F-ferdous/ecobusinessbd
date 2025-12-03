import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid, deleteUserDoc = true } = await req.json();
    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    // Delete from Firebase Authentication
    await adminAuth.deleteUser(uid);

    // Optionally delete Firestore Users/{uid}
    if (deleteUserDoc) {
      await adminDb
        .collection("Users")
        .doc(uid)
        .delete()
        .catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
